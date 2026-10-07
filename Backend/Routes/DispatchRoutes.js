const express = require("express");
const { listDispatches, createDispatch, updateDispatch } = require("../Controllers/DispatchController");
const { authenticate } = require("../Middleware/AuthMiddleware");

const router = express.Router();

router.get("/", authenticate, listDispatches);
router.post("/", authenticate, createDispatch);
router.patch("/:id", authenticate, updateDispatch);

module.exports = router;
