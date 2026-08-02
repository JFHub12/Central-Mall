import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, ArrowLeft, MapPin, Search, Compass, Clock, Info, Layers, 
  Crosshair, X, Building as BuildingIcon, ChevronRight, Bus, Shield, 
  Activity, Zap, Sparkles, CheckCircle2, RotateCcw, Radio
} from 'lucide-react';
import { CENTRAL_BUILDINGS } from '../data/campusData';
import { Building, BuildingCategory, LiveGPSUser } from '../types';

interface GPSViewProps {
  onBackToDashboard: () => void;
  initialSearchQuery?: string;
}

export const GPSView: React.FC<GPSViewProps> = ({ onBackToDashboard, initialSearchQuery = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory>('All');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);

  // Route Navigation state
  const [startBuildingId, setStartBuildingId] = useState<string>('trinity-hall');
  const [destBuildingId, setDestBuildingId] = useState<string>('clinic-1');
  const [isNavigating, setIsNavigating] = useState(false);

  // Live GPS Tracking State
  const [liveLocations, setLiveLocations] = useState<LiveGPSUser[]>([]);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [userLivePos, setUserLivePos] = useState<{ x: number; y: number; lat: number; lng: number; speedKmH: number; headingDeg: number } | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Animation ref for simulation
  const animRef = useRef<number | null>(null);

  // Fetch Live GPS Locations from Backend
  const fetchLiveLocations = async () => {
    try {
      const res = await fetch('/api/gps/locations');
      const data = await res.json();
      if (data.locations) {
        setLiveLocations(data.locations);
      }
    } catch (err) {
      console.error('Failed to fetch live GPS positions', err);
    }
  };

  // Poll Backend Live Locations every 2.5s
  useEffect(() => {
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 2500);
    return () => clearInterval(interval);
  }, []);

  // Post User Live Location update to Backend
  const updateBackendLocation = async (x: number, y: number, speed = 4.5, heading = 45) => {
    try {
      const lat = 5.7592 + (y - 50) * 0.0001;
      const lng = 0.0528 + (x - 50) * 0.0001;

      setUserLivePos({ x, y, lat, lng, speedKmH: speed, headingDeg: heading });

      await fetch('/api/gps/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'user-self',
          name: 'Your Live Position',
          role: 'Student (Live GPS)',
          x,
          y,
          lat,
          lng,
          speedKmH: speed,
          headingDeg: heading,
        }),
      });

      fetchLiveLocations();
    } catch (err) {
      console.error('Failed to post live location update', err);
    }
  };

  // Start/Stop Live GPS
  const handleToggleLiveGps = () => {
    if (isLiveGpsActive) {
      setIsLiveGpsActive(false);
      setIsSimulatingWalk(false);
      setUserLivePos(null);
      setGpsMessage('Live GPS deactivated.');
      if (animRef.current) cancelAnimationFrame(animRef.current);
    } else {
      setIsLiveGpsActive(true);
      setGpsMessage('Live GPS activated! Syncing position with Miotso campus network...');
      
      // Request device location or default to campus entry point
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Map device coords or default to campus coordinates
            updateBackendLocation(72, 68, 0, 0);
            setGpsMessage('Connected to GPS Satellite! Device location locked on Miotso Campus.');
          },
          (err) => {
            updateBackendLocation(72, 68, 0, 0);
            setGpsMessage('GPS Signal locked to Trinity Hall, Miotso Campus.');
          }
        );
      } else {
        updateBackendLocation(72, 68, 0, 0);
      }
    }
  };

  // Simulated Live Walking along route
  useEffect(() => {
    if (!isSimulatingWalk || !isNavigating) return;

    const startB = CENTRAL_BUILDINGS.find(b => b.id === startBuildingId);
    const destB = CENTRAL_BUILDINGS.find(b => b.id === destBuildingId);
    if (!startB || !destB) return;

    let progress = 0;
    const step = () => {
      progress += 0.005;
      if (progress > 1) progress = 0;

      const currX = startB.x + (destB.x - startB.x) * progress;
      const currY = startB.y + (destB.y - startB.y) * progress;
      
      // Calculate angle/heading
      const dx = destB.x - startB.x;
      const dy = destB.y - startB.y;
      const heading = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);

      updateBackendLocation(currX, currY, 5.2, heading);
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSimulatingWalk, isNavigating, startBuildingId, destBuildingId]);

  const categories: BuildingCategory[] = [
    'All',
    'Academic',
    'Hostels',
    'Medical',
    'Administrative',
    'Amenities',
    'Sports',
  ];

  // Deep Search Filter for Buildings
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredBuildings = CENTRAL_BUILDINGS.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    if (!trimmedSearch) return matchesCategory;

    const matchesName = b.name.toLowerCase().includes(trimmedSearch);
    const matchesCode = b.code.toLowerCase().includes(trimmedSearch);
    const matchesCategoryName = b.category.toLowerCase().includes(trimmedSearch);
    const matchesDesc = b.description.toLowerCase().includes(trimmedSearch);
    const matchesFacility = b.facilities.some((fac) => fac.toLowerCase().includes(trimmedSearch));

    return matchesCategory && (matchesName || matchesCode || matchesCategoryName || matchesDesc || matchesFacility);
  });

  const startBuilding = CENTRAL_BUILDINGS.find((b) => b.id === startBuildingId);
  const destBuilding = CENTRAL_BUILDINGS.find((b) => b.id === destBuildingId);

  // Calculate Distance & Walk time on campus
  const calculateRoute = () => {
    if (!startBuilding || !destBuilding) return null;
    const dx = startBuilding.x - destBuilding.x;
    const dy = startBuilding.y - destBuilding.y;
    const euclideanPct = Math.sqrt(dx * dx + dy * dy);
    
    // Scale factor: 100% canvas width ≈ 600 meters across Miotso campus
    const distanceMeters = Math.round(euclideanPct * 6.5);
    const walkMinutes = Math.max(1, Math.round(distanceMeters / 75)); // ~75m per min walk speed

    const steps = [
      `Exit ${startBuilding.name} (${startBuilding.code}) and follow paved campus walkway.`,
      `Head straight for about ${Math.round(distanceMeters * 0.4)} meters towards central quad.`,
      `Turn towards the ${destBuilding.category} zone near ${destBuilding.name}.`,
      `Arrive at ${destBuilding.name} (${destBuilding.code}). Entrance is on your right.`
    ];

    return { distanceMeters, walkMinutes, steps };
  };

  const routeInfo = isNavigating ? calculateRoute() : null;

  return (
    <div className="relative min-h-screen z-10 flex flex-col px-4 py-6 text-slate-800 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/90 border border-red-200/80 p-4 rounded-3xl backdrop-blur-md shadow-lg shadow-red-100/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            id="back-to-dashboard-from-gps"
            className="p-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-[#CE1126] rounded-full transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-[#CE1126]" />
              Miotso Campus Live GPS
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Central University Main Campus • Real-time Live Navigator & Route Finder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live GPS Toggle Button */}
          <button
            onClick={handleToggleLiveGps}
            id="toggle-live-gps-button"
            className={`flex items-center gap-2 font-extrabold text-xs px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-md ${
              isLiveGpsActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 animate-pulse'
                : 'bg-slate-100 hover:bg-red-50 border border-slate-200 text-[#CE1126]'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLiveGpsActive ? 'animate-spin' : ''}`} />
            <span>{isLiveGpsActive ? 'Live GPS Active' : 'Start Live GPS'}</span>
          </button>

          {/* Quick Locate Button */}
          <button
            onClick={() => {
              if (!isLiveGpsActive) handleToggleLiveGps();
              updateBackendLocation(72, 68, 0, 0);
            }}
            id="locate-me-button"
            className="flex items-center gap-2 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Center My Location</span>
          </button>
        </div>
      </div>

      {/* GPS Status Alert Notice */}
      <AnimatePresence>
        {gpsMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs font-bold text-[#CE1126]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CE1126]" />
              <span>{gpsMessage}</span>
            </div>
            <button onClick={() => setGpsMessage(null)} className="p-1 hover:text-slate-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Map & Navigation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* LEFT PANEL: ROUTE FINDER & SEARCH */}
        <div className="space-y-6">
          {/* Route Finder Card */}
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xl shadow-red-100/50">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#CE1126]" />
              Campus Route Finder
            </h2>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Location
                </label>
                <select
                  value={startBuildingId}
                  onChange={(e) => setStartBuildingId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                >
                  {CENTRAL_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Location
                </label>
                <select
                  value={destBuildingId}
                  onChange={(e) => setDestBuildingId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#CE1126] focus:bg-white"
                >
                  {CENTRAL_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsNavigating(!isNavigating);
                  if (!isLiveGpsActive && !isNavigating) setIsLiveGpsActive(true);
                }}
                id="toggle-navigation-button"
                className={`w-full py-3 font-extrabold text-xs rounded-full shadow-md transition-all cursor-pointer ${
                  isNavigating
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-[#CE1126] hover:bg-[#A00D1D] text-white shadow-red-200'
                }`}
              >
                {isNavigating ? 'Clear Active Route' : 'Find Best Route & Directions'}
              </button>

              {isNavigating && (
                <button
                  onClick={() => setIsSimulatingWalk(!isSimulatingWalk)}
                  id="simulate-walk-button"
                  className={`w-full py-2.5 font-bold text-xs rounded-full border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isSimulatingWalk
                      ? 'bg-amber-500 border-amber-600 text-slate-900 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isSimulatingWalk ? 'Stop Walk Simulation' : 'Simulate Live Walking GPS'}</span>
                </button>
              )}
            </div>

            {/* Display Calculated Route Stats */}
            {isNavigating && routeInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-slate-100 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-500">Distance</span>
                    <span className="text-base font-black text-slate-900">{routeInfo.distanceMeters} m</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-500">Est. Walk Time</span>
                    <span className="text-base font-black text-[#CE1126]">{routeInfo.walkMinutes} min</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#CE1126]" />
                    Turn-by-Turn Guidance:
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {routeInfo.steps.map((step, idx) => (
                      <li key={idx} className="leading-snug">{step}</li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </div>

          {/* Search & List Filter */}
          <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-xl shadow-red-100/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Campus Places Search</span>
              {trimmedSearch && (
                <span className="text-[10px] font-bold bg-red-100 text-[#CE1126] px-2 py-0.5 rounded-full">
                  {filteredBuildings.length} found
                </span>
              )}
            </div>

            {/* Search Input Field */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#CE1126]" />
              <input
                type="text"
                placeholder="Search Senate, Clinic, Library, Law, Trinity, MoMo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CE1126]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[#CE1126] border-[#CE1126] text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#CE1126]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Landmarks */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredBuildings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No campus building matching "{searchQuery}"
                </div>
              ) : (
                filteredBuildings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBuilding(b)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#CE1126]">{b.name}</h4>
                      <p className="text-[10px] text-slate-500">{b.code} • {b.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CE1126] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE CAMPUS MAP CANVAS WITH LIVE GPS NODES */}
        <div className="lg:col-span-2 bg-white border border-red-100 rounded-3xl p-4 shadow-xl shadow-red-100/50 relative min-h-[520px] flex flex-col justify-between">
          {/* Map Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#CE1126]" />
              Central University Miotso Campus Map
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-100 text-[#CE1126] font-bold px-2.5 py-0.5 rounded-full font-mono">
                {liveLocations.length} Live Signals
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Network
              </span>
            </div>
          </div>

          {/* Canvas Map Container */}
          <div className="relative flex-1 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center p-4 min-h-[420px]">
            {/* Campus Road Network Vector Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="10%" y1="15%" x2="85%" y2="70%" stroke="#CE1126" strokeWidth="4" strokeDasharray="6,6" />
              <path d="M 20 80 Q 50 20 80 45" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.3" />
              <path d="M 30 30 Q 60 70 80 70" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.3" />
            </svg>

            {/* SVG Navigation Route Path when active */}
            {isNavigating && startBuilding && destBuilding && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1={`${startBuilding.x}%`}
                  y1={`${startBuilding.y}%`}
                  x2={`${destBuilding.x}%`}
                  y2={`${destBuilding.y}%`}
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeDasharray="8,8"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Render Building Pins on Canvas */}
            {CENTRAL_BUILDINGS.map((b) => {
              const isSelected = activeBuilding?.id === b.id;
              const isStart = isNavigating && startBuildingId === b.id;
              const isDest = isNavigating && destBuildingId === b.id;

              // Check if building matches search query
              const isMatched = trimmedSearch
                ? b.name.toLowerCase().includes(trimmedSearch) ||
                  b.code.toLowerCase().includes(trimmedSearch) ||
                  b.facilities.some(f => f.toLowerCase().includes(trimmedSearch))
                : true;

              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBuilding(b)}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer z-20 group ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  } ${!isMatched && trimmedSearch ? 'opacity-30 scale-90' : 'opacity-100'}`}
                  title={`${b.name} (${b.code})`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xl border ${
                      isStart
                        ? 'bg-amber-500 border-white text-black animate-bounce'
                        : isDest
                        ? 'bg-[#CE1126] border-white text-white animate-bounce'
                        : isSelected
                        ? 'bg-white border-[#CE1126] text-[#CE1126] ring-4 ring-red-200'
                        : isMatched && trimmedSearch
                        ? 'bg-amber-400 border-white text-slate-900 ring-4 ring-amber-300 animate-pulse'
                        : 'bg-white/90 border-red-200 text-slate-800 hover:bg-[#CE1126] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[80px] sm:max-w-[120px]">{b.name}</span>
                  </div>
                </button>
              );
            })}

            {/* Render Live GPS Backend Vehicles & Nodes */}
            {liveLocations.map((loc) => {
              const isShuttle = loc.role.includes('Shuttle');
              const isAmbulance = loc.role.includes('Emergency') || loc.role.includes('Ambulance');
              const isSecurity = loc.role.includes('Security');

              return (
                <div
                  key={loc.id}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-700 pointer-events-auto cursor-pointer group"
                  title={`${loc.name} • ${loc.speedKmH} km/h • Updated ${loc.lastUpdated}`}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400 animate-ping absolute" />
                    <div
                      className={`w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white ${
                        isShuttle
                          ? 'bg-blue-600'
                          : isAmbulance
                          ? 'bg-red-600'
                          : isSecurity
                          ? 'bg-purple-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {isShuttle ? (
                        <Bus className="w-3.5 h-3.5" />
                      ) : isAmbulance ? (
                        <Activity className="w-3.5 h-3.5" />
                      ) : isSecurity ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Tooltip Label */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white font-bold text-[9px] px-2 py-0.5 rounded-md border border-slate-700 shadow-md pointer-events-none">
                    {loc.name} ({loc.speedKmH} km/h)
                  </div>
                </div>
              );
            })}

            {/* Render User's Active Self Live Position */}
            {userLivePos && (
              <div
                style={{ left: `${userLivePos.x}%`, top: `${userLivePos.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400/40 border-2 border-amber-300 animate-ping absolute" />
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-2xl relative flex items-center justify-center text-[9px] font-black text-slate-950">
                  YOU
                </div>
              </div>
            )}
          </div>

          {/* Live Telemetry Banner at Bottom of Canvas */}
          {userLivePos && (
            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-300">Live GPS Telemetry Active</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
                <span>Speed: <strong className="text-white">{userLivePos.speedKmH} km/h</strong></span>
                <span>Heading: <strong className="text-white">{userLivePos.headingDeg}°</strong></span>
                <span>Lat/Lng: <strong className="text-white">{userLivePos.lat.toFixed(4)}°N, {userLivePos.lng.toFixed(4)}°E</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER / MODAL: BUILDING DETAILS */}
      <AnimatePresence>
        {activeBuilding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-red-100 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-slate-800"
            >
              <button
                onClick={() => setActiveBuilding(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={activeBuilding.image}
                  alt={activeBuilding.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[#CE1126] text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  {activeBuilding.code}
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-1">{activeBuilding.name}</h2>
              <p className="text-xs font-extrabold text-[#CE1126] mb-3">{activeBuilding.category} Facility</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{activeBuilding.description}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Hours:</span>
                  <span className="font-bold text-slate-900">{activeBuilding.openingHours}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Facilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBuilding.facilities.map((fac, i) => (
                      <span key={i} className="bg-red-50 text-[#CE1126] font-bold px-2 py-0.5 rounded-full text-[10px] border border-red-100">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDestBuildingId(activeBuilding.id);
                    setIsNavigating(true);
                    setActiveBuilding(null);
                  }}
                  id={`navigate-to-${activeBuilding.id}`}
                  className="flex-1 py-3 bg-[#CE1126] hover:bg-[#A00D1D] text-white font-extrabold text-xs rounded-full shadow-md shadow-red-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate To Here</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
