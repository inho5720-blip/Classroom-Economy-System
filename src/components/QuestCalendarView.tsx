import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  BookOpen,
  Briefcase,
  AlertCircle,
  Plus,
  Send,
  MessageSquare,
  CalendarDays,
  CalendarRange,
  RotateCcw,
  RotateCw,
  Users,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isQuestActiveForDateAndStudent, getRecurringDaysLabel, getQuestRewardForStudent } from '../utils/questUtils';

export const QuestCalendarView: React.FC = () => {
  const {
    currentUser,
    users,
    quests,
    questLogs,
    jobs,
    studentJobs,
    submitQuestLog,
    getStudentJob,
    getStudentJobs,
    triggerCelebration,
  } = useApp();

  // View mode: 'week' | 'month'
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Currently navigated Year & Month
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 1-12
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(2); // 0-indexed week within the month (Week 3 is index 2, containing Aug 17)

  // Selected date state (defaults to today '2026-08-17')
  const [selectedDate, setSelectedDate] = useState('2026-08-17');
  const [activeMemoInputQuestId, setActiveMemoInputQuestId] = useState<string | null>(null);
  const [memoInputText, setMemoInputText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'job'>('all');

  const todayStr = '2026-08-17';

  // Generate calendar days for the current year & month
  const { monthDays, weeksList } = useMemo(() => {
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun, 1 = Mon...

    const days: Array<{
      date: string;
      dayNum: number;
      dayOfWeek: string;
      dayOfWeekIndex: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      weekIndex: number;
    }> = [];

    // Weekday labels
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // Previous month padding
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const pMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const pYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayNum: pDay,
        dayOfWeek: dayNames[(firstDayOfWeek - 1 - i + 7) % 7],
        dayOfWeekIndex: (firstDayOfWeek - 1 - i + 7) % 7,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        weekIndex: 0,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = new Date(currentYear, currentMonth - 1, d).getDay();
      days.push({
        date: dateStr,
        dayNum: d,
        dayOfWeek: dayNames[dow],
        dayOfWeekIndex: dow,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        weekIndex: 0,
      });
    }

    // Next month padding to complete the 7-column grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let n = 1; n <= remaining; n++) {
        const nMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
        const dow = new Date(nYear, nMonth - 1, n).getDay();
        days.push({
          date: dateStr,
          dayNum: n,
          dayOfWeek: dayNames[dow],
          dayOfWeekIndex: dow,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          weekIndex: 0,
        });
      }
    }

    // Group into weeks (chunks of 7)
    const weeks: Array<typeof days> = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekChunk = days.slice(i, i + 7);
      const wIdx = Math.floor(i / 7);
      weekChunk.forEach((item) => (item.weekIndex = wIdx));
      weeks.push(weekChunk);
    }

    return { monthDays: days, weeksList: weeks };
  }, [currentYear, currentMonth]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedWeekIndex(0);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedWeekIndex(0);
  };

  // Navigate to previous week
  const handlePrevWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex((w) => w - 1);
    } else {
      handlePrevMonth();
      setSelectedWeekIndex(weeksList.length > 0 ? weeksList.length - 1 : 0);
    }
  };

  // Navigate to next week
  const handleNextWeek = () => {
    if (selectedWeekIndex < weeksList.length - 1) {
      setSelectedWeekIndex((w) => w + 1);
    } else {
      handleNextMonth();
      setSelectedWeekIndex(0);
    }
  };

  // Quick reset to today
  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedWeekIndex(2);
    setSelectedDate(todayStr);
  };

  const studentJobList = getStudentJobs ? getStudentJobs(currentUser.id) : [];
  const studentJobIds = studentJobList.map((j) => j.id);

  // Filter quests with date, deadline, completion status, and student targeting support
  const activeDateQuests = useMemo(() => {
    return quests.filter((q) =>
      isQuestActiveForDateAndStudent(
        q,
        selectedDate,
        currentUser.id,
        questLogs,
        studentJobIds,
        currentUser.role === 'teacher'
      )
    );
  }, [quests, selectedDate, currentUser, questLogs, studentJobIds]);

  const filteredQuests = useMemo(() => {
    return activeDateQuests.filter((q) => {
      if (filterType === 'homework') return q.questType === 'homework' || q.questType === 'reading';
      if (filterType === 'job') return q.questType === 'job' || q.questType === 'cleaning';
      return true;
    });
  }, [activeDateQuests, filterType]);

  const selectedDateLogs = questLogs.filter(
    (l) => l.userId === currentUser.id && l.targetDate === selectedDate
  );

  const handleQuickSubmit = (questId: string) => {
    submitQuestLog(questId, currentUser.id, selectedDate, '오늘 수행 완료했습니다!');
    triggerCelebration();
  };

  const handleMemoSubmit = (questId: string) => {
    submitQuestLog(questId, currentUser.id, selectedDate, memoInputText.trim() || '완료');
    setActiveMemoInputQuestId(null);
    setMemoInputText('');
    triggerCelebration();
  };

  const completedCount = selectedDateLogs.filter((l) => l.status === 'approved').length;
  const pendingCount = selectedDateLogs.filter((l) => l.status === 'pending').length;
  const currentWeekDays = weeksList[selectedWeekIndex] || weeksList[0] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/40 border border-indigo-200/80 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-3xl shadow-2xs">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-850">퀘스트 & 숙제 인증 달력</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
                {currentYear}년 {currentMonth}월
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              한 주 또는 한 달 단위로 일정을 확인하고, 날짜별 숙제와 1인 1역 직업 활동을 제출하세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToToday}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" /> 오늘로 이동 (8/17)
          </button>
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            선택일 완료: <strong className="text-emerald-700 font-mono font-bold">{completedCount}</strong>건 / 대기{' '}
            <strong className="text-amber-700 font-mono font-bold">{pendingCount}</strong>건
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation & View Selector Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Top Controls: Mode Switch, Month Navigation, Period Dropdowns */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Left: View Mode Toggle (한 주 보기 vs 한 달 보기) */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>한 달 보기</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>한 주 보기</span>
              </button>
            </div>
          </div>

          {/* Center: Prev/Next Month/Week Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs transition"
              title={viewMode === 'month' ? '이전 달' : '이전 주'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <span className="font-mono font-black text-sm text-indigo-900">
                {currentYear}년 {currentMonth}월
              </span>
              {viewMode === 'week' && (
                <span className="text-xs font-bold text-indigo-700 px-2 py-0.5 bg-white rounded-md border border-indigo-200">
                  {selectedWeekIndex + 1}주차
                </span>
              )}
            </div>

            <button
              onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs transition"
              title={viewMode === 'month' ? '다음 달' : '다음 주'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Quick Selectors (Month & Week Direct Dropdown) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Month Select */}
            <div className="flex items-center gap-1">
              <label className="text-xs font-bold text-slate-500 shrink-0">월 선택:</label>
              <select
                value={currentMonth}
                onChange={(e) => {
                  setCurrentMonth(Number(e.target.value));
                  setSelectedWeekIndex(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
                  <option key={m} value={m}>
                    {m}월 ({m >= 3 && m <= 7 ? '1학기' : m >= 8 ? '2학기' : '겨울'})
                  </option>
                ))}
              </select>
            </div>

            {/* Week Select (Available in both, especially in week mode) */}
            <div className="flex items-center gap-1">
              <label className="text-xs font-bold text-slate-500 shrink-0">주차 선택:</label>
              <select
                value={selectedWeekIndex}
                onChange={(e) => {
                  setSelectedWeekIndex(Number(e.target.value));
                  if (viewMode !== 'week') setViewMode('week');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                {weeksList.map((week, idx) => {
                  const firstDay = week[0]?.date || '';
                  const lastDay = week[week.length - 1]?.date || '';
                  return (
                    <option key={idx} value={idx}>
                      {currentMonth}월 {idx + 1}주차 ({firstDay.slice(5)} ~ {lastDay.slice(5)})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Month Quick-Tabs for Instant Switching (1학기 & 2학기) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1">학기별 빠른 이동:</span>
          {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const isSelected = currentMonth === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setCurrentMonth(m);
                  setSelectedWeekIndex(0);
                }}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {m}월
              </button>
            );
          })}
        </div>

        {/* ===================== VIEW A: 한 달 보기 (Month View Grid) ===================== */}
        {viewMode === 'month' && (
          <div className="space-y-2">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black py-2">
              <div className="text-rose-500">일</div>
              <div className="text-slate-600">월</div>
              <div className="text-slate-600">화</div>
              <div className="text-slate-600">수</div>
              <div className="text-slate-600">목</div>
              <div className="text-slate-600">금</div>
              <div className="text-blue-500">토</div>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, idx) => {
                const isSelected = selectedDate === day.date;
                const isSunday = day.dayOfWeekIndex === 0;
                const isSaturday = day.dayOfWeekIndex === 6;

                const dayLogs = questLogs.filter(
                  (l) => l.userId === currentUser.id && l.targetDate === day.date
                );
                const approvedCount = dayLogs.filter((l) => l.status === 'approved').length;
                const pendingCount = dayLogs.filter((l) => l.status === 'pending').length;

                return (
                  <button
                    key={`${day.date}-${idx}`}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedWeekIndex(day.weekIndex);
                    }}
                    className={`min-h-[72px] sm:min-h-[84px] p-2.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 shadow-md'
                        : day.isToday
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                        : day.isCurrentMonth
                        ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                        : 'bg-slate-50/30 border-slate-100 text-slate-300 opacity-40 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-black font-mono ${
                          day.isToday
                            ? 'text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded-md'
                            : isSelected
                            ? 'text-indigo-900'
                            : isSunday
                            ? 'text-rose-500'
                            : isSaturday
                            ? 'text-blue-500'
                            : 'text-slate-800'
                        }`}
                      >
                        {day.dayNum}
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">
                          오늘
                        </span>
                      )}
                    </div>

                    {/* Quest status badges on calendar cell */}
                    <div className="space-y-1 mt-1">
                      {approvedCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>완료 {approvedCount}</span>
                        </div>
                      )}
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>대기 {pendingCount}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== VIEW B: 한 주 보기 (Week View Bar / Cards) ===================== */}
        {viewMode === 'week' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                {currentMonth}월 {selectedWeekIndex + 1}주차 ({currentWeekDays[0]?.date} ~ {currentWeekDays[currentWeekDays.length - 1]?.date})
              </span>
              <span className="text-slate-400">날짜를 클릭하면 상세 퀘스트를 제출 및 확인할 수 있습니다.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
              {currentWeekDays.map((day, idx) => {
                const isSelected = selectedDate === day.date;
                const isSunday = day.dayOfWeekIndex === 0;
                const isSaturday = day.dayOfWeekIndex === 6;

                const dayLogs = questLogs.filter(
                  (l) => l.userId === currentUser.id && l.targetDate === day.date
                );
                const approvedCount = dayLogs.filter((l) => l.status === 'approved').length;
                const pendingCount = dayLogs.filter((l) => l.status === 'pending').length;
                const dayActiveCount = quests.filter((q) =>
                  isQuestActiveForDateAndStudent(
                    q,
                    day.date,
                    currentUser.id,
                    questLogs,
                    studentJobIds,
                    currentUser.role === 'teacher'
                  )
                ).length;

                return (
                  <button
                    key={`${day.date}-${idx}`}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between min-h-[110px] cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400 shadow-md'
                        : day.isToday
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[11px] font-bold">
                      <span
                        className={
                          isSunday
                            ? 'text-rose-500'
                            : isSaturday
                            ? 'text-blue-500'
                            : 'text-slate-500'
                        }
                      >
                        {day.dayOfWeek}요일
                      </span>
                      {day.isToday && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">
                          오늘
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-xl font-black font-mono my-1 ${
                        isSelected
                          ? 'text-indigo-900 font-black'
                          : isSunday
                          ? 'text-rose-600'
                          : isSaturday
                          ? 'text-blue-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {day.dayNum}
                    </div>

                    {/* Status Badges */}
                    <div className="w-full space-y-1">
                      {approvedCount > 0 ? (
                        <div className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{approvedCount}개 승인</span>
                        </div>
                      ) : pendingCount > 0 ? (
                        <div className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center justify-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          <span>{pendingCount}개 대기</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-semibold">
                          과제 {dayActiveCount}개
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Quest List & Submissions for the Selected Date */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        {/* Sub Header & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-850 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-900 font-black font-mono">{selectedDate}</span> 퀘스트 & 과제 목록
              </h3>
              {selectedDate === todayStr && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  오늘
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">선택된 날짜의 숙제와 직업 과제를 검토하고 제출하세요.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-850 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 ({quests.length})
            </button>
            <button
              onClick={() => setFilterType('homework')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === 'homework'
                  ? 'bg-white text-slate-850 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              숙제/배움
            </button>
            <button
              onClick={() => setFilterType('job')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === 'job'
                  ? 'bg-white text-slate-850 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              1인1역/직업
            </button>
          </div>
        </div>

        {/* Quests Container */}
        <div className="space-y-3">
          {filteredQuests.map((quest) => {
            const log = selectedDateLogs.find((l) => l.questId === quest.id);
            const isApproved = log?.status === 'approved';
            const isPending = log?.status === 'pending';
            const isRejected = log?.status === 'rejected';
            const dynamicReward = getQuestRewardForStudent(quest, currentUser.id, jobs, studentJobs);

            return (
              <div
                key={quest.id}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isApproved
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isPending
                    ? 'bg-amber-50/70 border-amber-200'
                    : isRejected
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs mt-0.5">
                    {quest.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-850">
                        {quest.title}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        +{dynamicReward} P
                      </span>
                      {quest.questType === 'job' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                          직업 주급 1/5
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                        {quest.statRewardType === 'wisdom'
                          ? `지혜 +${quest.statRewardAmount ?? 1}`
                          : quest.statRewardType === 'diligence'
                          ? `성실 +${quest.statRewardAmount ?? 1}`
                          : quest.statRewardType === 'frugality'
                          ? `절약 +${quest.statRewardAmount ?? 1}`
                          : quest.statRewardType === 'credit'
                          ? `신용 +${quest.statRewardAmount ?? 1}`
                          : `기여 +${quest.statRewardAmount ?? 1}`}
                      </span>
                      {/* Recurrence Chip */}
                      {quest.frequencyType === 'recurring' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100 flex items-center gap-1">
                          <RotateCw className="w-2.5 h-2.5" />
                          {getRecurringDaysLabel(quest.recurringDays)}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
                          <CalendarIcon className="w-2.5 h-2.5" />
                          단발성 {quest.dueDate ? `(${quest.dueDate})` : ''}
                        </span>
                      )}
                      {quest.targetStudentType === 'specific' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100 flex items-center gap-1">
                          <UserCheck className="w-2.5 h-2.5" />
                          지정 과제
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{quest.description}</p>

                    {log?.studentMemo && (
                      <div className="text-xs text-indigo-900 mt-2 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>내가 작성한 메모: "{log.studentMemo}"</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-xs text-rose-900 mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>
                          {log?.rejectReason
                            ? `선생님 반려 사유: "${log.rejectReason}" (수정 후 다시 제출할 수 있습니다)`
                            : '선생님께서 다시 점검하도록 반려하셨습니다. (확인 후 다시 제출할 수 있습니다)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Section */}
                <div className="shrink-0 w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  {isApproved ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 승인 완료 (+{dynamicReward}P)
                      </span>
                      <span className="text-[10px] text-emerald-700 block mt-1">
                        {log?.isPaid ? '주급 지급 완료' : '스탯 부여 완료 · 주급 정산 대기'}
                      </span>
                    </div>
                  ) : isPending ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-4 h-4 text-amber-600" /> 선생님 승인 대기 중
                      </span>
                      <span className="text-[10px] text-amber-700 block mt-1">승인 시 스탯 부여 & 주급 적립</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setActiveMemoInputQuestId(quest.id);
                          setMemoInputText('');
                        }}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs cursor-pointer"
                      >
                        메모 남기기
                      </button>
                      <button
                        onClick={() => handleQuickSubmit(quest.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 제출 완료
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {quests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-1">
                📝
              </div>
              <p className="text-sm font-bold text-slate-800">
                현재 등록된 퀘스트가 없습니다.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                선생님께서 새로운 학급 퀘스트나 1인 1역 과제를 등록하면 실시간으로 여기에 표시됩니다.
              </p>
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6 space-y-2">
              <div className="text-3xl">🎉</div>
              <p className="text-sm font-bold text-slate-750">
                선택한 날짜({selectedDate})에 예정된 퀘스트나 과제가 없습니다!
              </p>
              <p className="text-xs text-slate-400">
                이미 완료했거나 마감일이 지났거나, 해당 요일에 설정된 과제가 없습니다.
              </p>
            </div>
          ) : null}
        </div>

        {/* Memo Input Section if opened */}
        {activeMemoInputQuestId && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
              <span>📝 선생님께 보낼 수행 증빙 메모 입력</span>
              <button
                onClick={() => setActiveMemoInputQuestId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="예: 사회 교과서 52쪽 요약 정리 완료, 수학 익힘책 채점까지 마쳤습니다."
              value={memoInputText}
              onChange={(e) => setMemoInputText(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-indigo-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveMemoInputQuestId(null)}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-600 text-xs border border-slate-200 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleMemoSubmit(activeMemoInputQuestId)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> 메모 포함 제출
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
