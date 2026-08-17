const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const createNotification = async (recipientId, title, message, type, entityId, entityType, link, priority = 'normal') => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      entityId,
      entityType,
      link,
      priority
    });

    try {
      const io = getIO();
      if (io) {
        io.to(recipientId.toString()).emit('notification', notification);
      }
    } catch (socketError) {
      console.error('Socket IO error:', socketError);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const notifyComplaintCreated = async (complaint, studentId) => {
  return createNotification(
    studentId,
    'Complaint Created',
    `Your complaint "${complaint.title}" has been successfully submitted.`,
    'complaint_created',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`
  );
};

const notifyComplaintAssigned = async (complaint, handlerId) => {
  return createNotification(
    handlerId,
    'Complaint Assigned',
    `A new complaint "${complaint.title}" has been assigned to you.`,
    'complaint_assigned',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`
  );
};

const notifyComplaintEscalated = async (complaint, newHandlerId, studentId) => {
  await createNotification(
    newHandlerId,
    'Complaint Escalated',
    `A complaint "${complaint.title}" has been escalated to you.`,
    'complaint_escalated',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`,
    'high'
  );

  return createNotification(
    studentId,
    'Complaint Escalated',
    `Your complaint "${complaint.title}" has been escalated to the next level.`,
    'complaint_escalated',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`
  );
};

const notifyComplaintResolved = async (complaint, studentId) => {
  return createNotification(
    studentId,
    'Complaint Resolved',
    `Your complaint "${complaint.title}" has been resolved.`,
    'complaint_resolved',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`
  );
};

const notifyComplaintUpdated = async (complaint, studentId, message) => {
  return createNotification(
    studentId,
    'Complaint Updated',
    message,
    'complaint_updated',
    complaint._id,
    'Complaint',
    `/complaints/${complaint._id}`
  );
};

const notifyAcademicReviewUpdate = async (review, studentId, message) => {
  return createNotification(
    studentId,
    'Academic Review Updated',
    message,
    'academic_review_updated',
    review._id,
    'AcademicReview',
    `/reviews/${review._id}`
  );
};

module.exports = {
  createNotification,
  notifyComplaintCreated,
  notifyComplaintAssigned,
  notifyComplaintEscalated,
  notifyComplaintResolved,
  notifyComplaintUpdated,
  notifyAcademicReviewUpdate
};
