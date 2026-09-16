const User = require("../models/User");

const getMyAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        message: "Admin profile not found",
      });
    }

    res.status(200).json({
      message: "Admin profile fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateMyAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, profileImage } = req.body;

    // FIX: req.used.id → req.user.id
    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        message: "Admin profile not found",
      });
    }

    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (phone !== undefined) admin.phone = phone;
    if (profileImage !== undefined) admin.profileImage = profileImage;

    await admin.save();

    res.status(200).json({
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        profileImage: admin.profileImage,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMyAdminProfile,
  updateMyAdminProfile,
};
