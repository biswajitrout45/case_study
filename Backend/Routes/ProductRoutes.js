const express = require("express");
const { getProducts, createProduct } = require("../Controllers/ProductController");
const { authenticate } = require("../Middleware/AuthMiddleware");
const { authorize } = require("../Middleware/RoleMiddleware");

const router = express.Router();

router.get("/", authenticate, getProducts);
router.post("/", authenticate, authorize("admin"), createProduct);

module.exports = router;
