import React, { useState } from 'react';
import { MovingBackground } from './components/MovingBackground';
import { WelcomePage } from './components/WelcomePage';
import { AuthPage } from './components/AuthPage';
import { DashboardPage } from './components/DashboardPage';
import { ShopView } from './components/ShopView';
import { GPSView } from './components/GPSView';
import { ClinicView } from './components/ClinicView';
import { AIChatBotModal } from './components/AIChatBotModal';
import { User } from './types';

export default function App() {
  // Page Flow State: 1 = Welcome, 2 = Auth, 3 = Dashboard, 'shop' | 'gps' | 'clinic' = Sub Views
  const [currentPage, setCurrentPage] = useState<'welcome' | 'auth' | 'dashboard' | 'shop' | 'gps' | 'clinic'>('welcome');
  
  // User Authentication State
  const [user, setUser] = useState<User | null>(null);

  // Active Search Query state passed from Dashboard
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // Global AI Chat Assistant Modal
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Navigation Handlers
  const handleEnterFromWelcome = () => {
    setCurrentPage('auth');
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  const handleSelectDashboardOption = (option: 'shop' | 'gps' | 'clinic', query = '') => {
    setActiveSearchQuery(query);
    setCurrentPage(option);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('auth');
  };

  return (
    <div className="relative min-h-screen bg-black font-sans text-white overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* Animated Moving Background in School Red & White Theme */}
      <MovingBackground />

      {/* Main Page Routing */}
      <main className="relative z-10 min-h-screen">
        {currentPage === 'welcome' && (
          <WelcomePage onEnter={handleEnterFromWelcome} />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onLogin={handleLogin}
            onBackToWelcome={() => setCurrentPage('welcome')}
          />
        )}

        {currentPage === 'dashboard' && user && (
          <DashboardPage
            user={user}
            onSelectOption={handleSelectDashboardOption}
            onLogout={handleLogout}
            onOpenAIChat={() => setIsAIChatOpen(true)}
          />
        )}

        {currentPage === 'shop' && user && (
          <ShopView
            user={user}
            initialSearchQuery={activeSearchQuery}
            onBackToDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'gps' && (
          <GPSView
            initialSearchQuery={activeSearchQuery}
            onBackToDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'clinic' && user && (
          <ClinicView
            user={user}
            onBackToDashboard={() => setCurrentPage('dashboard')}
          />
        )}
      </main>

      {/* Global AI Chat Assistant */}
      <AIChatBotModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        user={user}
      />
    </div>
  );
}
