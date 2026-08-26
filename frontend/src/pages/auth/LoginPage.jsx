import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const rolePresets = {
  student: [
    { role: 'Student 1', name: 'Aarav Patel', email: 'student@demo.com', pass: 'Password@123', meta: 'SE-A • CE2024001' },
    { role: 'Student 2', name: 'Priya Sharma', email: 'student2@demo.com', pass: 'Password@123', meta: 'TE-B • CE2024045' },
    { role: 'Student 3', name: 'Rohan Verma', email: 'student3@demo.com', pass: 'Password@123', meta: 'BE-A • IT2024012' }
  ],
  faculty: [
    { role: 'Teacher', name: 'Prof. Rajesh Kulkarni', email: 'teacher@demo.com', pass: 'Password@123', meta: 'Faculty Reviewer' },
    { role: 'Teacher Guardian', name: 'Prof. Vikram Mehta', email: 'tg@demo.com', pass: 'Password@123', meta: '1st Escalation Tier' },
    { role: 'Class Incharge', name: 'Prof. Sneha Deshmukh', email: 'classincharge@demo.com', pass: 'Password@123', meta: 'Class SE-A' },
    { role: 'HOD', name: 'Dr. Anand Joshi', email: 'hod@demo.com', pass: 'Password@123', meta: 'Head of Department' }
  ],
  admin: [
    { role: 'Super Admin', name: 'Rajesh Sharma', email: 'admin@demo.com', pass: 'Password@123', meta: 'Full System Control' }
  ]
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'faculty' | 'admin'
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: 'student@demo.com',
      password: 'Password@123'
    }
  });

  const onSubmit = async (data) => {
    try {
      const role = await login(data.email, data.password);
      toast.success(`Welcome back! Logged in as ${role.toUpperCase()}`);

      // Direct redirection to the exact role dashboard
      switch (role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'tg':
          navigate('/tg/dashboard');
          break;
        case 'class_incharge':
          navigate('/class-incharge/dashboard');
          break;
        case 'hod':
          navigate('/hod/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  const autofill = (email, pass) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success(`Loaded credentials for ${email}`, { duration: 2000, icon: '⚡' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* LEFT COLUMN: HERO & VALUE PROPOSITION */}
      <div className="relative lg:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-b lg:border-b-0 lg:border-r border-indigo-900/30">
        
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar: Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">Campus Voice</span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-xs text-indigo-300/80 font-medium">Next-Gen College Grievance & Academic Redressal Engine</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-200 text-xs font-medium backdrop-blur-md mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart AI Categorization & Automated SLA Escalation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Every Student Voice Heard.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-white bg-clip-text text-transparent">
                Every Issue Resolved.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal">
              A transparent, hierarchical platform connecting students directly with Teachers, Guardians, and HODs with automated SLA tracking.
            </p>
          </div>
        </div>

        {/* Middle Feature highlights */}
        <div className="relative z-10 my-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Instant AI Triaging</h4>
            <p className="text-xs text-slate-400 mt-1">Automatic priority prediction, category routing & duplicate issue detection.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">4-Tier Escalation</h4>
            <p className="text-xs text-slate-400 mt-1">SLA-backed automatic escalation from Teacher up to Department HOD.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Academic Reviews</h4>
            <p className="text-xs text-slate-400 mt-1">Track paper re-evaluations, faculty moderation and marks updates in real time.</p>
          </div>
        </div>

        {/* Bottom metrics banner */}
        <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">1,400+</div>
            <div className="text-xs text-indigo-200/70 font-medium">Tickets Resolved</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">99.2%</div>
            <div className="text-xs text-indigo-200/70 font-medium">Resolution Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300 tracking-tight">&lt; 24h</div>
            <div className="text-xs text-indigo-200/70 font-medium">Average Response</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM & 1-CLICK DEMO LOGIN */}
      <div className="relative lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-900/60 backdrop-blur-2xl">
        
        <div className="w-full max-w-md space-y-6">

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select your role tab below or enter your institutional credentials.
            </p>
          </div>

          {/* Role Tab Selector */}
          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faculty')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Faculty / Staff
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Quick Demo Autofill Bar */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                1-Click Demo Login ({activeTab.toUpperCase()})
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {rolePresets[activeTab].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => autofill(acc.email, acc.pass)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500 hover:bg-indigo-950 text-left transition-all group flex items-center gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 leading-tight">
                      {acc.role}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">{acc.name}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Fill
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={`block w-full pl-11 pr-4 py-3 bg-slate-950/80 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700/90 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all`}
                  placeholder="e.g. student@demo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.success('Demo password is Password@123')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`block w-full pl-11 pr-11 py-3 bg-slate-950/80 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700/90 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all font-mono`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 7-day session
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Campus Voice</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-4 text-center border-t border-slate-800/80 space-y-3">
            <p className="text-sm text-slate-400">
              New Student?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create an account
              </Link>
            </p>
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Role-Based Access Control (RBAC) & End-to-End Audit Trail
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
