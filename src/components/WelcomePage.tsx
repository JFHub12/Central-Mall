import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Navigation, Stethoscope, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen z-10 flex flex-col items-center justify-between px-4 py-8 md:py-12 text-slate-800">
      {/* Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 bg-white/90 border border-red-200/80 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-red-100/50"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#CE1126] animate-pulse" />
        <span className="text-xs md:text-sm font-extrabold tracking-wider text-[#CE1126] uppercase">
          Central University • Main Campus Miotso
        </span>
      </motion.div>

      {/* Main Hero Content */}
      <div className="max-w-4xl w-full text-center my-auto py-8">
        {/* University Logo / Badge representation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto w-24 h-24 md:w-32 md:h-32 mb-6 rounded-3xl bg-gradient-to-br from-[#CE1126] to-[#A00D1D] border-4 border-white shadow-2xl shadow-red-200 flex items-center justify-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center justify-center text-center p-2">
            <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">CU</span>
            <span className="text-[10px] md:text-[11px] font-extrabold text-red-100 tracking-widest uppercase mt-0.5">Miotso</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight"
        >
          Welcome to <span className="text-[#CE1126]">Central Mall</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          Your all-in-one digital campus ecosystem for Central University, Miotso. Buy & sell freely, navigate the campus via GPS, and access 24/7 clinic care.
        </motion.p>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 text-left"
        >
          {/* Shop Card */}
          <div className="bg-white/95 border border-red-100 hover:border-red-300 p-6 rounded-3xl shadow-xl shadow-red-100/50 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:bg-[#CE1126] group-hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Central Marketplace</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Open to all students & merchants. Sell your items, buy hostel essentials, and pay with MoMo instantly.
            </p>
          </div>

          {/* GPS Card */}
          <div className="bg-white/95 border border-red-100 hover:border-red-300 p-6 rounded-3xl shadow-xl shadow-red-100/50 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-[#CE1126] group-hover:text-white transition-colors">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Campus GPS</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Mapped specifically for Central University Miotso main campus. Get turn-by-turn navigation between hostels & faculties.
            </p>
          </div>

          {/* Clinic Card */}
          <div className="bg-white/95 border border-red-100 hover:border-red-300 p-6 rounded-3xl shadow-xl shadow-red-100/50 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-[#CE1126] group-hover:text-white transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">School Clinic Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Chat directly with clinic triage nurses, request emergency assistance, and book appointments at Central Clinic.
            </p>
          </div>
        </motion.div>

        {/* Enter CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={onEnter}
            id="enter-app-button"
            className="px-8 py-4 rounded-full bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-lg shadow-xl shadow-red-200 hover:shadow-red-300 flex items-center gap-3 mx-auto transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Enter Central Mall</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold pt-4 border-t border-slate-200/60 w-full max-w-4xl"
      >
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#CE1126]" /> Miotso, Greater Accra, Ghana
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#CE1126]" /> Official Central University Portal
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#CE1126]" /> Powered by Central AI
        </span>
      </motion.div>
    </div>
  );
};
