const express = require("express");

const {
    createTeacher,
    getAllTeachers,
    getMyTeacherProfile,
} = require("../controllers/teacherController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/",
    protect,
    authorizeRoles("admin"),
    createTeacher
);

router.get("/",
    protect,
    authorizeRoles("admin"),
    getAllTeachers
);

router.get("/profile",
    protect,
    authorizeRoles("teacher"),
    getMyTeacherProfile
)
module.exports = router;