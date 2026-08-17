const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { escalateComplaint } = require('../services/escalationService');

const startEscalationJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      
      const overdueComplaints = await Complaint.find({
        status: { $nin: ['Resolved', 'Rejected', 'Closed'] },
        deadline: { $lt: now },
        escalationLevel: { $lt: 4 }
      });

      let escalatedCount = 0;

      for (const complaint of overdueComplaints) {
        try {
          await escalateComplaint(complaint);
          escalatedCount++;
        } catch (err) {
          console.error(`Error escalating complaint ${complaint._id}:`, err);
        }
      }

      console.log(`[Escalation Job] Checked ${overdueComplaints.length} complaints, escalated ${escalatedCount}`);
    } catch (error) {
      console.error('[Escalation Job] Error checking for overdue complaints:', error);
    }
  });
};

module.exports = { startEscalationJob };
