const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users, createId } = require("../data/store");
const { validateRegister, validateLogin } = require("../Validators/AuthValidator");
const { JWT_SECRET } = require("../Middleware/AuthMiddleware");
const pool = require("../Config/db");

const buildToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "8h" });

const register = async (req, res, next) => {
  try {
    const error = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user;

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(714823, 1)");
        const existing = await client.query(
          "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
          [req.body.email],
        );
        if (existing.rowCount) {
          await client.query("ROLLBACK");
          return res.status(409).json({ success: false, message: "User already exists" });
        }

        const count = await client.query("SELECT COUNT(*)::int AS count FROM users");
        const role = count.rows[0].count === 0 ? "ADMIN" : "SALES_USER";
        const result = await client.query(
          "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
          [req.body.name.trim(), req.body.email.trim().toLowerCase(), hashedPassword, role],
        );
        await client.query("COMMIT");
        user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          role: result.rows[0].role.toLowerCase(),
          createdAt: result.rows[0].created_at,
          password: hashedPassword,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } else {
      if (users.some((entry) => entry.email.toLowerCase() === req.body.email.toLowerCase())) {
        return res.status(409).json({ success: false, message: "User already exists" });
      }

      const userCount = users.length;
      user = {
        id: createId("user"),
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        password: hashedPassword,
        role: userCount === 0 ? "admin" : "sales",
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }

    const { password, ...safeUser } = user;
    const token = buildToken(user);

    return res.status(201).json({ success: true, message: "User registered successfully", user: safeUser, token });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const error = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    let user;
    if (pool) {
      const result = await pool.query(
        "SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER($1)",
        [req.body.email],
      );
      if (result.rowCount) {
        const row = result.rows[0];
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password_hash,
          role: row.role.toLowerCase(),
          createdAt: row.created_at,
        };
      }
    } else {
      user = users.find((entry) => entry.email.toLowerCase() === req.body.email.toLowerCase());
    }
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const { password, ...safeUser } = user;
    const token = buildToken(user);

    return res.status(200).json({ success: true, message: "Login successful", user: safeUser, token });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    let user;
    if (pool) {
      const result = await pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
        [req.user.id],
      );
      if (result.rowCount) {
        const row = result.rows[0];
        user = { id: row.id, name: row.name, email: row.email, role: row.role.toLowerCase(), createdAt: row.created_at };
      }
    } else {
      user = users.find((entry) => entry.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password, ...safeUser } = user;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, getProfile };
