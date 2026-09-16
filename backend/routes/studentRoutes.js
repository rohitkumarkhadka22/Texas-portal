const express = require("express");

const {
  createStudentProfile,
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  createStudentByAdmin,
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Student own profile
router.post(
  "/profile",
  protect,
  authorizeRoles("student"),
  createStudentProfile,
);

router.get("/profile", protect, authorizeRoles("student"), getMyProfile);

router.put("/profile", protect, authorizeRoles("student"), updateMyProfile);

// Admin - all students
router.get("/", protect, authorizeRoles("admin"), getAllStudents);

// Admin - create student
router.post("/admin", protect, authorizeRoles("admin"), createStudentByAdmin);

module.exports = router;
