const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelpers');

exports.getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const complaints = await Complaint.find({
      $or: [{ studentId: userId }, { student: userId }]
    }).sort({ createdAt: -1 });

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const escalated = complaints.filter(c => c.status === 'Escalated').length;

    const recentComplaints = complaints.slice(0, 5);
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5);

    const statusDistribution = [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inProgress },
      { name: 'Resolved', value: resolved },
      { name: 'Escalated', value: escalated }
    ].filter(s => s.value > 0);

    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' && c.resolvedAt);
    let avgResolutionTime = '24h';
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((acc, c) => acc + (new Date(c.resolvedAt) - new Date(c.createdAt)), 0);
      const hours = Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60));
      avgResolutionTime = `${hours}h`;
    }

    const kpis = { total, pending, inProgress, resolved, escalated, avgResolutionTime };

    return sendSuccess(res, {
      kpis,
      total,
      pending,
      inProgress,
      resolved,
      escalated,
      recentComplaints,
      notifications,
      statusDistribution,
      avgResolutionTime
    }, 'Student dashboard data');
  } catch (error) {
    next(error);
  }
};

exports.getStaffDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const assignedComplaints = await Complaint.find({
      $or: [{ currentHandlerId: userId }, { assignedTo: userId }]
    }).sort({ createdAt: -1 });

    const total = assignedComplaints.length;
    const pending = assignedComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = assignedComplaints.filter(c => c.status === 'In Progress').length;
    const resolved = assignedComplaints.filter(c => c.status === 'Resolved').length;
    const escalated = assignedComplaints.filter(c => c.status === 'Escalated').length;

    const now = new Date();
    const overdue = assignedComplaints.filter(c => c.deadline && new Date(c.deadline) < now && c.status !== 'Resolved').length;
    const dueToday = assignedComplaints.filter(c => {
      if (!c.deadline) return false;
      const due = new Date(c.deadline);
      return due.toDateString() === now.toDateString() && c.status !== 'Resolved';
    }).length;

    const recent = assignedComplaints.slice(0, 5);

    return sendSuccess(res, {
      total,
      pending,
      inProgress,
      resolved,
      escalated,
      overdue,
      dueToday,
      recentAssigned: recent,
      recentComplaints: recent
    }, 'Staff dashboard data');
  } catch (error) {
    next(error);
  }
};

exports.getHODDashboard = async (req, res, next) => {
  try {
    const deptId = req.user.department;
    const deptName = req.user.departmentName;

    const query = {
      $or: [
        ...(deptId ? [{ departmentId: deptId }] : []),
        ...(deptName ? [{ department: deptName }] : [])
      ]
    };

    const complaints = await Complaint.find(query.length ? query : {}).sort({ createdAt: -1 });

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const escalated = complaints.filter(c => c.status === 'Escalated').length;
    const critical = complaints.filter(c => c.priority === 'Critical').length;

    const categoryBreakdown = await Complaint.aggregate([
      ...(deptName ? [{ $match: { department: deptName } }] : []),
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priorityBreakdown = await Complaint.aggregate([
      ...(deptName ? [{ $match: { department: deptName } }] : []),
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, {
      total,
      pending,
      resolved,
      escalated,
      critical,
      categoryBreakdown,
      priorityBreakdown,
      recentComplaints: complaints.slice(0, 5)
    }, 'HOD dashboard data');
  } catch (error) {
    next(error);
  }
};

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: { $in: ['teacher', 'tg', 'class_incharge', 'hod'] } });
    const totalComplaints = await Complaint.countDocuments();

    const statusBreakdown = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const deptBreakdown = await Complaint.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const catBreakdown = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const escalated = await Complaint.countDocuments({ status: 'Escalated' });

    const resolutionRate = totalComplaints ? Math.round((resolved / totalComplaints) * 100) : 0;
    const escalationRate = totalComplaints ? Math.round((escalated / totalComplaints) * 100) : 0;

    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);

    return sendSuccess(res, {
      totalStudents,
      totalFaculty,
      totalComplaints,
      statusBreakdown,
      deptBreakdown,
      catBreakdown,
      resolutionRate,
      escalationRate,
      recentComplaints
    }, 'Admin dashboard data');
  } catch (error) {
    next(error);
  }
};

exports.getCommitteeDashboard = async (req, res, next) => {
  try {
    const escalated = await Complaint.find({
      $or: [{ status: 'Escalated' }, { escalationLevel: { $gte: 3 } }]
    }).sort({ createdAt: -1 });

    return sendSuccess(res, {
      escalatedComplaints: escalated,
      count: escalated.length,
      recentComplaints: escalated.slice(0, 5)
    }, 'Committee dashboard data');
  } catch (error) {
    next(error);
  }
};
