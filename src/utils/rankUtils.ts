import { StudentStats } from '../types';

export interface RankInfo {
  title: string;
  shortTitle: string;
  minExp: number;
  maxExp: number;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  levelNum: number;
  emoji: string;
  desc: string;
}

export const ALL_RANKS: RankInfo[] = [
  {
    title: '인턴/사원',
    shortTitle: '인턴/사원',
    minExp: 0,
    maxExp: 30,
    badgeBg: 'bg-gradient-to-r from-slate-500 to-zinc-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 1,
    emoji: '🌱',
    desc: '학급 경제에 첫 발을 내디딘 새싹 사원',
  },
  {
    title: '주임/대리',
    shortTitle: '주임/대리',
    minExp: 31,
    maxExp: 60,
    badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 2,
    emoji: '🌿',
    desc: '기본 직무와 과제를 능숙하게 수행하는 실무자',
  },
  {
    title: '과장/차장',
    shortTitle: '과장/차장',
    minExp: 61,
    maxExp: 90,
    badgeBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 3,
    emoji: '⭐',
    desc: '학급 내에서 든든한 역할을 책임지는 핵심 리더',
  },
  {
    title: '부장',
    shortTitle: '부장',
    minExp: 91,
    maxExp: 110,
    badgeBg: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 4,
    emoji: '🎖️',
    desc: '모든 스탯이 고루 뛰어난 베테랑 부서장',
  },
  {
    title: '상무(임원)',
    shortTitle: '상무',
    minExp: 111,
    maxExp: 130,
    badgeBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 5,
    emoji: '💎',
    desc: '학급 경제를 주도하는 엘리트 임원진',
  },
  {
    title: '전무(임원)',
    shortTitle: '전무',
    minExp: 131,
    maxExp: 150,
    badgeBg: 'bg-gradient-to-r from-rose-500 to-red-600',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 6,
    emoji: '🔥',
    desc: '탁월한 역량으로 학급을 이끄는 총괄 임원',
  },
  {
    title: '부사장',
    shortTitle: '부사장',
    minExp: 151,
    maxExp: 160,
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-sm shadow-amber-500/30',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 7,
    emoji: '🚀',
    desc: '회장을 보좌하며 경영을 총괄하는 최고 임원',
  },
  {
    title: '사장',
    shortTitle: '사장',
    minExp: 161,
    maxExp: 170,
    badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-md shadow-orange-500/40',
    badgeTextColor: 'text-white',
    badgeBorder: 'border-white',
    levelNum: 8,
    emoji: '👑',
    desc: '학급 회사의 전반적인 운영을 지휘하는 사장',
  },
  {
    title: '부회장',
    shortTitle: '부회장',
    minExp: 171,
    maxExp: 180,
    badgeBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-md shadow-amber-500/40',
    badgeTextColor: 'text-amber-950 font-black',
    badgeBorder: 'border-white',
    levelNum: 9,
    emoji: '🏆',
    desc: '정상급 능력치와 신뢰를 보유한 최고 경영진',
  },
  {
    title: '회장',
    shortTitle: '회장',
    minExp: 181,
    maxExp: 250,
    badgeBg: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-lg shadow-amber-500/50 ring-2 ring-amber-300',
    badgeTextColor: 'text-amber-950 font-black',
    badgeBorder: 'border-white',
    levelNum: 10,
    emoji: '✨👑',
    desc: '학급 모든 분야에서 최고의 경지에 도달한 회장',
  },
];

/**
 * Calculate total EXP by summing all 5 stats
 */
export function getTotalExp(stats?: Partial<StudentStats>): number {
  if (!stats) return 5; // default 1 * 5 = 5
  return (
    (stats.diligence ?? 1) +
    (stats.frugality ?? 1) +
    (stats.contribution ?? 1) +
    (stats.wisdom ?? 1) +
    (stats.credit ?? 1)
  );
}

/**
 * Get Rank info based on total EXP
 */
export function getRankInfo(exp: number): RankInfo {
  if (exp <= 30) return ALL_RANKS[0]; // 인턴/사원
  if (exp <= 60) return ALL_RANKS[1]; // 주임/대리
  if (exp <= 90) return ALL_RANKS[2]; // 과장/차장
  if (exp <= 110) return ALL_RANKS[3]; // 부장
  if (exp <= 130) return ALL_RANKS[4]; // 상무(임원)
  if (exp <= 150) return ALL_RANKS[5]; // 전무(임원)
  if (exp <= 160) return ALL_RANKS[6]; // 부사장
  if (exp <= 170) return ALL_RANKS[7]; // 사장
  if (exp <= 180) return ALL_RANKS[8]; // 부회장
  return ALL_RANKS[9]; // 회장 (181 ~ 250+)
}

/**
 * Get Next Rank progress information
 */
export function getNextRankProgress(exp: number) {
  const currentRank = getRankInfo(exp);
  const currentIdx = ALL_RANKS.findIndex((r) => r.title === currentRank.title);
  const isMaxRank = currentIdx === ALL_RANKS.length - 1;
  const nextRank = isMaxRank ? null : ALL_RANKS[currentIdx + 1];

  let percent = 100;
  let remainingExp = 0;

  if (nextRank) {
    const range = nextRank.minExp - currentRank.minExp;
    const progressInCurrent = exp - currentRank.minExp;
    percent = Math.min(100, Math.max(0, Math.round((progressInCurrent / (range || 1)) * 100)));
    remainingExp = Math.max(0, nextRank.minExp - exp);
  }

  return {
    currentRank,
    nextRank,
    isMaxRank,
    percent,
    remainingExp,
  };
}
