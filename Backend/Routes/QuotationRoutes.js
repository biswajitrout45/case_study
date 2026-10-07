const express = require("express");
const { listQuotations, createQuotation, updateQuotation } = require("../Controllers/QuotationController");
const { authenticate } = require("../Middleware/AuthMiddleware");

const router = express.Router();

router.get("/", authenticate, listQuotations);
router.post("/", authenticate, createQuotation);
router.patch("/:id", authenticate, updateQuotation);

module.exports = router;
