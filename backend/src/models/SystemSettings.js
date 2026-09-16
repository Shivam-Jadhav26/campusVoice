const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    // We only ever need one document, so we can use a hardcoded id or just rely on single document logic
    isSingleton: { type: Boolean, default: true, unique: true },
    
    // Escalation Timers (Hours)

    escalationTG: { type: Number, default: 48 },
    escalationClassIncharge: { type: Number, default: 72 },
    escalationHOD: { type: Number, default: 120 },

    // General Preferences
    appName: { type: String, default: 'Campus Voice' },
    supportEmail: { type: String, default: 'support@campusvoice.edu' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
