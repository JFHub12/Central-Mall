import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, ArrowLeft, Send, PhoneCall, Calendar, Clock, AlertTriangle, ShieldAlert, Sparkles, User, CheckCircle2, X, HeartPulse } from 'lucide-react';
import { ChatMessage, ClinicAppointment } from '../types';

interface ClinicViewProps {
  user: any;
  onBackToDashboard: () => void;
}

export const ClinicView: React.FC<ClinicViewProps> = ({ user, onBackToDashboard }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'clinic_nurse',
      text: `Hello ${user?.name || 'Student'}! Welcome to Central University Clinic Virtual Desk at Miotso Main Campus. We provide 24/7 healthcare assistance. How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: ['Fever / Symptoms Check', 'First Aid Guidance', 'Book Consultation', 'Pharmacy Hours']
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Appointment Modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [studentId, setStudentId] = useState(user?.studentId || 'CU-2026-8801');
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [apptSuccess, setApptSuccess] = useState(false);

  // Handle Send Message to Clinic Nurse AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/clinic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();
      const replyMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'clinic_nurse',
        text: data.reply || 'Central Clinic Miotso nurse desk is standing by. Visit the clinic near Trinity Hall for in-person treatment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error('Error in Clinic Chat', err);
    } finally {
      setSending(false);
    }
  };

  // Handle Book Appointment
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDate || !apptTime || !apptReason) return;

    const newAppt: ClinicAppointment = {
      id: `APPT-CU-${Date.now().toString().slice(-5)}`,
      studentName: user?.name || 'Student',
      studentId: studentId,
      date: apptDate,
      time: apptTime,
      reason: apptReason,
      status: 'Confirmed',
    };

    setAppointments((prev) => [newAppt, ...prev]);
    setApptSuccess(true);
    setTimeout(() => {
      setApptSuccess(false);
      setShowAppointmentModal(false);
      setApptReason('');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen z-10 flex flex-col px-4 py-6 text-slate-800 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/90 border border-red-200/80 p-4 rounded-3xl backdrop-blur-md shadow-lg shadow-red-100/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            id="back-to-dashboard-from-clinic"
            className="p-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-[#CE1126] rounded-full transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-[#CE1126]" />
              Central School Clinic Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Central University Miotso Main Campus • Medical Triage & Consultation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Emergency Hotline Button */}
          <a
            href="tel:+233303930000"
            id="clinic-emergency-call-button"
            className="flex items-center gap-2 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md shadow-red-200 cursor-pointer transition-all animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency (+233 30 393 0000)</span>
          </a>

          {/* Book Appointment Button */}
          <button
            onClick={() => setShowAppointmentModal(true)}
            id="open-appointment-modal-button"
            className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-[#CE1126] font-bold text-xs px-4 py-2.5 rounded-full transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#CE1126]" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>

      {/* Main Clinic Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* CHAT MESSAGES WINDOW */}
        <div className="lg:col-span-2 bg-white border border-red-100 rounded-3xl p-4 md:p-6 shadow-xl shadow-red-100/50 flex flex-col min-h-[500px]">
          {/* Chat Info Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">Central Clinic Nurse Desk Active</span>
            </div>
            <span className="text-[10px] text-[#CE1126] font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              Miotso Campus • Near Trinity Hall
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#CE1126] text-white rounded-br-none shadow-md shadow-red-200'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Quick Action Chips if present */}
                {msg.quickActions && (
                  <div className="flex flex-wrap gap-2 mt-3 max-w-[90%]">
                    {msg.quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] font-bold bg-red-50 hover:bg-[#CE1126] text-[#CE1126] hover:text-white px-3.5 py-1.5 rounded-full border border-red-200 transition-all cursor-pointer shadow-sm"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-[#CE1126] italic font-semibold">
                <HeartPulse className="w-4 h-4 animate-spin text-[#CE1126]" />
                <span>Central Clinic Nurse typing response...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Type your health symptoms, medical query, or first aid request..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              id="send-clinic-message-button"
              className="absolute right-2 p-2 bg-[#CE1126] hover:bg-[#A00D1D] text-white rounded-xl cursor-pointer disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* SIDEBAR: CLINIC INFO & SCHEDULED APPOINTMENTS */}
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xl shadow-red-100/50 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#CE1126]" />
              Central Clinic Miotso Overview
            </h3>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>• <strong className="text-slate-900">Location:</strong> Main Campus, near Trinity Hall Male Hostel.</p>
              <p>• <strong className="text-slate-900">Services:</strong> 24/7 General Consultations, Nursing Care, Pharmacy, Lab Tests, Emergency Ambulance dispatch.</p>
              <p>• <strong className="text-slate-900">Emergency Hotline:</strong> +233 (0)30 393 0000</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>In case of severe difficulty breathing or trauma, report to the clinic ward immediately.</span>
            </div>
          </div>

          {/* My Appointments List */}
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xl shadow-red-100/50 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>My Clinic Appointments</span>
              <span className="text-xs bg-red-100 text-[#CE1126] font-bold px-2.5 py-0.5 rounded-full font-mono">
                {appointments.length}
              </span>
            </h3>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No upcoming consultations scheduled. Click "Book Consultation" above.
              </p>
            ) : (
              <div className="space-y-2">
                {appointments.map((appt) => (
                  <div key={appt.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{appt.reason}</span>
                      <span className="text-emerald-600 font-bold text-[10px] uppercase">{appt.status}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                      <span><Calendar className="w-3 h-3 inline mr-1 text-[#CE1126]" />{appt.date}</span>
                      <span><Clock className="w-3 h-3 inline mr-1 text-[#CE1126]" />{appt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: BOOK CLINIC APPOINTMENT */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-red-100 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-slate-800"
            >
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-left">
                <h2 className="text-2xl font-black text-slate-900">Book Clinic Consultation</h2>
                <p className="text-xs text-slate-500 font-medium">Central University Miotso School Clinic Ward</p>
              </div>

              {apptSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h3>
                  <p className="text-xs text-slate-500">Please arrive 5 minutes early at the Miotso Clinic reception.</p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Index Number
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#CE1126]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        value={apptDate}
                        onChange={(e) => setApptDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#CE1126]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        required
                        value={apptTime}
                        onChange={(e) => setApptTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#CE1126]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason for Consultation / Symptoms
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Headache, Routine Checkup, Eye Examination, Prescription refill..."
                      value={apptReason}
                      onChange={(e) => setApptReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126]"
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-clinic-appointment-button"
                    className="w-full py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold rounded-full shadow-md shadow-red-200 cursor-pointer transition-all"
                  >
                    Confirm Appointment Schedule
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
