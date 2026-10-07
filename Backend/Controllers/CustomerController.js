const { customers } = require("../data/store");
const pool = require("../Config/db");

const listCustomers = async (req, res, next) => {
  try {
    if (pool) {
      const result = await pool.query(
        `SELECT id, company_name AS "companyName", contact_person AS "contactPerson",
                mobile, email, city, created_at AS "createdAt"
         FROM customers ORDER BY company_name`,
      );
      return res.status(200).json({ success: true, data: result.rows });
    }
    return res.status(200).json({ success: true, data: customers });
  } catch (error) {
    return next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const {
      companyName = req.body?.company,
      contactPerson = req.body?.name,
      mobile = req.body?.phone,
      email,
      city = "",
    } = req.body || {};

    if (!companyName?.trim() || !contactPerson?.trim() || !mobile?.trim()) {
      return res.status(400).json({ success: false, message: "Company name, contact person, and mobile are required" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (pool) {
      const result = await pool.query(
        `INSERT INTO customers (company_name, contact_person, mobile, email, city)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, company_name AS "companyName", contact_person AS "contactPerson",
                   mobile, email, city, created_at AS "createdAt"`,
        [companyName.trim(), contactPerson.trim(), mobile.trim(), email?.trim() || null, city.trim()],
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    const customer = {
      id: `customer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      mobile: mobile.trim(),
      email: email?.trim() || "",
      city: city.trim(),
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return next(error);
  }
};

const updateCustomer = (req, res) => {
  const customer = customers.find((entry) => entry.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  Object.assign(customer, req.body, { updatedAt: new Date().toISOString() });
  return res.status(200).json({ success: true, data: customer });
};

module.exports = { listCustomers, createCustomer, updateCustomer };
