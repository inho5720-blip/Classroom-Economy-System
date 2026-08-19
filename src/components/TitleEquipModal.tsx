import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Check, Sparkles, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TitleEquipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitleEquipModal: React.FC<TitleEquipModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, titles, userTitles, equipTitle, triggerCelebration } = useApp();

  if (!isOpen) return null;

  const unlockedTitleIds = userTitles
    .filter((ut) => ut.userId === currentUser.id)
    .map((ut) => ut.titleId);

  const handleEquip = (titleId: string) => {
    equipTitle(currentUser.id, titleId);
    triggerCelebration();
    onClose();
  };

  const handleUnequip = () => {
    equipTitle(currentUser.id, null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50/40 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs">
                🏆
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  보유 칭호 및 업적 관리
                </h2>
                <p className="text-xs text-slate-500">
                  대표 칭호 1개를 선택하여 프로필에 장착할 수 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Titles List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {currentUser.mainTitleId && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleUnequip}
                  className="text-xs text-slate-500 hover:text-amber-800 underline underline-offset-4 font-semibold"
                >
                  대표 칭호 해제하기
                </button>
              </div>
            )}

            <div className="space-y-3">
              {titles.map((title) => {
                const isUnlocked = unlockedTitleIds.includes(title.id);
                const isEquipped = currentUser.mainTitleId === title.id;

                return (
                  <div
                    key={title.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      isEquipped
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/60 shadow-sm'
                        : isUnlocked
                        ? 'bg-slate-50/80 border-slate-200/80 hover:bg-amber-50/40 hover:border-amber-200'
                        : 'bg-slate-50/40 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          isUnlocked
                            ? 'bg-white border border-slate-200 shadow-2xs'
                            : 'bg-slate-100 border border-slate-200 text-slate-400'
                        }`}
                      >
                        {isUnlocked ? title.icon : <Lock className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isUnlocked ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {title.name}
                          </span>
                          {title.isDynamic && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                              실시간 1위 전용
                            </span>
                          )}
                          {isEquipped && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3" /> 장착 중
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {title.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        isEquipped ? (
                          <button
                            onClick={handleUnequip}
                            className="px-3.5 py-1.5 rounded-xl bg-white text-slate-600 text-xs font-semibold hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                          >
                            해제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEquip(title.id)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> 장착
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Lock className="w-3.5 h-3.5" /> 미획득
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
