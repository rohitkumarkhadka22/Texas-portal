const express = require("express");

const {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Change password
router.put("/change-password", protect, changePassword);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

// Protected current user
router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

// Student only
router.get("/student-only", protect, authorizeRoles("student"), (req, res) => {
  res.json({
    message: "Welcome Student 🎓",
    user: req.user,
  });
});

module.exports = router;
