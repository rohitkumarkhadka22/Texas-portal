const mongoose = require("mongoose");
const Student = require("./Student");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status:{
            type: String,
            enum:["present", "absent", "late", "leave"],
            required: true,
        },

        remarks: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

attendanceSchema.index(
    {
        student: 1,
        subject: 1,
        date: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);