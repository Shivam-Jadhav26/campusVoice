const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CATEGORIES = ['Academic', 'Infrastructure', 'Laboratory', 'Hostel', 'Library', 'Mess', 'Faculty', 'Transport', 'IT', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated', 'Reopened', 'Closed'];
const ESCALATION_LEVELS = ['Teacher', 'TG', 'Class Incharge', 'HOD'];

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  url: String,
});

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true },
    department: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    location: { type: String, trim: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },

    // Student
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String },
    studentRoll: { type: String },
    studentClass: { type: String },

    // Handler
    currentHandler: { type: String, default: 'Teacher' }, // role label
    currentHandlerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    currentHandlerName: { type: String },

    // Status
    status: { type: String, enum: STATUSES, default: 'Pending', index: true },
    escalationLevel: { type: Number, default: 0, min: 0, max: 3 }, // 0=Teacher..3=HOD

    // Deadlines
    deadline: { type: Date, index: true },
    resolvedAt: { type: Date },
    closedAt: { type: Date },

    // Resolution
    resolution: {
      note: String,
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedByName: String,
      resolvedAt: Date,
    },

    // Attachments
    attachments: [attachmentSchema],

    // Flags
    isEscalated: { type: Boolean, default: false },
    isCritical: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    parentComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // AI metadata
    aiSuggestedCategory: String,
    aiSuggestedPriority: String,
    aiConfidenceScore: Number,

    // Settings snapshot (escalation times in hours)
    escalationConfig: {
      teacherHours: { type: Number, default: 24 },
      tgHours: { type: Number, default: 24 },
      classInchargeHours: { type: Number, default: 24 },
      hodHours: { type: Number, default: 24 },
    },
  },
  { timestamps: true }
);

// Auto-generate complaint number before saving
complaintSchema.pre('save', async function () {
  if (!this.complaintNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintNumber = `CMP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  if (this.priority === 'Critical') this.isCritical = true;
});

// Indexes
complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ currentHandlerId: 1, status: 1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ deadline: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
