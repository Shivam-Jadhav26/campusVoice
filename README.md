# 🎓 Campus Voice — Advanced Complaint Management System

A production-grade MERN stack complaint management platform for colleges, featuring multi-role dashboards, automatic escalation, real-time notifications, AI-powered features, feedback portal, and academic review workflows.

---

## 🚀 Features

### Core
- 🔐 JWT Authentication with role-based access control
- 👥 7 User Roles: Student, Teacher, TG, Class Incharge, HOD, Committee, Admin
- 📋 Complete Complaint Lifecycle Management
- ⚡ Automatic Escalation via `node-cron`
- 🔔 Real-time Notifications via Socket.IO
- 🤖 AI Complaint Categorization (mock + OpenAI-ready)
- 📊 Analytics Dashboards with Recharts
- 📁 File Uploads (Multer)
- 🎭 Feedback Portal with Anonymous Mode
- 🎓 Academic Review/Re-evaluation Module
- 📝 Comprehensive Audit Logs

### Escalation Chain
```
Student → Teacher (24h) → TG (24h) → Class Incharge (24h) → HOD (24h) → Committee (Final)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh Tokens) |
| Real-time | Socket.IO |
| Scheduler | node-cron |
| File Upload | Multer |
| Validation | express-validator |
| Charts | Recharts |

---

## 📦 Project Structure

```
Campus Voice/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components per role
│       ├── context/       # Auth & Notification context
│       ├── services/      # Axios API services
│       └── utils/         # Helpers & constants
│
├── backend/               # Node.js + Express
│   └── src/
│       ├── models/        # Mongoose models
│       ├── controllers/   # Business logic
│       ├── routes/        # API routes
│       ├── middleware/     # Auth, roles, error handler
│       ├── services/      # AI, notifications, escalation
│       ├── jobs/          # node-cron jobs
│       └── config/        # DB & Socket.IO config
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm v9+

### 1. Clone / Open Project
```bash
cd "Campus Voice"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend (development)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 4. Seed Demo Data
```bash
cd backend
npm run seed
```

---

## 🌱 Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Password@123 |
| Student | student@demo.com | Password@123 |
| Teacher | teacher@demo.com | Password@123 |
| TG | tg@demo.com | Password@123 |
| Class Incharge | classincharge@demo.com | Password@123 |
| HOD | hod@demo.com | Password@123 |
| Committee | committee@demo.com | Password@123 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/complaints` | List complaints |
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints/:id` | Get complaint |
| POST | `/api/complaints/:id/resolve` | Resolve |
| POST | `/api/complaints/:id/escalate` | Escalate |
| GET | `/api/dashboard/student` | Student dashboard |
| GET | `/api/dashboard/admin` | Admin dashboard |
| GET | `/api/feedback` | List feedback |
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/academic-reviews` | List reviews |
| POST | `/api/academic-reviews` | Submit review |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/analytics/complaints` | Analytics |
| GET | `/api/audit-logs` | Audit logs (admin) |

---

## 🔒 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-voice
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=           # Optional: for real AI features
NODE_ENV=development
```

---

## 🤖 AI Features (Mock Mode)

Without `OPENAI_API_KEY`, the system uses intelligent keyword-based mocks:
- **Complaint Categorization**: keyword matching → category + priority
- **Duplicate Detection**: text similarity scoring
- **Sentiment Analysis**: keyword-based positive/negative/neutral
- **Reply Suggestions**: professional templates per category

Set `OPENAI_API_KEY` in `.env` to enable real AI.

---

## 📱 Responsive Design

- ✅ Desktop: Fixed sidebar + main content
- ✅ Tablet: Collapsible sidebar
- ✅ Mobile: Hamburger menu drawer

---

## 🧪 Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

Frontend proxies `/api` requests to the backend automatically.

---

## 📄 License

MIT — Campus Voice © 2026
