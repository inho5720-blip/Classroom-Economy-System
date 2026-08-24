import React, { useState } from 'react';
import { Smile, ChevronDown, Check } from 'lucide-react';

export interface EmojiOptionGroup {
  categoryName: string;
  items: {
    emoji: string;
    name: string;
    desc: string;
  }[];
}

export const CLASSROOM_JOB_EMOJIS: EmojiOptionGroup[] = [
  {
    categoryName: '🧹 청소 & 환경미화',
    items: [
      { emoji: '🧹', name: '빗자루', desc: '바닥 쓸기 및 교실 청소' },
      { emoji: '🧽', name: '스펀지/지우개', desc: '칠판 지우기 및 책상 닦기' },
      { emoji: '🗑️', name: '쓰레기통', desc: '분리수거 및 쓰레기통 비우기' },
      { emoji: '🧼', name: '비누/손소독', desc: '손소독제 및 위생 청결' },
      { emoji: '🪣', name: '물양동이/걸레', desc: '대걸레 빨기 및 물걸레질' },
      { emoji: '🪟', name: '창문', desc: '창문 열고 닫기 및 환기' },
      { emoji: '✨', name: '반짝이', desc: '사물함 및 정리정돈 점검' },
      { emoji: '🧺', name: '빨래바구니', desc: '걸레 및 청소도구함 정리' },
    ],
  },
  {
    categoryName: '📚 학습 & 독서 & 교구',
    items: [
      { emoji: '📚', name: '학급문고/책', desc: '학급 책장 및 도서 대출 정리' },
      { emoji: '📖', name: '교과서/독서', desc: '학습 자료 및 교과서 챙김이' },
      { emoji: '📝', name: '알림장/과제', desc: '숙제 및 과제물 수합 도우미' },
      { emoji: '✏️', name: '연필/학용품', desc: '연필깎이 및 분실물 관리' },
      { emoji: '🎨', name: '미술/꾸미기', desc: '게시판 꾸미기 및 미술도구' },
      { emoji: '🔬', name: '과학/실험', desc: '과학 실험도구 및 교구 관리' },
      { emoji: '📐', name: '수학/교구', desc: '수학 교구 및 자/각도기' },
      { emoji: '🖨️', name: '학습지/인쇄', desc: '유인물 배부 및 학습지 정리' },
      { emoji: '🏷️', name: '이름표/라벨', desc: '교구 라벨링 및 물품 표시' },
    ],
  },
  {
    categoryName: '📢 질서 & 알림 & 방송',
    items: [
      { emoji: '📢', name: '확성기', desc: '선생님 말씀 전달 및 안내 방송' },
      { emoji: '🔔', name: '종소리/시종', desc: '수업 시작 및 끝 알림 도우미' },
      { emoji: '⏰', name: '시계/타이머', desc: '쉬는 시간 및 활동 시간 관리' },
      { emoji: '📋', name: '출석부/체크', desc: '출결 확인 및 이동 시 인원 점검' },
      { emoji: '🗣️', name: '발표/진행', desc: '학급 회의 및 아침 조회 진행' },
      { emoji: '🎤', name: '마이크/방송', desc: '아침 방송 켜기 및 음향' },
      { emoji: '🚩', name: '줄서기/깃발', desc: '급식실 및 이동 시 줄서기 질서' },
      { emoji: '🚶', name: '복도 안전', desc: '복도에서 뛰지 않기 지도' },
    ],
  },
  {
    categoryName: '🌿 생태 & 식물 & 급식',
    items: [
      { emoji: '🌱', name: '새싹/식물', desc: '학급 화분 물주기 및 식물 돌보기' },
      { emoji: '🪴', name: '화초', desc: '교실 화단 및 화초 가꾸기' },
      { emoji: '🌻', name: '해바라기', desc: '꽃과 생명 사랑 도우미' },
      { emoji: '🥛', name: '우유 당번', desc: '우유 급식 배부 및 상자 정리' },
      { emoji: '🍎', name: '급식/식판', desc: '식사 전 줄서기 및 식판 정리' },
      { emoji: '🥪', name: '간식 배부', desc: '학급 간식 및 다과 도우미' },
      { emoji: '💧', name: '정수기/물', desc: '물 마시기 줄서기 및 정수기' },
      { emoji: '☀️', name: '날씨/블라인드', desc: '햇빛 조절 및 블라인드 치기' },
    ],
  },
  {
    categoryName: '💻 전자기기 & 스마트 & 시설',
    items: [
      { emoji: '💻', name: '노트북/태블릿', desc: '스마트기기 충전 및 보관함' },
      { emoji: '🖥️', name: '컴퓨터/TV', desc: '교실 TV 모니터 및 컴퓨터 켜기' },
      { emoji: '📽️', name: '빔프로젝터', desc: '프로젝터 및 스크린 내리기' },
      { emoji: '🔌', name: '멀티탭/충전', desc: '전자기기 배터리 충전선 정리' },
      { emoji: '💡', name: '소등/에너지', desc: '점심시간 및 퇴실 시 전등 끄기' },
      { emoji: '🎵', name: '음악 재생', desc: '청소 시간 및 활동 배경음악' },
      { emoji: '🔑', name: '문단속/보안', desc: '교실 문 잠그기 및 열쇠 관리' },
    ],
  },
  {
    categoryName: '🤝 봉사 & 복지 & 안전 & 리더',
    items: [
      { emoji: '🤝', name: '또래 도우미', desc: '도움이 필요한 친구 돕기' },
      { emoji: '🩺', name: '보건/체온', desc: '체온 측정 및 보건실 동행' },
      { emoji: '🩹', name: '구급약/반창고', desc: '학급 구급함 및 밴드 챙김' },
      { emoji: '💬', name: '마음우체통', desc: '칭찬 편지 및 고민 상담함' },
      { emoji: '🛡️', name: '안전 지킴이', desc: '교실 내 위험 요소 점검' },
      { emoji: '📦', name: '택배/물품', desc: '교무실 물품 및 학습 도구 수령' },
      { emoji: '👑', name: '학급 반장/대표', desc: '학급 총괄 및 회의 주재' },
      { emoji: '🎖️', name: '부반장/위원', desc: '학급 부대표 및 행사 지원' },
      { emoji: '⚖️', name: '학급재판/공정', desc: '학급 규칙 준수 및 갈등 중재' },
      { emoji: '💼', name: '서류/행정', desc: '선생님 심부름 및 공지 배부' },
      { emoji: '🎯', name: '이벤트/기획', desc: '학급 행사 기획 및 미션 도우미' },
      { emoji: '📸', name: '학급 사진사', desc: '학급 활동 사진 및 추억 기록' },
      { emoji: '🎲', name: '보드게임 관리', desc: '학급 놀이도구 및 보드게임 정리' },
      { emoji: '🏃', name: '체육 도우미', desc: '체육관 공 관리 및 준비운동' },
    ],
  },
];

// Flat list for quick lookup
export const ALL_JOB_EMOJIS = CLASSROOM_JOB_EMOJIS.flatMap((group) => group.items);

interface JobEmojiSelectorProps {
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
  className?: string;
  showCustomInput?: boolean;
}

export const JobEmojiSelector: React.FC<JobEmojiSelectorProps> = ({
  value,
  onChange,
  label = '직업 이모지 아이콘',
  className = '',
  showCustomInput = true,
}) => {
  const [isOpenGrid, setIsOpenGrid] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Find matching item info
  const matchedItem = ALL_JOB_EMOJIS.find((item) => item.emoji === value);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            {label}
          </label>
          <span className="text-[11px] text-indigo-600 font-medium">
            드롭다운에서 직업별 추천 이모지 선택
          </span>
        </div>
      )}

      {/* Main Select Dropdown Row */}
      <div className="flex items-center gap-2">
        {/* Selected Emoji Preview Tile with Click to Open Grid Palette */}
        <button
          type="button"
          onClick={() => setIsOpenGrid((prev) => !prev)}
          title="이모지 모음 팔레트 열기/닫기"
          className="w-11 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs transition cursor-pointer"
        >
          <span>{value || '💼'}</span>
        </button>

        {/* Dropdown Select Box */}
        <div className="relative flex-1">
          <select
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-400 transition cursor-pointer appearance-none truncate"
          >
            {/* If currently selected emoji isn't in predefined list, show custom option */}
            {!matchedItem && value && (
              <option value={value}>
                {value} 직접 입력된 이모지
              </option>
            )}

            {CLASSROOM_JOB_EMOJIS.map((group) => (
              <optgroup key={group.categoryName} label={group.categoryName}>
                {group.items.map((item) => (
                  <option key={item.emoji} value={item.emoji}>
                    {item.emoji} {item.name} - {item.desc}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Palette Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpenGrid((prev) => !prev)}
          className={`px-2.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
            isOpenGrid
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="모든 직업 이모지 한눈에 보기"
        >
          <Smile className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">팔레트</span>
        </button>
      </div>

      {/* Helper text showing the selected item's role */}
      {matchedItem && (
        <div className="text-[11px] text-slate-500 flex items-center gap-1 pl-1">
          <span className="font-semibold text-indigo-700">{matchedItem.name}:</span>
          <span>{matchedItem.desc}</span>
        </div>
      )}

      {/* Interactive Visual Grid Popover / Expandable Box */}
      {isOpenGrid && (
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 space-y-2.5 mt-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>✨</span> 학급 1인 1역 추천 이모지 모음
            </span>
            <button
              type="button"
              onClick={() => setIsOpenGrid(false)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 cursor-pointer"
            >
              닫기
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CLASSROOM_JOB_EMOJIS.map((group, idx) => (
              <button
                key={group.categoryName}
                type="button"
                onClick={() => setActiveCategoryIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategoryIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {group.categoryName.split(' ')[0]} {group.categoryName.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {CLASSROOM_JOB_EMOJIS[activeCategoryIndex].items.map((item) => {
              const isSelected = value === item.emoji;
              return (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => {
                    onChange(item.emoji);
                    setIsOpenGrid(false);
                  }}
                  title={`${item.name} (${item.desc})`}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center relative group ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-xl group-hover:scale-115 transition-transform">
                    {item.emoji}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white truncate max-w-full font-medium">
                    {item.name.split('/')[0]}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showCustomInput && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">원하는 다른 이모지가 있다면?</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="이모지 직접 입력"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-24 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-center text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
