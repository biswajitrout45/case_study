const express = require("express");
const { listOrders, createSalesOrder, updateOrderStatus } = require("../Controllers/SalesOrderController");
const { authenticate } = require("../Middleware/AuthMiddleware");
const { authorize } = require("../Middleware/RoleMiddleware");

const router = express.Router();

router.get("/", authenticate, listOrders);
router.post("/", authenticate, createSalesOrder);
router.patch("/:id/status", authenticate, authorize("admin"), updateOrderStatus);

module.exports = router;
