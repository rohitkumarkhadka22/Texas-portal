const express = require("express");

const {
    markAttendance,
    getMyAttendance,
    getMyAttendanceSummary,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { route } = require("./subjectRoutes");

const router = express.Router();

router.post("/",
    protect,
    authorizeRoles("teacher"),
    markAttendance
);

router.get("/my-attendance",
    protect,
    authorizeRoles("student"),
    getMyAttendance
);

router.get("/my-summary",
    protect,
    authorizeRoles("student"),
    getMyAttendanceSummary
);

module.exports = router;