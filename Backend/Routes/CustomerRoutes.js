const express = require("express");
const { listCustomers, createCustomer, updateCustomer } = require("../Controllers/CustomerController");
const { authenticate } = require("../Middleware/AuthMiddleware");

const router = express.Router();

router.get("/", authenticate, listCustomers);
router.post("/", authenticate, createCustomer);
router.patch("/:id", authenticate, updateCustomer);

module.exports = router;
