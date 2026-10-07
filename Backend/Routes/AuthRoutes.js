const express = require("express");
const { register, login, getProfile } = require("../Controllers/AuthController");
const { authenticate } = require("../Middleware/AuthMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);

module.exports = router;
