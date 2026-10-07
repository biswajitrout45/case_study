const validateRegister = (payload) => {
  const { name, email, password, role } = payload || {};

  if (!name || !email || !password) {
    return "Name, email, and password are required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please provide a valid email address";
  }

  if (role && !["admin", "manager", "sales"].includes(role)) {
    return "Role must be admin, manager, or sales";
  }

  return null;
};

const validateLogin = (payload) => {
  const { email, password } = payload || {};

  if (!email || !password) {
    return "Email and password are required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please provide a valid email address";
  }

  return null;
};

module.exports = { validateRegister, validateLogin };
