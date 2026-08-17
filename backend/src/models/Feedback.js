const mongoose = require('mongoose');

const FEEDBACK_TYPES = ['Academic', 'Infrastructure', 'Library', 'Hostel', 'Mess', 'Faculty', 'General'];

const feedbackSchema = new mongoose.Schema(
  {
    type: { type: String, enum: FEEDBACK_TYPES, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxlength: 1000 },
    department: { type: String },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    // Anonymous
    isAnonymous: { type: Boolean, default: false },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // always stored
    studentName: { type: String },

    // AI sentiment
    sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
    urgencyLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    sentimentScore: { type: Number, default: 0 }, // -1 to 1

    status: { type: String, enum: ['Active', 'Reviewed', 'Archived'], default: 'Active' },
    adminNote: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

feedbackSchema.index({ department: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
