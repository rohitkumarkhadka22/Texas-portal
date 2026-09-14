const express = require("express");

const {
  createStudentProfile,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("student"),
  createStudentProfile,
);

router.get("/profile",
    protect,
    authorizeRoles("student"),
    getMyProfile
);

router.put("/profile",
    protect,
    authorizeRoles("student"),
    updateMyProfile
);

module.exports = router;