import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Coins,
  Shield,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  ChevronRight,
  Zap,
  Award,
  BookOpen,
  HeartHandshake,
  Scale,
  PlusCircle,
  XCircle,
  Eye,
  Check,
  Palette,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatRadarChart } from './StatRadarChart';
import { TitleEquipModal } from './TitleEquipModal';
import { CharacterCustomizerModal } from './CharacterCustomizerModal';
import { isQuestActiveForDateAndStudent, getQuestRewardForStudent } from '../utils/questUtils';
import { getTotalExp, getRankInfo, getNextRankProgress } from '../utils/rankUtils';

interface StudentDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    stats,
    getStudentJob,
    titles,
    quests,
    questLogs,
    jobs,
    studentJobs,
    seats,
    submitQuestLog,
    pointLedger,
    triggerCelebration,
    taxSettings,
    getStudentJobs,
  } = useApp();

  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [memoQuestId, setMemoQuestId] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');

  const currentStats = stats[currentUser.id] || {
    userId: currentUser.id,
    diligence: 10,
    frugality: 10,
    contribution: 10,
    wisdom: 10,
    credit: 10,
  };

  const userJobs = getStudentJobs ? getStudentJobs(currentUser.id) : [];
  const userJobIds = userJobs.map((j) => j.id);
  const totalWeeklyJobSalary = userJobs.reduce((sum, j) => sum + (j.weeklySalary || 0), 0);
  const mainTitle = titles.find((t) => t.id === currentUser.mainTitleId);

  // Total stat EXP & Rank calculations
  const totalStatPoints = getTotalExp(currentStats);
  const rankInfo = getRankInfo(totalStatPoints);
  const nextRankProgress = getNextRankProgress(totalStatPoints);

  // Today's date YYYY-MM-DD
  const todayStr = '2026-08-17';

  // Today's quest logs
  const todayLogs = questLogs.filter((l) => l.userId === currentUser.id && l.targetDate === todayStr);

  // Active quests for today (accounting for one-time deadline, completion status, target student & recurring days)
  const todayActiveQuests = quests.filter((q) =>
    isQuestActiveForDateAndStudent(
      q,
      todayStr,
      currentUser.id,
      questLogs,
      userJobIds,
      currentUser.role === 'teacher'
    )
  );

  // Seat status
  const currentSeat = seats.find((s) => s.currentOccupantId === currentUser.id);
  const isSeatOwner = currentSeat && currentSeat.ownerId === currentUser.id;

  // Diligence bonus %
  const diligenceBonusPercent = Math.min(30, Math.floor(currentStats.diligence / 5));

  // ----------------------------------------------------
  // ESTIMATED WEEKLY SALARY (예상 주급) CALCULATION
  // ----------------------------------------------------
  // 1. Unpaid approved quest logs for current student
  const unpaidApprovedLogs = questLogs.filter(
    (l) => l.userId === currentUser.id && l.status === 'approved' && !l.isPaid
  );

  // 2. Quest reward points sum (including 1-person-1-role job quests and regular quests)
  const approvedQuestPoints = unpaidApprovedLogs.reduce((acc, log) => {
    const q = quests.find((item) => item.id === log.questId);
    if (!q) return acc;
    return acc + getQuestRewardForStudent(q, currentUser.id, jobs, studentJobs);
  }, 0);

  // 3. Diligence bonus
  const estimatedDiligenceBonus = Math.round(
    approvedQuestPoints * (diligenceBonusPercent / 100)
  );

  // 4. Gross Expected Salary
  const grossExpectedSalary = approvedQuestPoints + estimatedDiligenceBonus;

  // 5. Taxes & deductions
  let estimatedTaxAmount = 0;
  taxSettings.forEach((tax) => {
    if (!tax.isActive || tax.id === 'tax-seat') return;
    if (tax.taxType === 'percent') {
      estimatedTaxAmount += Math.round(grossExpectedSalary * (tax.value / 100));
    } else {
      estimatedTaxAmount += tax.value;
    }
  });

  let estimatedSeatTax = 0;
  if (currentSeat && currentSeat.ownerId !== currentUser.id) {
    const seatTaxSetting = taxSettings.find((t) => t.id === 'tax-seat' && t.isActive);
    estimatedSeatTax = seatTaxSetting ? currentSeat.rentalFee : 0;
  }

  const totalEstimatedDeduction = estimatedTaxAmount + estimatedSeatTax;
  const estimatedNetSalary = grossExpectedSalary - totalEstimatedDeduction;

  // Recent 3 transactions
  const myRecentLedgers = pointLedger.filter((l) => l.userId === currentUser.id).slice(0, 3);

  const handleQuickSubmit = (questId: string) => {
    submitQuestLog(questId, currentUser.id, todayStr, '오늘 수행 완료했습니다!');
    triggerCelebration();
  };

  const handleSaveMemoSubmit = (questId: string) => {
    submitQuestLog(questId, currentUser.id, todayStr, memoText.trim() || '완료');
    setMemoQuestId(null);
    setMemoText('');
    triggerCelebration();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HERO CHARACTER & RPG PROFILE CARD (Bright Pastel Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-indigo-50/40 border border-amber-200/80 shadow-md shadow-amber-900/5 p-6 sm:p-8">
        {/* Soft pastel ambient background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Identifiers */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative group cursor-pointer" onClick={() => setIsCustomizerOpen(true)} title="클릭하여 캐릭터 꾸미기">
              <motion.div
                whileHover={{ scale: 1.06, rotate: 2 }}
                whileTap={{ scale: 0.96 }}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${currentUser.avatarColor} border-3 border-white shadow-lg shadow-amber-500/20 flex items-center justify-center text-4xl sm:text-5xl select-none relative`}
              >
                {currentUser.avatarEmoji}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white rounded-full p-1 text-[10px]">
                  <Palette className="w-3 h-3" />
                </div>
              </motion.div>
              {/* Job Rank Badge (Replaces numeric Lv.) */}
              <div
                className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-right-2 px-3 py-0.5 rounded-full ${rankInfo.badgeBg} border-2 ${rankInfo.badgeBorder} ${rankInfo.badgeTextColor} text-[11px] font-black shadow-md whitespace-nowrap flex items-center gap-1 shrink-0 z-20`}
              >
                <span>{rankInfo.emoji}</span>
                <span>{rankInfo.title}</span>
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight">
                  {currentUser.name}
                </h1>
                {currentUser.studentNumber && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    #{currentUser.studentNumber}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
                  {currentUser.nickname}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="이름, 닉네임(별명), 캐릭터 아바타 변경"
                >
                  <Palette className="w-3 h-3 text-amber-700" />
                  <span>이름·별명·캐릭터 수정</span>
                </button>
              </div>

              {/* Equipped Title Badge */}
              <div className="flex items-center gap-2 pt-0.5">
                {mainTitle ? (
                  <button
                    onClick={() => setIsTitleModalOpen(true)}
                    className="text-xs px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold flex items-center gap-1.5 shadow-2xs hover:bg-amber-50 transition cursor-pointer"
                  >
                    <span>{mainTitle.icon}</span>
                    <span>{mainTitle.name}</span>
                    <Sparkles className="w-3 h-3 text-amber-500 opacity-80" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTitleModalOpen(true)}
                    className="text-xs px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>대표 칭호 장착하기</span>
                  </button>
                )}
                <button
                  onClick={() => setIsTitleModalOpen(true)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold transition underline underline-offset-2"
                >
                  칭호 변경
                </button>
              </div>

              {/* Stat EXP Progress Bar */}
              <div className="pt-1.5 max-w-sm">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span className="flex items-center gap-1 text-indigo-900 font-bold">
                    <span>{rankInfo.emoji}</span> {rankInfo.title}
                    <span className="text-slate-400 font-normal">({totalStatPoints} EXP)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {nextRankProgress.nextRank ? (
                      <>다음 <strong>[{nextRankProgress.nextRank.title}]</strong>까지 <strong className="text-indigo-600 font-mono">+{nextRankProgress.remainingExp} EXP</strong></>
                    ) : (
                      <span className="text-amber-600 font-bold">👑 최고 직급 도달!</span>
                    )}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${nextRankProgress.percent}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-3 pt-1">
                <span>🔥 연속 성실 <strong className="text-amber-700">{currentUser.consecutiveSuccessDays}일</strong></span>
                <span>•</span>
                <span>🛒 연속 절약 <strong className="text-emerald-700">{currentUser.unspentDays}일차</strong></span>
              </div>
            </div>
          </div>

          {/* Points & Economy Summary Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Main Coin Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm flex-1 sm:min-w-[200px] bg-white ${
                currentUser.points < 0
                  ? 'border-rose-300 bg-rose-50/50'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <Coins className="w-4 h-4 text-amber-500" /> 보유 학급 화폐
                </span>
                {currentUser.points < 0 ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> 마이너스 채무!
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    정상 자산
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    currentUser.points < 0 ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {currentUser.points.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-500">포인트 (P)</span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>성실 보너스 배율:</span>
                <span className="font-bold text-sky-700">+{diligenceBonusPercent}% 가산</span>
              </div>
            </div>

            {/* Expected Weekly Salary Quick Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/60 transition shadow-sm flex-1 sm:min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> 이번 주 예상 주급
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                  정산 대기
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-700">
                  {estimatedNetSalary >= 0 ? `+${estimatedNetSalary.toLocaleString()}` : `${estimatedNetSalary.toLocaleString()}`}
                </span>
                <span className="text-xs font-bold text-slate-500">P (실수령액)</span>
              </div>

              <div className="mt-2 pt-2 border-t border-indigo-100/80 text-[11px] text-slate-600 flex items-center justify-between">
                <span>승인 퀘스트 {unpaidApprovedLogs.length}건:</span>
                <strong className="text-emerald-700 font-mono font-bold">+{approvedQuestPoints}P 대기</strong>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 shrink-0">
              <button
                onClick={() => onNavigateTab('passbook')}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-200 shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                💳 통장
              </button>
              <button
                onClick={() => onNavigateTab('shop')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-xs shadow-sm shadow-amber-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                🏪 상점
              </button>
              <button
                onClick={() => onNavigateTab('quests')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
              >
                📅 퀘스트
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED EXPECTED WEEKLY SALARY & APPROVED QUEST SETTLEMENT SECTION */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
        {/* Header & Explanation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/20">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-850">
                  현재 나의 예상 주급 & 승인 퀘스트 정산함
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  교사 일괄 정산 대기
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                승인된 퀘스트(1인 1역 직업 및 과제) 보상을 바탕으로 산출된 이번 주 예상 주급입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-900 px-3.5 py-2 rounded-2xl border border-indigo-100 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>스탯은 승인 즉시 지급 완료됨</span>
          </div>
        </div>

        {/* 3-Formula Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. 승인된 퀘스트 보상 (직업 퀘스트 + 과제 퀘스트) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ① 승인 퀘스트 총 보상
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                {unpaidApprovedLogs.length}건 승인 완료
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                +{approvedQuestPoints.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-800">P</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-2">
              1인 1역 직업 퀘스트(1/5 주급) 및 일반 과제 합산
            </p>
          </div>

          {/* 2. 성실 스탯 보너스 */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-sky-800 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600" /> ② 성실 보너스 가산
              </span>
              <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full font-bold">
                +{diligenceBonusPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-sky-700">
                +{estimatedDiligenceBonus.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-sky-800">P</span>
            </div>
            <p className="text-[11px] text-sky-700/80 mt-2">
              승인 퀘스트 보상 × 성실 스탯 가산율
            </p>
          </div>

          {/* 3. 세금 & 자리세 자동 공제 */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-rose-800 mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-600" /> ③ 세금 및 자리세 공제
              </span>
              <span className="text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                자동 공제
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-rose-600">
                -{totalEstimatedDeduction.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-700">P</span>
            </div>
            <p className="text-[11px] text-rose-700/80 mt-2">
              학급세({estimatedTaxAmount}P) + 자리세({estimatedSeatTax}P)
            </p>
          </div>
        </div>

        {/* Expected Net Salary Hero Banner & Quests List Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-900 block mb-1">
              💡 이번 주 예상 최종 실수령액 (세후)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-850">
                {estimatedNetSalary.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-600">포인트 (P)</span>
              <span className="text-xs text-slate-500 font-medium ml-1">
                (세전 총액: {grossExpectedSalary.toLocaleString()}P)
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white/90 p-3 rounded-xl border border-indigo-100 max-w-md leading-relaxed shadow-2xs">
            📢 <strong>정산 방식 안내</strong>: 교사 관리실에서 선생님이{' '}
            <span className="text-indigo-700 font-bold">[주급 일괄 지급 & 세금 자동 정산]</span>{' '}
            버튼을 누르면, 세금이 자동으로 차감된 실수령액(
            <strong className="text-amber-700">{estimatedNetSalary.toLocaleString()}P</strong>)이
            학생 통장에 일괄 입금됩니다.
          </div>
        </div>

        {/* Approved Quests Waiting for Payout List */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-750 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              정산 대기 중인 승인 퀘스트 목록 ({unpaidApprovedLogs.length}건)
            </h3>
            <span className="text-[11px] text-slate-400">
              승인 즉시 스탯 부여 완료됨
            </span>
          </div>

          {unpaidApprovedLogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unpaidApprovedLogs.map((log) => {
                const quest = quests.find((q) => q.id === log.questId);
                const dynamicReward = quest
                  ? getQuestRewardForStudent(quest, currentUser.id, jobs, studentJobs)
                  : 0;

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {quest?.icon || '📝'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {quest?.title || '퀘스트'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>수행일: {log.targetDate}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">선생님 승인 완료</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md text-xs">
                        +{dynamicReward} P
                      </span>
                      <span className="text-[9px] text-indigo-700 block mt-0.5 font-medium">
                        주급 정산 대기
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              아직 이번 주 승인된 퀘스트가 없습니다. 숙제나 직업 과제를 제출하고 승인을 받으면 주급에 가산됩니다.
            </div>
          )}
        </div>
      </div>

      {/* 2. 5대 스탯 RADAR CHART & RPG PERKS BREAKDOWN (Pastel Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">5대 RPG 능력치 다각형</h3>
                <p className="text-[11px] text-slate-500">행동에 따라 능력치가 실시간 반영됩니다</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('rankings')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5"
            >
              스탯 랭킹 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 flex items-center justify-center">
            <StatRadarChart stats={currentStats} size={250} />
          </div>

          <div className="text-center bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-slate-500">현재 직급:</span>
              <span className={`px-2.5 py-0.5 rounded-full ${rankInfo.badgeBg} ${rankInfo.badgeTextColor} font-black text-xs shadow-2xs inline-flex items-center gap-1`}>
                <span>{rankInfo.emoji}</span>
                <span>{rankInfo.title}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              총 누적 경험치: <strong className="text-amber-700 font-mono font-bold">{totalStatPoints} EXP</strong> (스탯 합계)
            </div>
          </div>
        </div>

        {/* 5-Stats Perk Bars (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" /> 5대 능력치별 획득 방법 & 특수 혜택
              </h3>
              <p className="text-[11px] text-slate-500">모든 스탯은 10에서 시작하여 최대 100까지 성장합니다.</p>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              최대 100점
            </span>
          </div>

          <div className="space-y-3">
            {/* 1. 성실 */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 hover:bg-sky-50 transition">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-sky-900 flex items-center gap-1.5">
                  ⚡ 성실 (Diligence)
                  <span className="text-[10px] font-normal text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded">배움/숙제 퀘스트 완료 시 +1점</span>
                </span>
                <span className="font-mono text-sky-700 font-bold">{currentStats.diligence} / 100</span>
              </div>
              <div className="w-full h-2 bg-sky-200/60 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentStats.diligence)}%` }}
                />
              </div>
              <div className="text-[11px] text-sky-800 flex items-center justify-between">
                <span>✨ 주급 정산 추가 보너스</span>
                <strong className="text-sky-700 font-mono font-bold">+{diligenceBonusPercent}% 추가 수령 연동</strong>
              </div>
            </div>

            {/* 2. 기여 */}
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 hover:bg-rose-50 transition">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-900 flex items-center gap-1.5">
                  🤝 기여 (Contribution)
                  <span className="text-[10px] font-normal text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded">1인1역/직업 & 특별공헌 퀘스트 완료 시 +1점</span>
                </span>
                <span className="font-mono text-rose-700 font-bold">{currentStats.contribution} / 100</span>
              </div>
              <div className="w-full h-2 bg-rose-200/60 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentStats.contribution)}%` }}
                />
              </div>
              <div className="text-[11px] text-rose-800 flex items-center justify-between">
                <span>✨ 학급 공헌 활약도</span>
                <strong className="text-rose-700 font-mono font-bold">기여의 영웅 칭호 & 보너스 연계</strong>
              </div>
            </div>

            {/* 3. 지혜 */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-50 transition">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-indigo-900 flex items-center gap-1.5">
                  📖 지혜 (Wisdom)
                  <span className="text-[10px] font-normal text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded">독서 / 생각 퀘스트 완료 시 +1점</span>
                </span>
                <span className="font-mono text-indigo-700 font-bold">{currentStats.wisdom} / 100</span>
              </div>
              <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentStats.wisdom)}%` }}
                />
              </div>
              <div className="text-[11px] text-indigo-800 flex items-center justify-between">
                <span>✨ 탐구 및 독서 혜택</span>
                <strong className="text-indigo-700 font-mono font-bold">지혜의 현자 칭호 획득</strong>
              </div>
            </div>

            {/* 4. 절약 & 신용 (2 Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 절약 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-900">💰 절약 (Frugality)</span>
                  <span className="font-mono text-emerald-700">{currentStats.frugality} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, currentStats.frugality)}%` }}
                  />
                </div>
                <div className="text-[10px] text-emerald-800 font-medium">
                  상점 미구매 시 <strong>매일 +1점 자동 적립</strong> (연속 {currentUser.unspentDays}일차)
                </div>
              </div>

              {/* 신용 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-900">⚖️ 신용 (Credit)</span>
                  <span className="font-mono text-amber-700">{currentStats.credit} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentStats.credit < 40 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, currentStats.credit)}%` }}
                  />
                </div>
                <div className="text-[10px] text-amber-800 font-medium">
                  주급 수령 & 세금 납부 시 <strong>+5점씩 적립</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: TODAY'S ACTIVE QUESTS & MY JOB & REAL ESTATE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Today's Quests */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> 오늘({todayStr})의 퀘스트 & 할 일
              </h3>
              <p className="text-xs text-slate-500">완료 체크 후 선생님 승인을 받아 포인트를 적립하세요!</p>
            </div>
            <button
              onClick={() => onNavigateTab('quests')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              전체 달력 보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quests List */}
          <div className="space-y-3">
            {todayActiveQuests.map((quest) => {
              const myLog = todayLogs.find((l) => l.questId === quest.id);
              const isApproved = myLog?.status === 'approved';
              const isPending = myLog?.status === 'pending';
              const isRejected = myLog?.status === 'rejected';
              const dynamicReward = getQuestRewardForStudent(quest, currentUser.id, jobs, studentJobs);

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isApproved
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : isPending
                      ? 'bg-amber-50/70 border-amber-200'
                      : isRejected
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs mt-0.5">
                      {quest.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{quest.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          +{dynamicReward} P
                        </span>
                        {quest.questType === 'job' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                            직업 주급 1/5
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{quest.description}</p>

                      {myLog?.studentMemo && (
                        <div className="text-[11px] text-indigo-800 mt-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-medium">
                          💬 내 메모: {myLog.studentMemo}
                        </div>
                      )}

                      {isRejected && myLog?.rejectReason && (
                        <div className="text-[11px] text-rose-800 mt-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-semibold">
                          ❌ 반려 사유: {myLog.rejectReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button & Status Pill */}
                  <div className="shrink-0 w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    {isApproved ? (
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 승인 완료 (+{dynamicReward}P)
                        </span>
                        <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
                          {myLog?.isPaid ? '주급 지급 완료' : '스탯 부여 완료 · 주급 정산 대기'}
                        </span>
                      </div>
                    ) : isPending ? (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-4 h-4 text-amber-600" /> 선생님 확인 중
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setMemoQuestId(quest.id);
                            setMemoText('');
                          }}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
                        >
                          메모 작성
                        </button>
                        <button
                          onClick={() => handleQuickSubmit(quest.id)}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> 완료 제출
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {todayActiveQuests.length === 0 && (
              <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-4 space-y-1.5">
                <div className="text-2xl">🎉</div>
                <p className="text-xs font-bold text-slate-700">오늘 할 일과 퀘스트가 모두 완료되었거나 없습니다!</p>
                <p className="text-[11px] text-slate-400">마감일이 지난 단발성 과제나 이미 완료한 과제는 자동으로 정리됩니다.</p>
              </div>
            )}
          </div>

          {/* Memo writing sub-modal/input if active */}
          {memoQuestId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>📝 완료 메모 남기기 (선택 사항)</span>
                <button
                  onClick={() => setMemoQuestId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="예: 칠판 깔끔히 지우고 분필 채워둠, 수학 45쪽까지 풀었습니다!"
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setMemoQuestId(null)}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-600 text-xs hover:bg-slate-100 border border-slate-200"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSaveMemoSubmit(memoQuestId)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs"
                >
                  메모와 함께 제출
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right 5 Cols: My Job & Real Estate Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* My Job Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  내 1인 1역 직업 {userJobs.length > 1 && `(${userJobs.length}개)`}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                주급 보장제
              </span>
            </div>

            {userJobs.length === 0 ? (
              <div className="text-center py-5 space-y-2">
                <p className="text-xs text-slate-600 font-bold">현재 무직 상태입니다.</p>
                <p className="text-[11px] text-slate-400">1인 1역 직업에 지원하여 매주 정기 주급을 획득하세요!</p>
                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="mt-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>직업 공고 확인 & 지원서 작성</span>
                </button>
              </div>
            ) : userJobs.length === 1 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {userJobs[0].icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-850">{userJobs[0].title}</h4>
                    <p className="text-xs text-slate-500">{userJobs[0].description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px] block">기본 주급</span>
                    <strong className="text-amber-700 font-mono font-bold text-sm">
                      {userJobs[0].weeklySalary.toLocaleString()} P
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px] block">업무 난이도</span>
                    <div className="text-rose-500 font-bold">
                      {'★'.repeat(userJobs[0].difficulty)}
                      <span className="text-slate-300">{'★'.repeat(Math.max(0, 5 - userJobs[0].difficulty))}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1인 1역 직업 센터 & 추가 지원 바로가기</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Total salary banner for multi-jobs */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-600 font-bold block">총 예상 합산 주급 ({userJobs.length}개 직업)</span>
                    <span className="text-xs text-indigo-900 font-medium">매주 정산 시 합산 지급</span>
                  </div>
                  <strong className="text-amber-700 font-mono font-black text-base">
                    +{totalWeeklyJobSalary.toLocaleString()} P
                  </strong>
                </div>

                {/* List of jobs */}
                <div className="space-y-2">
                  {userJobs.map((j) => (
                    <div
                      key={j.id}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{j.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{j.title}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{j.description}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono font-bold text-xs text-amber-700">
                        +{j.weeklySalary.toLocaleString()}P
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1인 1역 직업 센터 & 추가 지원 바로가기</span>
                </button>
              </div>
            )}
          </div>

          {/* Real Estate & Seat Status */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">내 자리 (부동산) 현황</h3>
              </div>
              <button
                onClick={() => onNavigateTab('seats')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
              >
                자리 배치도 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentSeat ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-2xs ${
                        isSeatOwner
                          ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {isSeatOwner ? '🏡' : '🪑'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {currentSeat.seatNumber}번 자리 ({currentSeat.rowIdx}분단 {currentSeat.colIdx}열)
                      </div>
                      <div className="text-xs text-slate-500">
                        {isSeatOwner ? (
                          <span className="text-emerald-700 font-bold">내 집 (자가 소유)</span>
                        ) : (
                          <span>국가(교사) 소유 임대 중</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">주당 자리세</span>
                    <strong
                      className={`font-mono text-sm ${
                        isSeatOwner ? 'text-emerald-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {isSeatOwner ? '0P (면제)' : `${currentSeat.rentalFee}P`}
                    </strong>
                  </div>
                </div>

                {!isSeatOwner && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <span>💡 자리를 600P에 매입하면 매주 자리세가 면제됩니다!</span>
                    <button
                      onClick={() => onNavigateTab('seats')}
                      className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shrink-0 ml-2 shadow-2xs"
                    >
                      매입하기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">배정된 자리가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECENT FINANCIAL ACTIVITY LEDGER */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-800">최근 입출금 활동 내역</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">실시간 장부 기록</span>
        </div>

        {myRecentLedgers.length > 0 ? (
          <div className="space-y-2">
            {myRecentLedgers.map((ledger) => (
              <div
                key={ledger.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                      ledger.amount >= 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {ledger.amount >= 0 ? '+' : '-'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{ledger.description}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(ledger.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      ledger.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {ledger.amount >= 0 ? `+${ledger.amount}` : ledger.amount} P
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    잔액 {ledger.balanceAfter.toLocaleString()} P
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            아직 포인트 거래 내역이 없습니다.
          </div>
        )}
      </div>

      {/* Title Selection Modal */}
      <TitleEquipModal isOpen={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)} />

      {/* Character Customization Modal */}
      <CharacterCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        user={currentUser}
      />
    </div>
  );
};
