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

router.post("/", protect, authorizeRoles("admin"), createStudentByAdmin);

router.get("/", protect, authorizeRoles("admin"), getAllStudents);

router.post(
  "/profile",
  protect,
  authorizeRoles("student"),
  createStudentProfile,
);

router.get("/profile", protect, authorizeRoles("student"), getMyProfile);

router.put("/profile", protect, authorizeRoles("student"), updateMyProfile);

module.exports = router;
