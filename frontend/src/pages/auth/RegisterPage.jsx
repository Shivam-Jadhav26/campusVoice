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
  ArrowRight,
  User,
  Hash,
  Calendar,
  BookOpen,
  Building,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Map form fields to API payload
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        rollNumber: data.rollNo,

        currentYear: data.currentYear,
        departmentName: data.department,
        batch: data.batch,
      };

      const role = await registerUser(payload);
      toast.success('Registration successful! Welcome to Campus Voice.');

      // Default redirect to student dashboard as only students register via this page
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-sans p-4 sm:p-8 relative"
      style={{ backgroundImage: "url('/bg-building-new.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/30"></div>
      <div className="relative z-10 w-full max-w-2xl bg-white/95 border border-slate-200 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 overflow-hidden">
            <img src="/logo.png" alt="Campus Voice Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Registration</h1>
          <p className="text-sm text-slate-500 mt-2">Create your Campus Voice account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.fullName ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.email ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all`}
                  placeholder="student@demo.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
                    errors.password ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all font-mono`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Hash className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('rollNo', { required: 'Roll Number is required' })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.rollNo ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all`}
                  placeholder="e.g. CE2024001"
                />
              </div>
              {errors.rollNo && <p className="mt-1 text-xs text-red-500">{errors.rollNo.message}</p>}
            </div>


            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="h-4 w-4" />
                </div>
                <select
                  {...register('department', { required: 'Department is required' })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.department ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 transition-all`}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
            </div>

            {/* Current Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <BookOpen className="h-4 w-4" />
                </div>
                <select
                  {...register('currentYear', { required: 'Current Year is required' })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.currentYear ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 transition-all`}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year (FE)</option>
                  <option value="2nd Year">2nd Year (SE)</option>
                  <option value="3rd Year">3rd Year (TE)</option>
                  <option value="4th Year">4th Year (BE)</option>
                </select>
              </div>
              {errors.currentYear && <p className="mt-1 text-xs text-red-500">{errors.currentYear.message}</p>}
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  {...register('batch', { required: 'Batch is required' })}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.batch ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all`}
                  placeholder="e.g. 2023-2027"
                />
              </div>
              {errors.batch && <p className="mt-1 text-xs text-red-500">{errors.batch.message}</p>}
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 px-4 rounded-xl font-bold text-sm text-slate-900 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
