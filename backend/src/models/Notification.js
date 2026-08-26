const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'complaint', 'feedback', 'academic_review', 'system', 'escalation', 'resolution',
        'complaint_created', 'complaint_assigned', 'complaint_escalated', 'complaint_resolved',
        'complaint_updated', 'academic_review_updated'
      ],
      default: 'system',
    },
    entityId: { type: mongoose.Schema.Types.ObjectId }, // complaint / feedback / review ID
    entityType: { type: String, enum: ['Complaint', 'Feedback', 'AcademicReview', null] },
    link: { type: String }, // frontend route
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
