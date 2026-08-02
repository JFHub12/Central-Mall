import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogIn, UserPlus, ArrowLeft, Shield, Mail, Lock, Phone, GraduationCap, Store, UserCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
  onBackToWelcome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBackToWelcome }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  // Form State
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'merchant' | 'visitor'>('student');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loggedUser: UserType = {
      id: `usr-${Date.now()}`,
      name: name.trim() || (isLoginView ? 'Central Student' : 'New User'),
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase().trim()}@central.edu.gh`,
      studentId: studentId || (role === 'student' ? 'CU-2026-4891' : undefined),
      role,
      phone: phone || '+233 24 123 4567',
    };

    onLogin(loggedUser);
  };

  const handleGuestLogin = () => {
    onLogin({
      id: 'guest-101',
      name: 'Miotso Visitor',
      email: 'visitor@central.edu.gh',
      role: 'visitor',
      phone: '+233 50 000 0000',
    });
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col items-center justify-center px-4 py-8 text-slate-800">
      {/* Top Bar with Back Button */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <button
          onClick={onBackToWelcome}
          id="back-to-welcome-button"
          className="flex items-center gap-2 text-sm font-bold text-[#CE1126] bg-white/90 border border-red-200/80 hover:bg-red-50 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Welcome Page</span>
        </button>

        <div className="flex items-center gap-1 bg-white/90 border border-red-200/80 px-3 py-1 rounded-full text-xs font-bold text-[#CE1126]">
          <Shield className="w-3.5 h-3.5 text-[#CE1126]" />
          <span>Central Portal</span>
        </div>
      </div>

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-red-100 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-red-100 relative overflow-hidden text-slate-800"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#CE1126]" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#CE1126] text-white flex items-center justify-center shadow-lg shadow-red-200">
            {isLoginView ? <LogIn className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLoginView ? 'Sign In to Central Mall' : 'Create Central Account'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access Central University Miotso Marketplace, Campus GPS & School Clinic
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLoginView(true)}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLoginView
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setIsLoginView(false)}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLoginView
                ? 'bg-[#CE1126] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLoginView && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#CE1126]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Asante"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email or Student ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#CE1126]" />
              <input
                type="text"
                required
                placeholder={isLoginView ? 'student@central.edu.gh or CU-2026-X' : 'k.asante@central.edu.gh'}
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#CE1126]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
              />
            </div>
          </div>

          {!isLoginView && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (MoMo Enabled)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#CE1126]" />
                  <input
                    type="tel"
                    required
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'student'
                        ? 'bg-[#CE1126] border-[#CE1126] text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('merchant')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'merchant'
                        ? 'bg-[#CE1126] border-[#CE1126] text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Merchant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('visitor')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      role === 'visitor'
                        ? 'bg-[#CE1126] border-[#CE1126] text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Visitor</span>
                  </button>
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Index Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CU-2026-9812"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            id="auth-submit-button"
            className="w-full mt-2 py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold rounded-full shadow-lg shadow-red-200 transition-all cursor-pointer transform active:scale-98"
          >
            {isLoginView ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>

        {/* Divider & Guest Access */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
            Or quick explore
          </span>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          id="guest-login-button"
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue as Guest / Visitor</span>
        </button>
      </motion.div>
    </div>
  );
};
