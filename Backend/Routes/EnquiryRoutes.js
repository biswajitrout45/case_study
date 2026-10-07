const express = require("express");
const { listEnquiries, createEnquiry, updateEnquiryStatus } = require("../Controllers/EnquiryController");
const { authenticate } = require("../Middleware/AuthMiddleware");

const router = express.Router();

router.get("/", authenticate, listEnquiries);
router.post("/", authenticate, createEnquiry);
router.patch("/:id/status", authenticate, updateEnquiryStatus);

module.exports = router;
