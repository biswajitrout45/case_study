const express = require("express");
const { listInventory, createInventoryItem, updateInventoryItemById } = require("../Controllers/InventoryController");
const { authenticate } = require("../Middleware/AuthMiddleware");
const { authorize } = require("../Middleware/RoleMiddleware");

const router = express.Router();

router.get("/", authenticate, listInventory);
router.post("/", authenticate, authorize("admin"), createInventoryItem);
router.patch("/:id", authenticate, authorize("admin"), updateInventoryItemById);

module.exports = router;
