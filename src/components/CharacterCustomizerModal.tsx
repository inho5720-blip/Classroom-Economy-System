import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Palette, Smile, RefreshCw, Wand2 } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
}

// Background Color Palettes (Gradients & Pastel tones)
const BG_PALETTES = [
  { id: 'amber-orange', label: '골든 썬샤인', value: 'from-amber-400 to-orange-500', hex: '#F59E0B' },
  { id: 'blue-indigo', label: '오션 사파이어', value: 'from-blue-400 to-indigo-600', hex: '#3B82F6' },
  { id: 'emerald-teal', label: '에메랄드 포레스트', value: 'from-emerald-400 to-teal-600', hex: '#10B981' },
  { id: 'purple-pink', label: '미스틱 라벤더', value: 'from-purple-400 to-pink-500', hex: '#A855F7' },
  { id: 'rose-red', label: '루비 블로섬', value: 'from-rose-400 to-red-500', hex: '#F43F5E' },
  { id: 'cyan-sky', label: '크리스탈 스카이', value: 'from-cyan-400 to-blue-500', hex: '#06B6D4' },
  { id: 'yellow-amber', label: '비타민 레몬', value: 'from-yellow-300 to-amber-500', hex: '#EAB308' },
  { id: 'violet-fuchsia', label: '갤럭시 오로라', value: 'from-violet-500 to-fuchsia-500', hex: '#8B5CF6' },
  { id: 'slate-zinc', label: '실버 나이트', value: 'from-slate-600 to-zinc-800', hex: '#475569' },
  { id: 'teal-cyan', label: '민트 브리즈', value: 'from-teal-300 to-cyan-500', hex: '#14B8A6' },
  { id: 'orange-rose', label: '선셋 코랄', value: 'from-orange-400 to-rose-500', hex: '#FB923C' },
  { id: 'lime-emerald', label: '네이처 라임', value: 'from-lime-400 to-emerald-600', hex: '#84CC16' },
];

// Character / Object Archetypes
const CHARACTER_OBJECTS = [
  {
    category: '모험가 & 직업',
    items: [
      { emoji: '🎓', name: '수석 학자' },
      { emoji: '🧙‍♂️', name: '꼬마 마법사' },
      { emoji: '🦸‍♂️', name: '학급 히어로' },
      { emoji: '👨‍🚀', name: '우주 비행사' },
      { emoji: '🕵️', name: '명탐정' },
      { emoji: '🧑‍🍳', name: '마스터 셰프' },
      { emoji: '🧑‍🎨', name: '아티스트' },
      { emoji: '👑', name: '황금 왕관' },
    ],
  },
  {
    category: '신비로운 동물',
    items: [
      { emoji: '🐱', name: '행운의 고양이' },
      { emoji: '🐯', name: '용맹한 호랑이' },
      { emoji: '🦁', name: '위풍당당 사자' },
      { emoji: '🐼', name: '지혜로운 판다' },
      { emoji: '🦊', name: '영리한 붉은여우' },
      { emoji: '🐹', name: '귀요미 햄스터' },
      { emoji: '🐧', name: '황제 펭귄' },
      { emoji: '🐲', name: '전설의 아기드래곤' },
      { emoji: '🦄', name: '무지개 유니콘' },
      { emoji: '🦉', name: '밤의 수호자 올빼미' },
    ],
  },
  {
    category: '마법 사물 & 보물',
    items: [
      { emoji: '💎', name: '다이아몬드' },
      { emoji: '⭐', name: '슈퍼 스타' },
      { emoji: '🔥', name: '열정의 불꽃' },
      { emoji: '⚡', name: '번개 에너지' },
      { emoji: '🤖', name: '스마트 로봇' },
      { emoji: '🚀', name: '하이퍼 로켓' },
      { emoji: '🏆', name: '챔피언 트로피' },
      { emoji: '🍀', name: '네잎클로버' },
      { emoji: '🛡️', name: '수호의 방패' },
      { emoji: '⚔️', name: '용사의 검' },
    ],
  },
];

// Preset combinations for quick recommendation
const PRESET_CHARACTERS = [
  { name: '황금빛 수석 학자', emoji: '🎓', color: 'from-amber-400 to-orange-500' },
  { name: '사파이어 마법사', emoji: '🧙‍♂️', color: 'from-blue-400 to-indigo-600' },
  { name: '에메랄드 아기드래곤', emoji: '🐲', color: 'from-emerald-400 to-teal-600' },
  { name: '루비 블로섬 냥이', emoji: '🐱', color: 'from-rose-400 to-red-500' },
  { name: '갤럭시 유니콘', emoji: '🦄', color: 'from-violet-500 to-fuchsia-500' },
  { name: '오로라 번개 로봇', emoji: '🤖', color: 'from-cyan-400 to-blue-500' },
];

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateProfile, triggerCelebration } = useApp();

  const [selectedEmoji, setSelectedEmoji] = useState(user.avatarEmoji || '🎓');
  const [selectedColor, setSelectedColor] = useState(user.avatarColor || 'from-amber-400 to-orange-500');
  const [customNickname, setCustomNickname] = useState(user.nickname || user.name || '');
  const [customStatusMessage, setCustomStatusMessage] = useState(user.statusMessage || '');
  const [activeTab, setActiveTab] = useState<'presets' | 'objects' | 'background'>('presets');

  if (!isOpen) return null;

  const handleSave = () => {
    const finalNickname = customNickname.trim() || user.nickname || user.name || '학생';
    updateProfile(user.id, {
      name: finalNickname,
      nickname: finalNickname,
      statusMessage: customStatusMessage.trim(),
      avatarEmoji: selectedEmoji,
      avatarColor: selectedColor,
    });
    triggerCelebration();
    onClose();
  };

  const handleRandomize = () => {
    const randomPreset = PRESET_CHARACTERS[Math.floor(Math.random() * PRESET_CHARACTERS.length)];
    setSelectedEmoji(randomPreset.emoji);
    setSelectedColor(randomPreset.color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-amber-200/80 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-xs">
              🎨
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">내 프로필 & 캐릭터 꾸미기</h3>
              <p className="text-xs text-slate-500">닉네임(자기 별명), 상태 메시지(기분, 생각), 아바타를 자유롭게 변경하세요!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Preview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4">
              {/* Dynamic Animated Avatar Preview */}
              <motion.div
                key={`${selectedEmoji}-${selectedColor}`}
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${selectedColor} border-3 border-white shadow-lg shadow-slate-300 flex items-center justify-center text-4xl sm:text-5xl select-none relative group`}
              >
                <span>{selectedEmoji}</span>
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-amber-500 flex items-center justify-center text-xs shadow-xs">
                  ✨
                </div>
              </motion.div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  실시간 미리보기
                </span>
                <div className="font-extrabold text-base text-slate-800 mt-1 flex items-center gap-1.5">
                  <span>{customNickname.trim() || user.nickname || user.name}</span>
                  {user.studentNumber && (
                    <span className="text-[11px] font-mono text-slate-400">
                      #{user.studentNumber}
                    </span>
                  )}
                </div>
                <div className="text-xs text-indigo-700 font-semibold mt-1 bg-indigo-50/80 px-2.5 py-0.5 rounded-lg border border-indigo-100 inline-block">
                  💬 {customStatusMessage.trim() || user.statusMessage || '상태 메시지가 없습니다.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>랜덤 아바타</span>
            </button>
          </div>

          {/* Nickname & Status Message Edit Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>🏷️ 닉네임</span>
                <span className="text-[10px] text-amber-700 font-normal">(자기 별명)</span>
              </label>
              <input
                type="text"
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                placeholder="예: 태무산 2인자, 멍파치, 포냥 리치"
                maxLength={15}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>💬 상태 메시지</span>
                <span className="text-[10px] text-amber-700 font-normal">(기분, 생각)</span>
              </label>
              <input
                type="text"
                value={customStatusMessage}
                onChange={(e) => setCustomStatusMessage(e.target.value)}
                placeholder="예: 오늘 하루도 파이팅!, 건강이 최고!"
                maxLength={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Customization Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>추천 프리셋</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('objects')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'objects'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smile className="w-3.5 h-3.5 text-indigo-500" />
              <span>캐릭터 & 사물</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'background'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>배경 색상</span>
            </button>
          </div>

          {/* Tab 1: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">인기 캐릭터 프리셋 조합</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_CHARACTERS.map((preset, idx) => {
                  const isSelected = selectedEmoji === preset.emoji && selectedColor === preset.color;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(preset.emoji);
                        setSelectedColor(preset.color);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.color} border border-white shadow-xs flex items-center justify-center text-xl shrink-0`}
                      >
                        {preset.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          {isSelected ? <span className="text-amber-700 font-bold">선택됨 ✓</span> : '클릭하여 적용'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Character / Object Selection */}
          {activeTab === 'objects' && (
            <div className="space-y-4">
              {CHARACTER_OBJECTS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{group.category}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {group.items.length}종
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {group.items.map((item, iIdx) => {
                      const isSelected = selectedEmoji === item.emoji;
                      return (
                        <button
                          key={iIdx}
                          type="button"
                          onClick={() => setSelectedEmoji(item.emoji)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Background Color Palettes */}
          {activeTab === 'background' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">배경 그라디언트 및 파스텔 팔레트</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BG_PALETTES.map((pal) => {
                  const isSelected = selectedColor === pal.value;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setSelectedColor(pal.value)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${pal.value} border border-white shadow-2xs shrink-0`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{pal.label}</div>
                        {isSelected && <span className="text-[10px] text-amber-700 font-bold">선택됨 ✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>캐릭터 저장 완료</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
