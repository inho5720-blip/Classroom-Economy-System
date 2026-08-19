import { Quest, QuestLog, Job, StudentJobAssignment } from '../types';

export const WEEKDAYS = [
  { index: 1, name: '월', full: '월요일' },
  { index: 2, name: '화', full: '화요일' },
  { index: 3, name: '수', full: '수요일' },
  { index: 4, name: '목', full: '목요일' },
  { index: 5, name: '금', full: '금요일' },
  { index: 6, name: '토', full: '토요일' },
  { index: 0, name: '일', full: '일요일' },
];

export const QUEST_EMOJI_CATEGORIES = [
  {
    categoryName: '📚 배움 & 숙제',
    emojis: [
      { emoji: '📝', label: '노트/요약' },
      { emoji: '📖', label: '독서/책' },
      { emoji: '📚', label: '교과서' },
      { emoji: '🧮', label: '수학/연산' },
      { emoji: '🔬', label: '과학/실험' },
      { emoji: '🎨', label: '미술/만들기' },
      { emoji: '🎵', label: '음악/악기' },
      { emoji: '💻', label: '컴퓨터/코딩' },
      { emoji: '✍️', label: '글쓰기/일기' },
      { emoji: '📐', label: '도형/수학' },
      { emoji: '🧪', label: '탐구활동' },
      { emoji: '📜', label: '한자/어휘' },
    ],
  },
  {
    categoryName: '🧹 생활 & 1인1역',
    emojis: [
      { emoji: '💼', label: '1인1역 직업' },
      { emoji: '🧹', label: '청소/쓸기' },
      { emoji: '🧽', label: '칠판/닦기' },
      { emoji: '🌿', label: '화분/식물' },
      { emoji: '🗑️', label: '분리수거' },
      { emoji: '📢', label: '알림/방송' },
      { emoji: '🥛', label: '우유/급식' },
      { emoji: '🚪', label: '문단속/소등' },
      { emoji: '🏃', label: '체육/운동' },
      { emoji: '⚽', label: '체육교구' },
      { emoji: '🧺', label: '정리정돈' },
      { emoji: '🧼', label: '손씻기/위생' },
    ],
  },
  {
    categoryName: '🌟 미션 & 특별',
    emojis: [
      { emoji: '🌟', label: '특별 미션' },
      { emoji: '🎯', label: '목표 달성' },
      { emoji: '🏆', label: '우수 퀘스트' },
      { emoji: '💬', label: '발표/토론' },
      { emoji: '🤝', label: '협동/도움' },
      { emoji: '🌱', label: '성장/습관' },
      { emoji: '⏰', label: '시간 지키기' },
      { emoji: '🧩', label: '퍼즐/창의' },
      { emoji: '💌', label: '감사 편지' },
      { emoji: '💖', label: '마음 돌봄' },
      { emoji: '🥇', label: '도전 과제' },
      { emoji: '🚀', label: '미래 역량' },
    ],
  },
];

/**
 * Returns Day-Of-Week index (0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토) safely from YYYY-MM-DD
 */
export function getDayOfWeekFromYMD(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.getDay();
}

/**
 * Checks whether a quest applies to a specific student/user on a specific date
 */
export function isQuestActiveForDateAndStudent(
  quest: Quest,
  dateStr: string,
  studentId: string,
  questLogs: QuestLog[] = [],
  studentJobId?: string,
  isTeacher = false
): boolean {
  // If quest is deleted/archived, it only appears on historical dates where a submission/log already exists
  if (quest.isArchived) {
    if (isTeacher) {
      return questLogs.some((l) => l.questId === quest.id && l.targetDate === dateStr);
    }
    return questLogs.some(
      (l) => l.questId === quest.id && l.userId === studentId && l.targetDate === dateStr
    );
  }

  // 1. Target student check
  if (!isTeacher && quest.targetStudentType === 'specific') {
    if (!quest.targetStudentIds || !quest.targetStudentIds.includes(studentId)) {
      return false;
    }
  }

  // 2. Target job check
  if (!isTeacher && quest.questType === 'job' && quest.targetJobId) {
    if (studentJobId !== quest.targetJobId) {
      return false;
    }
  }

  // 3. Frequency & Due Date check
  const isOneTime = quest.frequencyType === 'once' || (!quest.isRecurring && !!quest.dueDate);

  if (isOneTime) {
    // A) Deadline check: after due date, it must not appear on that date
    if (quest.dueDate && dateStr > quest.dueDate) {
      return false;
    }

    if (isTeacher) {
      return true;
    }

    // B) Single quest completion check for student
    const studentQuestLogs = questLogs.filter(
      (l) => l.questId === quest.id && l.userId === studentId
    );

    const approvedLog = studentQuestLogs.find((l) => l.status === 'approved');
    if (approvedLog) {
      // If completed and approved, only show it on the exact completed targetDate (for history view),
      // and do NOT show on any date after the completed date or any future date
      return dateStr === approvedLog.targetDate;
    }

    const pendingLog = studentQuestLogs.find((l) => l.status === 'pending');
    if (pendingLog) {
      // If submitted and pending, show on the submission date; hide on subsequent dates
      return dateStr === pendingLog.targetDate;
    }

    // Not yet completed: active for dates up to dueDate
    return true;
  }

  // Recurring quest
  const dayOfWeek = getDayOfWeekFromYMD(dateStr);
  if (quest.recurringDays && quest.recurringDays.length > 0) {
    return quest.recurringDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Returns a human-friendly label for recurring days
 */
export function getRecurringDaysLabel(recurringDays?: number[]): string {
  if (!recurringDays || recurringDays.length === 0) return '매일 (월~일)';
  if (recurringDays.length === 7) return '매일 (월~일)';

  const sorted = [...recurringDays].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
  const isWeekdays =
    sorted.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => sorted.includes(d));
  if (isWeekdays) return '평일 매일 (월~금)';

  const isWeekend =
    sorted.length === 2 && sorted.includes(6) && sorted.includes(0);
  if (isWeekend) return '주말 (토, 일)';

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return sorted.map((d) => dayNames[d]).join(', ') + '요일';
}

/**
 * Computes the reward points for a quest:
 * - If questType === 'job':
 *   - If student has an active job, reward is 1/5th of that student's job weekly salary (rounded)
 *   - If quest has a specific targetJobId, reward is 1/5th of that target job's salary
 *   - Otherwise, defaults to Math.round(quest.rewardPoints) or fallback to 1/5th of average/fallback job salary
 * - If other questType: returns quest.rewardPoints
 */
export function getQuestRewardForStudent(
  quest: Quest,
  userId?: string,
  jobs: Job[] = [],
  studentJobs: StudentJobAssignment[] = []
): number {
  if (quest.questType === 'job') {
    // 1. If student is provided and has an active job assignment
    if (userId) {
      const assignment = studentJobs.find((sj) => sj.userId === userId && sj.isActive);
      if (assignment) {
        const studentJob = jobs.find((j) => j.id === assignment.jobId);
        if (studentJob && studentJob.weeklySalary > 0) {
          return Math.round(studentJob.weeklySalary / 5);
        }
      }
    }

    // 2. If the quest is linked to a target job ID
    if (quest.targetJobId) {
      const targetJob = jobs.find((j) => j.id === quest.targetJobId);
      if (targetJob && targetJob.weeklySalary > 0) {
        return Math.round(targetJob.weeklySalary / 5);
      }
    }

    // 3. Fallback: if quest.rewardPoints is explicitly set, use it, else default to 1/5 of standard salary (e.g. 500/5 = 100)
    if (quest.rewardPoints) {
      return quest.rewardPoints;
    }
    return 100;
  }

  return quest.rewardPoints || 0;
}
