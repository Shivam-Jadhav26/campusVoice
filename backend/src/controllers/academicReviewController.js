const AcademicReview = require('../models/AcademicReview');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelpers');
const { createAuditLog } = require('./auditLogController');

exports.createAcademicReview = async (req, res, next) => {
  try {
    const { subjectName, subjectCode, examType, semester, originalMarks, maxMarks, reason, assignedFaculty } = req.body;
    
    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    let teacher = null;
    if (assignedFaculty) {
      teacher = await User.findById(assignedFaculty);
    }
    
    const review = await AcademicReview.create({
      requestId: 'AR-' + Math.floor(100000 + Math.random() * 900000),
      student: req.user.id,
      studentName: req.user.name,
      studentRoll: req.user.rollNumber,
      studentClass: req.user.class,
      department: req.user.departmentName,
      subjectName: subjectName || 'Unknown',
      subjectCode,
      examType: examType || 'Mid-Term',
      semester: parseInt(semester) || 1,
      originalMarks: Number(originalMarks) || 0,
      maxMarks: Number(maxMarks) || 100,
      reason: reason || '',
      assignedFaculty: teacher ? teacher._id : null,
      assignedFacultyName: teacher ? teacher.name : null,
      status: teacher ? 'Under Faculty Review' : 'Pending',
      attachments,
      timeline: [{ action: 'Request Submitted', description: 'Student requested re-evaluation', performedBy: req.user.id, performedByName: req.user.name, performedByRole: 'student' }]
    });
    
    if (teacher) {
      await Notification.create({
        recipient: teacher._id,
        title: 'New Academic Review Request',
        message: `${req.user.name} has requested a re-evaluation for ${subjectName}`,
        relatedEntity: review._id,
        entityModel: 'AcademicReview'
      });
    }
    
    await createAuditLog(req.user.id, 'CREATE_REVIEW', 'AcademicReview', review._id, 'Academic review requested', req);
    
    return sendSuccess(res, { review }, 'Review request submitted', 201);
  } catch (error) {
    next(error);
  }
};

exports.getAcademicReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    if (req.user.role === 'Student') {
      query.student = req.user.id;
    } else if (req.user.role === 'Teacher' || req.user.role === 'TG' || req.user.role === 'Class Incharge') {
      query.assignedFaculty = req.user.id;
    } else if (req.user.role === 'HOD') {
      // Logic for HOD department
      const deptUsers = await User.find({ department: req.user.department }).select('_id');
      query.student = { $in: deptUsers.map(u => u._id) };
    }
    
    const reviews = await AcademicReview.find(query)
      .populate('student', 'name email')
      .populate('assignedFaculty', 'name')
      .populate('subject', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    const total = await AcademicReview.countDocuments(query);
    
    return sendSuccess(res, { reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) }, 'Reviews retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getAcademicReviewById = async (req, res, next) => {
  try {
    const review = await AcademicReview.findById(req.params.id)
      .populate('student', 'name email')
      .populate('assignedFaculty', 'name')
      .populate('assignedHOD', 'name')
      .populate('subject', 'name code');
      
    if (!review) return sendError(res, 'Review not found', 404);
    
    return sendSuccess(res, { review }, 'Review retrieved');
  } catch (error) {
    next(error);
  }
};

exports.submitFacultyDecision = async (req, res, next) => {
  try {
    const { decision, revisedMarks, comment } = req.body;
    const review = await AcademicReview.findById(req.params.id);
    
    if (!review) return sendError(res, 'Review not found', 404);
    
    if (decision === 'Accept') {
      review.status = 'Accepted';
      review.facultyDecision = { decision, revisedMarks, comment, date: new Date() };
    } else if (decision === 'Reject') {
      review.status = 'Rejected';
      review.facultyDecision = { decision, comment, date: new Date() };
    } else if (decision === 'Escalate') {
      review.status = 'Under HOD Review';
      // Assign HOD
      const hod = await User.findOne({ department: req.user.department, role: 'HOD' });
      if (hod) review.assignedHOD = hod._id;
    }
    
    review.timeline.push({ action: `Faculty Decision: ${decision}`, actor: req.user.id, comment, date: new Date() });
    await review.save();
    
    await Notification.create({
      recipient: review.student,
      title: 'Review Updated',
      message: `Your academic review status changed to ${review.status}.`,
      relatedEntity: review._id,
      entityModel: 'AcademicReview'
    });
    
    await createAuditLog(req.user.id, 'FACULTY_DECISION', 'AcademicReview', review._id, `Faculty decided to ${decision}`, req);
    
    return sendSuccess(res, { review }, 'Decision submitted');
  } catch (error) {
    next(error);
  }
};

exports.submitHODDecision = async (req, res, next) => {
  try {
    const { decision, finalMarks, comment } = req.body;
    const review = await AcademicReview.findById(req.params.id);
    
    if (!review) return sendError(res, 'Review not found', 404);
    
    if (decision === 'Accept') {
      review.status = 'Marks Updated';
      review.hodDecision = { decision, finalMarks, comment, date: new Date() };
    } else if (decision === 'Reject') {
      review.status = 'Rejected';
      review.hodDecision = { decision, comment, date: new Date() };
    }
    
    review.timeline.push({ action: `HOD Decision: ${decision}`, actor: req.user.id, comment, date: new Date() });
    await review.save();
    
    await Notification.create({
      recipient: review.student,
      title: 'HOD Decision Made',
      message: `Final decision on your review: ${decision}.`,
      relatedEntity: review._id,
      entityModel: 'AcademicReview'
    });
    
    await createAuditLog(req.user.id, 'HOD_DECISION', 'AcademicReview', review._id, `HOD decided to ${decision}`, req);
    
    return sendSuccess(res, { review }, 'HOD decision submitted');
  } catch (error) {
    next(error);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await AcademicReview.find({ student: req.user.id })
      .populate('subject', 'name code')
      .populate('assignedTeacher', 'name')
      .sort({ createdAt: -1 });
      
    return sendSuccess(res, { reviews }, 'Your reviews retrieved');
  } catch (error) {
    next(error);
  }
};
