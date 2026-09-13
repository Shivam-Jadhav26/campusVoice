const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'rating', 'number'], required: true },
  required: { type: Boolean, default: false }
}, { _id: true });

const responseSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const feedbackRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    fields: [fieldSchema],
    responses: [responseSchema],
    
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending', index: true },
    submittedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedbackRequest', feedbackRequestSchema);
