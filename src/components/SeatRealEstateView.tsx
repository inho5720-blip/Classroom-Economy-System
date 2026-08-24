import React, { useState, useMemo } from 'react';
import {
  Home,
  Coins,
  Shield,
  Tag,
  ArrowRightLeft,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Sliders,
  Settings,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Seat } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

export const SeatRealEstateView: React.FC = () => {
  const {
    currentUser,
    users,
    seats,
    buySeatFromTeacher,
    listSeatForSale,
    cancelSeatSale,
    buySeatFromStudent,
    triggerCelebration,
  } = useApp();

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [salePriceInput, setSalePriceInput] = useState<number>(800);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  const showFeedback = (text: string, isError = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleBuyFromTeacher = (seat: Seat) => {
    const res = buySeatFromTeacher(seat.id, currentUser.id);
    showFeedback(res.message, !res.success);
    if (res.success) {
      triggerCelebration();
      setSelectedSeat(null);
    }
  };

  const handleListForSale = (seat: Seat) => {
    const res = listSeatForSale(seat.id, currentUser.id, Number(salePriceInput));
    showFeedback(res.message, !res.success);
    if (res.success) {
      triggerCelebration();
      setSelectedSeat(null);
    }
  };

  const handleCancelSale = (seat: Seat) => {
    cancelSeatSale(seat.id, currentUser.id);
    showFeedback('당근마켓 판매 등록이 취소되었습니다.');
    setSelectedSeat(null);
  };

  const handleBuyFromStudent = (seat: Seat) => {
    const res = buySeatFromStudent(seat.id, currentUser.id);
    showFeedback(res.message, !res.success);
    if (res.success) {
      triggerCelebration();
      setSelectedSeat(null);
    }
  };

  // Dynamically calculate rows and columns from seats
  const maxRow = useMemo(() => Math.max(...seats.map((s) => s.rowIdx), 1), [seats]);
  const maxCol = useMemo(() => Math.max(...seats.map((s) => s.colIdx), 1), [seats]);
  const rows = useMemo(() => Array.from({ length: maxRow }, (_, i) => i + 1), [maxRow]);
  const cols = useMemo(() => Array.from({ length: maxCol }, (_, i) => i + 1), [maxCol]);

  const activeSeats = seats.filter((s) => s.isActive);
  const myOwnedSeats = activeSeats.filter((s) => s.ownerId === currentUser.id);
  const myOccupiedSeat = activeSeats.find((s) => s.currentOccupantId === currentUser.id);
  const marketSeats = activeSeats.filter((s) => s.isForSale);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shadow-md ${
            feedbackMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedbackMessage.isError ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-sky-50/40 border border-emerald-200/80 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-3xl shadow-2xs">
            🏡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-850">학급 자리 부동산 & 당근마켓</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                교실 실시간 거래소
              </span>
              {isSupabaseConfigured && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                  <Database className="w-3 h-3 text-sky-600" />
                  Supabase DB 동기화
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              내 자리를 교사에게 자가로 분양받아 매주 자리세를 면제받거나, 친구들과 당근마켓에서 자유롭게 거래하세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs font-semibold text-slate-700 shadow-2xs">
            보유 부동산: <strong className="text-emerald-700 font-bold">{myOwnedSeats.length}</strong>개 자리
          </div>
          <div className="p-3 rounded-2xl bg-white border border-amber-200 text-xs font-semibold text-slate-700 shadow-2xs">
            내 화폐: <strong className="text-amber-700 font-mono font-bold">{currentUser.points.toLocaleString()}P</strong>
          </div>
        </div>
      </div>

      {/* Teacher notice banner */}
      {currentUser.role === 'teacher' && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>교사 알림:</strong> 자리 배치도 크기(가로*세로), 빈자리/통로 지정, 자리세 및 기본 분양가 설정은 <strong>교사 종합 행정실 &gt; [🪑 자리 부동산 &amp; 배치도 관리]</strong> 탭에서 자유롭게 편집할 수 있습니다.
            </span>
          </div>
        </div>
      )}

      {/* Classroom Seating Chart (Layout Grid) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Blackboard at top */}
        <div className="max-w-md mx-auto py-2.5 px-6 rounded-2xl bg-emerald-800 border-2 border-amber-600 text-emerald-100 text-center font-bold text-xs tracking-widest shadow-inner">
          [ 칠 판 / 교 탁 ]
        </div>

        {/* Dynamic Rows x Cols Grid */}
        <div className="space-y-3 max-w-5xl mx-auto">
          {rows.map((rowNum) => (
            <div
              key={rowNum}
              className="grid gap-2.5"
              style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}
            >
              {cols.map((colNum) => {
                const seat = seats.find((s) => s.rowIdx === rowNum && s.colIdx === colNum);

                // If not an active seat (empty space/aisle), render a transparent invisible placeholder
                if (!seat || !seat.isActive) {
                  return (
                    <div
                      key={`empty-${rowNum}-${colNum}`}
                      className="min-h-[100px] rounded-2xl border border-dashed border-slate-200/30 bg-slate-50/20 flex flex-col items-center justify-center text-slate-300 text-[10px] select-none"
                    >
                      <span className="text-[9px] text-slate-300/60 font-mono">통로</span>
                    </div>
                  );
                }

                const occupant = users.find((u) => u.id === seat.currentOccupantId);
                const owner = users.find((u) => u.id === seat.ownerId);

                const isMySeat = seat.currentOccupantId === currentUser.id;
                const isMyOwned = seat.ownerId === currentUser.id;
                const isForSale = seat.isForSale;
                const isSelected = selectedSeat?.id === seat.id;

                return (
                  <button
                    key={seat.id}
                    onClick={() => {
                      setSelectedSeat(seat);
                      if (seat.isForSale && seat.salePrice) {
                        setSalePriceInput(seat.salePrice);
                      } else {
                        setSalePriceInput(800);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[100px] cursor-pointer relative group ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 shadow-md scale-102'
                        : ''
                    } ${
                      isMySeat
                        ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                        : isForSale
                        ? 'bg-pink-50/90 border-pink-300 hover:bg-pink-100/80 shadow-2xs'
                        : isMyOwned
                        ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/90 border-slate-200/90 hover:bg-slate-100/90'
                    }`}
                  >
                    {/* Top Bar: Number & Badges */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        #{seat.seatNumber}
                      </span>
                      {isForSale ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200 animate-pulse">
                          당근판매중
                        </span>
                      ) : isMyOwned ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          내 소유
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-medium">
                          {seat.ownerId ? '사유지' : '국가(교사)'}
                        </span>
                      )}
                    </div>

                    {/* Occupant Avatar & Name */}
                    <div className="my-1 flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          occupant ? `bg-gradient-to-br ${occupant.avatarColor}` : 'bg-slate-200'
                        }`}
                      >
                        {occupant?.avatarEmoji || '🪑'}
                      </div>
                      <span className="font-bold text-xs text-slate-850 truncate">
                        {occupant?.name || '공석'}
                      </span>
                    </div>

                    {/* Bottom Status / Price Tag */}
                    <div className="text-[10px] text-slate-500 flex items-center justify-between w-full pt-1 border-t border-slate-200/60">
                      {isForSale ? (
                        <span className="text-pink-700 font-mono font-bold">
                          {seat.salePrice?.toLocaleString()}P
                        </span>
                      ) : isMyOwned ? (
                        <span className="text-emerald-700 font-bold">자리세 면제</span>
                      ) : (
                        <span>주 {seat.rentalFee}P</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
            <span>현재 내 앉은 자리</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
            <span>자가 소유 (자리세 면제)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-pink-100 border border-pink-300" />
            <span>당근마켓 판매 중</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
            <span>선생님(국가) 공공 임대석</span>
          </div>
        </div>
      </div>

      {/* Selected Seat Interaction Modal */}
      {selectedSeat && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold shadow-2xs">
                🪑
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-850">
                  {selectedSeat.seatNumber}번 자리 상세 정보
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSeat.rowIdx}행 {selectedSeat.colIdx}열 (
                  {selectedSeat.ownerId
                    ? `소유자: ${users.find((u) => u.id === selectedSeat.ownerId)?.name || '학생'}`
                    : '교사(국가) 공공 소유'}
                  )
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSeat(null)}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">현재 앉은 학생</span>
              <strong className="text-slate-800 font-bold text-sm">
                {users.find((u) => u.id === selectedSeat.currentOccupantId)?.name || '공석'}
              </strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">주당 자리세 (임대료)</span>
              <strong className="text-amber-700 font-mono font-bold text-sm">
                {selectedSeat.rentalFee} P
              </strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">교사 기본 분양가</span>
              <strong className="text-slate-800 font-mono font-bold text-sm">
                {selectedSeat.purchasePrice || 600} P
              </strong>
            </div>
          </div>

          {/* Action Buttons based on ownership */}
          <div className="pt-2">
            {/* Case 1: Seat is owned by teacher/public -> Student can buy from teacher */}
            {!selectedSeat.ownerId && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-emerald-900">선생님께 자리 분양받기 (자가 소유)</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    {selectedSeat.purchasePrice || 600}P로 매입 시 매주 {selectedSeat.rentalFee}P의 자리세가 영구 면제됩니다.
                  </div>
                </div>
                <button
                  onClick={() => handleBuyFromTeacher(selectedSeat)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
                >
                  {selectedSeat.purchasePrice || 600}P 로 매입하기
                </button>
              </div>
            )}

            {/* Case 2: I am the owner -> Can list on carrot market or cancel sale */}
            {selectedSeat.ownerId === currentUser.id && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-indigo-900">
                  <span>내가 소유한 자리 🥕 당근마켓 거래 관리</span>
                  {selectedSeat.isForSale && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 font-bold">
                      현재 {selectedSeat.salePrice}P에 판매 등록 중
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={salePriceInput}
                    onChange={(e) => setSalePriceInput(Number(e.target.value))}
                    placeholder="판매 희망가 (P)"
                    className="w-36 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-mono text-slate-800"
                  />
                  <span className="text-xs text-slate-600">P 에</span>
                  <button
                    onClick={() => handleListForSale(selectedSeat)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                  >
                    {selectedSeat.isForSale ? '가격 수정 등록' : '당근마켓 판매 등록'}
                  </button>

                  {selectedSeat.isForSale && (
                    <button
                      onClick={() => handleCancelSale(selectedSeat)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs shadow-2xs transition cursor-pointer"
                    >
                      판매 취소
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Case 3: Listed on Market by another student -> Can buy from student */}
            {selectedSeat.ownerId &&
              selectedSeat.ownerId !== currentUser.id &&
              selectedSeat.isForSale && (
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-pink-900">
                      {users.find((u) => u.id === selectedSeat.ownerId)?.name} 학생이 판매 중인 자리
                    </div>
                    <div className="text-[11px] text-pink-700 mt-0.5">
                      당근마켓 판매가: <strong>{selectedSeat.salePrice}P</strong> (구매 시 자리 소유권이 이전됩니다)
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyFromStudent(selectedSeat)}
                    className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
                  >
                    {selectedSeat.salePrice}P 에 즉시 구매
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
