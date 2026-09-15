const express = require("express");

const {
  createNotice,
  getAllNotices,
  getStudentNotices,
  getTeacherNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createNotice);

router.get("/", protect, authorizeRoles("admin"), getAllNotices);

router.get("/student", protect, authorizeRoles("student"), getStudentNotices);

router.get("/teacher", protect, authorizeRoles("teacher"), getTeacherNotices);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "student", "teacher"),
  getNoticeById,
);

// =================================
// Admin - Update Notice
// =================================
router.put("/:id", protect, authorizeRoles("admin"), updateNotice);

// =================================
// Admin - Delete Notice
// =================================
router.delete("/:id", protect, authorizeRoles("admin"), deleteNotice);

module.exports = router;
