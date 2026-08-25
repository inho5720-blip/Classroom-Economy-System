import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Search,
  BookOpen,
  DollarSign,
  Receipt,
  ShoppingBag,
  Sparkles,
  Award,
  Gavel,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  CalendarDays,
  BarChart3,
  Layers,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { TransactionCategory, PointLedger } from '../types';

type TrendRangeType = 'week' | 'month' | 'multi_month';

export const PassbookView: React.FC = () => {
  const { currentUser, users, pointLedger } = useApp();

  // If teacher, allow viewing any student's passbook
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser.role === 'teacher' ? 'student-1' : currentUser.id
  );

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(''); // YYYY-MM-DD

  // Trend Range State: 'week' (한 주/일별), 'month' (한 달/주별), 'multi_month' (여러 달/월별)
  const [trendRange, setTrendRange] = useState<TrendRangeType>('week');
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthForWeeklyTrend, setSelectedMonthForWeeklyTrend] = useState<string>(currentMonthStr);

  const targetUser =
    currentUser.role === 'teacher'
      ? users.find((u) => u.id === selectedStudentId) || currentUser
      : currentUser;

  // All ledgers for target user in chronological order (oldest to newest)
  const userLedgersAsc = useMemo(() => {
    return pointLedger
      .filter((l) => l.userId === targetUser.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [targetUser.id, pointLedger]);

  // All ledgers for target user in reverse chronological order (newest first)
  const userLedgersDesc = useMemo(() => {
    return [...userLedgersAsc].reverse();
  }, [userLedgersAsc]);

  // Available unique months from transactions for selection
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    userLedgersAsc.forEach((l) => {
      const d = new Date(l.createdAt);
      if (!isNaN(d.getTime())) {
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(ym);
      }
    });
    // Ensure current month is included
    monthsSet.add(currentMonthStr);
    return Array.from(monthsSet).sort().reverse();
  }, [userLedgersAsc, currentMonthStr]);

  // Ensure selected month is valid
  const activeSelectedMonth = availableMonths.includes(selectedMonthForWeeklyTrend)
    ? selectedMonthForWeeklyTrend
    : availableMonths[0] || currentMonthStr;

  // ----------------------------------------------------
  // 1. TREND DATA GENERATION (Week / Month / Multi-Month)
  // ----------------------------------------------------
  const trendData = useMemo(() => {
    if (userLedgersAsc.length === 0) {
      const currentPts = targetUser.points || 0;
      return [
        {
          key: 'base',
          displayDate: '현재',
          balance: currentPts,
          income: 0,
          expense: 0,
          netChange: 0,
          count: 0,
          description: '현재 보유 포인트',
        },
      ];
    }

    // Helper: format YYYY-MM-DD from Date
    const toYMD = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Helper to get Korean day of week
    const getKorDay = (d: Date) => ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

    // A) ONE WEEK - Daily points trend (한 주에서 날짜별 포인트 변화)
    if (trendRange === 'week') {
      // Find reference date (most recent transaction date or today: 2026-08-17)
      const latestTx = userLedgersAsc[userLedgersAsc.length - 1];
      const refDate = latestTx ? new Date(latestTx.createdAt) : new Date();
      
      // Generate past 7 days up to refDate
      const days: { ymd: string; dateObj: Date; label: string }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - i);
        days.push({
          ymd: toYMD(d),
          dateObj: d,
          label: `${d.getMonth() + 1}/${d.getDate()}(${getKorDay(d)})`,
        });
      }

      // Compute balance at end of each day
      let runningBalance = 0;
      // Find initial balance before the first day of the 7-day window
      const firstDayYmd = days[0].ymd;
      const priorLedgers = userLedgersAsc.filter((l) => toYMD(new Date(l.createdAt)) < firstDayYmd);
      if (priorLedgers.length > 0) {
        runningBalance = priorLedgers[priorLedgers.length - 1].balanceAfter;
      } else if (userLedgersAsc.length > 0) {
        runningBalance = userLedgersAsc[0].balanceAfter - userLedgersAsc[0].amount;
      }

      return days.map((day) => {
        const dayLedgers = userLedgersAsc.filter((l) => toYMD(new Date(l.createdAt)) === day.ymd);
        let dayIncome = 0;
        let dayExpense = 0;

        dayLedgers.forEach((l) => {
          if (l.amount > 0) dayIncome += l.amount;
          else dayExpense += Math.abs(l.amount);
        });

        if (dayLedgers.length > 0) {
          runningBalance = dayLedgers[dayLedgers.length - 1].balanceAfter;
        }

        const netChange = dayIncome - dayExpense;

        return {
          key: day.ymd,
          ymd: day.ymd,
          displayDate: day.label,
          balance: runningBalance,
          income: dayIncome,
          expense: dayExpense,
          netChange,
          count: dayLedgers.length,
          description:
            dayLedgers.length > 0
              ? dayLedgers.map((l) => l.description).join(', ')
              : '변동 내역 없음',
        };
      });
    }

    // B) ONE MONTH - Weekly points trend (한 달 안에서 주별 포인트 변화)
    if (trendRange === 'month') {
      const [yearStr, monthStr] = activeSelectedMonth.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1; // 0-based

      // Number of days in this month
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      // Divide month into 5 standard calendar week buckets
      // Week 1: 1~7, Week 2: 8~14, Week 3: 15~21, Week 4: 22~28, Week 5: 29~end
      const weekRanges = [
        { weekNum: 1, startDay: 1, endDay: 7, label: `${monthIndex + 1}월 1주차 (1~7일)` },
        { weekNum: 2, startDay: 8, endDay: 14, label: `${monthIndex + 1}월 2주차 (8~14일)` },
        { weekNum: 3, startDay: 15, endDay: 21, label: `${monthIndex + 1}월 3주차 (15~21일)` },
        { weekNum: 4, startDay: 22, endDay: 28, label: `${monthIndex + 1}월 4주차 (22~28일)` },
        ...(daysInMonth > 28
          ? [{ weekNum: 5, startDay: 29, endDay: daysInMonth, label: `${monthIndex + 1}월 5주차 (29~${daysInMonth}일)` }]
          : []),
      ];

      // Calculate initial balance before this month started
      const monthStartStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const priorToMonth = userLedgersAsc.filter((l) => toYMD(new Date(l.createdAt)) < monthStartStr);
      let runningBalance = 0;
      if (priorToMonth.length > 0) {
        runningBalance = priorToMonth[priorToMonth.length - 1].balanceAfter;
      } else if (userLedgersAsc.length > 0) {
        runningBalance = userLedgersAsc[0].balanceAfter - userLedgersAsc[0].amount;
      }

      return weekRanges.map((wr) => {
        const startYmd = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(wr.startDay).padStart(2, '0')}`;
        const endYmd = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(wr.endDay).padStart(2, '0')}`;

        const weekLedgers = userLedgersAsc.filter((l) => {
          const lYmd = toYMD(new Date(l.createdAt));
          return lYmd >= startYmd && lYmd <= endYmd;
        });

        let weekIncome = 0;
        let weekExpense = 0;
        weekLedgers.forEach((l) => {
          if (l.amount > 0) weekIncome += l.amount;
          else weekExpense += Math.abs(l.amount);
        });

        if (weekLedgers.length > 0) {
          runningBalance = weekLedgers[weekLedgers.length - 1].balanceAfter;
        }

        const netChange = weekIncome - weekExpense;

        return {
          key: `week-${wr.weekNum}`,
          displayDate: wr.label,
          balance: runningBalance,
          income: weekIncome,
          expense: weekExpense,
          netChange,
          count: weekLedgers.length,
          description: `${wr.weekNum}주차 거래 ${weekLedgers.length}건 (수입 +${weekIncome.toLocaleString()}P / 지출 -${weekExpense.toLocaleString()}P)`,
        };
      });
    }

    // C) MULTI-MONTH - Monthly points trend (여러 달 사이의 포인트 변화)
    if (trendRange === 'multi_month') {
      // Find all distinct year-months from May 2026 to August 2026
      const monthBuckets: { ym: string; label: string; year: number; month: number }[] = [];
      const sortedMonths = [...availableMonths].sort(); // oldest to newest

      sortedMonths.forEach((ym) => {
        const [y, m] = ym.split('-').map(Number);
        monthBuckets.push({
          ym,
          label: `${y}년 ${m}월`,
          year: y,
          month: m,
        });
      });

      let runningBalance = userLedgersAsc.length > 0
        ? userLedgersAsc[0].balanceAfter - userLedgersAsc[0].amount
        : 0;

      return monthBuckets.map((mb) => {
        const monthLedgers = userLedgersAsc.filter((l) => {
          const d = new Date(l.createdAt);
          return d.getFullYear() === mb.year && d.getMonth() + 1 === mb.month;
        });

        let monthIncome = 0;
        let monthExpense = 0;
        monthLedgers.forEach((l) => {
          if (l.amount > 0) monthIncome += l.amount;
          else monthExpense += Math.abs(l.amount);
        });

        if (monthLedgers.length > 0) {
          runningBalance = monthLedgers[monthLedgers.length - 1].balanceAfter;
        }

        const netChange = monthIncome - monthExpense;

        return {
          key: mb.ym,
          displayDate: mb.label,
          balance: runningBalance,
          income: monthIncome,
          expense: monthExpense,
          netChange,
          count: monthLedgers.length,
          description: `${mb.label} 누적 정산 (총 ${monthLedgers.length}건 거래)`,
        };
      });
    }

    return [];
  }, [userLedgersAsc, targetUser.points, trendRange, activeSelectedMonth, availableMonths]);

  // Trend range summary statistics
  const trendPeriodStats = useMemo(() => {
    if (trendData.length === 0) return { totalIncome: 0, totalExpense: 0, netChange: 0, startBal: 0, endBal: 0 };
    const totalIncome = trendData.reduce((acc, curr) => acc + (curr.income || 0), 0);
    const totalExpense = trendData.reduce((acc, curr) => acc + (curr.expense || 0), 0);
    const netChange = totalIncome - totalExpense;
    const startBal = trendData[0]?.balance ?? 0;
    const endBal = trendData[trendData.length - 1]?.balance ?? 0;
    return { totalIncome, totalExpense, netChange, startBal, endBal };
  }, [trendData]);

  // ----------------------------------------------------
  // 2. LIFETIME PASSBOOK STATISTICS
  // ----------------------------------------------------
  const totalIncome = useMemo(() => {
    return userLedgersDesc
      .filter((l) => l.amount > 0)
      .reduce((sum, l) => sum + l.amount, 0);
  }, [userLedgersDesc]);

  const totalExpense = useMemo(() => {
    return userLedgersDesc
      .filter((l) => l.amount < 0)
      .reduce((sum, l) => sum + Math.abs(l.amount), 0);
  }, [userLedgersDesc]);

  // ----------------------------------------------------
  // 3. TRANSACTION HISTORY FILTERING (Category, Date, Search)
  // ----------------------------------------------------
  const filteredLedgers = useMemo(() => {
    return userLedgersDesc.filter((l) => {
      // 1. Date Filter (specific day: YYYY-MM-DD)
      if (selectedDateFilter) {
        const d = new Date(l.createdAt);
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (ymd !== selectedDateFilter) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'salary' && l.category !== 'salary') return false;
        if (selectedCategory === 'quest_bonus' && l.category !== 'quest_bonus') return false;
        if (selectedCategory === 'tax' && l.category !== 'tax' && l.category !== 'seat_rental') return false;
        if (selectedCategory === 'shop' && l.category !== 'shop_purchase') return false;
        if (
          selectedCategory === 'auction' &&
          l.category !== 'auction_bid' &&
          l.category !== 'auction_refund' &&
          l.category !== 'auction_win'
        )
          return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return l.description.toLowerCase().includes(q);
      }

      return true;
    });
  }, [userLedgersDesc, selectedDateFilter, selectedCategory, searchQuery]);

  // Selected Date Filter Summary (if active)
  const selectedDateSummary = useMemo(() => {
    if (!selectedDateFilter) return null;
    const dayLedgers = userLedgersDesc.filter((l) => {
      const d = new Date(l.createdAt);
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return ymd === selectedDateFilter;
    });

    const income = dayLedgers.filter((l) => l.amount > 0).reduce((acc, l) => acc + l.amount, 0);
    const expense = dayLedgers.filter((l) => l.amount < 0).reduce((acc, l) => acc + Math.abs(l.amount), 0);
    const [y, m, d] = selectedDateFilter.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

    return {
      count: dayLedgers.length,
      income,
      expense,
      net: income - expense,
      formattedDate: `${y}년 ${m}월 ${d}일 (${dayName}요일)`,
    };
  }, [userLedgersDesc, selectedDateFilter]);

  const getCategoryBadge = (cat: TransactionCategory) => {
    switch (cat) {
      case 'salary':
        return { label: '💼 주급 수령', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'quest_bonus':
        return { label: '📝 퀘스트 보상', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'tax':
      case 'seat_rental':
        return { label: '⚖️ 세금/공제', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'shop_purchase':
        return { label: '🏪 상점 지출', bg: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'auction_bid':
        return { label: '👑 경매 입찰', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'auction_refund':
        return { label: '🔄 경매 환불', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'auction_win':
        return { label: '🏆 경매 낙찰', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'teacher_adjust':
        return { label: '👨‍🏫 교사 상벌점', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: '🪙 화폐 거래', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const studentsList = users.filter((u) => u.role === 'student');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-orange-50/40 border border-amber-200/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl shadow-2xs">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-850">나만의 전자 통장 & 자산 변동 분석</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                실시간 거래 장부
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              주급, 퀘스트 수입부터 세금, 상점 소비, 경매 입찰까지 모든 포인트 거래와 일자별 변화 추이를 한눈에 확인합니다.
            </p>
          </div>
        </div>

        {/* Teacher Student Selector or Student Balance Badge */}
        {currentUser.role === 'teacher' ? (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-600">조회 학생:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
            >
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (#{s.studentNumber || s.id}) - {s.points.toLocaleString()}P
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${targetUser.avatarColor} flex items-center justify-center text-lg shadow-2xs`}
            >
              {targetUser.avatarEmoji}
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{targetUser.name} 학생 전자 통장</div>
              <strong
                className={`font-mono font-black text-base ${
                  targetUser.points < 0 ? 'text-rose-600' : 'text-amber-700'
                }`}
              >
                {targetUser.points.toLocaleString()} P
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">총 누적 수입 (+입금)</span>
            <div className="text-xl font-black font-mono text-emerald-600 mt-1">
              +{totalIncome.toLocaleString()} P
            </div>
            <span className="text-[10px] text-slate-400">주급, 퀘스트 완료 보너스, 환불 등</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">총 누적 지출 (-출금)</span>
            <div className="text-xl font-black font-mono text-rose-600 mt-1">
              -{totalExpense.toLocaleString()} P
            </div>
            <span className="text-[10px] text-slate-400">세금 납부, 상점 구매, 경매 입찰 등</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Current Net Balance Status */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">현재 통장 잔액 (순자산)</span>
            <div
              className={`text-xl font-black font-mono mt-1 ${
                targetUser.points < 0 ? 'text-rose-600' : 'text-amber-700'
              }`}
            >
              {targetUser.points.toLocaleString()} P
            </div>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
              {targetUser.points < 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-500" /> 마이너스 부채 상태
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> 건전한 자산 유지 중
                </>
              )}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Dynamic Point Balance Trend Chart (Time Range Selectable)            */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-850">
                {targetUser.name} 학생의 포인트 변동 추이 분석
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {trendRange === 'week' && '📅 최근 1주일 간의 날짜별 포인트 잔액 및 일일 수입/지출 변화입니다.'}
              {trendRange === 'month' && `🗓️ ${activeSelectedMonth.replace('-', '년 ')}월 내 주차별(1~5주차) 포인트 잔액 및 주간 변화입니다.`}
              {trendRange === 'multi_month' && '📊 여러 달(학기 전체) 사이의 월별 포인트 잔액 및 월간 성장 추이입니다.'}
            </p>
          </div>

          {/* Time Range Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setTrendRange('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                trendRange === 'week'
                  ? 'bg-amber-400 text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>한 주 (날짜별)</span>
            </button>

            <button
              onClick={() => setTrendRange('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                trendRange === 'month'
                  ? 'bg-amber-400 text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>한 달 (주별)</span>
            </button>

            <button
              onClick={() => setTrendRange('multi_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                trendRange === 'multi_month'
                  ? 'bg-amber-400 text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>여러 달 (월별)</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar for 'month' (주별 변화) mode */}
        {trendRange === 'month' && (
          <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span>조회할 월 선택:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableMonths.map((ym) => {
                const [y, m] = ym.split('-').map(Number);
                const isSelected = ym === activeSelectedMonth;
                return (
                  <button
                    key={ym}
                    onClick={() => setSelectedMonthForWeeklyTrend(ym)}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {y}년 {m}월
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trend Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 text-xs">
            <span className="text-slate-400 block text-[11px] font-medium">선택 기간 시작 잔액</span>
            <span className="text-slate-700 font-mono font-bold text-sm">
              {trendPeriodStats.startBal.toLocaleString()} P
            </span>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-150 text-xs">
            <span className="text-emerald-700 block text-[11px] font-medium">기간 누적 수입</span>
            <span className="text-emerald-800 font-mono font-black text-sm">
              +{trendPeriodStats.totalIncome.toLocaleString()} P
            </span>
          </div>
          <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-150 text-xs">
            <span className="text-rose-700 block text-[11px] font-medium">기간 누적 지출</span>
            <span className="text-rose-800 font-mono font-black text-sm">
              -{trendPeriodStats.totalExpense.toLocaleString()} P
            </span>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-150 text-xs">
            <span className="text-amber-700 block text-[11px] font-medium">기간 순 변동량</span>
            <span
              className={`font-mono font-black text-sm ${
                trendPeriodStats.netChange >= 0 ? 'text-amber-800' : 'text-rose-700'
              }`}
            >
              {trendPeriodStats.netChange >= 0 ? '+' : ''}
              {trendPeriodStats.netChange.toLocaleString()} P
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-72 pt-2">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pointGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}P`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const hasActivity = (data.income || 0) > 0 || (data.expense || 0) > 0;
                      return (
                        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-2 backdrop-blur-xs min-w-[200px]">
                          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-300">{data.displayDate}</span>
                            <span>거래 {data.count || 0}건</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">최종 잔액:</span>
                            <span className="font-mono font-black text-sm text-amber-300">
                              {data.balance.toLocaleString()} P
                            </span>
                          </div>

                          {hasActivity ? (
                            <div className="space-y-1 pt-1 border-t border-slate-800/60 font-mono text-[11px]">
                              {data.income > 0 && (
                                <div className="flex items-center justify-between text-emerald-400">
                                  <span>+ 입금 수입:</span>
                                  <span>+{data.income.toLocaleString()} P</span>
                                </div>
                              )}
                              {data.expense > 0 && (
                                <div className="flex items-center justify-between text-rose-400">
                                  <span>- 출금 지출:</span>
                                  <span>-{data.expense.toLocaleString()} P</span>
                                </div>
                              )}
                              <div
                                className={`flex items-center justify-between font-bold pt-0.5 ${
                                  data.netChange >= 0 ? 'text-amber-400' : 'text-rose-400'
                                }`}
                              >
                                <span>순 변동:</span>
                                <span>
                                  {data.netChange >= 0 ? '+' : ''}
                                  {data.netChange.toLocaleString()} P
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic">변동 없음</div>
                          )}

                          {data.ymd && (
                            <div className="pt-1 text-[10px] text-amber-400/80">
                              💡 아래 거래 내역에서 {data.displayDate} 내역을 바로 필터링할 수 있습니다.
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#pointGradient)"
                  dot={{ r: 4, fill: '#F59E0B', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#D97706', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              아직 거래 기록이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Detailed Passbook Transaction Records (With Date Selection Filter)    */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-850">전자 통장 거래 상세 내역서</h3>
              <span className="text-xs text-slate-400 font-medium font-mono">
                (총 {filteredLedgers.length}건)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              원하는 날짜를 선택하여 그 날의 거래를 상세하게 조회할 수 있습니다.
            </p>
          </div>

          {/* Search and Date Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="내역 검색 (예: 주급, 상점, 세금)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Date Selector Input */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                title="특정 거래 날짜 선택"
              />
              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter('')}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer"
                  title="날짜 필터 해제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Date Shortcuts Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 빠른 날짜:
          </span>
          <button
            onClick={() => setSelectedDateFilter('')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              !selectedDateFilter
                ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            전체 날짜
          </button>
          {(() => {
            const today = new Date();
            const dates = [0, 1, 2, 3].map((offset) => {
              const d = new Date(today);
              d.setDate(today.getDate() - offset);
              const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const label = offset === 0 ? `오늘 (${d.getMonth() + 1}/${d.getDate()})` : offset === 1 ? `어제 (${d.getMonth() + 1}/${d.getDate()})` : `${d.getMonth() + 1}/${d.getDate()}`;
              return { ymd, label };
            });

            return dates.map(({ ymd, label }) => (
              <button
                key={ymd}
                onClick={() => setSelectedDateFilter(ymd)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                  selectedDateFilter === ymd
                    ? 'bg-amber-400 text-slate-900 border-amber-500 font-extrabold shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ));
          })()}
        </div>

        {/* Date Filter Active Highlight Banner */}
        {selectedDateSummary && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-800 font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-850">
                    {selectedDateSummary.formattedDate} 거래 상세
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold text-[10px]">
                    총 {selectedDateSummary.count}건
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-3 mt-1 font-mono">
                  <span>수입: <strong className="text-emerald-700">+{selectedDateSummary.income.toLocaleString()}P</strong></span>
                  <span>지출: <strong className="text-rose-700">-{selectedDateSummary.expense.toLocaleString()}P</strong></span>
                  <span>일일 순변동: <strong className={selectedDateSummary.net >= 0 ? 'text-amber-800' : 'text-rose-800'}>{selectedDateSummary.net >= 0 ? '+' : ''}{selectedDateSummary.net.toLocaleString()}P</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDateFilter('')}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>전체 날짜 보기</span>
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: '전체 내역' },
            { id: 'salary', label: '💼 주급' },
            { id: 'quest_bonus', label: '📝 퀘스트' },
            { id: 'tax', label: '⚖️ 세금/공제' },
            { id: 'shop', label: '🏪 상점' },
            { id: 'auction', label: '👑 경매' },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Ledger Transaction List */}
        {filteredLedgers.length > 0 ? (
          <div className="space-y-2.5">
            {filteredLedgers.map((ledger) => {
              const isIncome = ledger.amount > 0;
              const badge = getCategoryBadge(ledger.category);
              const txDate = new Date(ledger.createdAt);
              const dateStr = `${txDate.getFullYear()}년 ${txDate.getMonth() + 1}월 ${txDate.getDate()}일 ${String(
                txDate.getHours()
              ).padStart(2, '0')}:${String(txDate.getMinutes()).padStart(2, '0')}`;
              const ymd = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(
                txDate.getDate()
              ).padStart(2, '0')}`;

              return (
                <div
                  key={ledger.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/30 hover:border-amber-200 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-rose-100 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-850 break-words">
                          {ledger.description}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{dateStr}</span>
                        </span>
                        {/* Quick filter by this date button */}
                        <button
                          type="button"
                          onClick={() => setSelectedDateFilter(ymd)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-sans cursor-pointer"
                          title="이 날짜의 거래만 모아보기"
                        >
                          [이 날짜 모아보기]
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 flex sm:flex-col justify-between sm:justify-center items-end">
                    <div
                      className={`font-mono font-black text-sm sm:text-base ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : ''}
                      {ledger.amount.toLocaleString()} P
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      잔액 {ledger.balanceAfter.toLocaleString()} P
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400 space-y-2">
            <div className="text-3xl">📭</div>
            <div className="font-bold text-slate-700 text-sm">해당 조건의 거래 내역이 없습니다.</div>
            <p>선택한 날짜나 카테고리 필터, 검색어를 변경해 보세요.</p>
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="mt-2 px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition cursor-pointer"
              >
                날짜 필터 해제하고 전체 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
