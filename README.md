# 🎓 Campus Voice — Advanced Grievance & Complaint Management System

A production-grade MERN stack complaint management platform for colleges and universities, featuring multi-role dashboards, automated 5-tier SLA escalation, real-time notifications, AI-powered triaging, feedback portal, and academic review workflows.

---

## 🚀 Features

### Core Capabilities
- 🔐 **JWT Authentication & RBAC**: Access & Refresh token rotation with strict role gating.
- 👥 **6 Dedicated Roles**: Student, Teacher, Tutor Guardian (TG), Class Incharge, HOD, Admin.
- ⚡ **4-Tier SLA Escalation Engine**: Automated background cron job escalating overdue tickets across levels.
- 🔔 **Real-Time Notification System**: Socket.IO powered alerts on ticket changes and decisions.
- 🤖 **AI Complaint Triaging & Duplicate Detection**: Instant sentiment classification and duplicate checks.
- 📊 **Executive Analytics**: Recharts-powered trend graphs, SLA compliance velocity, and category distributions.
- 🎭 **Anonymous Feedback Hub**: Star ratings and feedback with privacy masking.
- 🎓 **Academic Review & Re-evaluation**: Re-marking requests with scanned copy uploads.
- 📝 **Immutable Audit Trail**: Security-critical user action recording.

### 4-Tier Escalation Chain
```
Level 0: Teacher (24h) ➔ Level 1: TG (24h) ➔ Level 2: Class Incharge (24h) ➔ Level 3: HOD (Final)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React Hook Form |
| **Backend** | Node.js, Express.js, Mongoose 9, Socket.IO, Multer, Node-Cron, Bcrypt |
| **Database** | MongoDB Atlas / Local MongoDB |

---

## 📦 Project Structure

```
Campus Voice/
├── frontend/              # React 18 + Vite + Tailwind UI
│   └── src/
│       ├── components/    # Reusable UI & Layout (DashboardLayout, Sidebar, Navbar)
│       ├── pages/         # 6 Role Dashboards (student, teacher, tg, class_incharge, hod, admin)
│       ├── context/       # AuthContext & NotificationContext
│       └── services/      # Axios API services
│
├── backend/               # Node.js + Express API
│   └── src/
│       ├── models/        # Mongoose schemas (Complaint, User, Feedback, AcademicReview, etc.)
│       ├── controllers/   # Business logic per domain
│       ├── routes/        # Role-protected API routes
│       ├── services/      # AI, Notification, Escalation services
│       └── jobs/          # Node-cron background escalation worker
│
└── README.md
```

---

## ⚙️ Quick Start (Local Setup)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 3. Seed Demo Data (Optional)
```bash
cd backend
npm run seed
```

---

## 🌱 Demo Accounts
Default password for all accounts: `Password@123`

| Role | Name | Email | Access |
|---|---|---|---|
| **Student** | Aarav Patel | `student@demo.com` | File grievances, academic reviews, anonymous feedback |
| **Teacher** | Prof. Rajesh Kulkarni | `teacher@demo.com` | Subject ticket resolution within 24h SLA |
| **Tutor Guardian** | Prof. Vikram Mehta | `tg@demo.com` | Level-1 cohort escalation review |
| **Class Incharge** | Prof. Sneha Deshmukh | `classincharge@demo.com` | Level-2 class cohort management |
| **HOD** | Dr. Anand Joshi | `hod@demo.com` | Level-3 departmental moderation & analytics |
| **Admin** | Rajesh Sharma | `admin@demo.com` | User management, departments, audit logs, system settings |

---

## 📄 License
MIT © Campus Voice
