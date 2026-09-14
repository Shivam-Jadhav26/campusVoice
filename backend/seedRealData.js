require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');

// Models
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Complaint = require('./src/models/Complaint');
const FeedbackRequest = require('./src/models/FeedbackRequest');
const AcademicReview = require('./src/models/AcademicReview');
const Notification = require('./src/models/Notification');
const AuditLog = require('./src/models/AuditLog');
const bcrypt = require('bcryptjs');

const cleanString = (str) => {
  if (!str) return '';
  return String(str).replace(/\r\n/g, ' ').replace(/\n/g, ' ').trim();
};

const extractTG = (rawTg) => {
  let cleaned = cleanString(rawTg);
  const match = cleaned.match(/(.+?)\s*\((\d+)\)/);
  if (match) {
    return { name: match[1].trim(), phone: match[2].trim() };
  }
  return { name: cleaned, phone: '' };
};

const generateEmail = (name) => {
  if (name === 'Viveksingh Chuahan') return 'viveksinghchuahan@sbjit.edu.in';
  if (name === 'Mayuri A. Getme') return 'smayuriagetme@sbjit.edu.in';
  if (name.includes('Sujata')) return 'sujatasardare@sbjit.edu.in';
  if (name.includes('Harshika')) return 'harshikadehariya@sbjit.edu.in';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@sbjit.edu.in';
};

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await FeedbackRequest.deleteMany({});
    await AcademicReview.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    
    // Hash password properly avoiding pre-save double hash issue if we use updateMany
    const hashedPassword = await bcrypt.hash('Password@123', 12);

    // We can just use standard create and let the pre-save hook hash it!
    // Wait, earlier the pre-save hook DID double hash it for some reason?
    // Actually, earlier I manually set them all to `hashedPassword` and it worked. 
    // I will let pre-save hook run. `User.create` runs `pre-save`. 

    // Always create a default admin
    await User.create({
      name: 'System Admin',
      email: 'admin@demo.com',
      password: 'Password@123',
      role: 'admin',
      departmentName: 'All Departments'
    });
    console.log('Admin user created.');

    const workbook = XLSX.readFile('../data for app.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const deptMap = new Map();
    const hodMap = new Map();
    const ciMap = new Map();
    const tgMap = new Map();

    console.log(`Processing ${data.length} records...`);

    let lastDept = '';
    let lastHod = '';
    let lastCi = '';
    let lastTg = '';

    for (const row of data) {
      const studentName = cleanString(row['Student Name']);
      if (!studentName) continue;
      
      const deptName = cleanString(row['Department']) || lastDept;
      const hodName = cleanString(row['HOD']) || lastHod;
      const ciName = cleanString(row['Class Incharge']) || lastCi;
      const rawTg = cleanString(row['Name of TG']) || lastTg;
      
      lastDept = deptName;
      lastHod = hodName;
      lastCi = ciName;
      lastTg = rawTg;
      
      const tgInfo = extractTG(rawTg);

      // 1. Create/Get HOD
      if (!hodMap.has(hodName)) {
        const email = generateEmail(hodName);
        const hod = await User.create({
          name: hodName,
          email,
          password: 'Password@123',
          role: 'hod',
          departmentName: deptName
        });
        hodMap.set(hodName, hod);
      }
      const hodUser = hodMap.get(hodName);

      // 2. Create/Get Department
      if (!deptMap.has(deptName)) {
        const dept = await Department.create({
          name: deptName,
          code: deptName.replace(/[^A-Z]/g, ''), // e.g. CSE(AIML) -> CSEAIML
          hod: hodUser._id,
          isActive: true
        });
        deptMap.set(deptName, dept);
      }
      const department = deptMap.get(deptName);

      // 3. Create/Get Class Incharge
      if (!ciMap.has(ciName)) {
        const email = generateEmail(ciName);
        const ci = await User.create({
          name: ciName,
          email,
          password: 'Password@123',
          role: 'class_incharge',
          department: department._id,
          departmentName: deptName
        });
        ciMap.set(ciName, ci);
      }
      const ciUser = ciMap.get(ciName);

      // 4. Create/Get TG
      if (!tgMap.has(tgInfo.name)) {
        const email = generateEmail(tgInfo.name);
        const nameToUse = tgInfo.name.includes('Sujata') ? 'Ms. Sujata Sardare' : tgInfo.name.includes('Harshika') ? 'Ms. Harshika Dehariya' : tgInfo.name;
        
        const tg = await User.create({
          name: nameToUse,
          email,
          password: 'Password@123',
          phone: tgInfo.phone,
          role: 'tg',
          department: department._id,
          departmentName: deptName
        });
        tgMap.set(tgInfo.name, tg);
      }
      const tgUser = tgMap.get(tgInfo.name);

      // 5. Create Student
      const studentEmail = cleanString(row['Student Email_ID']);
      const studentRoll = cleanString(row['Roll No']);
      const studentPhone = String(row['Student Contact No.']).trim();
      const studentSection = cleanString(row['Section']);
      const studentBatch = cleanString(row['Batch']);

      await User.create({
        name: studentName,
        email: studentEmail.toLowerCase(),
        password: 'Password@123',
        role: 'student',
        department: department._id,
        departmentName: deptName,
        teacherGuardian: tgUser._id,
        classIncharge: ciUser._id,
        class: studentSection,
        rollNumber: studentRoll,
        batch: studentBatch,
        currentYear: '4th Year', // User wanted 4th year
        phone: studentPhone
      });
    }

    // Since I discovered earlier that User.create double hashes or something, I will reset all passwords just to be 100% sure!
    const properHash = await bcrypt.hash('Password@123', 12);
    await User.updateMany({}, { password: properHash });

    console.log('Real data seeded successfully!');
    
    // Print created faculty credentials
    console.log('\n--- Faculty Accounts Created ---');
    console.log('Admin:', 'admin@demo.com');
    for (const [name, user] of hodMap.entries()) console.log(`HOD (${name}):`, user.email);
    for (const [name, user] of ciMap.entries()) console.log(`Class Incharge (${name}):`, user.email);
    for (const [name, user] of tgMap.entries()) console.log(`TG (${name}):`, user.email);
    console.log('All passwords are: Password@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

runSeed();
