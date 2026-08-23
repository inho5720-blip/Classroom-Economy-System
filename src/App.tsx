import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Coins, LogOut } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { QuestCalendarView } from './components/QuestCalendarView';
import { SeatRealEstateView } from './components/SeatRealEstateView';
import { RankingsView } from './components/RankingsView';
import { ShopView } from './components/ShopView';
import { JobView } from './components/JobView';
import { PassbookView } from './components/PassbookView';
import { TeacherAdminView } from './components/TeacherAdminView';
import { LoginView } from './components/LoginView';

function MainAppContent() {
  const { currentUser, isLoggedIn, logout } = useApp();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser?.role === 'teacher' ? 'admin' : 'dashboard';
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Sync active tab when user logs in or role changes
  useEffect(() => {
    if (isLoggedIn) {
      if (currentUser.role === 'teacher') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isLoggedIn, currentUser?.id, currentUser?.role]);

  // Guard against non-teacher accessing admin tab
  useEffect(() => {
    if (isLoggedIn && currentUser.role !== 'teacher' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser?.role, isLoggedIn]);

  // If user is not logged in, display the full-screen unified LoginView
  if (!isLoggedIn) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] via-[#F8FAFC] to-[#F1F5F9] text-slate-800 flex flex-col md:flex-row selection:bg-amber-200 selection:text-amber-900 font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile/Tablet Top Bar */}
        <header className="md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-amber-100 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl bg-amber-50 text-slate-700 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 text-amber-800" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏰</span>
              <div>
                <span className="font-extrabold text-sm text-slate-800 block leading-tight">
                  6학년 1반 학급 RPG
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">화폐 경제 시스템</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                currentUser.points < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentUser.points.toLocaleString()}P</span>
            </div>

            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentUser.avatarColor} border border-slate-200 flex items-center justify-center text-sm shadow-xs select-none`}
            >
              {currentUser.avatarEmoji}
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="로그아웃 (로그인 화면으로 이동)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              {activeTab === 'dashboard' && <StudentDashboard onNavigateTab={setActiveTab} />}
              {activeTab === 'jobs' && <JobView onNavigateToAdmin={() => setActiveTab('admin')} />}
              {activeTab === 'passbook' && <PassbookView />}
              {activeTab === 'quests' && <QuestCalendarView />}
              {activeTab === 'seats' && <SeatRealEstateView />}
              {activeTab === 'rankings' && <RankingsView />}
              {activeTab === 'shop' && <ShopView />}
              {activeTab === 'admin' && currentUser.role === 'teacher' && <TeacherAdminView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-4 px-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-700">🏰 6학년 1반 학급 화폐 경제 RPG</span>
              <span className="text-slate-300">•</span>
              <span>PC & 태블릿 최적화 학급 경영 시스템</span>
            </div>
            <div className="text-[11px] text-slate-400">
              1인 1역 주급 • 자리 부동산 거래 • 5대 스탯 칭호 • 실시간 상점
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
