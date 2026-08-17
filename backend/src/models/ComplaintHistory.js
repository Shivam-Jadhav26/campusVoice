const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByName: { type: String },
    performedByRole: { type: String },
    isSystem: { type: Boolean, default: false }, // true for auto-escalation etc
    previousStatus: { type: String },
    newStatus: { type: String },
    previousHandler: { type: String },
    newHandler: { type: String },
    message: { type: String }, // reply message
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

complaintHistorySchema.index({ complaint: 1, createdAt: 1 });

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
