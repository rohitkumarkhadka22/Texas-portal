const express = require("express");

const router = express.Router();

const {
  getMyAdminProfile,
  updateMyAdminProfile,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Get admin profile
router.get("/profile", protect, authorizeRoles("admin"), getMyAdminProfile);

// Update admin profile
router.put("/profile", protect, authorizeRoles("admin"), updateMyAdminProfile);

module.exports = router;
