const ROLES = ['student', 'tg', 'class_incharge', 'hod', 'admin'];

const ESCALATION_CHAIN = ['TG', 'Class Incharge', 'HOD'];

const ESCALATION_ROLES = ['tg', 'class_incharge', 'hod'];

const COMPLAINT_CATEGORIES = [
  'Academic', 'Infrastructure', 'Laboratory', 'Hostel', 
  'Library', 'Mess', 'Faculty', 'Transport', 'IT', 'Other'
];

const COMPLAINT_STATUSES = [
  'Pending', 'In Progress', 'Resolved', 'Rejected', 
  'Escalated', 'Reopened', 'Closed'
];

const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const DEFAULT_ESCALATION_HOURS = { 
  tg: 24, 
  class_incharge: 24, 
  hod: 24 
};

module.exports = {
  ROLES,
  ESCALATION_CHAIN,
  ESCALATION_ROLES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
  DEFAULT_ESCALATION_HOURS
};
