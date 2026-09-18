const express = require("express");

const {
  createStudentProfile,
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  createStudentByAdmin,
  uploadProfileImage,
  removeProfileImage,
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const profileUpload = require("../middleware/profileUpload");

const router = express.Router();

// ==========================================
// STUDENT - OWN PROFILE
// ==========================================

// Create student profile
router.post(
  "/profile",
  protect,
  authorizeRoles("student"),
  createStudentProfile,
);

// Get own profile
router.get("/profile", protect, authorizeRoles("student"), getMyProfile);

// Update own profile
router.put("/profile", protect, authorizeRoles("student"), updateMyProfile);

// Upload / change profile image
router.put(
  "/profile/image",
  protect,
  authorizeRoles("student"),
  profileUpload.single("profileImage"),
  uploadProfileImage,
);

// Remove profile image
router.delete(
  "/profile/image",
  protect,
  authorizeRoles("student"),
  removeProfileImage,
);

// ==========================================
// ADMIN - STUDENTS
// ==========================================

// Get all students
router.get("/", protect, authorizeRoles("admin"), getAllStudents);

// Create student by admin
router.post("/admin", protect, authorizeRoles("admin"), createStudentByAdmin);

module.exports = router;
