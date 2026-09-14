const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        
        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        course: {
            type: String,
            required: true,
            trim: true,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },
        section: {
            type: String,
            default: "",
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum:["male", "female", "other"],
            default: "other",
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },
        admissionDate: {
            type: Date,
            default: Date.now,
        },
        guardian: {
            name: {
                type: String,
                default: "",
                trim: true,
            },
            relationship: {
                type: String,
                default: "",
                trim: true,
            },
            phone: {
                type: String,
                default: "",
                trim: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Student",studentSchema);