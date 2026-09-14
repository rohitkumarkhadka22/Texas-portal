const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

router.get("/student-only", protect, authorizeRoles("student"), (req, res) => {
  res.json({
    message: "Welcome Student ",
    user: req.user,
  });
});

module.exports = router;
