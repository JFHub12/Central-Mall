import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, User as UserIcon } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const AIChatBotModal: React.FC<AIChatBotModalProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-1',
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I'm your Central AI Assistant. Ask me anything about Central University Miotso campus, Central Mall marketplace, GPS directions, or campus facilities!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || 'Central AI is happy to assist you on Miotso campus.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Assistant Error', err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Where is Central University Clinic located?',
    'How do I list an item for sale on Central Mall?',
    'What food vendors are at Miotso Cafeteria?',
    'Tell me about Trinity & Destiny hostels.'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md">
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="bg-white border border-red-100 w-full sm:max-w-md h-[85vh] sm:h-[600px] rounded-3xl p-4 md:p-5 flex flex-col shadow-2xl relative overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#CE1126] text-white flex items-center justify-center shadow-md shadow-red-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1">
                  Central AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Miotso Campus & Central Mall Guide</p>
              </div>
            </div>

            <button
              onClick={onClose}
              id="close-ai-chat-modal"
              className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${
                  m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    m.sender === 'user'
                      ? 'bg-[#CE1126] text-white shadow-sm'
                      : 'bg-red-100 text-[#CE1126] font-bold'
                  }`}
                >
                  {m.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#CE1126] text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#CE1126] italic p-2 font-semibold">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>Central AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="text-[10px] font-bold bg-red-50 hover:bg-[#CE1126] text-[#CE1126] hover:text-white px-2.5 py-1 rounded-full border border-red-200 transition-all cursor-pointer truncate max-w-full shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Ask Central AI about campus, shop, or clinic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              id="send-ai-message-button"
              className="absolute right-1.5 p-1.5 bg-[#CE1126] hover:bg-[#A00D1D] text-white rounded-lg cursor-pointer disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
