import React, { useState, useMemo } from 'react';
import {
  Home,
  Grid,
  Sliders,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  UserCheck,
  Coins,
  Shield,
  Info,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  Database,
  CloudCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Seat } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

export const TeacherSeatManagement: React.FC = () => {
  const {
    seats,
    users,
    taxSettings,
    updateSeat,
    updateAllSeats,
    toggleSeatActive,
    rebuildSeatGrid,
    bulkUpdateSeatTaxes,
    autoRenumberSeats,
    assignSeatOccupant,
    resetSeatOwnership,
    triggerCelebration,
  } = useApp();

  // Current calculated rows and cols
  const currentMaxRow = useMemo(() => Math.max(...seats.map((s) => s.rowIdx), 1), [seats]);
  const currentMaxCol = useMemo(() => Math.max(...seats.map((s) => s.colIdx), 1), [seats]);

  // Form states for grid dimensions
  const [gridRows, setGridRows] = useState<number>(currentMaxRow || 4);
  const [gridCols, setGridCols] = useState<number>(currentMaxCol || 6);
  const [defaultTax, setDefaultTax] = useState<number>(50);
  const [defaultPrice, setDefaultPrice] = useState<number>(600);

  // Selected seat for deep editing in inspector
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);

  // Banner message
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  const editingSeat = useMemo(
    () => seats.find((s) => s.id === editingSeatId) || null,
    [seats, editingSeatId]
  );

  // Stats
  const activeSeats = seats.filter((s) => s.isActive);
  const inactiveCells = seats.filter((s) => !s.isActive);
  const occupiedSeats = activeSeats.filter((s) => s.currentOccupantId !== null);
  const ownedSeats = activeSeats.filter((s) => s.ownerId !== null);
  const marketSeats = activeSeats.filter((s) => s.isForSale);

  const studentsList = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  // Handle grid resize / rebuild
  const handleApplyGridSize = () => {
    if (gridRows < 1 || gridRows > 12 || gridCols < 1 || gridCols > 12) {
      showFeedback('행과 열은 각각 1~12 사이여야 합니다.', true);
      return;
    }
    rebuildSeatGrid(gridRows, gridCols, defaultTax, defaultPrice);
    showFeedback(`자리 배치도가 ${gridRows}행 × ${gridCols}열 (${gridRows * gridCols}칸)로 재구성되었습니다.`);
  };

  // Preset layouts
  const handleApplyPreset = (presetName: string, rows: number, cols: number, pattern?: 'normal' | 'pairs' | 'u-shape') => {
    setGridRows(rows);
    setGridCols(cols);
    rebuildSeatGrid(rows, cols, defaultTax, defaultPrice);

    if (pattern === 'pairs') {
      // Create aisle every 2 columns if cols >= 4
      setTimeout(() => {
        // Renumber after
        autoRenumberSeats();
      }, 50);
    } else if (pattern === 'u-shape') {
      // Hollow center
    }

    showFeedback(`'${presetName}' 프리셋이 적용되었습니다.`);
  };

  // Bulk update prices
  const handleBulkUpdatePrices = () => {
    bulkUpdateSeatTaxes(defaultTax, defaultPrice);
    showFeedback(`모든 자리의 기본 자리세(${defaultTax}P)와 분양가(${defaultPrice}P)가 일괄 업데이트되었습니다.`);
  };

  // Auto renumber
  const handleAutoRenumber = () => {
    autoRenumberSeats();
    showFeedback('실제 배치된 자리 번호가 1번부터 차례대로 재부여되었습니다.');
  };

  const rows = useMemo(() => Array.from({ length: currentMaxRow }, (_, i) => i + 1), [currentMaxRow]);
  const cols = useMemo(() => Array.from({ length: currentMaxCol }, (_, i) => i + 1), [currentMaxCol]);

  return (
    <div className="space-y-6">
      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold transition flex items-center gap-2 shadow-md ${
            feedback.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.isError ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">총 격자 칸 수</span>
          <strong className="text-xl font-black text-slate-800">{seats.length} 칸</strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">{currentMaxRow}행 × {currentMaxCol}열</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
          <span className="text-[11px] text-emerald-700 font-medium block">실제 사용 자리</span>
          <strong className="text-xl font-black text-emerald-700">{activeSeats.length} 석</strong>
          <span className="text-[10px] text-emerald-600 block mt-0.5">빈자리/통로 {inactiveCells.length}개</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs">
          <span className="text-[11px] text-blue-700 font-medium block">학생 착석 현황</span>
          <strong className="text-xl font-black text-blue-700">{occupiedSeats.length} / {studentsList.length}</strong>
          <span className="text-[10px] text-blue-600 block mt-0.5">공석 {activeSeats.length - occupiedSeats.length}자리</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs">
          <span className="text-[11px] text-amber-700 font-medium block">자가 매입 완료</span>
          <strong className="text-xl font-black text-amber-700">{ownedSeats.length} 석</strong>
          <span className="text-[10px] text-amber-600 block mt-0.5">자리세 면제 대상</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-pink-200 shadow-2xs">
          <span className="text-[11px] text-pink-700 font-medium block">당근마켓 매물</span>
          <strong className="text-xl font-black text-pink-700">{marketSeats.length} 석</strong>
          <span className="text-[10px] text-pink-600 block mt-0.5">학생 간 거래 진행 중</span>
        </div>
      </div>

      {/* Grid Configuration Controls */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-850">교실 자리 배치도 및 기본 세금/분양가 설정</h3>
            {isSupabaseConfigured && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Database className="w-3 h-3 text-emerald-600" />
                Supabase DB 실시간 연동 중
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">빠른 배치:</span>
            <button
              onClick={() => handleApplyPreset('4분단 6행 (24인)', 4, 6)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              4행 × 6열 (24인)
            </button>
            <button
              onClick={() => handleApplyPreset('5행 6열 (30인)', 5, 6)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              5행 × 6열 (30인)
            </button>
            <button
              onClick={() => handleApplyPreset('6행 4열 (24인)', 6, 4)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              6행 × 4열 (24인)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Dimension: Rows */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              세로 행 수 (Rows)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={12}
                value={gridRows}
                onChange={(e) => setGridRows(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">행</span>
            </div>
          </div>

          {/* Dimension: Cols */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              가로 열 수 (Cols)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={12}
                value={gridCols}
                onChange={(e) => setGridCols(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">열</span>
            </div>
          </div>

          {/* Base Rental Fee */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              기본 주당 자리세 (임대료)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={defaultTax}
                onChange={(e) => setDefaultTax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">P / 주</span>
            </div>
          </div>

          {/* Base Purchase Price */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              교사 기본 분양 매입가
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">P</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyGridSize}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>격자 크기 적용 ({gridRows}×{gridCols})</span>
            </button>
            <button
              onClick={handleBulkUpdatePrices}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>자리세({defaultTax}P) 및 분양가({defaultPrice}P) 일괄 적용</span>
            </button>
          </div>

          <button
            onClick={handleAutoRenumber}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>실제 자리 번호 자동 재부여 (1번~)</span>
          </button>
        </div>
      </div>

      {/* Seating Grid Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Grid View (2 cols on large) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-850">교실 배치도 편집기</h3>
            </div>
            <div className="text-xs text-slate-500">
              💡 칸을 클릭하여 <strong>[실제 자리 ↔ 빈자리/통로]</strong> 전환 및 세부 설정
            </div>
          </div>

          {/* Blackboard */}
          <div className="max-w-xs mx-auto py-2 px-4 rounded-xl bg-emerald-800 border-2 border-amber-600 text-emerald-100 text-center font-bold text-xs tracking-widest shadow-inner">
            [ 칠 판 / 교 탁 ]
          </div>

          {/* The Visual Grid */}
          <div className="space-y-2.5 overflow-x-auto pb-2">
            {rows.map((rowNum) => (
              <div
                key={rowNum}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${currentMaxCol}, minmax(0, 1fr))` }}
              >
                {cols.map((colNum) => {
                  const seat = seats.find((s) => s.rowIdx === rowNum && s.colIdx === colNum);
                  if (!seat) return null;

                  const isSelected = editingSeatId === seat.id;
                  const occupant = users.find((u) => u.id === seat.currentOccupantId);
                  const owner = users.find((u) => u.id === seat.ownerId);

                  if (!seat.isActive) {
                    return (
                      <button
                        key={seat.id}
                        onClick={() => {
                          setEditingSeatId(seat.id);
                        }}
                        className={`min-h-[88px] p-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-100 transition flex flex-col items-center justify-center text-slate-400 group cursor-pointer ${
                          isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/40 border-indigo-300' : ''
                        }`}
                      >
                        <EyeOff className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 mb-1" />
                        <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold">
                          통로 (빈자리)
                        </span>
                        <span className="text-[9px] text-slate-300">
                          {rowNum}행 {colNum}열
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => setEditingSeatId(seat.id)}
                      className={`min-h-[88px] p-2.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer relative group ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 shadow-md scale-102 bg-white'
                          : seat.ownerId
                          ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/70'
                          : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      {/* Top info */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono font-black text-slate-700">
                          #{seat.seatNumber}
                        </span>
                        {seat.ownerId ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            자가
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            교사
                          </span>
                        )}
                      </div>

                      {/* Occupant */}
                      <div className="my-0.5 flex items-center gap-1 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                            occupant ? `bg-gradient-to-br ${occupant.avatarColor}` : 'bg-slate-200'
                          }`}
                        >
                          {occupant?.avatarEmoji || '🪑'}
                        </div>
                        <span className="font-bold text-[11px] text-slate-850 truncate">
                          {occupant?.name || '공석'}
                        </span>
                      </div>

                      {/* Bottom prices */}
                      <div className="text-[9px] text-slate-500 flex items-center justify-between w-full pt-1 border-t border-slate-200/60">
                        <span className="text-amber-700 font-medium">주 {seat.rentalFee}P</span>
                        <span className="text-slate-600 font-mono">{seat.purchasePrice || 600}P</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Grid Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
              <span>선생님(국유) 자리</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
              <span>학생 자가 매입 자리</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-dashed border-slate-300" />
              <span>빈자리 / 통로 (미노출)</span>
            </div>
          </div>
        </div>

        {/* Seat Inspector / Edit Sidebar */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-850">자리 세부 설정 &amp; 학생 배정</h3>
            </div>
          </div>

          {editingSeat ? (
            <div className="space-y-4 text-xs">
              {/* Status Header */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">선택된 좌표</span>
                  <strong className="text-sm font-bold text-slate-800">
                    {editingSeat.rowIdx}행 {editingSeat.colIdx}열 (
                    {editingSeat.isActive ? `#${editingSeat.seatNumber}번 자리` : '통로/빈자리'})
                  </strong>
                </div>

                <button
                  onClick={() => {
                    toggleSeatActive(editingSeat.id);
                    showFeedback(
                      editingSeat.isActive
                        ? '빈자리(통로)로 전환되었습니다.'
                        : '실제 자리로 활성화되었습니다.'
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    editingSeat.isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {editingSeat.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>빈자리(통로)로 변경</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>실제 자리로 활성화</span>
                    </>
                  )}
                </button>
              </div>

              {editingSeat.isActive ? (
                <>
                  {/* Seat Number & Zone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">자리 번호</label>
                      <input
                        type="number"
                        value={editingSeat.seatNumber}
                        onChange={(e) =>
                          updateSeat(editingSeat.id, { seatNumber: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">구역(Zone)</label>
                      <select
                        value={editingSeat.zone || 'middle'}
                        onChange={(e) =>
                          updateSeat(editingSeat.id, { zone: e.target.value as Seat['zone'] })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                      >
                        <option value="front">앞자리</option>
                        <option value="middle">중간자리</option>
                        <option value="window">창가자리</option>
                        <option value="back">뒷자리</option>
                        <option value="vip">VIP 로얄석</option>
                      </select>
                    </div>
                  </div>

                  {/* Assign Occupant Student */}
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">
                      앉은 학생 배정 (Occupant)
                    </label>
                    <select
                      value={editingSeat.currentOccupantId || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : e.target.value;
                        assignSeatOccupant(editingSeat.id, val);
                        showFeedback('앉은 학생 배정이 변경되었습니다.');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="">[ 공석 (비어있음) ]</option>
                      {studentsList.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.name} ({stu.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prices: Rental Tax & Purchase Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        주당 자리세 (P)
                      </label>
                      <input
                        type="number"
                        value={editingSeat.rentalFee}
                        onChange={(e) =>
                          updateSeat(editingSeat.id, { rentalFee: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-amber-700"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">
                        교사 분양가 (P)
                      </label>
                      <input
                        type="number"
                        value={editingSeat.purchasePrice || 600}
                        onChange={(e) =>
                          updateSeat(editingSeat.id, { purchasePrice: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Ownership Status & Reset */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">소유권 상태</span>
                      {editingSeat.ownerId ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                          {users.find((u) => u.id === editingSeat.ownerId)?.name || '학생'} 개인 소유
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          교사/국가 공공 소유
                        </span>
                      )}
                    </div>

                    {editingSeat.ownerId && (
                      <button
                        onClick={() => {
                          resetSeatOwnership(editingSeat.id);
                          showFeedback('소유권이 교사(국가)로 환수되었습니다.');
                        }}
                        className="w-full py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition cursor-pointer"
                      >
                        소유권 교사로 환수(초기화)
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 text-center text-slate-400 space-y-2">
                  <p>현재 이 칸은 빈자리(통로)로 설정되어 학생들에게 노출되지 않습니다.</p>
                  <p className="text-[11px] text-slate-500">
                    실제 책상을 배치하려면 위의 [실제 자리로 활성화] 버튼을 누르세요.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Grid className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">
                왼쪽 교실 배치도에서 편집할 자리를 클릭하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
