const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userName: String,
    userRole: String,
    action: { type: String, required: true }, // e.g. 'CREATE_COMPLAINT', 'LOGIN', 'ESCALATE'
    entityType: { type: String }, // 'Complaint', 'User', 'Feedback', etc.
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }, // extra context
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
