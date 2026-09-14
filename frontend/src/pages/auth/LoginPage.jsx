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
      email: '',
      password: ''
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* LEFT COLUMN: HERO & VALUE PROPOSITION */}
      <div className="relative lg:w-7/12 flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-b lg:border-b-0 lg:border-r border-indigo-100">
        
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
                <span className="text-2xl font-black tracking-tight text-slate-900">Campus Voice</span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-xs text-indigo-600/80 font-medium">Next-Gen College Grievance & Academic Redressal Engine</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium backdrop-blur-md mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart AI Categorization & Automated SLA Escalation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Every Student Voice Heard.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-800 bg-clip-text text-transparent">
                Every Issue Resolved.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A transparent, hierarchical platform connecting students directly with Teachers, Guardians, and HODs with automated SLA tracking.
            </p>
          </div>
        </div>


      </div>

      {/* RIGHT COLUMN: LOGIN FORM & 1-CLICK DEMO LOGIN */}
      <div className="relative lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white backdrop-blur-2xl border-l border-slate-200 shadow-xl">
        
        <div className="w-full max-w-md space-y-6">

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your role tab below or enter your institutional credentials.
            </p>
          </div>

          {/* Role Tab Selector */}
          <div className="flex p-1 rounded-xl bg-slate-100/80 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white'
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
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white'
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
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  className={`block w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all`}
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.error('Please contact administration to reset your password.')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`block w-full pl-11 pr-11 py-3 bg-white border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all font-mono`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
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
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
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
          <div className="pt-4 text-center border-t border-slate-200 space-y-3">
            <p className="text-sm text-slate-600">
              New Student?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
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
