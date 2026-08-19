import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { loginWithCredentials, triggerCelebration } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('아이디(학번 또는 이름)를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    const res = loginWithCredentials(identifier.trim(), password.trim());
    setIsLoading(false);

    if (res.success) {
      triggerCelebration();
    } else {
      setErrorMessage(res.message);
    }
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
      </header>

      {/* 2. MAIN BODY */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: RPG World Showcase */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
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

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 border border-amber-200">
                💼
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  1인 1역 주급 & 성실 보너스
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  매일 직무를 수행하고 성실 스탯에 따라 정산되는 주급 시스템
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-indigo-200/80 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-xl shrink-0 border border-indigo-200">
                ⚡
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  5대 스탯 & 직급 승진
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  성실·기여·지혜·절약·신용 경험치로 인턴부터 회장까지 10단계 승진
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200/80 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 border border-emerald-200">
                🪑
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  자리 부동산 & 세금 시스템
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  우리 반 명당자리 매매, 임대료 거래 및 공공 복지 세금 정산
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/80 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl shrink-0 border border-rose-200">
                👑
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  학급 특권 경매 & 상점
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                  선생님 식사권, DJ 선곡권, 다양한 혜택 아이템 자유 경매 및 구매
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Single Unified Login Card */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-amber-200/80 shadow-2xl shadow-amber-900/10 overflow-hidden">
            {/* Login Card Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-850 flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-amber-600" /> 학급 포털 로그인
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  아이디와 비밀번호를 입력하여 시스템에 접속하세요.
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-2xl shadow-2xs">
                🎒
              </div>
            </div>

            {/* Login Form */}
            <div className="p-6 sm:p-7">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>아이디 (학번, 이름 또는 교사 ID)</span>
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="아이디를 입력하세요"
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-850 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>비밀번호</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="current-password"
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-850 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message Alert */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인하기</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-amber-200/40 text-center text-xs text-slate-500">
        <p>© 6학년 1반 학급 자치 화폐 경제 RPG 시스템 · 배움과 성장의 교실</p>
      </footer>
    </div>
  );
};
