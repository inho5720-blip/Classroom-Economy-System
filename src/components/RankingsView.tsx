import React, { useState } from 'react';
import {
  Trophy,
  Coins,
  Crown,
  Sparkles,
  Zap,
  PiggyBank,
  HeartHandshake,
  BookOpen,
  Scale,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatKey } from '../types';
import { getTotalExp, getRankInfo } from '../utils/rankUtils';

export const RankingsView: React.FC = () => {
  const { users, stats, titles, getStudentJob, getStudentJobs } = useApp();
  const [rankingType, setRankingType] = useState<'wealth' | StatKey>('wealth');

  const students = users.filter((u) => u.role === 'student');

  // Sorted list based on selected ranking category
  const sortedStudents = [...students].sort((a, b) => {
    if (rankingType === 'wealth') {
      return b.points - a.points;
    }
    const statA = stats[a.id]?.[rankingType] || 0;
    const statB = stats[b.id]?.[rankingType] || 0;
    return statB - statA;
  });

  const getRankBadge = (rankIdx: number) => {
    if (rankIdx === 0) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-400/30">
          🥇 1
        </div>
      );
    }
    if (rankIdx === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-300 text-slate-900 flex items-center justify-center font-black text-sm shadow-sm">
          🥈 2
        </div>
      );
    }
    if (rankIdx === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center font-mono">
        {rankIdx + 1}
      </div>
    );
  };

  const getCategoryTitle = () => {
    switch (rankingType) {
      case 'wealth':
        return {
          title: '학급 화폐 만수르 랭킹 (자산 1위)',
          desc: '1위 학생에게 [황금 만수르] 영구/실시간 칭호가 자동 부여됩니다.',
          icon: '👑',
          statName: '보유 자산',
        };
      case 'diligence':
        return {
          title: '성실의 모범생 랭킹 (숙제/직업 완수)',
          desc: '성실 1위 학생에게 [성실의 마스터] 칭호가 부여됩니다.',
          icon: '⚡',
          statName: '성실도',
        };
      case 'frugality':
        return {
          title: '알뜰 절약왕 랭킹 (연속 미소비)',
          desc: '절약 1위 학생에게 [학급 짠돌이] 칭호가 부여됩니다.',
          icon: '💰',
          statName: '절약도',
        };
      case 'contribution':
        return {
          title: '학급 영웅 랭킹 (공헌/청소 헌신)',
          desc: '기여 1위 학생에게 [기여의 영웅] 칭호가 부여됩니다.',
          icon: '🤝',
          statName: '기여도',
        };
      case 'wisdom':
        return {
          title: '지혜의 현자 랭킹 (독서/배움)',
          desc: '지혜 1위 학생에게 [배움의 현자] 칭호가 부여됩니다.',
          icon: '📖',
          statName: '지혜도',
        };
      case 'credit':
        return {
          title: '신용 모범생 랭킹 (세금 완납/무체납)',
          desc: '신용 1위 학생에게 [1등급 모범 납세자] 칭호가 부여됩니다.',
          icon: '⚖️',
          statName: '신용도',
        };
    }
  };

  const currentCategory = getCategoryTitle();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-yellow-50/90 via-amber-50/50 to-orange-50/40 border border-amber-200/80 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl shadow-2xs">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-850">명예의 전당 & 5대 스탯 랭킹</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                실시간 칭호 연동
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              각 부문별 1위 학생에게는 해당 분야의 특별 칭호와 명예가 수여됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'wealth', label: '👑 만수르 자산', color: 'border-amber-300' },
          { id: 'diligence', label: '⚡ 성실 (숙제)', color: 'border-sky-300' },
          { id: 'frugality', label: '💰 절약 (미소비)', color: 'border-emerald-300' },
          { id: 'contribution', label: '🤝 기여 (청소)', color: 'border-rose-300' },
          { id: 'wisdom', label: '📖 지혜 (배움)', color: 'border-indigo-300' },
          { id: 'credit', label: '⚖️ 신용 (납세)', color: 'border-amber-300' },
        ].map((cat) => {
          const isActive = rankingType === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setRankingType(cat.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm shadow-amber-400/20 scale-102'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ranking Podium Top 3 & Full List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-850 flex items-center gap-2">
              <span>{currentCategory.icon}</span>
              <span>{currentCategory.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentCategory.desc}</p>
          </div>
        </div>

        {/* Top 3 Podium Highlights for Tablet & PC */}
        {sortedStudents.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* 2nd Place */}
            <div className="order-2 sm:order-1 p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-between text-center relative shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                2위
              </div>
              <div className="my-3">
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${sortedStudents[1].avatarColor} flex items-center justify-center text-3xl shadow-sm mb-2`}
                >
                  {sortedStudents[1].avatarEmoji}
                </div>
                <div className="font-bold text-sm text-slate-800">
                  {sortedStudents[1].nickname || sortedStudents[1].name} #{sortedStudents[1].studentNumber}
                </div>
                {sortedStudents[1].statusMessage && (
                  <div className="text-xs text-slate-500 truncate max-w-[140px] mx-auto mt-0.5">💬 {sortedStudents[1].statusMessage}</div>
                )}
                {(() => {
                  const sStats = stats[sortedStudents[1].id] || { diligence: 1, frugality: 1, contribution: 1, wisdom: 1, credit: 1, userId: sortedStudents[1].id };
                  const rInfo = getRankInfo(getTotalExp(sStats));
                  return (
                    <div className="mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${rInfo.badgeBg} ${rInfo.badgeTextColor} font-bold inline-flex items-center gap-0.5`}>
                        {rInfo.emoji} {rInfo.title}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="font-mono font-black text-slate-700 text-base">
                {rankingType === 'wealth'
                  ? `${sortedStudents[1].points.toLocaleString()} P`
                  : `${stats[sortedStudents[1].id]?.[rankingType] || 0} 점`}
              </div>
            </div>

            {/* 1st Place (Winner - Elevated) */}
            <div className="order-1 sm:order-2 p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50/60 to-orange-50/40 border-2 border-amber-300 flex flex-col items-center justify-between text-center relative shadow-md scale-102">
              <div className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-2xs">
                👑 1위 챔피언
              </div>
              <div className="my-3">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${sortedStudents[0].avatarColor} flex items-center justify-center text-4xl shadow-md border-2 border-amber-300 mb-2`}
                >
                  {sortedStudents[0].avatarEmoji}
                </div>
                <div className="font-bold text-base text-slate-900">
                  {sortedStudents[0].nickname || sortedStudents[0].name} #{sortedStudents[0].studentNumber}
                </div>
                {sortedStudents[0].statusMessage ? (
                  <div className="text-xs text-indigo-700 font-semibold mt-0.5 truncate max-w-[160px] mx-auto">
                    💬 {sortedStudents[0].statusMessage}
                  </div>
                ) : (
                  <div className="text-xs font-bold text-amber-700 mt-0.5">
                    {titles.find((t) => t.id === sortedStudents[0].mainTitleId)?.name || '학급 대표 모험가'}
                  </div>
                )}
                {(() => {
                  const sStats = stats[sortedStudents[0].id] || { diligence: 1, frugality: 1, contribution: 1, wisdom: 1, credit: 1, userId: sortedStudents[0].id };
                  const rInfo = getRankInfo(getTotalExp(sStats));
                  return (
                    <div className="mt-1">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${rInfo.badgeBg} ${rInfo.badgeTextColor} font-bold inline-flex items-center gap-0.5 shadow-2xs`}>
                        {rInfo.emoji} {rInfo.title}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="font-mono font-black text-amber-700 text-xl">
                {rankingType === 'wealth'
                  ? `${sortedStudents[0].points.toLocaleString()} P`
                  : `${stats[sortedStudents[0].id]?.[rankingType] || 0} 점`}
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-between text-center relative shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center font-mono">
                3위
              </div>
              <div className="my-3">
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${sortedStudents[2].avatarColor} flex items-center justify-center text-3xl shadow-sm mb-2`}
                >
                  {sortedStudents[2].avatarEmoji}
                </div>
                <div className="font-bold text-sm text-slate-800">
                  {sortedStudents[2].nickname || sortedStudents[2].name} #{sortedStudents[2].studentNumber}
                </div>
                {sortedStudents[2].statusMessage && (
                  <div className="text-xs text-slate-500 truncate max-w-[140px] mx-auto mt-0.5">💬 {sortedStudents[2].statusMessage}</div>
                )}
                {(() => {
                  const sStats = stats[sortedStudents[2].id] || { diligence: 1, frugality: 1, contribution: 1, wisdom: 1, credit: 1, userId: sortedStudents[2].id };
                  const rInfo = getRankInfo(getTotalExp(sStats));
                  return (
                    <div className="mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${rInfo.badgeBg} ${rInfo.badgeTextColor} font-bold inline-flex items-center gap-0.5`}>
                        {rInfo.emoji} {rInfo.title}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="font-mono font-black text-amber-800 text-base">
                {rankingType === 'wealth'
                  ? `${sortedStudents[2].points.toLocaleString()} P`
                  : `${stats[sortedStudents[2].id]?.[rankingType] || 0} 점`}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Full List */}
        <div className="space-y-2 pt-2">
          {sortedStudents.map((student, idx) => {
            const studentJobList = getStudentJobs ? getStudentJobs(student.id) : [];
            const title = titles.find((t) => t.id === student.mainTitleId);
            const statVal =
              rankingType === 'wealth' ? student.points : stats[student.id]?.[rankingType] || 0;
            const sStats = stats[student.id] || { diligence: 1, frugality: 1, contribution: 1, wisdom: 1, credit: 1, userId: student.id };
            const rInfo = getRankInfo(getTotalExp(sStats));

            return (
              <div
                key={student.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between hover:bg-amber-50/40 hover:border-amber-200 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {getRankBadge(idx)}

                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${student.avatarColor} flex items-center justify-center text-xl shadow-2xs shrink-0`}
                  >
                    {student.avatarEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 truncate">
                        {student.nickname || student.name}
                      </span>
                      {student.studentNumber && (
                        <span className="text-[10px] font-mono text-slate-500">
                          #{student.studentNumber}
                        </span>
                      )}
                      {student.statusMessage && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 truncate max-w-[150px]">
                          💬 {student.statusMessage}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${rInfo.badgeBg} ${rInfo.badgeTextColor} font-bold inline-flex items-center gap-0.5 whitespace-nowrap`}>
                        {rInfo.emoji} {rInfo.title}
                      </span>
                      {title && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 truncate">
                          {title.icon} {title.name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {studentJobList.length === 0
                        ? '현재 무직'
                        : studentJobList.map((j) => `${j.icon} ${j.title}`).join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-slate-800">
                    {rankingType === 'wealth'
                      ? `${statVal.toLocaleString()} P`
                      : `${statVal} 점`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentCategory.statName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
