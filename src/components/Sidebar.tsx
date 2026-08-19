import React, { useState } from 'react';
import {
  Coins,
  Shield,
  Calendar,
  Home,
  Trophy,
  ShoppingBag,
  UserCheck,
  Sparkles,
  Settings,
  Menu,
  X,
  Award,
  ChevronRight,
  GraduationCap,
  Sparkle,
  Wallet,
  Briefcase,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoginModal } from './LoginModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentUser, titles, triggerCelebration, logout } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const mainTitle = titles.find((t) => t.id === currentUser.mainTitleId);
  const isTeacher = currentUser.role === 'teacher';

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: '내 캐릭터',
      subtitle: 'RPG 스탯 & 자산',
      icon: Shield,
      iconBg: 'bg-amber-100 text-amber-700',
      activeBg: 'bg-amber-100/90 text-amber-900 border-amber-300 shadow-sm shadow-amber-200/50',
      badge: 'RPG',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'jobs',
      label: '1인 1역 직업',
      subtitle: '직업 공고 & 지원서',
      icon: Briefcase,
      iconBg: 'bg-blue-100 text-blue-700',
      activeBg: 'bg-blue-100/90 text-blue-900 border-blue-300 shadow-sm shadow-blue-200/50',
      badge: '채용',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'passbook',
      label: '전자 통장',
      subtitle: '주급/세금/자산 그래프',
      icon: Wallet,
      iconBg: 'bg-teal-100 text-teal-700',
      activeBg: 'bg-teal-100/90 text-teal-900 border-teal-300 shadow-sm shadow-teal-200/50',
      badge: '통장',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'quests',
      label: '퀘스트 달력',
      subtitle: '숙제 & 직업 인증',
      icon: Calendar,
      iconBg: 'bg-indigo-100 text-indigo-700',
      activeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-300 shadow-sm shadow-indigo-200/50',
      badge: '할일',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      id: 'seats',
      label: '자리 부동산',
      subtitle: '배치도 & 당근마켓',
      icon: Home,
      iconBg: 'bg-emerald-100 text-emerald-700',
      activeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-sm shadow-emerald-200/50',
      badge: '당근',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'rankings',
      label: '명예의 전당',
      subtitle: '만수르 & 스탯 랭킹',
      icon: Trophy,
      iconBg: 'bg-yellow-100 text-yellow-700',
      activeBg: 'bg-yellow-100/90 text-yellow-900 border-yellow-300 shadow-sm shadow-yellow-200/50',
      badge: '랭킹',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
      id: 'shop',
      label: '상점 & 경매',
      subtitle: '쿠폰 & 실시간 경매',
      icon: ShoppingBag,
      iconBg: 'bg-pink-100 text-pink-700',
      activeBg: 'bg-pink-100/90 text-pink-900 border-pink-300 shadow-sm shadow-pink-200/50',
      badge: '쇼핑/경매',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    },
    {
      id: 'admin',
      label: '교사 관리실',
      subtitle: '승인/주급/세금/경매',
      icon: Settings,
      iconBg: 'bg-purple-100 text-purple-700',
      activeBg: 'bg-purple-100/90 text-purple-900 border-purple-300 shadow-sm shadow-purple-200/50',
      badge: '선생님',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      adminOnly: true,
    },
  ];

  const handleNavClick = (itemId: string, adminOnly?: boolean) => {
    if (adminOnly && !isTeacher) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveTab(itemId);
    setIsMobileOpen(false);
    if (itemId === 'dashboard') {
      triggerCelebration();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-r border-amber-100/80 shadow-lg shadow-amber-900/5 select-none">
      {/* 1. App Header & Brand */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            triggerCelebration();
          }}
          className="flex items-center gap-3 text-left w-full group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-md shadow-amber-400/30 group-hover:scale-105 group-hover:rotate-3 transition duration-200 shrink-0">
            🏰
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                6학년 1반
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                RPG 경제
              </span>
            </div>
            <div className="text-base font-extrabold text-slate-800 group-hover:text-amber-600 transition truncate mt-0.5">
              학급 화폐 시스템
            </div>
          </div>
        </button>
      </div>

      {/* 2. User Profile Card in Sidebar */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 border border-amber-200/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentUser.avatarColor} border-2 border-white shadow-sm flex items-center justify-center text-xl shrink-0`}
            >
              {currentUser.avatarEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-800 truncate">
                  {currentUser.name}
                </span>
                {currentUser.role === 'teacher' ? (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                    선생님
                  </span>
                ) : (
                  currentUser.studentNumber && (
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      #{currentUser.studentNumber}
                    </span>
                  )
                )}
              </div>
              <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                {mainTitle ? (
                  <span className="text-amber-700 font-medium truncate">
                    {mainTitle.icon} {mainTitle.name}
                  </span>
                ) : (
                  <span>{currentUser.nickname}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="p-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-slate-200 text-slate-600 hover:text-amber-700 transition shadow-2xs cursor-pointer"
              title="계정 전환"
            >
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
              title="로그아웃 (로그인 화면으로 이동)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Currency points pill */}
        <div
          className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition ${
            currentUser.points < 0
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-white border-amber-200 text-amber-900 shadow-2xs'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            <Coins className="w-4 h-4 text-amber-500" /> 보유 화폐
          </span>
          <div className="flex items-baseline gap-1 font-mono font-black">
            <span
              className={`text-base ${
                currentUser.points < 0 ? 'text-rose-600' : 'text-amber-700'
              }`}
            >
              {currentUser.points.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-500">P</span>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Items (Vertical with full horizontal space - NO vertical text wrap) */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-1.5">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-3 py-1">
          메인 메뉴
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.adminOnly && !isTeacher;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.adminOnly)}
              className={`w-full px-3.5 py-3 rounded-2xl text-left flex items-center justify-between transition-all duration-150 group border ${
                isActive
                  ? `${item.activeBg} font-bold`
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-transform group-hover:scale-105 shrink-0 ${
                    isActive
                      ? 'bg-white shadow-sm ring-2 ring-amber-300'
                      : item.iconBg
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold truncate whitespace-nowrap">
                      {item.label}
                    </span>
                    {isLocked && (
                      <span className="text-[10px] text-slate-400">🔒</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 group-hover:text-slate-500 truncate whitespace-nowrap">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className="shrink-0 ml-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Sidebar Footer Notice */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center justify-between font-medium">
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            ✨ 초등 6학년 경제 RPG
          </span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-mono">
            v2.0
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="py-2 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>계정 전환</span>
          </button>
          <button
            onClick={logout}
            className="py-2 px-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-rose-700 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet-Landscape Persistent Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Tablet Portrait & Mobile Slide Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sliding Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-3 z-20 p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Account / User Switcher Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
