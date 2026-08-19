import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn,
  GraduationCap,
  Sparkles,
  Shield,
  Coins,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  ArrowRight,
  UserCheck,
  Building2,
  ShoppingBag,
  Layers,
  CalendarCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTotalExp, getRankInfo } from '../utils/rankUtils';

export const LoginView: React.FC = () => {
  const {
    users,
    stats,
    jobs,
    studentJobs,
    quests,
    loginAsUser,
    loginWithCredentials,
    triggerCelebration,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'quick'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStudentForForm, setSelectedStudentForForm] = useState<string | null>(null);

  const students = users.filter((u) => u.role === 'student');
  const teacher = users.find((u) => u.role === 'teacher');

  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('아이디(학번 또는 이름)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const res = loginWithCredentials(identifier, password);
    if (res.success) {
      setSuccessMessage(res.message);
      triggerCelebration();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleTeacherLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const teacherIdInput = identifier.trim() || 'teacher';
    const teacherPwInput = password.trim() || '1234';

    const res = loginWithCredentials(teacherIdInput, teacherPwInput);
    if (res.success) {
      setSuccessMessage(res.message);
      triggerCelebration();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickStudentSelect = (studentId: string, studentName: string, studentNumber?: string) => {
    setSelectedStudentForForm(studentId);
    setIdentifier(studentNumber || studentName);
    setPassword('1234');
    setErrorMessage('');
  };

  const handleDirectQuickLogin = (userId: string) => {
    loginAsUser(userId);
    triggerCelebration();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-indigo-50/50 text-slate-800 flex flex-col justify-between selection:bg-amber-200 selection:text-amber-900 font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-rose-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP NAV / HEADER */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-amber-200/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-amber-500/25 shrink-0">
            🏰
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/70">
                6학년 1반 학급 RPG
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                화폐 경제 포털
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-850 tracking-tight leading-tight mt-0.5">
              배움과 성장이 자라나는 학급 경제 시스템
            </h1>
          </div>
        </div>

        {/* Top Quick Status Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-amber-200/80 px-3 py-1.5 rounded-2xl shadow-2xs backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600">학급 시스템 정상 가동 중</span>
          <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
            학생 {students.length}명
          </span>
        </div>
      </header>

      {/* 2. MAIN BODY (2-Column Grid on large screens) */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: RPG World Showcase & System Features (5 or 6 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {/* Main Hero Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-extrabold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>꿈을 이루는 우리 교실 속 작은 경제 사회</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-850 tracking-tight leading-snug">
              역할을 다하고 스탯을 쌓아 <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 bg-clip-text text-transparent">
                사원에서 회장까지
              </span>{' '}
              성장하는 교실
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              1인 1역 직업 활동과 일일 퀘스트를 통해 화폐를 획득하고, 성실·기여·지혜·절약·신용 5대 스탯을
              기르며 스스로 경제 활동과 자치 규약을 실천합니다.
            </p>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs hover:shadow-md transition duration-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 border border-amber-200">
                💼
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  1인 1역 주급 & 성실 보너스
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  매일 직무를 수행하고 성실 스탯에 따라 최대 30% 보너스 주급 정산
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-indigo-200/80 shadow-xs hover:shadow-md transition duration-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-xl shrink-0 border border-indigo-200">
                ⚡
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  5대 스탯 & 직급 승진
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  성실·기여·지혜·절약·신용 경험치로 인턴부터 회장까지 10단계 승진
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200/80 shadow-xs hover:shadow-md transition duration-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 border border-emerald-200">
                🪑
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  자리 부동산 & 세금 시스템
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  우리 반 명당자리 매매, 임대료 거래 및 공공 복지 세금 정산
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 shadow-xs hover:shadow-md transition duration-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl shrink-0 border border-rose-200">
                👑
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  학급 특권 경매 & 상점
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  선생님 식사권, DJ 선곡권, 다양한 혜택 아이템 자유 경매 및 구매
                </p>
              </div>
            </div>
          </div>

          {/* Quick Economy Stats Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200 flex items-center justify-around text-center">
            <div>
              <div className="text-[11px] font-bold text-slate-500">등록된 학생</div>
              <div className="text-lg sm:text-xl font-black font-mono text-slate-800">
                {students.length}명
              </div>
            </div>
            <div className="w-px h-8 bg-amber-200" />
            <div>
              <div className="text-[11px] font-bold text-slate-500">개설된 직업</div>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-700">
                {jobs.length}개
              </div>
            </div>
            <div className="w-px h-8 bg-amber-200" />
            <div>
              <div className="text-[11px] font-bold text-slate-500">활성 퀘스트</div>
              <div className="text-lg sm:text-xl font-black font-mono text-indigo-700">
                {quests.length}종
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login Card */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-amber-200/80 shadow-2xl shadow-amber-900/10 overflow-hidden">
            {/* Login Card Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-850 flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-amber-600" /> 학급 포털 로그인
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  본인의 계정 정보로 로그인하여 학급 화폐 시스템에 접속하세요.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-xl shadow-2xs">
                🎒
              </div>
            </div>

            {/* Role Select Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setErrorMessage('');
                  setSuccessMessage('');
                  setIdentifier('');
                  setPassword('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'student'
                    ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>학생 모험가</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('teacher');
                  setErrorMessage('');
                  setSuccessMessage('');
                  setIdentifier('teacher');
                  setPassword('1234');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'teacher'
                    ? 'bg-white text-purple-800 shadow-sm border border-purple-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>선생님 관리실</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'quick'
                    ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>빠른 체험</span>
              </button>
            </div>

            {/* Login Card Body */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Alert Feedback Messages */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage} 잠시 후 대시보드로 이동합니다...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ----------------- TAB 1: STUDENT LOGIN ----------------- */}
              {activeTab === 'student' && (
                <div className="space-y-4">
                  <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        학생 학번 또는 이름
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="예: 60101, 1번, 또는 강민우"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-3 focus:ring-amber-200/50 text-sm font-semibold transition outline-none bg-slate-50/50 focus:bg-white"
                        />
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        비밀번호 (초기: 1234)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호를 입력하세요 (기본: 1234)"
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-3 focus:ring-amber-200/50 text-sm font-semibold transition outline-none bg-slate-50/50 focus:bg-white"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>🎒 학생으로 로그인 & 모험 시작</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  </form>

                  {/* Quick Select Student Grid for convenience */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        우리 반 학생 계정 빠른 선택
                      </span>
                      <span className="text-[11px] text-slate-400">클릭하여 자동 입력</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {students.map((student) => {
                        const studentStat = stats[student.id] || { diligence: 10, frugality: 10, contribution: 10, wisdom: 10, credit: 10 };
                        const exp = getTotalExp(studentStat);
                        const rank = getRankInfo(exp);
                        const isSelected = selectedStudentForForm === student.id || identifier === student.name || identifier === student.studentNumber;

                        return (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => handleQuickStudentSelect(student.id, student.name, student.studentNumber)}
                            className={`p-2 rounded-xl text-left border transition flex flex-col items-center text-center ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                                : 'bg-slate-50/80 border-slate-200 hover:bg-amber-50/50 hover:border-amber-200'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${student.avatarColor} text-base flex items-center justify-center shadow-2xs mb-1`}>
                              {student.avatarEmoji}
                            </div>
                            <span className="text-xs font-bold text-slate-800 truncate w-full">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{student.studentNumber?.slice(-2) || '학생'}
                            </span>
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-full mt-0.5">
                              {rank.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TAB 2: TEACHER LOGIN ----------------- */}
              {activeTab === 'teacher' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0 border border-purple-200">
                      👨‍🏫
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-900">교사 관리실 계정 안내</h4>
                      <p className="text-[11px] text-purple-700/80 mt-0.5 leading-snug">
                        학급 퀘스트 승인, 주급 정산, 자리 배치, 상점 관리 등 전체 시스템을 총괄합니다.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleTeacherLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        선생님 아이디
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="teacher 또는 선생님"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-200/50 text-sm font-semibold transition outline-none bg-slate-50/50 focus:bg-white"
                        />
                        <Shield className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        비밀번호 (초기: 1234)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호 (기본: 1234)"
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-200/50 text-sm font-semibold transition outline-none bg-slate-50/50 focus:bg-white"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-sm shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>👨‍🏫 교사 관리실 접속하기</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectQuickLogin('teacher-1')}
                      className="w-full py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>원클릭으로 선생님 계정 즉시 로그인</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ----------------- TAB 3: QUICK EXPERIENCE ----------------- */}
              {activeTab === 'quick' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-semibold mb-2">
                    원하는 역할을 선택하면 비밀번호 없이 즉시 시스템을 둘러볼 수 있습니다.
                  </div>

                  {/* Teacher direct button */}
                  <button
                    type="button"
                    onClick={() => handleDirectQuickLogin('teacher-1')}
                    className="w-full p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100/90 border border-purple-200 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-2xs">
                        👨‍🏫
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-purple-950">김선생님 (관리자)</span>
                          <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                            교사 권한
                          </span>
                        </div>
                        <p className="text-xs text-purple-700/80 mt-0.5">
                          주급 정산, 퀘스트 승인, 상점/경매 관리
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Top Students direct button */}
                  {students.slice(0, 4).map((student) => {
                    const studentStat = stats[student.id] || { diligence: 10, frugality: 10, contribution: 10, wisdom: 10, credit: 10 };
                    const exp = getTotalExp(studentStat);
                    const rank = getRankInfo(exp);

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleDirectQuickLogin(student.id)}
                        className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-200 text-left transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${student.avatarColor} text-base flex items-center justify-center shadow-2xs`}>
                            {student.avatarEmoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-800">{student.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">#{student.studentNumber}</span>
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                                {rank.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              보유 화폐: {student.points.toLocaleString()}P
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Notice footnote */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-600" /> 기본 계정 비밀번호: 1234
                </span>
                <span>6학년 1반 자치경제</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>🏰 초등 6학년 학급 화폐 경제 RPG 시스템</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">배움 · 성실 · 나눔</span>
        </div>
        <div className="text-[11px] text-slate-400">
          모든 경제 활동 내역은 실시간 입출금 통장 및 교사 관리실에 안전하게 기록됩니다.
        </div>
      </footer>
    </div>
  );
};
