const Notice = require("../models/Notice");

const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      targetAudience,
      publishDate,
      expiryDate,
      isPublished,
      isPinned,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || "general",
      targetAudience: targetAudience || "all",
      createdBy: req.user.id,
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null,
      isPublished: isPublished !== undefined ? isPublished : true,
      isPinned: isPinned !== undefined ? isPinned : false,
    });

    const populatedNotice = await Notice.findById(notice._id).populate(
      "createdBy",
      "name email role",
    );

    res.status(201).json({
      message: "Notice created successfully",
      notice: populatedNotice,
    });
  } catch (error) {
    console.error("Create notice error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email role")
      .sort({
        isPinned: -1,
        publishDate: -1,
      });

    res.status(200).json({
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("Get all notices error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getStudentNotices = async (req, res) => {
  try {
    const now = new Date();

    const notices = await Notice.find({
      isPublished: true,

      targetAudience: {
        $in: ["all", "students"],
      },

      publishDate: {
        $lte: now,
      },

      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
    })
      .populate("createdBy", "name email")
      .sort({
        isPinned: -1,
        publishDate: -1,
      });

    res.status(200).json({
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("Get student notices error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherNotices = async (req, res) => {
  try {
    const now = new Date();

    const notices = await Notice.find({
      isPublished: true,

      targetAudience: {
        $in: ["all", "teachers"],
      },

      publishDate: {
        $lte: now,
      },

      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
    })
      .populate("createdBy", "name email")
      .sort({
        isPinned: -1,
        publishDate: -1,
      });

    res.status(200).json({
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("Get teacher notices error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id).populate(
      "createdBy",
      "name email role",
    );

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    res.status(200).json({
      notice,
    });
  } catch (error) {
    console.error("Get notice by ID error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      content,
      category,
      targetAudience,
      publishDate,
      expiryDate,
      isPublished,
      isPinned,
    } = req.body;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    notice.title = title ?? notice.title;
    notice.content = content ?? notice.content;
    notice.category = category ?? notice.category;
    notice.targetAudience = targetAudience ?? notice.targetAudience;
    notice.publishDate = publishDate ?? notice.publishDate;
    notice.expiryDate = expiryDate ?? notice.expiryDate;
    notice.isPublished = isPublished ?? notice.isPublished;
    notice.isPinned = isPinned ?? notice.isPinned;

    await notice.save();

    const updatedNotice = await Notice.findById(id).populate(
      "createdBy",
      "name email role",
    );

    res.status(200).json({
      message: "Notice updated successfully",
      notice: updatedNotice,
    });
  } catch (error) {
    console.error("Update notice error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    await Notice.findByIdAndDelete(id);

    res.status(200).json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete notice error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getStudentNotices,
  getTeacherNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
};
