const mongoose = require('mongoose');

const academicReviewSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: String,
    studentRoll: String,
    studentClass: String,
    department: String,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: { type: String, required: true },
    subjectCode: { type: String },
    examType: { type: String, enum: ['Mid-Term', 'End-Term', 'Internal', 'Practical', 'Assignment'], required: true },
    semester: { type: Number, min: 1, max: 8 },
    academicYear: { type: String },

    originalMarks: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true },
    reason: { type: String, required: true, maxlength: 1000 },

    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        size: Number,
      },
    ],

    status: {
      type: String,
      enum: ['Pending', 'Under Faculty Review', 'Under HOD Review', 'Accepted', 'Rejected', 'Marks Updated'],
      default: 'Pending',
    },

    // Faculty Decision
    facultyDecision: {
      decision: { type: String, enum: ['Accept', 'Reject', 'Escalate'] },
      remarks: String,
      revisedMarks: Number,
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      decidedByName: String,
      decidedAt: Date,
    },

    // HOD Decision
    hodDecision: {
      decision: { type: String, enum: ['Accept', 'Reject', 'Final'] },
      remarks: String,
      finalMarks: Number,
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      decidedByName: String,
      decidedAt: Date,
    },

    assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedFacultyName: String,
    assignedHOD: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    timeline: [
      {
        action: String,
        description: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: String,
        performedByRole: String,
        isSystem: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

academicReviewSchema.pre('save', async function () {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('AcademicReview').countDocuments();
    this.requestId = `REV-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('AcademicReview', academicReviewSchema);
