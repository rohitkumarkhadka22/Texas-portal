const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        teacherId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        designation: {
            type: String,
            default: "Lecturer",
            trim: true,
        },
        qualification: {
            type: String,
            default: "",
            trim: true,
        },
        specialization: {
            type: String,
            default: "",
            trim: true,
        },
        joiningDate: {
            type: Date,
            default: Date.now,
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },
        bio: {
            type: String,
            default: "",
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Teacher", teacherSchema);