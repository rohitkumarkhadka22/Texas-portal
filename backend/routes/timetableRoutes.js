const express = require("express");

const {
  createTimetable,
  getAllTimetables,
  getStudentTimetable,
  getTeacherTimetable,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
} = require("../controllers/timetableController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createTimetable);

router.get("/", protect, authorizeRoles("admin"), getAllTimetables);

router.get("/student", protect, authorizeRoles("student"), getStudentTimetable);

router.get("/teacher", protect, authorizeRoles("teacher"), getTeacherTimetable);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "student", "teacher"),
  getTimetableById,
);

router.put("/:id", protect, authorizeRoles("admin"), updateTimetable);

router.delete("/:id", protect, authorizeRoles("admin"), deleteTimetable);

module.exports = router;
