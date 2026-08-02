import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Navigation, Stethoscope, LogOut, Sparkles, MapPin, ChevronRight, User as UserIcon, Search, Tag, X, ArrowUpRight } from 'lucide-react';
import { User, Building, Product } from '../types';

interface DashboardPageProps {
  user: User;
  onSelectOption: (option: 'shop' | 'gps' | 'clinic', searchQuery?: string) => void;
  onLogout: () => void;
  onOpenAIChat: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onSelectOption,
  onLogout,
  onOpenAIChat,
}) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ buildings: Building[]; products: Product[]; totalCount: number } | null>(null);
  const [searching, setSearching] = useState(false);

  // Live Backend Search Fetch
  useEffect(() => {
    if (!globalSearch.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(`/api/gps/search?q=${encodeURIComponent(globalSearch.trim())}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Backend search error', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [globalSearch]);

  return (
    <div className="relative min-h-screen z-10 flex flex-col justify-between px-4 py-6 md:py-10 text-slate-800 max-w-6xl mx-auto">
      {/* Top Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 bg-white/90 border border-red-200/80 p-4 rounded-3xl backdrop-blur-md shadow-lg shadow-red-100/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#CE1126] flex items-center justify-center font-black text-white text-xl shadow-md shadow-red-200">
            C
          </div>
          <div>
            <h1 className="text-xl font-black text-[#CE1126] tracking-tight">CENTRAL MALL</h1>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#CE1126]" /> Miotso Main Campus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs">
            <UserIcon className="w-3.5 h-3.5 text-[#CE1126]" />
            <span className="font-bold text-slate-800">{user.name}</span>
            <span className="bg-[#CE1126] text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full text-white ml-1">
              {user.role}
            </span>
          </div>

          {/* AI Assistant Quick Button */}
          <button
            onClick={onOpenAIChat}
            id="open-ai-chat-header"
            className="flex items-center gap-1.5 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs px-4 py-2 rounded-full shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Campus AI</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            id="logout-button"
            title="Log Out"
            className="p-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-[#CE1126] rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Main Choice Section */}
      <div className="my-auto py-6">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-red-100/80 border border-red-200 text-[#CE1126] px-3.5 py-1 rounded-full text-xs font-bold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CE1126]" />
            <span>Central University Miotso Hub</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            What are you looking for today?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-slate-600 font-medium mt-2"
          >
            Search any building, hostel, textbook, food, or campus service below
          </motion.p>
        </div>

        {/* UNIVERSAL CAMPUS SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-10 relative z-30">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#CE1126]" />
            <input
              type="text"
              placeholder="Search Senate, Trinity Hall, Jollof, Textbooks, Clinic, Printing..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-red-200 rounded-2xl text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126] shadow-xl shadow-red-100/60 font-medium"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Instant Dropdown Search Results */}
          <AnimatePresence>
            {globalSearch.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-red-200 rounded-3xl p-4 shadow-2xl z-50 max-h-[380px] overflow-y-auto text-left"
              >
                {searching ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-medium">
                    Searching Central University database...
                  </div>
                ) : !searchResults || searchResults.totalCount === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-medium">
                    No exact match for "{globalSearch}". Try "Clinic", "Trinity", "Textbook", or "Food".
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Buildings matched */}
                    {searchResults.buildings.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#CE1126] mb-2 flex items-center justify-between">
                          <span>Campus Buildings & Locations ({searchResults.buildings.length})</span>
                          <span className="text-slate-400">GPS Interactive</span>
                        </div>
                        <div className="space-y-1.5">
                          {searchResults.buildings.slice(0, 3).map((b) => (
                            <div
                              key={b.id}
                              onClick={() => onSelectOption('gps', b.name)}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-200 cursor-pointer flex items-center justify-between transition-all group"
                            >
                              <div className="flex items-center gap-2.5">
                                <Navigation className="w-4 h-4 text-[#CE1126]" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#CE1126]">{b.name}</h4>
                                  <p className="text-[10px] text-slate-500">{b.code} • {b.category}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-extrabold text-[#CE1126] flex items-center gap-0.5">
                                Locate on GPS <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products matched */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-2 flex items-center justify-between">
                          <span>Marketplace Items ({searchResults.products.length})</span>
                          <span className="text-slate-400">Central Mall</span>
                        </div>
                        <div className="space-y-1.5">
                          {searchResults.products.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => onSelectOption('shop', p.title)}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 cursor-pointer flex items-center justify-between transition-all group"
                            >
                              <div className="flex items-center gap-2.5">
                                <ShoppingBag className="w-4 h-4 text-orange-600" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600">{p.title}</h4>
                                  <p className="text-[10px] text-slate-500">GHS {p.price} • {p.sellerName}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-extrabold text-orange-600 flex items-center gap-0.5">
                                View in Shop <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3 Main Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OPTION 1: SHOP / MARKETPLACE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => onSelectOption('shop')}
            id="option-shop-card"
            className="group bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-6 shadow-xl shadow-gray-100/80 hover:shadow-2xl hover:shadow-red-100 transition-all cursor-pointer hover:-translate-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <div className="inline-block bg-orange-50 text-orange-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                Open To Everyone
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#CE1126] transition-colors">
                1. Central Marketplace
              </h3>

              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Buy or put your things up to sell! Explore textbooks, electronics, fashion, food, and hostel gadgets. Instant MTN MoMo & Telecel payments.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-extrabold text-[#CE1126]">
              <span>Explore Shops</span>
              <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-[#CE1126] flex items-center justify-center text-[#CE1126] group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* OPTION 2: CAMPUS GPS NAVIGATION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => onSelectOption('gps')}
            id="option-gps-card"
            className="group bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-6 shadow-xl shadow-gray-100/80 hover:shadow-2xl hover:shadow-red-100 transition-all cursor-pointer hover:-translate-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Navigation className="w-7 h-7" />
              </div>

              <div className="inline-block bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                Miotso Main Campus
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#CE1126] transition-colors">
                2. Campus Live GPS Navigator
              </h3>

              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Interactive map of Central University Miotso campus with real-time live GPS tracking, shuttles, Senate, Trinity & Destiny Hostels, and turn-by-turn walk routes.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-extrabold text-[#CE1126]">
              <span>Open Navigator</span>
              <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-[#CE1126] flex items-center justify-center text-[#CE1126] group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* OPTION 3: SCHOOL CLINIC & MEDICAL ASSISTANCE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => onSelectOption('clinic')}
            id="option-clinic-card"
            className="group bg-white border border-gray-100 hover:border-red-200 rounded-3xl p-6 shadow-xl shadow-gray-100/80 hover:shadow-2xl hover:shadow-red-100 transition-all cursor-pointer hover:-translate-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2">
                24/7 Medical Care
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#CE1126] transition-colors">
                3. School Clinic Desk
              </h3>

              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-6">
                Chat with Central University Miotso Clinic staff, consult health AI triage, book appointments, and access emergency medical phone dispatches.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-extrabold text-[#CE1126]">
              <span>Access Clinic Desk</span>
              <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-[#CE1126] flex items-center justify-center text-[#CE1126] group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="text-center text-xs text-slate-500 font-semibold pt-4 border-t border-slate-200/60">
        <span>Central University Ghana • Miotso Campus • Central Mall Application</span>
      </div>
    </div>
  );
};
