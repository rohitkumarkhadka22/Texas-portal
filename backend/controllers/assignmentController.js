const Assignment = require("../models/Assignment");
const Subject = require("../models/Subject");

const createAssignment = async( req, res ) => {
    try{
        const {
            title,
            description,
            subject,
            course,
            semester,
            dueDate,
            totalMarks,
            attachment,
            isPublished,
        } = req.body;

        if(!title || !description || !subject || !course || !semester || !dueDate || !totalMarks ){
     return res.status(400).json({
        message: "Title, description, subject, course, semester, due date and total marks are required",
    });
}

const subjectExists = await Subject.findById(subject);
if(!subjectExists) {
    return res.status(404).json({
        message: "Subject not found",
    });
}

if(
    subjectExists.teacher &&
    subjectExists.teacher.toString() !== req.user.id
) {
    return res.status(403).json({
        message: "You are not assigned to this subject",
    });
}

const assignment = await Assignment.create({
    title,
    description,
    subject,
    teacher: req.user.id,
    course,
    semester,
    dueDate,
    totalMarks,
    attachment: attachment || "",
    isPublished: isPublished !== undefined ? isPublished : true,
});

const populatedAssignment = await Assignment.findById(
    assignment._id
)
.populate("subject", "name code course semester")
.populate("teacher","name email");

res.status(201).json({
    message: "Assignment created successfully",
    assignment: populatedAssignment,
});
    } catch(error){
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMyAssignments = async (req,res) => {
    try {
        const assignments = await Assignment.find({
            teacher: req.user.id,
        })
        .populate("subject", "name code course semester")
        .sort({ dueDate: 1 });

        res.status(200).json({
            count: assignments.length,
            assignments,
        });
    } catch(error){
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getStudentAssignments = async (req,res) => {
    try {
        const Student = require("../models/Student");
        const student = await Student.findOne({
            user: req.user.id,
        });
        if(!student) {
            return res.status(404).json({
                message: "Student profile not found",
            });
        }
        const assignments = await Assignment.find({
            course: student.course,
            semester: student.semester,
            isPublished: true,
        })
        .populate("subject", "name code course semester")
        .populate("teacher", "name email")
        .sort({ dueDate: 1 });

        res.status(200).json({
            count: assignments.length,
            assignments,
        });
} catch(error){
    console.error(error);

    res.status(500).json({
        message: "Server error",
    });
}
};

const getAssignmentById = async(req,res) => {
    try{
        const assignment = await Assignment.findById(req.params.id)
        .populate("subject", "name code couse semester")
        .populate("teacher", "name email");
        
        if(!assignment) {
            return res.status(404).json({
                message: "Assignment not found",
            });
        }
        res.status(200).json({
            assignment,
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
  createAssignment,
  getMyAssignments,
  getStudentAssignments,
  getAssignmentById,
};

