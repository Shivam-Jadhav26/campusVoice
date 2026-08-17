require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // Drop existing collections to ensure fresh schema & indexes
    const collections = await db.collections();
    for (const collection of collections) {
      try {
        await collection.drop();
      } catch (err) {
        // Ignore if collection doesn't exist
      }
    }
    console.log('Cleared existing collections and indexes');

    // ==========================================
    // 1. CREATE DEPARTMENTS
    // ==========================================
    const deptData = [
      { name: 'Computer Engineering', code: 'CE', description: 'Department of Computer Engineering & Science' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
      { name: 'Electronics & Telecom', code: 'EXTC', description: 'Department of Electronics and Telecommunication' },
      { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
      { name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' }
    ].map(d => ({
      ...d,
      _id: new mongoose.Types.ObjectId(),
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 3600000),
      updatedAt: new Date()
    }));

    await db.collection('departments').insertMany(deptData);
    console.log(`Created ${deptData.length} departments`);

    const ceDept = deptData[0];
    const itDept = deptData[1];

    // ==========================================
    // 2. CREATE USERS
    // ==========================================
    const hashedPassword = await bcrypt.hash('Password@123', 12);

    const usersData = [
      // Admin
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Super Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+1 555-0100',
        isActive: true
      },
      // Students
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Alex Johnson',
        email: 'student@demo.com',
        password: hashedPassword,
        role: 'student',
        department: ceDept._id,
        departmentName: ceDept.name,
        class: 'SE-A',
        rollNumber: 'CE2024001',
        phone: '+1 555-0101',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Priya Sharma',
        email: 'student2@demo.com',
        password: hashedPassword,
        role: 'student',
        department: ceDept._id,
        departmentName: ceDept.name,
        class: 'TE-B',
        rollNumber: 'CE2024045',
        phone: '+1 555-0102',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'David Miller',
        email: 'student3@demo.com',
        password: hashedPassword,
        role: 'student',
        department: itDept._id,
        departmentName: itDept.name,
        class: 'BE-A',
        rollNumber: 'IT2024012',
        phone: '+1 555-0103',
        isActive: true
      },
      // Faculty & Staff
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Prof. Robert Brown',
        email: 'teacher@demo.com',
        password: hashedPassword,
        role: 'teacher',
        department: ceDept._id,
        departmentName: ceDept.name,
        phone: '+1 555-0104',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Prof. Anita Desai',
        email: 'teacher2@demo.com',
        password: hashedPassword,
        role: 'teacher',
        department: ceDept._id,
        departmentName: ceDept.name,
        phone: '+1 555-0105',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Prof. Vikram Mehta',
        email: 'tg@demo.com',
        password: hashedPassword,
        role: 'tg',
        department: ceDept._id,
        departmentName: ceDept.name,
        phone: '+1 555-0106',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Prof. Sarah Wilson',
        email: 'classincharge@demo.com',
        password: hashedPassword,
        role: 'class_incharge',
        department: ceDept._id,
        departmentName: ceDept.name,
        class: 'SE-A',
        phone: '+1 555-0107',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dr. Arthur Davis',
        email: 'hod@demo.com',
        password: hashedPassword,
        role: 'hod',
        department: ceDept._id,
        departmentName: ceDept.name,
        phone: '+1 555-0108',
        isActive: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dr. Elena Rostova',
        email: 'committee@demo.com',
        password: hashedPassword,
        role: 'committee',
        phone: '+1 555-0109',
        isActive: true
      }
    ].map(u => ({
      ...u,
      notificationPreferences: { email: true, push: true, sms: false },
      createdAt: new Date(Date.now() - 30 * 24 * 3600000),
      updatedAt: new Date()
    }));

    await db.collection('users').insertMany(usersData);
    console.log(`Created ${usersData.length} users`);

    // Assign HOD to CE Department
    const adminUser = usersData[0];
    const student1 = usersData[1];
    const student2 = usersData[2];
    const student3 = usersData[3];
    const teacher1 = usersData[4];
    const teacher2 = usersData[5];
    const tgUser = usersData[6];
    const inchargeUser = usersData[7];
    const hodUser = usersData[8];
    const committeeUser = usersData[9];

    await db.collection('departments').updateOne({ _id: ceDept._id }, { $set: { hod: hodUser._id } });

    // ==========================================
    // 3. CREATE SUBJECTS
    // ==========================================
    const subjectsData = [
      { _id: new mongoose.Types.ObjectId(), name: 'Data Structures & Algorithms', code: 'CS201', department: ceDept._id, teacher: teacher1._id, semester: 3, credits: 4, isActive: true },
      { _id: new mongoose.Types.ObjectId(), name: 'Database Management Systems', code: 'CS202', department: ceDept._id, teacher: teacher2._id, semester: 4, credits: 4, isActive: true },
      { _id: new mongoose.Types.ObjectId(), name: 'Computer Networks', code: 'CS301', department: ceDept._id, teacher: teacher1._id, semester: 5, credits: 3, isActive: true },
      { _id: new mongoose.Types.ObjectId(), name: 'Operating Systems', code: 'CS302', department: ceDept._id, teacher: teacher2._id, semester: 5, credits: 4, isActive: true },
      { _id: new mongoose.Types.ObjectId(), name: 'Artificial Intelligence', code: 'CS401', department: ceDept._id, teacher: hodUser._id, semester: 7, credits: 3, isActive: true },
      { _id: new mongoose.Types.ObjectId(), name: 'Cloud Computing', code: 'IT301', department: itDept._id, semester: 6, credits: 3, isActive: true }
    ].map(s => ({ ...s, createdAt: new Date(), updatedAt: new Date() }));

    await db.collection('subjects').insertMany(subjectsData);
    console.log(`Created ${subjectsData.length} subjects`);

    // ==========================================
    // 4. CREATE COMPLAINTS & HISTORIES
    // ==========================================
    const now = Date.now();
    const complaintsSeed = [
      {
        title: 'Projector not working in Lab 304',
        description: 'The ceiling projector in Computer Lab 304 keeps flickering and turns off automatically every 5 minutes during practical sessions.',
        category: 'Laboratory',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Lab 304, 3rd Floor, Tech Block',
        priority: 'High',
        student: student1,
        currentHandler: 'Teacher',
        handlerUser: teacher1,
        status: 'In Progress',
        escalationLevel: 0,
        daysAgo: 2,
        history: [
          { action: 'Created', desc: 'Complaint submitted by student', by: student1, role: 'student' },
          { action: 'Assigned', desc: `Automatically routed to ${teacher1.name} (Teacher)`, by: null, role: 'system', isSystem: true },
          { action: 'Status Update', desc: 'Hardware technician has been scheduled for inspection tomorrow morning.', by: teacher1, role: 'teacher' }
        ]
      },
      {
        title: 'Air conditioning malfunction in Central Library Reading Hall',
        description: 'The main HVAC unit on the 2nd floor silent study area is producing loud rattling noises and blowing warm air.',
        category: 'Infrastructure',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Central Library, 2nd Floor',
        priority: 'Medium',
        student: student2,
        currentHandler: 'Teacher',
        handlerUser: teacher1,
        status: 'Pending',
        escalationLevel: 0,
        daysAgo: 1,
        history: [
          { action: 'Created', desc: 'Complaint submitted by student', by: student2, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher1.name}`, by: null, role: 'system', isSystem: true }
        ]
      },
      {
        title: 'Wi-Fi connectivity drop in Boys Hostel Wing B',
        description: 'Frequent packet loss and zero signal on the 3rd and 4th floors of Hostel B since Monday. Online submissions are getting disrupted.',
        category: 'Hostel',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Hostel B, 3rd & 4th Floors',
        priority: 'Critical',
        student: student1,
        currentHandler: 'HOD',
        handlerUser: hodUser,
        status: 'Escalated',
        escalationLevel: 3,
        daysAgo: 6,
        isEscalated: true,
        history: [
          { action: 'Created', desc: 'Complaint submitted by student', by: student1, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher1.name}`, by: null, isSystem: true },
          { action: 'Escalated', desc: 'SLA breached at Teacher level. Auto-escalated to Teacher Guardian.', by: null, isSystem: true },
          { action: 'Escalated', desc: 'SLA breached at TG level. Auto-escalated to Class Incharge.', by: null, isSystem: true },
          { action: 'Escalated', desc: `Escalated to HOD (${hodUser.name}) for vendor intervention.`, by: inchargeUser, role: 'class_incharge' }
        ]
      },
      {
        title: 'Broken chairs and faulty power sockets in Seminar Hall',
        description: 'Several armchairs in rows D and E are broken. Multiple laptops cannot be plugged in during guest lectures.',
        category: 'Infrastructure',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Main Seminar Hall, Ground Floor',
        priority: 'Low',
        student: student3,
        currentHandler: 'Teacher',
        handlerUser: teacher2,
        status: 'Resolved',
        escalationLevel: 0,
        daysAgo: 10,
        resolvedAt: new Date(now - 3 * 24 * 3600000),
        resolution: {
          note: 'Carpentry and electrical maintenance completed. 12 chairs replaced and 6 sockets re-wired.',
          resolvedBy: teacher2._id,
          resolvedByName: teacher2.name,
          resolvedAt: new Date(now - 3 * 24 * 3600000)
        },
        history: [
          { action: 'Created', desc: 'Complaint submitted by student', by: student3, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher2.name}`, by: null, isSystem: true },
          { action: 'Resolved', desc: 'Carpentry and electrical maintenance completed.', by: teacher2, role: 'teacher' }
        ]
      },
      {
        title: 'Discrepancy in Mid-Term Internal Marks display on portal',
        description: 'The marks shown for CS201 Data Structures on the portal do not match the evaluated answer scripts shown in class.',
        category: 'Academic',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Academic Section',
        priority: 'High',
        student: student1,
        currentHandler: 'Class Incharge',
        handlerUser: inchargeUser,
        status: 'In Progress',
        escalationLevel: 2,
        daysAgo: 4,
        history: [
          { action: 'Created', desc: 'Complaint submitted by student', by: student1, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher1.name}`, by: null, isSystem: true },
          { action: 'Transferred', desc: `Transferred to Class Incharge (${inchargeUser.name}) for cross-verification with exam cell.`, by: teacher1, role: 'teacher' }
        ]
      },
      {
        title: 'Hygiene and food quality issue in South Campus Canteen',
        description: 'Unfiltered drinking water dispenser and unhygienic food handling noticed during lunch hours. Several students reported stomach infections.',
        category: 'Mess',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Campus Canteen A',
        priority: 'Critical',
        student: student2,
        currentHandler: 'Committee',
        handlerUser: committeeUser,
        status: 'Escalated',
        escalationLevel: 4,
        daysAgo: 7,
        isEscalated: true,
        history: [
          { action: 'Created', desc: 'Complaint submitted with photo evidence', by: student2, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher2.name}`, by: null, isSystem: true },
          { action: 'Escalated', desc: 'Escalated to HOD due to health severity', by: tgUser, role: 'tg' },
          { action: 'Escalated', desc: 'Escalated to Student Welfare Committee for vendor audit', by: hodUser, role: 'hod' }
        ]
      },
      {
        title: 'Outdated Python compiler and IDE versions in Software Lab 2',
        description: 'Software Lab 2 still runs Python 3.7 which lacks syntax support for newer modules required in the AI curriculum.',
        category: 'Laboratory',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'Lab 202',
        priority: 'Medium',
        student: student1,
        currentHandler: 'Teacher',
        handlerUser: teacher1,
        status: 'Resolved',
        escalationLevel: 0,
        daysAgo: 14,
        resolvedAt: new Date(now - 5 * 24 * 3600000),
        resolution: {
          note: 'IT team updated all 40 workstations to Python 3.12 and VS Code latest build with required extensions.',
          resolvedBy: teacher1._id,
          resolvedByName: teacher1.name,
          resolvedAt: new Date(now - 5 * 24 * 3600000)
        },
        history: [
          { action: 'Created', desc: 'Complaint created', by: student1, role: 'student' },
          { action: 'Assigned', desc: `Assigned to ${teacher1.name}`, by: null, isSystem: true },
          { action: 'Resolved', desc: 'All lab workstations updated.', by: teacher1, role: 'teacher' }
        ]
      },
      {
        title: 'Delay in Bus Route #4 arrival causing morning lecture delays',
        description: 'College bus on Route 4 consistently arrives 25 minutes late at the North Gate stop, causing students to miss the 8:30 AM attendance.',
        category: 'Transport',
        department: ceDept.name,
        departmentId: ceDept._id,
        location: 'North Gate Bus Stop',
        priority: 'Medium',
        student: student3,
        currentHandler: 'Teacher Guardian',
        handlerUser: tgUser,
        status: 'Pending',
        escalationLevel: 1,
        daysAgo: 3,
        history: [
          { action: 'Created', desc: 'Complaint created by student', by: student3, role: 'student' },
          { action: 'Assigned', desc: `Forwarded to TG (${tgUser.name}) to check with transport office`, by: teacher1, role: 'teacher' }
        ]
      }
    ];

    const complaintsToInsert = [];
    const historiesToInsert = [];

    complaintsSeed.forEach((item, index) => {
      const complaintId = new mongoose.Types.ObjectId();
      const createdAt = new Date(now - item.daysAgo * 24 * 3600000);
      const deadline = new Date(createdAt.getTime() + 24 * 3600000);
      const year = new Date().getFullYear();
      const complaintNumber = `CMP-${year}-${String(index + 1).padStart(6, '0')}`;

      complaintsToInsert.push({
        _id: complaintId,
        complaintNumber,
        title: item.title,
        description: item.description,
        category: item.category,
        department: item.department,
        departmentId: item.departmentId,
        location: item.location,
        priority: item.priority,
        isCritical: item.priority === 'Critical',
        isEscalated: !!item.isEscalated,
        studentId: item.student._id,
        studentName: item.student.name,
        studentRoll: item.student.rollNumber || 'CE2024001',
        studentClass: item.student.class || 'SE-A',
        currentHandler: item.currentHandler,
        currentHandlerId: item.handlerUser._id,
        currentHandlerName: item.handlerUser.name,
        status: item.status,
        escalationLevel: item.escalationLevel,
        deadline,
        resolvedAt: item.resolvedAt || null,
        resolution: item.resolution || null,
        attachments: [],
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 12 * 3600000)
      });

      // Insert Timeline Histories
      item.history.forEach((h, hIdx) => {
        historiesToInsert.push({
          _id: new mongoose.Types.ObjectId(),
          complaint: complaintId,
          action: h.action,
          description: h.desc,
          performedBy: h.by ? h.by._id : null,
          performedByName: h.by ? h.by.name : (h.isSystem ? 'System Engine' : 'Administrator'),
          performedByRole: h.role || (h.isSystem ? 'system' : 'admin'),
          isSystem: !!h.isSystem,
          createdAt: new Date(createdAt.getTime() + (hIdx + 1) * 3 * 3600000),
          updatedAt: new Date(createdAt.getTime() + (hIdx + 1) * 3 * 3600000)
        });
      });
    });

    await db.collection('complaints').insertMany(complaintsToInsert);
    await db.collection('complainthistories').insertMany(historiesToInsert);
    console.log(`Created ${complaintsToInsert.length} complaints with ${historiesToInsert.length} history records`);

    // ==========================================
    // 5. CREATE FEEDBACK
    // ==========================================
    const feedbackData = [
      {
        type: 'Academic',
        rating: 5,
        comment: 'The hybrid lab sessions and hands-on coding demos by the Computer Engineering faculty have greatly improved our practical understanding.',
        department: ceDept.name,
        departmentId: ceDept._id,
        isAnonymous: false,
        studentId: student1._id,
        studentName: student1.name,
        sentiment: 'Positive',
        urgencyLevel: 'Low',
        sentimentScore: 0.88,
        status: 'Reviewed',
        adminNote: 'Shared appreciation note with faculty during monthly meeting.',
        reviewedBy: hodUser._id,
        reviewedAt: new Date(now - 2 * 24 * 3600000),
        createdAt: new Date(now - 5 * 24 * 3600000)
      },
      {
        type: 'Mess',
        rating: 2,
        comment: 'The evening snacks menu in the hostel mess lacks variety and often runs out by 5:30 PM.',
        department: ceDept.name,
        departmentId: ceDept._id,
        isAnonymous: true,
        studentId: student2._id,
        studentName: 'Anonymous Student',
        sentiment: 'Negative',
        urgencyLevel: 'Medium',
        sentimentScore: -0.65,
        status: 'Active',
        createdAt: new Date(now - 3 * 24 * 3600000)
      },
      {
        type: 'Library',
        rating: 4,
        comment: 'Great collection of latest IEEE transaction journals and Springer publications. Extended digital kiosk hours are very convenient.',
        department: ceDept.name,
        departmentId: ceDept._id,
        isAnonymous: false,
        studentId: student3._id,
        studentName: student3.name,
        sentiment: 'Positive',
        urgencyLevel: 'Low',
        sentimentScore: 0.75,
        status: 'Active',
        createdAt: new Date(now - 1 * 24 * 3600000)
      },
      {
        type: 'Infrastructure',
        rating: 3,
        comment: 'Classroom acoustic system in Room 204 has slight echo. Microphone battery backup could be improved.',
        department: ceDept.name,
        departmentId: ceDept._id,
        isAnonymous: true,
        studentId: student1._id,
        studentName: 'Anonymous Student',
        sentiment: 'Neutral',
        urgencyLevel: 'Low',
        sentimentScore: 0.05,
        status: 'Active',
        createdAt: new Date(now - 2 * 24 * 3600000)
      },
      {
        type: 'Faculty',
        rating: 5,
        comment: 'Dr. Arthur Davis gave exceptional mentorship for our capstone project architecture review.',
        department: ceDept.name,
        departmentId: ceDept._id,
        isAnonymous: false,
        studentId: student2._id,
        studentName: student2.name,
        sentiment: 'Positive',
        urgencyLevel: 'Low',
        sentimentScore: 0.92,
        status: 'Reviewed',
        adminNote: 'Noted for annual performance review.',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(now - 1 * 24 * 3600000),
        createdAt: new Date(now - 4 * 24 * 3600000)
      }
    ].map(f => ({
      _id: new mongoose.Types.ObjectId(),
      ...f,
      updatedAt: f.createdAt
    }));

    await db.collection('feedbacks').insertMany(feedbackData);
    console.log(`Created ${feedbackData.length} feedback records`);

    // ==========================================
    // 6. CREATE ACADEMIC REVIEWS
    // ==========================================
    const reviewsData = [
      {
        _id: new mongoose.Types.ObjectId(),
        requestId: `REV-${new Date().getFullYear()}-00001`,
        student: student1._id,
        studentName: student1.name,
        studentRoll: student1.rollNumber,
        studentClass: student1.class,
        department: ceDept.name,
        departmentId: ceDept._id,
        subject: subjectsData[0]._id,
        subjectName: subjectsData[0].name,
        subjectCode: subjectsData[0].code,
        examType: 'Mid-Term',
        semester: 3,
        academicYear: '2024-2025',
        originalMarks: 24,
        maxMarks: 40,
        reason: 'Question 3(b) regarding AVL tree balance factors was marked incorrect, but step-by-step rotations match the textbook algorithm standard.',
        status: 'Accepted',
        assignedFaculty: teacher1._id,
        assignedFacultyName: teacher1.name,
        facultyDecision: {
          decision: 'Accept',
          remarks: 'Reviewed answer script. Steps for left-right double rotation are valid. +4 marks granted.',
          revisedMarks: 28,
          decidedBy: teacher1._id,
          decidedByName: teacher1.name,
          decidedAt: new Date(now - 2 * 24 * 3600000)
        },
        timeline: [
          { action: 'Submitted', description: 'Re-evaluation request submitted by student', performedBy: student1._id, performedByName: student1.name, performedByRole: 'student', timestamp: new Date(now - 4 * 24 * 3600000) },
          { action: 'Faculty Review', description: 'Evaluated and accepted with revised score 28/40', performedBy: teacher1._id, performedByName: teacher1.name, performedByRole: 'teacher', timestamp: new Date(now - 2 * 24 * 3600000) }
        ],
        createdAt: new Date(now - 4 * 24 * 3600000),
        updatedAt: new Date(now - 2 * 24 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        requestId: `REV-${new Date().getFullYear()}-00002`,
        student: student2._id,
        studentName: student2.name,
        studentRoll: student2.rollNumber,
        studentClass: student2.class,
        department: ceDept.name,
        departmentId: ceDept._id,
        subject: subjectsData[1]._id,
        subjectName: subjectsData[1].name,
        subjectCode: subjectsData[1].code,
        examType: 'Internal',
        semester: 4,
        academicYear: '2024-2025',
        originalMarks: 14,
        maxMarks: 20,
        reason: 'SQL normalization query for 3NF was fully solved but 3 marks were deducted for syntax formatting.',
        status: 'Under Faculty Review',
        assignedFaculty: teacher2._id,
        assignedFacultyName: teacher2.name,
        timeline: [
          { action: 'Submitted', description: 'Re-evaluation request submitted by student', performedBy: student2._id, performedByName: student2.name, performedByRole: 'student', timestamp: new Date(now - 1 * 24 * 3600000) }
        ],
        createdAt: new Date(now - 1 * 24 * 3600000),
        updatedAt: new Date(now - 1 * 24 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        requestId: `REV-${new Date().getFullYear()}-00003`,
        student: student1._id,
        studentName: student1.name,
        studentRoll: student1.rollNumber,
        studentClass: student1.class,
        department: ceDept.name,
        departmentId: ceDept._id,
        subject: subjectsData[2]._id,
        subjectName: subjectsData[2].name,
        subjectCode: subjectsData[2].code,
        examType: 'End-Term',
        semester: 5,
        academicYear: '2024-2025',
        originalMarks: 52,
        maxMarks: 80,
        reason: 'TCP sliding window flow control calculation was rechecked with standard formulas.',
        status: 'Under HOD Review',
        assignedFaculty: teacher1._id,
        assignedFacultyName: teacher1.name,
        assignedHOD: hodUser._id,
        facultyDecision: {
          decision: 'Escalate',
          remarks: 'Requires HOD endorsement due to End-Term paper re-moderation threshold.',
          decidedBy: teacher1._id,
          decidedByName: teacher1.name,
          decidedAt: new Date(now - 12 * 3600000)
        },
        timeline: [
          { action: 'Submitted', description: 'Request submitted', performedBy: student1._id, performedByName: student1.name, performedByRole: 'student', timestamp: new Date(now - 3 * 24 * 3600000) },
          { action: 'Escalated', description: 'Referred to HOD for final endorsement', performedBy: teacher1._id, performedByName: teacher1.name, performedByRole: 'teacher', timestamp: new Date(now - 12 * 3600000) }
        ],
        createdAt: new Date(now - 3 * 24 * 3600000),
        updatedAt: new Date()
      }
    ];

    await db.collection('academicreviews').insertMany(reviewsData);
    console.log(`Created ${reviewsData.length} academic reviews`);

    // ==========================================
    // 7. CREATE NOTIFICATIONS
    // ==========================================
    const notificationsData = [
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: student1._id,
        title: 'Complaint Update',
        message: 'Your complaint "Projector not working in Lab 304" status changed to In Progress.',
        type: 'complaint',
        entityId: complaintsToInsert[0]._id,
        entityType: 'Complaint',
        link: `/student/complaints/${complaintsToInsert[0]._id}`,
        isRead: false,
        priority: 'high',
        createdAt: new Date(now - 2 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: student1._id,
        title: 'Academic Review Accepted',
        message: 'Your re-evaluation for Data Structures & Algorithms was accepted. Revised marks: 28/40.',
        type: 'academic_review',
        entityId: reviewsData[0]._id,
        entityType: 'AcademicReview',
        link: '/student/academic-review',
        isRead: true,
        priority: 'normal',
        readAt: new Date(now - 12 * 3600000),
        createdAt: new Date(now - 24 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: teacher1._id,
        title: 'New Complaint Assigned',
        message: 'New complaint "Air conditioning malfunction in Central Library" assigned to you.',
        type: 'complaint',
        entityId: complaintsToInsert[1]._id,
        entityType: 'Complaint',
        link: `/teacher/complaints/${complaintsToInsert[1]._id}`,
        isRead: false,
        priority: 'normal',
        createdAt: new Date(now - 4 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: hodUser._id,
        title: 'Urgent Escalation Notice',
        message: 'Critical complaint "Wi-Fi connectivity drop in Boys Hostel Wing B" has been escalated to HOD level.',
        type: 'escalation',
        entityId: complaintsToInsert[2]._id,
        entityType: 'Complaint',
        link: `/hod/complaints`,
        isRead: false,
        priority: 'urgent',
        createdAt: new Date(now - 6 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: committeeUser._id,
        title: 'Committee Review Pending',
        message: 'Complaint "Hygiene and food quality issue in South Campus Canteen" reached Committee level.',
        type: 'escalation',
        entityId: complaintsToInsert[5]._id,
        entityType: 'Complaint',
        link: `/committee/complaints`,
        isRead: false,
        priority: 'urgent',
        createdAt: new Date(now - 1 * 3600000)
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: adminUser._id,
        title: 'System Activity Alert',
        message: 'Weekly system analytics summary is ready for review.',
        type: 'system',
        link: '/admin/analytics',
        isRead: false,
        priority: 'normal',
        createdAt: new Date(now - 8 * 3600000)
      }
    ].map(n => ({ ...n, updatedAt: n.createdAt }));

    await db.collection('notifications').insertMany(notificationsData);
    console.log(`Created ${notificationsData.length} notifications`);

    // ==========================================
    // SUMMARY CREDENTIALS
    // ==========================================
    console.log('\n======================================================');
    console.log('🎉 Seed Completed Successfully with Rich SaaS Demo Data!');
    console.log('======================================================');
    console.log('All accounts share the password: Password@123\n');
    usersData.forEach(u => {
      console.log(`• Role: [${u.role.padEnd(14)}] | Name: ${u.name.padEnd(20)} | Email: ${u.email}`);
    });
    console.log('======================================================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDB();
