import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Coins,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Percent,
  History,
  Users,
  Sparkles,
  AlertCircle,
  Check,
  Calendar,
  Gavel,
  Clock,
  Award,
  ShoppingBag,
  Package,
  Home,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CalendarDays,
  CheckCheck,
  RotateCw,
  UserCheck,
  CheckSquare,
  Square,
  Smile,
  Archive,
  FolderArchive,
  RotateCcw,
  AlertTriangle,
  FileCheck2,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Job, Quest, QuestLog, AuctionItem, ShopItem, TaxSetting, QuestFrequencyType, QuestTargetType, StatKey } from '../types';
import { TeacherSeatManagement } from './TeacherSeatManagement';
import { JobEmojiSelector } from './JobEmojiSelector';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  WEEKDAYS,
  QUEST_EMOJI_CATEGORIES,
  getRecurringDaysLabel,
  getQuestRewardForStudent,
  getTodayDateStr,
} from '../utils/questUtils';

export const TeacherAdminView: React.FC = () => {
  const {
    currentUser,
    users,
    jobs,
    studentJobs,
    jobApplications,
    quests,
    questLogs,
    taxSettings,
    shopItems,
    shopOrders,
    auctions,
    getStudentJobs,
    approveQuestLog,
    rejectQuestLog,
    executeWeeklySalarySettlement,
    addJob,
    updateJob,
    deleteJob,
    assignStudentJob,
    unassignStudentJob,
    approveJobApplication,
    rejectJobApplication,
    createQuest,
    deleteQuest,
    archiveQuest,
    restoreQuest,
    createTaxSetting,
    updateTaxSetting,
    deleteTaxSetting,
    adjustStudentPoints,
    createShopItem,
    updateShopItem,
    deleteShopItem,
    createAuction,
    closeAuction,
    deleteAuction,
    resetClassroomEconomy,
    economyResetDate,
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<
    'approvals' | 'shop_items' | 'seat_real_estate' | 'auctions' | 'jobs' | 'quests' | 'taxes' | 'shop_history' | 'students'
  >('approvals');

  // Reset classroom modal state
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Tax Policy Management Modal States
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxType, setNewTaxType] = useState<'percent' | 'fixed'>('percent');
  const [newTaxValue, setNewTaxValue] = useState(10);
  const [newTaxDesc, setNewTaxDesc] = useState('');
  const [newTaxIsActive, setNewTaxIsActive] = useState(true);

  const [editingTax, setEditingTax] = useState<TaxSetting | null>(null);
  const [editTaxName, setEditTaxName] = useState('');
  const [editTaxType, setEditTaxType] = useState<'percent' | 'fixed'>('percent');
  const [editTaxValue, setEditTaxValue] = useState(10);
  const [editTaxDesc, setEditTaxDesc] = useState('');
  const [editTaxIsActive, setEditTaxIsActive] = useState(true);

  const [deletingTaxTarget, setDeletingTaxTarget] = useState<TaxSetting | null>(null);

  // Job Application rejection modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectAppReason, setRejectAppReason] = useState('');

  // Rejection dialog
  const [rejectingLogId, setRejectingLogId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Add Job Form
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobSalary, setNewJobSalary] = useState(500);
  const [newJobDifficulty, setNewJobDifficulty] = useState(3);
  const [newJobMaxCount, setNewJobMaxCount] = useState(2);
  const [newJobIcon, setNewJobIcon] = useState('🧹');
  const [newJobCategory, setNewJobCategory] = useState<Job['category']>('cleaning');

  // Edit Job Form
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobDesc, setEditJobDesc] = useState('');
  const [editJobSalary, setEditJobSalary] = useState(500);
  const [editJobDifficulty, setEditJobDifficulty] = useState(3);
  const [editJobMaxCount, setEditJobMaxCount] = useState(2);
  const [editJobIcon, setEditJobIcon] = useState('💼');
  const [editJobCategory, setEditJobCategory] = useState<Job['category']>('service');

  // Add Quest Form
  const [showAddQuestModal, setShowAddQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDesc, setNewQuestDesc] = useState('');
  const [newQuestReward, setNewQuestReward] = useState(100);
  const [newQuestType, setNewQuestType] = useState<Quest['questType']>('homework');
  const [newQuestStatType, setNewQuestStatType] = useState<StatKey>('diligence');
  const [newQuestStatAmount, setNewQuestStatAmount] = useState<number>(1);
  const [newQuestTargetJobId, setNewQuestTargetJobId] = useState<string>('');
  const [newQuestIcon, setNewQuestIcon] = useState('📝');
  const [newQuestTargetType, setNewQuestTargetType] = useState<QuestTargetType>('all');
  const [newQuestTargetStudentIds, setNewQuestTargetStudentIds] = useState<string[]>([]);
  const [newQuestFrequencyType, setNewQuestFrequencyType] = useState<QuestFrequencyType>('once');
  const [newQuestDueDate, setNewQuestDueDate] = useState(() => getTodayDateStr());
  const [newQuestRecurringDays, setNewQuestRecurringDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);

  // Quest Management sub-tab ('active' = 진행 중, 'archived' = 완료 퀘스트 보관함)
  const [questSubTab, setQuestSubTab] = useState<'active' | 'archived'>('active');
  const [deletingQuestTarget, setDeletingQuestTarget] = useState<Quest | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Quest | null>(null);

  // Add Auction Form
  const [showAddAuctionModal, setShowAddAuctionModal] = useState(false);
  const [newAuctionTitle, setNewAuctionTitle] = useState('');
  const [newAuctionDesc, setNewAuctionDesc] = useState('');
  const [newAuctionStartPrice, setNewAuctionStartPrice] = useState(500);
  const [newAuctionMinStep, setNewAuctionMinStep] = useState(50);
  const [newAuctionDuration, setNewAuctionDuration] = useState(24);
  const [newAuctionCategory, setNewAuctionCategory] = useState<AuctionItem['category']>('privilege');
  const [newAuctionIcon, setNewAuctionIcon] = useState('👑');

  // Shop Item Form states (Add & Edit)
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopDesc, setNewShopDesc] = useState('');
  const [newShopPrice, setNewShopPrice] = useState(200);
  const [newShopStock, setNewShopStock] = useState(10);
  const [newShopCategory, setNewShopCategory] = useState<ShopItem['category']>('privilege');
  const [newShopIcon, setNewShopIcon] = useState('🎟️');

  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [deletingShopItemTarget, setDeletingShopItemTarget] = useState<ShopItem | null>(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopDesc, setEditShopDesc] = useState('');
  const [editShopPrice, setEditShopPrice] = useState(200);
  const [editShopStock, setEditShopStock] = useState(10);
  const [editShopCategory, setEditShopCategory] = useState<ShopItem['category']>('privilege');
  const [editShopIcon, setEditShopIcon] = useState('🎟️');

  // Point adjust dialog
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(100);
  const [adjustReason, setAdjustReason] = useState('');

  // Job Applications Inbox tab (pending vs completed)
  const [jobInboxTab, setJobInboxTab] = useState<'pending' | 'completed'>('pending');

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingLogs = questLogs.filter((l) => l.status === 'pending');
  const unpaidApprovedLogs = questLogs.filter((l) => l.status === 'approved' && !l.isPaid);
  const unpaidApprovedPoints = unpaidApprovedLogs.reduce((acc, log) => {
    const q = quests.find((item) => item.id === log.questId);
    if (!q) return acc;
    return acc + getQuestRewardForStudent(q, log.userId, jobs, studentJobs);
  }, 0);
  const students = users.filter((u) => u.role === 'student');

  // 📋 퀘스트 승인 대기열 필터링 & 캘린더 상태
  type ApprovalCategoryFilter = 'all' | 'job' | 'homework' | 'reading' | 'special';
  const [approvalCategoryFilter, setApprovalCategoryFilter] = useState<ApprovalCategoryFilter>('all');
  const [approvalSelectedDate, setApprovalSelectedDate] = useState<string | null>(null); // 'YYYY-MM-DD' or null (전체)
  const [approvalSearchStudent, setApprovalSearchStudent] = useState<string>('');
  const [approvalSelectedLogIds, setApprovalSelectedLogIds] = useState<string[]>([]);
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(new Date());
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  const handleApprove = (logId: string) => {
    approveQuestLog(logId, currentUser.id);
    showToast(
      '퀘스트가 승인되었습니다! 능력치(스탯)가 즉시 학생에게 지급되었으며, 포인트는 [주급 일괄 정산] 시 세금 공제 후 일괄 지급됩니다.'
    );
  };

  const handleReject = () => {
    if (!rejectingLogId) return;
    rejectQuestLog(rejectingLogId, currentUser.id, rejectReasonInput.trim());
    showToast('퀘스트가 반려 처리되었습니다.');
    setRejectingLogId(null);
    setRejectReasonInput('');
  };

  const handleQuickReject = (logId: string) => {
    rejectQuestLog(logId, currentUser.id, '');
    showToast('퀘스트가 사유 없이 즉시 반려 처리되었습니다.');
  };

  const handleBulkApproveFiltered = (targetLogs: QuestLog[]) => {
    if (targetLogs.length === 0) return;
    targetLogs.forEach((log) => {
      approveQuestLog(log.id, currentUser.id);
    });
    setApprovalSelectedLogIds([]);
    showToast(`총 ${targetLogs.length}건의 퀘스트가 일괄 승인되었습니다!`);
  };

  const handleBulkRejectFiltered = (targetLogs: QuestLog[]) => {
    if (targetLogs.length === 0) return;
    targetLogs.forEach((log) => {
      rejectQuestLog(log.id, currentUser.id, '');
    });
    setApprovalSelectedLogIds([]);
    showToast(`총 ${targetLogs.length}건의 퀘스트가 일괄 반려되었습니다.`);
  };

  const handleBulkSalary = () => {
    const res = executeWeeklySalarySettlement();
    showToast(
      `총 ${res.count}명의 학생에게 주급(총 ${res.totalPaid.toLocaleString()}P) 지급 및 세금(${res.totalTax.toLocaleString()}P) 공제가 완료되었습니다!`
    );
  };

  // Tax Policy Handlers
  const handleCreateTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName.trim()) return;

    createTaxSetting({
      name: newTaxName.trim(),
      taxType: newTaxType,
      value: Number(newTaxValue),
      description: newTaxDesc.trim() || '학급 세금 및 공제 정책',
      isActive: newTaxIsActive,
    });

    showToast(`'${newTaxName}' 세금 정책이 등록되었습니다!`);
    setShowAddTaxModal(false);
    setNewTaxName('');
    setNewTaxType('percent');
    setNewTaxValue(10);
    setNewTaxDesc('');
    setNewTaxIsActive(true);
  };

  const handleOpenEditTax = (tax: TaxSetting) => {
    setEditingTax(tax);
    setEditTaxName(tax.name);
    setEditTaxType(tax.taxType);
    setEditTaxValue(tax.value);
    setEditTaxDesc(tax.description);
    setEditTaxIsActive(tax.isActive);
  };

  const handleUpdateTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTax || !editTaxName.trim()) return;

    updateTaxSetting(editingTax.id, {
      name: editTaxName.trim(),
      taxType: editTaxType,
      value: Number(editTaxValue),
      description: editTaxDesc.trim(),
      isActive: editTaxIsActive,
    });

    showToast(`'${editTaxName}' 세금 정책이 성공적으로 수정되었습니다!`);
    setEditingTax(null);
  };

  const handleExecuteDeleteTax = () => {
    if (!deletingTaxTarget) return;
    const name = deletingTaxTarget.name;
    deleteTaxSetting(deletingTaxTarget.id);
    showToast(`'${name}' 세금 정책이 삭제되었습니다.`);
    setDeletingTaxTarget(null);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    addJob({
      title: newJobTitle.trim(),
      description: newJobDesc.trim() || '학급 1인 1역 직업입니다.',
      weeklySalary: Number(newJobSalary),
      difficulty: Number(newJobDifficulty),
      maxCount: Math.max(1, Number(newJobMaxCount)),
      icon: newJobIcon || '💼',
      category: newJobCategory,
    });

    showToast(`'${newJobTitle}' 직업이 새로 추가되었습니다! (정원: ${newJobMaxCount}명)`);
    setShowAddJobModal(false);
    setNewJobTitle('');
    setNewJobDesc('');
    setNewJobSalary(500);
    setNewJobMaxCount(2);
  };

  const handleStartEditJob = (job: Job) => {
    setEditingJob(job);
    setEditJobTitle(job.title);
    setEditJobDesc(job.description);
    setEditJobSalary(job.weeklySalary);
    setEditJobDifficulty(job.difficulty);
    setEditJobMaxCount(job.maxCount);
    setEditJobIcon(job.icon);
    setEditJobCategory(job.category);
  };

  const handleUpdateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editJobTitle.trim()) return;

    updateJob(editingJob.id, {
      title: editJobTitle.trim(),
      description: editJobDesc.trim(),
      weeklySalary: Number(editJobSalary),
      difficulty: Number(editJobDifficulty),
      maxCount: Math.max(1, Number(editJobMaxCount)),
      icon: editJobIcon || '💼',
      category: editJobCategory,
    });

    showToast(`'${editJobTitle}' 직업 정보 및 정원(${editJobMaxCount}명) 수정이 완료되었습니다!`);
    setEditingJob(null);
  };

  const handleAdjustJobQuota = (jobId: string, delta: number) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const currentAssigned = studentJobs.filter((sj) => sj.jobId === jobId && sj.isActive).length;
    const newCount = Math.max(1, Math.max(currentAssigned, job.maxCount + delta));
    updateJob(jobId, { maxCount: newCount });
    showToast(`'${job.title}' 직업 정원이 ${newCount}명으로 조정되었습니다.`);
  };

  const handleDeleteJob = (jobId: string) => {
    const res = deleteJob(jobId);
    showToast(res.message, !res.success);
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) {
      showToast('퀘스트 제목을 입력해주세요.', true);
      return;
    }

    if (newQuestTargetType === 'specific' && newQuestTargetStudentIds.length === 0) {
      showToast('배부할 대상 학생을 1명 이상 선택해주세요.', true);
      return;
    }

    if (newQuestFrequencyType === 'recurring' && newQuestRecurringDays.length === 0) {
      showToast('반복할 요일을 1개 이상 선택해주세요.', true);
      return;
    }

    let calculatedReward = Number(newQuestReward) || 100;
    if (newQuestType === 'job') {
      if (newQuestTargetJobId) {
        const selJob = jobs.find((j) => j.id === newQuestTargetJobId);
        calculatedReward = selJob ? Math.round(selJob.weeklySalary / 5) : 100;
      } else {
        calculatedReward = 100; // 동적으로 학생별 직업 주급의 1/5이 적용됨
      }
    }

    createQuest({
      title: newQuestTitle.trim(),
      description:
        newQuestDesc.trim() ||
        (newQuestType === 'homework'
          ? '지정된 과제를 성실하게 완수합니다.'
          : newQuestType === 'reading'
          ? '독서 후 생각이나 배움을 정리합니다.'
          : '학급 역할을 성실하게 실천합니다.'),
      questType: newQuestType,
      rewardPoints: calculatedReward,
      targetJobId: newQuestType === 'job' && newQuestTargetJobId ? newQuestTargetJobId : undefined,
      statRewardType: newQuestStatType,
      statRewardAmount: Math.max(1, Number(newQuestStatAmount) || 1),
      isRecurring: newQuestFrequencyType === 'recurring',
      frequencyType: newQuestFrequencyType,
      recurringDays: newQuestFrequencyType === 'recurring' ? newQuestRecurringDays : undefined,
      targetStudentType: newQuestTargetType,
      targetStudentIds: newQuestTargetType === 'specific' ? newQuestTargetStudentIds : undefined,
      dueDate: newQuestFrequencyType === 'once' ? newQuestDueDate : undefined,
      icon: newQuestIcon || '📝',
    });

    const targetDesc =
      newQuestTargetType === 'all'
        ? '전체 학생'
        : `${newQuestTargetStudentIds.length}명의 학생`;
    const freqDesc =
      newQuestFrequencyType === 'recurring'
        ? `[${getRecurringDaysLabel(newQuestRecurringDays)}]`
        : `[단발성 ${newQuestDueDate}]`;

    showToast(`'${newQuestTitle}' 퀘스트가 ${targetDesc}에게 ${freqDesc} 등록되었습니다!`);
    setShowAddQuestModal(false);
    setNewQuestTitle('');
    setNewQuestDesc('');
    setNewQuestReward(100);
    setNewQuestType('homework');
    setNewQuestStatType('diligence');
    setNewQuestStatAmount(1);
    setNewQuestTargetJobId('');
    setNewQuestTargetType('all');
    setNewQuestTargetStudentIds([]);
    setNewQuestFrequencyType('once');
    setNewQuestRecurringDays([1, 2, 3, 4, 5]);
    setShowEmojiDropdown(false);
  };

  const handleAdjustPointsSubmit = () => {
    if (!adjustUserId) return;
    adjustStudentPoints(adjustUserId, Number(adjustAmount), adjustReason.trim() || '교사 상벌점 조정');
    showToast('포인트 조정이 반영되었습니다.');
    setAdjustUserId(null);
    setAdjustReason('');
  };

  const handleCreateAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuctionTitle.trim()) return;

    createAuction({
      title: newAuctionTitle.trim(),
      description: newAuctionDesc.trim(),
      startPrice: Number(newAuctionStartPrice),
      minBidStep: Number(newAuctionMinStep),
      durationHours: Number(newAuctionDuration),
      category: newAuctionCategory,
      icon: newAuctionIcon || '👑',
    });

    showToast(`'${newAuctionTitle}' 특권 경매가 새로 시작되었습니다!`);
    setShowAddAuctionModal(false);
    setNewAuctionTitle('');
    setNewAuctionDesc('');
  };

  const handleCloseAuction = (auctionId: string) => {
    const res = closeAuction(auctionId);
    showToast(res.message, !res.success);
  };

  const handleDeleteAuction = (auctionId: string) => {
    const res = deleteAuction(auctionId);
    showToast(res.message, !res.success);
  };

  // Shop Item Handlers
  const handleCreateShopItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    createShopItem({
      name: newShopName.trim(),
      description: newShopDesc.trim(),
      price: Number(newShopPrice),
      stock: Number(newShopStock),
      category: newShopCategory,
      icon: newShopIcon || '🎟️',
      isActive: true,
    });

    showToast(`'${newShopName}' 상품이 등록되었습니다!`);
    setShowAddShopModal(false);
    setNewShopName('');
    setNewShopDesc('');
    setNewShopPrice(200);
    setNewShopStock(10);
  };

  const handleOpenEditShopModal = (item: ShopItem) => {
    setEditingShopItem(item);
    setEditShopName(item.name);
    setEditShopDesc(item.description);
    setEditShopPrice(item.price);
    setEditShopStock(item.stock);
    setEditShopCategory(item.category);
    setEditShopIcon(item.icon);
  };

  const handleUpdateShopItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShopItem || !editShopName.trim()) return;

    updateShopItem(editingShopItem.id, {
      name: editShopName.trim(),
      description: editShopDesc.trim(),
      price: Number(editShopPrice),
      stock: Math.max(0, Number(editShopStock)),
      category: editShopCategory,
      icon: editShopIcon || '🎟️',
    });

    showToast(`'${editShopName}' 상품 정보가 수정되었습니다.`);
    setEditingShopItem(null);
  };

  const handleQuickStockAdjust = (itemId: string, delta: number) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    updateShopItem(itemId, { stock: newStock });
    showToast(`${item.name} 재고가 ${newStock}개로 변경되었습니다.`);
  };

  const handleDeleteShopItemConfirm = (item: ShopItem) => {
    setDeletingShopItemTarget(item);
  };

  const handleExecuteDeleteShopItem = () => {
    if (!deletingShopItemTarget) return;
    deleteShopItem(deletingShopItemTarget.id);
    showToast(`'${deletingShopItemTarget.name}' 상품이 삭제되었습니다.`);
    setDeletingShopItemTarget(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold transition flex items-center gap-2 ${
            toastMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
        >
          {toastMessage.isError ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-amber-50/40 border border-purple-200/80 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-3xl shadow-2xs">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-850">교사 종합 행정 통제실</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                김선생님 관리 모드
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              퀘스트 승인/반려, 주급 일괄 지급, 직업 관리(추가/삭제), 세금 정책, 상점 장부를 모두 제어합니다.
            </p>
          </div>
        </div>

        {/* Quick Bulk Pay Button */}
        <button
          onClick={handleBulkSalary}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs shadow-sm shadow-amber-500/20 transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Coins className="w-4 h-4" /> 주급 일괄 지급 & 세금 자동 정산
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'approvals', label: `퀘스트 승인 대기 (${pendingLogs.length})`, icon: CheckCircle },
          { id: 'shop_items', label: `🏪 상점 상품 관리 (${shopItems.length})`, icon: ShoppingBag },
          { id: 'seat_real_estate', label: '🪑 자리 부동산 & 배치도 관리', icon: Home },
          { id: 'auctions', label: `👑 특권 경매 관리 (${auctions.filter(a => a.status === 'ongoing').length})`, icon: Gavel },
          {
            id: 'jobs',
            label: `1인 1역 & 지원서 심사 (${jobApplications.filter((a) => a.status === 'pending').length}건 대기)`,
            icon: Briefcase,
          },
          { id: 'quests', label: `할 일(숙제) 관리 (${quests.filter((q) => !q.isArchived).length})`, icon: Plus },
          { id: 'taxes', label: '세금 정책 설정', icon: Percent },
          { id: 'shop_history', label: `상점 거래 내역 (${shopOrders.length})`, icon: History },
          { id: 'students', label: `학생 명단 & 잔액 관리 (${students.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: PENDING APPROVALS */}
      {activeAdminSubTab === 'approvals' && (
        <div className="space-y-4">
          {/* Informational Guidance Banner & Batch Settlement Status Card */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-purple-50/70 border border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h4 className="font-bold text-sm sm:text-base text-indigo-950">
                  퀘스트 승인 및 주급 정산 프로세스 안내
                </h4>
              </div>
              <p className="text-xs text-indigo-900/90 leading-relaxed">
                • <strong>스탯(능력치) 즉시 부여</strong>: 아래에서 퀘스트를 승인하면 학생의 지혜, 성실, 기여 등의 스탯이 즉시 지급됩니다.<br />
                • <strong>포인트 주급 적립</strong>: 승인된 포인트는 학생의 [예상 주급]으로 적립되며, 아래 <strong>[주급 일괄 지급 & 세금 자동 정산]</strong> 버튼을 누르면 세금을 자동 공제한 실수령액이 일괄 지급됩니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-indigo-200 text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">정산 대기 승인 퀘스트</span>
                <span className="font-mono font-black text-indigo-700 text-sm">
                  {unpaidApprovedLogs.length}건 ({unpaidApprovedPoints.toLocaleString()}P)
                </span>
              </div>

              <button
                onClick={handleBulkSalary}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Coins className="w-4 h-4 text-emerald-200" />
                <span>주급 일괄 지급 & 세금 자동 정산</span>
              </button>
            </div>
          </div>

          {/* 🌟 REORGANIZED QUEST APPROVAL QUEUE: CATEGORIZED & DATE-FILTERED WITH MINI-CALENDAR */}
          {(() => {
            // 날짜별 펜딩 건수 맵
            const pendingByDateMap: Record<string, number> = {};
            pendingLogs.forEach((l) => {
              const d = l.targetDate || l.completedAt?.split('T')[0] || '미지정';
              pendingByDateMap[d] = (pendingByDateMap[d] || 0) + 1;
            });

            // 퀘스트 종류(job, homework, reading, special) 정밀 판별 헬퍼
            const getQuestTypeForLog = (log: (typeof pendingLogs)[0]): 'job' | 'homework' | 'reading' | 'special' => {
              const q = quests.find((item) => item.id === log.questId);
              if (!q) return 'homework';
              if (q.questType === 'job' || !!q.targetJobId) return 'job';
              if (q.questType === 'reading') return 'reading';
              if (q.questType === 'special') return 'special';
              return 'homework';
            };

            // 필터링 적용 (퀘스트 유형, 수행 날짜, 학생명 검색)
            const filteredPendingLogs = pendingLogs.filter((log) => {
              const quest = quests.find((q) => q.id === log.questId);
              const student = users.find((u) => u.id === log.userId);

              // 1. 카테고리 필터
              if (approvalCategoryFilter !== 'all') {
                const logType = getQuestTypeForLog(log);
                if (logType !== approvalCategoryFilter) {
                  return false;
                }
              }

              // 2. 날짜 필터
              if (approvalSelectedDate) {
                const logDate = log.targetDate || log.completedAt?.split('T')[0];
                if (logDate !== approvalSelectedDate) {
                  return false;
                }
              }

              // 3. 학생 검색 필터
              if (approvalSearchStudent.trim()) {
                const query = approvalSearchStudent.trim().toLowerCase();
                const studentName = (student?.name || '').toLowerCase();
                const studentNum = (student?.studentNumber || '').toLowerCase();
                const studentNickname = (student?.nickname || '').toLowerCase();
                const questTitle = (quest?.title || '').toLowerCase();
                if (
                  !studentName.includes(query) &&
                  !studentNum.includes(query) &&
                  !studentNickname.includes(query) &&
                  !questTitle.includes(query)
                ) {
                  return false;
                }
              }

              return true;
            });

            // 캘린더 날짜 계산 헬퍼
            const currentYear = calendarViewMonth.getFullYear();
            const currentMonth = calendarViewMonth.getMonth();
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
            const monthPendingCount = Object.entries(pendingByDateMap).reduce((acc, [date, cnt]) => {
              if (date.startsWith(monthStr)) return acc + cnt;
              return acc;
            }, 0);

            // 퀘스트 종류별 대기 건수 집계
            const categoryCounts: Record<ApprovalCategoryFilter, number> = {
              all: pendingLogs.length,
              job: 0,
              homework: 0,
              reading: 0,
              special: 0,
            };
            pendingLogs.forEach((log) => {
              const type = getQuestTypeForLog(log);
              if (categoryCounts[type] !== undefined) {
                categoryCounts[type]++;
              }
            });

            const categoryTabs: { id: ApprovalCategoryFilter; label: string; icon: string; count: number }[] = [
              { id: 'all', label: '전체 보기', icon: '📋', count: categoryCounts.all },
              { id: 'job', label: '1인 1역 주간 직업', icon: '💼', count: categoryCounts.job },
              { id: 'homework', label: '일일 과제 & 숙제', icon: '📝', count: categoryCounts.homework },
              { id: 'reading', label: '독서 & 학습 습관', icon: '📖', count: categoryCounts.reading },
              { id: 'special', label: '특별 & 도전 퀘스트', icon: '🌟', count: categoryCounts.special },
            ];

            const isAllFilteredSelected =
              filteredPendingLogs.length > 0 &&
              filteredPendingLogs.every((l) => approvalSelectedLogIds.includes(l.id));

            const toggleSelectAll = () => {
              if (isAllFilteredSelected) {
                setApprovalSelectedLogIds([]);
              } else {
                setApprovalSelectedLogIds(filteredPendingLogs.map((l) => l.id));
              }
            };

            const toggleSelectLog = (id: string) => {
              setApprovalSelectedLogIds((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
              );
            };

            const selectedLogsList = filteredPendingLogs.filter((l) =>
              approvalSelectedLogIds.includes(l.id)
            );

            return (
              <div className="space-y-4">
                {/* 1. 상단 안내 및 종합 현황 요약 카드 */}
                <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-purple-50/70 border border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <h4 className="font-bold text-sm sm:text-base text-indigo-950">
                        퀘스트 승인 및 주급 정산 프로세스 안내
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-900/90 leading-relaxed">
                      • <strong>스탯(능력치) 즉시 부여</strong>: 퀘스트를 승인하면 지혜, 성실 등의 스탯이 즉시 학생에게 지급됩니다.<br />
                      • <strong>포인트 주급 적립</strong>: 승인된 포인트는 학생의 [예상 주급]으로 적립되며, <strong>[주급 일괄 지급 & 세금 자동 정산]</strong> 시 세금을 공제한 실수령액이 일괄 지급됩니다.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
                    <div className="px-4 py-2.5 rounded-2xl bg-white border border-indigo-200 text-center shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block">정산 대기 승인 퀘스트</span>
                      <span className="font-mono font-black text-indigo-700 text-sm">
                        {unpaidApprovedLogs.length}건 ({unpaidApprovedPoints.toLocaleString()}P)
                      </span>
                    </div>

                    <button
                      onClick={handleBulkSalary}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Coins className="w-4 h-4 text-emerald-200" />
                      <span>주급 일괄 지급 & 세금 자동 정산</span>
                    </button>
                  </div>
                </div>

                {/* 2. 대기열 메인 컨테이너: 좌측 캘린더/날짜 필터 + 우측 분류별 퀘스트 리스트 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* 좌측: 조그만 달력 및 날짜별 필터 위젯 (4 Cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* 미니 캘린더 카드 */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-600" />
                          <h4 className="font-extrabold text-sm text-slate-850">
                            {currentYear}년 {currentMonth + 1}월 대기 현황
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setCalendarViewMonth(
                                new Date(currentYear, currentMonth - 1, 1)
                              )
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                            title="이전 달"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setCalendarViewMonth(
                                new Date(currentYear, currentMonth + 1, 1)
                              )
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                            title="다음 달"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 요일 헤더 */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-100">
                        <span className="text-rose-500">일</span>
                        <span>월</span>
                        <span>화</span>
                        <span>수</span>
                        <span>목</span>
                        <span>금</span>
                        <span className="text-blue-500">토</span>
                      </div>

                      {/* 달력 날짜 그리드 */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-9" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const count = pendingByDateMap[dateStr] || 0;
                          const isSelected = approvalSelectedDate === dateStr;
                          const isToday = getTodayDateStr() === dateStr;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => {
                                if (approvalSelectedDate === dateStr) {
                                  setApprovalSelectedDate(null); // 토글 해제
                                } else {
                                  setApprovalSelectedDate(dateStr);
                                }
                              }}
                              className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white font-black shadow-xs ring-2 ring-indigo-300'
                                  : count > 0
                                  ? 'bg-amber-50 hover:bg-amber-100 text-slate-800 font-bold border border-amber-200'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                              title={`${dateStr}: ${count}건 대기 중`}
                            >
                              <span className={`text-xs ${isToday && !isSelected ? 'font-black text-indigo-600 underline underline-offset-2' : ''}`}>
                                {day}
                              </span>
                              {count > 0 && (
                                <span
                                  className={`text-[9px] leading-none px-1 rounded-full font-black ${
                                    isSelected
                                      ? 'bg-white text-indigo-700'
                                      : 'bg-amber-500 text-white'
                                  }`}
                                >
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* 날짜 선택 필터 바 */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-medium">선택 날짜:</span>
                          <span className="font-bold text-slate-800">
                            {approvalSelectedDate ? `${approvalSelectedDate} (${pendingByDateMap[approvalSelectedDate] || 0}건)` : '모든 날짜'}
                          </span>
                        </div>
                        {approvalSelectedDate && (
                          <button
                            onClick={() => setApprovalSelectedDate(null)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            전체 날짜 보기
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 날짜별 대기 건수 요약 리스트 */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>날짜별 대기 큐</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          총 {pendingLogs.length}건
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        <button
                          onClick={() => setApprovalSelectedDate(null)}
                          className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer border ${
                            approvalSelectedDate === null
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-extrabold'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 font-medium'
                          }`}
                        >
                          <span>📅 전체 날짜 일괄 보기</span>
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border text-slate-700">
                            {pendingLogs.length}건
                          </span>
                        </button>

                        {Object.entries(pendingByDateMap)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .map(([dateStr, count]) => {
                            const isSelected = approvalSelectedDate === dateStr;
                            return (
                              <button
                                key={dateStr}
                                onClick={() => setApprovalSelectedDate(dateStr)}
                                className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-xs'
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                                }`}
                              >
                                <span>{dateStr}</span>
                                <span
                                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-amber-100 text-amber-900 font-extrabold'
                                  }`}
                                >
                                  {count}건 대기
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* 우측: 퀘스트 종류별 탭 + 검색 + 일괄 승인/반려 + 대기열 목록 (8 Cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* 퀘스트 종류별 분류 탭 및 드롭다운 필터 */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 sm:p-4 shadow-xs space-y-3">
                      {/* 드롭다운 필터 + 좌우 스크롤 제어 헤더 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="text-xs font-extrabold text-slate-700 whitespace-nowrap">퀘스트 종류:</span>
                          <div className="relative flex-1 sm:w-64">
                            <select
                              value={approvalCategoryFilter}
                              onChange={(e) => setApprovalCategoryFilter(e.target.value as ApprovalCategoryFilter)}
                              className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer appearance-none"
                            >
                              {categoryTabs.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.label} ({cat.count}건)
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        {/* 빠른 전체 보기 및 좌우 탭 스크롤 버튼 */}
                        <div className="flex items-center justify-end gap-1.5">
                          {approvalCategoryFilter !== 'all' && (
                            <button
                              type="button"
                              onClick={() => setApprovalCategoryFilter('all')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition cursor-pointer"
                            >
                              전체 해제
                            </button>
                          )}
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (categoryScrollRef.current) {
                                  categoryScrollRef.current.scrollBy({ left: -160, behavior: 'smooth' });
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                              title="탭 왼쪽으로 넘기기"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (categoryScrollRef.current) {
                                  categoryScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                              title="탭 오른쪽으로 넘기기"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 가로 스크롤 탭 바 (모바일 및 데스크톱 모두 짤림 없이 부드럽게 스크롤 가능) */}
                      <div
                        ref={categoryScrollRef}
                        className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                      >
                        {categoryTabs.map((cat) => {
                          const isActive = approvalCategoryFilter === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setApprovalCategoryFilter(cat.id)}
                              className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                                isActive
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                  isActive
                                    ? 'bg-white/25 text-white'
                                    : cat.count > 0
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200 font-extrabold'
                                    : 'bg-slate-200/80 text-slate-500'
                                }`}
                              >
                                {cat.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 검색 바 & 빠른 일괄 처리 도구 모음 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="학생 이름, 번호, 퀘스트명 검색..."
                            value={approvalSearchStudent}
                            onChange={(e) => setApprovalSearchStudent(e.target.value)}
                            className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
                          />
                          {approvalSearchStudent && (
                            <button
                              onClick={() => setApprovalSearchStudent('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* 전체 선택 및 일괄 처리 버튼 */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between sm:justify-end">
                          <button
                            onClick={toggleSelectAll}
                            disabled={filteredPendingLogs.length === 0}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                          >
                            {isAllFilteredSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>
                              {isAllFilteredSelected ? '선택 해제' : '현재 목록 전체 선택'}
                            </span>
                          </button>

                          {approvalSelectedLogIds.length > 0 && (
                            <>
                              <button
                                onClick={() => handleBulkApproveFiltered(selectedLogsList)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>선택 {approvalSelectedLogIds.length}건 일괄 승인</span>
                              </button>
                              <button
                                onClick={() => handleBulkRejectFiltered(selectedLogsList)}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>일괄 반려</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 대기열 리스트 카드 */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-850">
                            대기 중인 퀘스트 제출 목록
                          </h3>
                          {approvalSelectedDate && (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                              📅 {approvalSelectedDate}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {filteredPendingLogs.length > 0 && (
                            <button
                              onClick={() => handleBulkApproveFiltered(filteredPendingLogs)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              title="현재 필터된 모든 퀘스트를 즉시 승인합니다"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>필터 목록 ({filteredPendingLogs.length}건) 전체 승인</span>
                            </button>
                          )}
                          <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            {filteredPendingLogs.length} / 총 {pendingLogs.length}건
                          </span>
                        </div>
                      </div>

                      {filteredPendingLogs.length > 0 ? (
                        <div className="space-y-3">
                          {filteredPendingLogs.map((log) => {
                            const student = users.find((u) => u.id === log.userId);
                            const quest = quests.find((q) => q.id === log.questId);
                            const dynamicReward = quest
                              ? getQuestRewardForStudent(quest, log.userId, jobs, studentJobs)
                              : 0;
                            const isSelected = approvalSelectedLogIds.includes(log.id);

                            return (
                              <div
                                key={log.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                  isSelected
                                    ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-200'
                                    : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  {/* 체크박스 */}
                                  <button
                                    onClick={() => toggleSelectLog(log.id)}
                                    className="mt-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-300" />
                                    )}
                                  </button>

                                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                                    {quest?.icon || '📝'}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-sm text-slate-800">
                                        {student?.name || student?.nickname || '학생'}
                                      </span>
                                      {student?.studentNumber && (
                                        <span className="text-xs text-slate-500 font-semibold">
                                          ({student.studentNumber})
                                        </span>
                                      )}
                                      <span className="text-xs text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                                        [{quest?.title || '퀘스트'}]
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200/70">
                                        +{dynamicReward}P 주급 적립 예정
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        수행일: {log.targetDate || log.completedAt?.split('T')[0]}
                                      </span>
                                    </div>

                                    {log.studentMemo && (
                                      <div className="text-xs text-indigo-900 mt-1.5 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 font-medium">
                                        💬 학생 메모: "{log.studentMemo}"
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => handleQuickReject(log.id)}
                                    className="px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                    title="사유 입력 없이 바로 반려"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-rose-500" /> 즉시 반려
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingLogId(log.id);
                                      setRejectReasonInput('');
                                    }}
                                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                    title="사유를 작성하여 반려 (사유는 선택 사항)"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" /> 사유 반려
                                  </button>
                                  <button
                                    onClick={() => handleApprove(log.id)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                    title="승인 시 스탯은 즉시 지급되며 포인트는 주급 정산 시 지급됩니다"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> 승인 (+{dynamicReward}P)
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                          <div className="text-4xl">🎉</div>
                          <div className="font-bold text-slate-750 text-sm">
                            {pendingLogs.length === 0
                              ? '승인 대기 중인 퀘스트가 없습니다!'
                              : '선택한 필터 조건에 해당하는 대기 퀘스트가 없습니다.'}
                          </div>
                          <p>
                            {pendingLogs.length === 0
                              ? '모든 학생의 숙제 및 직업 수행 검토가 완료되었습니다.'
                              : '다른 분류 탭을 누르거나 날짜 필터를 전체로 변경해 보세요.'}
                          </p>
                          {approvalSelectedDate && (
                            <button
                              onClick={() => setApprovalSelectedDate(null)}
                              className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer"
                            >
                              전체 날짜 보기
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 반려 모달 */}
                {rejectingLogId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                          <XCircle className="w-4 h-4" /> 퀘스트 반려 처리
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          사유 입력 선택 사항
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        반려 시 포인트는 미지급됩니다. 사유를 적지 않고 <strong>[반려 확정]</strong>을 눌러도 바로 반려 처리됩니다.
                      </p>
                      <textarea
                        rows={3}
                        placeholder="(선택 사항) 학생에게 전달할 피드백이 있다면 입력하세요. 비워두어도 반려 가능합니다."
                        value={rejectReasonInput}
                        onChange={(e) => setRejectReasonInput(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400 shadow-2xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setRejectingLogId(null);
                            setRejectReasonInput('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleReject}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                        >
                          반려 확정
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB TAB: SHOP ITEMS MANAGEMENT (ADD / EDIT / STOCK / DELETE) */}
      {activeAdminSubTab === 'shop_items' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-850">고정가 일반 상점 상품 & 재고 관리</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  총 {shopItems.length}개 상품
                </span>
                {isSupabaseConfigured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Supabase DB 연동 활성
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                상점에 진열될 상품을 직접 등록하고, 수량(재고)을 실시간으로 늘리거나 줄이고, 불필요한 상품을 삭제할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setShowAddShopModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 새 상품 등록하기
            </button>
          </div>

          {/* Quick Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-400 font-semibold">등록된 전체 상품</div>
              <div className="text-lg font-black text-slate-800 mt-0.5">{shopItems.length}종류</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <div className="text-[11px] text-emerald-600 font-semibold">판매 중 (재고 있음)</div>
              <div className="text-lg font-black text-emerald-800 mt-0.5">
                {shopItems.filter((i) => i.stock > 0).length}종류
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80">
              <div className="text-[11px] text-rose-600 font-semibold">일시 품절 (재고 0)</div>
              <div className="text-lg font-black text-rose-800 mt-0.5">
                {shopItems.filter((i) => i.stock === 0).length}종류
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
              <div className="text-[11px] text-amber-600 font-semibold">총 누적 구매 건수</div>
              <div className="text-lg font-black text-amber-800 mt-0.5">{shopOrders.length}건</div>
            </div>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems.map((item) => {
              const isOutOfStock = item.stock <= 0;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                    isOutOfStock
                      ? 'bg-slate-50/90 border-slate-200 opacity-90'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top info */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          {item.price.toLocaleString()} P
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.category === 'privilege'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : item.category === 'snack'
                              ? 'bg-pink-50 text-pink-700 border-pink-200'
                              : item.category === 'fun'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.category === 'privilege'
                            ? '특권 & 쿠폰'
                            : item.category === 'snack'
                            ? '간식'
                            : item.category === 'fun'
                            ? '재미/놀이'
                            : '학급 아이템'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-slate-850 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Stock & Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Real-time Stock Stepper */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-600 pl-1">
                        현재 재고:{' '}
                        <strong
                          className={`font-mono text-sm ${
                            isOutOfStock ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {item.stock}개
                        </strong>
                        {isOutOfStock && (
                          <span className="text-[10px] text-rose-500 font-normal ml-1">(품절)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStockAdjust(item.id, -1)}
                          disabled={item.stock <= 0}
                          title="재고 1개 감소"
                          className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-white text-slate-700 font-black text-xs border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleQuickStockAdjust(item.id, 1)}
                          title="재고 1개 증가"
                          className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleQuickStockAdjust(item.id, 5)}
                          title="재고 5개 즉시 추가"
                          className="px-2 h-7 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 flex items-center justify-center transition cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditShopModal(item)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" /> 정보/수량 수정
                      </button>
                      <button
                        onClick={() => handleDeleteShopItemConfirm(item)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition shadow-2xs cursor-pointer"
                        title="상품 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB: SEAT REAL ESTATE & CLASSROOM LAYOUT MANAGEMENT */}
      {activeAdminSubTab === 'seat_real_estate' && (
        <TeacherSeatManagement />
      )}

      {/* SUB TAB 2: JOBS MANAGEMENT (APPLICATIONS & DIRECTORY) */}
      {activeAdminSubTab === 'jobs' && (
        <div className="space-y-6">
          {/* 1. Job Applications Review Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-850">
                    📩 1인 1역 직업 지원서 심사함
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    전체 {jobApplications.length}건
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  학생들이 제출한 직업 지원서와 제안서를 심사하고 채용을 승인하세요. 완료된 지원서는 완료함에서 확인하실 수 있습니다.
                </p>
              </div>

              {/* Pending vs Completed Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setJobInboxTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                    jobInboxTab === 'pending'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>⏳ 심사 대기함</span>
                  {jobApplications.filter((a) => a.status === 'pending').length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      {jobApplications.filter((a) => a.status === 'pending').length}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                      0
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setJobInboxTab('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                    jobInboxTab === 'completed'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📁 심사 완료함</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    {jobApplications.filter((a) => a.status === 'approved' || a.status === 'rejected').length}
                  </span>
                </button>
              </div>
            </div>

            {/* Applications List */}
            {jobInboxTab === 'pending' ? (
              <div className="space-y-3">
                {jobApplications
                  .filter((a) => a.status === 'pending')
                  .map((app) => {
                    const student = users.find((u) => u.id === app.userId);
                    const targetJob = app.jobId !== 'custom' ? jobs.find((j) => j.id === app.jobId) : null;
                    const isCustom = app.jobId === 'custom';
                    const jobTitle = isCustom ? app.proposedJobTitle : targetJob?.title;
                    const jobIcon = isCustom ? app.proposedIcon || '🌟' : targetJob?.icon || '💼';

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl border transition space-y-3 bg-indigo-50/40 border-indigo-200 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                              {student?.avatarEmoji || '🧑‍🎓'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-850">{student?.name}</span>
                                <span className="text-xs text-slate-500 font-medium">({student?.studentNumber || '학생'})</span>
                                {isCustom ? (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                                    💡 신규 직업 제안
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                                    기존 직업 지원
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                신청 직업: <strong className="text-indigo-900">{jobIcon} {jobTitle}</strong>
                                {isCustom && app.proposedWeeklySalary && (
                                  <span className="text-amber-700 font-mono font-bold ml-1.5">
                                    (제안 주급: {app.proposedWeeklySalary}P)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const res = approveJobApplication(app.id, currentUser.id);
                                showToast(res.message, !res.success);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> 채용 승인
                            </button>
                            <button
                              onClick={() => {
                                setRejectingAppId(app.id);
                                setRejectAppReason('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                            >
                              반려
                            </button>
                          </div>
                        </div>

                        {/* Proposed Job Details if custom */}
                        {isCustom && app.proposedJobDescription && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                            <strong>학생 제안 업무:</strong> {app.proposedJobDescription}
                          </div>
                        )}

                        {/* Reasons & Pledges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                              <span>🎯</span> 이 직업이 우리 반에서 필요한 이유
                            </span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                              <span>💪</span> 나의 장점 및 활동 다짐
                            </span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{app.pledge}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {jobApplications.filter((a) => a.status === 'pending').length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                    <div className="text-2xl">🎉</div>
                    <div className="font-bold text-slate-700 text-sm">심사 대기 중인 지원서가 없습니다!</div>
                    <p className="text-xs text-slate-500">모든 지원서의 승인 및 반려 검토가 완료되었습니다.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {jobApplications
                  .filter((a) => a.status === 'approved' || a.status === 'rejected')
                  .map((app) => {
                    const student = users.find((u) => u.id === app.userId);
                    const targetJob = app.jobId !== 'custom' ? jobs.find((j) => j.id === app.jobId) : null;
                    const isCustom = app.jobId === 'custom';
                    const jobTitle = isCustom ? app.proposedJobTitle : targetJob?.title;
                    const jobIcon = isCustom ? app.proposedIcon || '🌟' : targetJob?.icon || '💼';

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl border transition space-y-3 bg-slate-50/70 border-slate-200/80"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                              {student?.avatarEmoji || '🧑‍🎓'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-850">{student?.name}</span>
                                <span className="text-xs text-slate-500 font-medium">({student?.studentNumber || '학생'})</span>
                                {isCustom ? (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                                    💡 신규 직업 제안
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                                    기존 직업 지원
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                신청 직업: <strong className="text-indigo-900">{jobIcon} {jobTitle}</strong> • 지원일:{' '}
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {app.status === 'approved' ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> 채용 승인 완료
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
                                ❌ 반려 처리됨
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Proposed Job Details if custom */}
                        {isCustom && app.proposedJobDescription && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                            <strong>학생 제안 업무:</strong> {app.proposedJobDescription}
                          </div>
                        )}

                        {/* Reasons & Pledges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                              <span>🎯</span> 이 직업이 우리 반에서 필요한 이유
                            </span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                              <span>💪</span> 나의 장점 및 활동 다짐
                            </span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{app.pledge}</p>
                          </div>
                        </div>

                        {app.status === 'rejected' && app.rejectReason && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <strong>반려 사유:</strong> {app.rejectReason}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {jobApplications.filter((a) => a.status === 'approved' || a.status === 'rejected').length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                    <div className="text-slate-400 text-sm">완료된 지원서가 없습니다.</div>
                    <p className="text-xs text-slate-500">승인 또는 반려 처리된 지원서가 이곳에 보관됩니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Job Directory & Student Assignment */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-850">학급 직업 목록 & 학생 배정</h3>
                <p className="text-xs text-slate-500">직업을 추가하거나 학생을 직접 배정/해제할 수 있습니다.</p>
              </div>
              <button
                onClick={() => setShowAddJobModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> 새 직업 추가
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const assignedStudents = studentJobs
                  .filter((sj) => sj.jobId === job.id && sj.isActive)
                  .map((sj) => users.find((u) => u.id === sj.userId))
                  .filter(Boolean);

                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                          {job.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-850">{job.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                              {job.category === 'cleaning' && '🧹 청소'}
                              {job.category === 'learning' && '📚 학습'}
                              {job.category === 'order' && '📢 질서'}
                              {job.category === 'environment' && '🌿 생태'}
                              {job.category === 'service' && '🤝 봉사'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{job.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditJob(job)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="직업 정보 및 정원 수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="직업 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700 font-mono font-bold">주급 {job.weeklySalary.toLocaleString()} P</span>
                        <span className="text-amber-500 font-bold">{'★'.repeat(job.difficulty)}</span>
                        
                        {/* Interactive Quota Controls */}
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[11px] text-slate-500 font-bold">정원:</span>
                          <button
                            type="button"
                            onClick={() => handleAdjustJobQuota(job.id, -1)}
                            disabled={job.maxCount <= Math.max(1, assignedStudents.length)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                            title="정원 1명 감소"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-slate-800 text-xs px-0.5">
                            {assignedStudents.length} / {job.maxCount}명
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustJobQuota(job.id, 1)}
                            className="w-5 h-5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                            title="정원 1명 증가"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Current Assigned Students with unassign button */}
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                        <span className="text-slate-400 text-[11px]">담당:</span>
                        {assignedStudents.length > 0 ? (
                          assignedStudents.map((st) => (
                            <span
                              key={st?.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700"
                            >
                              <span>{st?.avatarEmoji}</span>
                              <span>{st?.name}</span>
                              <button
                                onClick={() => st && unassignStudentJob(st.id)}
                                className="ml-1 text-slate-400 hover:text-rose-600 font-black cursor-pointer"
                                title="배정 해제"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">미배정</span>
                        )}
                      </div>

                      {/* Direct Assign Dropdown */}
                      <div className="pt-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStudentJob(e.target.value, job.id);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-bold"
                        >
                          <option value="" disabled>
                            ➕ 학생 직접 배정하기...
                          </option>
                          {users
                            .filter((u) => u.role === 'student')
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.studentNumber || '학생'})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Job Modal */}
          {showAddJobModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <form
                onSubmit={handleCreateJob}
                className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <h3 className="font-bold text-base text-slate-850">새로운 1인 1역 직업 등록</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">직업명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 칠판 도우미, 식물 집사"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">업무 설명</label>
                  <input
                    type="text"
                    placeholder="예: 매 시간 칠판을 닦고 분필 정리"
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">직업 분야(카테고리)</label>
                    <select
                      value={newJobCategory}
                      onChange={(e) => setNewJobCategory(e.target.value as Job['category'])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                    >
                      <option value="service">🤝 봉사 & 복지</option>
                      <option value="cleaning">🧹 청소 & 환경</option>
                      <option value="learning">📚 학습 & 독서</option>
                      <option value="order">📢 질서 & 알림</option>
                      <option value="environment">🌿 생태 & 식물</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-1">정원 (최대 인원)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        required
                        value={newJobMaxCount}
                        onChange={(e) => setNewJobMaxCount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs text-indigo-900 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-500 whitespace-nowrap">명</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">주급(P)</label>
                    <input
                      type="number"
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">난이도 (1~5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newJobDifficulty}
                      onChange={(e) => setNewJobDifficulty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <JobEmojiSelector
                  value={newJobIcon}
                  onChange={setNewJobIcon}
                  label="직업 이모지 아이콘 선택"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddJobModal(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-2xs hover:bg-indigo-700 cursor-pointer"
                  >
                    추가 완료
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Job Modal */}
          {editingJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <form
                onSubmit={handleUpdateJobSubmit}
                className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-base text-slate-850 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-indigo-600" />
                    <span>직업 설정 및 정원 수정</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">직업명</label>
                  <input
                    type="text"
                    required
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">업무 설명</label>
                  <input
                    type="text"
                    value={editJobDesc}
                    onChange={(e) => setEditJobDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">직업 분야</label>
                    <select
                      value={editJobCategory}
                      onChange={(e) => setEditJobCategory(e.target.value as Job['category'])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                    >
                      <option value="service">🤝 봉사 & 복지</option>
                      <option value="cleaning">🧹 청소 & 환경</option>
                      <option value="learning">📚 학습 & 독서</option>
                      <option value="order">📢 질서 & 알림</option>
                      <option value="environment">🌿 생태 & 식물</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-1">직업 정원 (명)</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditJobMaxCount((prev) => Math.max(1, prev - 1))}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        required
                        value={editJobMaxCount}
                        onChange={(e) => setEditJobMaxCount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-2 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs text-indigo-900 font-mono font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setEditJobMaxCount((prev) => Math.min(20, prev + 1))}
                        className="px-2.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">주급(P)</label>
                    <input
                      type="number"
                      value={editJobSalary}
                      onChange={(e) => setEditJobSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">난이도 (1~5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editJobDifficulty}
                      onChange={(e) => setEditJobDifficulty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <JobEmojiSelector
                  value={editJobIcon}
                  onChange={setEditJobIcon}
                  label="직업 이모지 아이콘 선택"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-2xs hover:bg-indigo-700 cursor-pointer"
                  >
                    수정 저장
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Job Application Reject Modal */}
          {rejectingAppId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="font-bold text-base text-slate-850 text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> 지원서 반려 사유 입력
                </h3>
                <p className="text-xs text-slate-500">학생에게 전달할 반려 피드백을 입력해 주세요.</p>
                <textarea
                  rows={3}
                  placeholder="예: 정원 초과로 인해 다른 학생이 배정되었습니다. 다음 기회에 지원해 주세요!"
                  value={rejectAppReason}
                  onChange={(e) => setRejectAppReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectingAppId(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      const res = rejectJobApplication(rejectingAppId, currentUser.id, rejectAppReason.trim());
                      showToast(res.message, !res.success);
                      setRejectingAppId(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                  >
                    반려 확정
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: QUESTS MANAGEMENT */}
      {activeAdminSubTab === 'quests' && (() => {
        const activeQuests = quests.filter((q) => !q.isArchived);
        const archivedQuests = quests.filter((q) => q.isArchived);
        const todayStr = getTodayDateStr();

        return (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Header & Sub Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-bold text-base text-slate-850 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> 숙제 & 할 일 퀘스트 등록·완료 관리
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  단발성 과제나 정기 퀘스트를 관리하고, 마감/삭제된 퀘스트는 학생 완료 기록을 보존하며 완료함에 보관합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Switcher Pills */}
                <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setQuestSubTab('active')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                      questSubTab === 'active'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    진행 중인 퀘스트 ({activeQuests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestSubTab('archived')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                      questSubTab === 'archived'
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    완료 퀘스트함 ({archivedQuests.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuestModal(true);
                    setShowEmojiDropdown(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> 새 퀘스트 등록
                </button>
              </div>
            </div>

            {/* TAB 1: ACTIVE QUESTS */}
            {questSubTab === 'active' && (
              <div className="space-y-4">
                {activeQuests.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-3">
                      📝
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">현재 진행 중인 퀘스트가 없습니다</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      상단의 [새 퀘스트 등록] 버튼을 눌러 학생들에게 숙제나 1인 1역 할 일을 부여해보세요.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeQuests.map((quest) => {
                      const isRecurring =
                        quest.frequencyType === 'recurring' ||
                        (quest.frequencyType === undefined && quest.isRecurring);
                      const isOneTime = quest.frequencyType === 'once' || (!quest.isRecurring && !!quest.dueDate);
                      const freqLabel = isRecurring
                        ? getRecurringDaysLabel(quest.recurringDays)
                        : `마감: ${quest.dueDate || '단발성'}`;
                      const isSpecific = quest.targetStudentType === 'specific';
                      const targetStudentCount = quest.targetStudentIds?.length || 0;
                      const targetStudentNames = quest.targetStudentIds
                        ?.map((id) => users.find((u) => u.id === id)?.name)
                        .filter(Boolean)
                        .join(', ');

                      // Completed logs for this quest
                      const approvedLogs = questLogs.filter((l) => l.questId === quest.id && l.status === 'approved');
                      const approvedStudentIds = Array.from(new Set(approvedLogs.map((l) => l.userId)));
                      const pendingLogsForQuest = questLogs.filter((l) => l.questId === quest.id && l.status === 'pending');
                      const isPastDue = isOneTime && quest.dueDate && quest.dueDate < todayStr;

                      return (
                        <div
                          key={quest.id}
                          className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-indigo-200/80 transition flex flex-col justify-between gap-3.5 shadow-2xs group"
                        >
                          <div>
                            {/* Top row: Icon, title, points, and delete button */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                                  {quest.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold text-sm text-slate-850 truncate">{quest.title}</h4>
                                    {quest.questType === 'job' ? (
                                      <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-200/80 flex items-center gap-1">
                                        <Briefcase className="w-3 h-3 text-indigo-600" />
                                        {quest.targetJobId
                                          ? `+${quest.rewardPoints} P (직업 주급 1/5)`
                                          : `각 직업 주급의 1/5 자동 적용`}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200/80">
                                        +{quest.rewardPoints} P
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {quest.description}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setDeletingQuestTarget(quest)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                                title="퀘스트 삭제 / 완료 보관"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Past Due Notification Banner */}
                            {isPastDue && (
                              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-800 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>마감일({quest.dueDate})이 지났습니다.</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    archiveQuest(quest.id);
                                    showToast(`'${quest.title}' 퀘스트가 완료 퀘스트함으로 보관되었습니다.`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition shrink-0 cursor-pointer"
                                >
                                  완료함으로 이동
                                </button>
                              </div>
                            )}

                            {/* Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/70 text-xs">
                              {/* Frequency Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] border ${
                                  isRecurring
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {isRecurring ? <RotateCw className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                {isRecurring ? `반복: ${freqLabel}` : `단발: ${freqLabel}`}
                              </span>

                              {/* Target Student Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] border ${
                                  isSpecific
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                                title={isSpecific && targetStudentNames ? `배부 대상: ${targetStudentNames}` : '학급 전체 대상'}
                              >
                                <Users className="w-3 h-3" />
                                {isSpecific ? `선택 학생 (${targetStudentCount}명)` : '전체 학생 배부'}
                              </span>

                              {/* Stat Bonus */}
                              {quest.statRewardType && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium text-[11px] bg-slate-100 text-slate-600">
                                  <Award className="w-3 h-3 text-slate-400" />
                                  {quest.statRewardType === 'wisdom'
                                    ? `지혜 +${quest.statRewardAmount ?? 1}`
                                    : quest.statRewardType === 'contribution'
                                    ? `기여 +${quest.statRewardAmount ?? 1}`
                                    : quest.statRewardType === 'frugality'
                                    ? `절약 +${quest.statRewardAmount ?? 1}`
                                    : quest.statRewardType === 'credit'
                                    ? `신용 +${quest.statRewardAmount ?? 1}`
                                    : `성실 +${quest.statRewardAmount ?? 1}`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Completion & Student Status Footer */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 완료: {approvedStudentIds.length}명
                              </span>
                              {pendingLogsForQuest.length > 0 && (
                                <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                                  심사대기 {pendingLogsForQuest.length}건
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setDeletingQuestTarget(quest)}
                              className="text-[11px] text-slate-400 hover:text-slate-700 font-medium transition cursor-pointer flex items-center gap-1"
                            >
                              <Archive className="w-3 h-3" /> 완료 보관 / 삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ARCHIVED QUESTS (완료 퀘스트함) */}
            {questSubTab === 'archived' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
                  <FolderArchive className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-900 leading-relaxed">
                    <p className="font-bold">📁 완료 퀘스트 보관함 안내</p>
                    <p className="text-purple-800/90 mt-0.5">
                      단발성 과제가 마감되었거나 교사가 삭제 처리한 퀘스트가 안전하게 보관되는 곳입니다.
                      <strong> 교사가 퀘스트를 삭제했어도 학생들이 완료했던 수행 기록, 승인 내역 및 지급 포인트는 완벽히 보존됩니다.</strong>
                    </p>
                  </div>
                </div>

                {archivedQuests.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mx-auto mb-3">
                      📂
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">완료 퀘스트함이 비어 있습니다</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      진행 중인 퀘스트 목록에서 단발성 과제를 삭제하거나 완료 보관하면 이곳으로 안전하게 모입니다.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedQuests.map((quest) => {
                      const approvedLogs = questLogs.filter((l) => l.questId === quest.id && l.status === 'approved');
                      const approvedStudentIds = Array.from(new Set(approvedLogs.map((l) => l.userId)));
                      const totalPointsPaid = approvedLogs.length * quest.rewardPoints;
                      const archivedDateStr = quest.archivedAt
                        ? new Date(quest.archivedAt).toLocaleDateString('ko-KR')
                        : '보관됨';

                      return (
                        <div
                          key={quest.id}
                          className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between gap-3.5 shadow-2xs opacity-95"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0 grayscale-30 shadow-2xs">
                                  {quest.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">{quest.title}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                                      완료 보관 ({archivedDateStr})
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {quest.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Historical completion record pills */}
                            <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                                  완료 학생: {approvedStudentIds.length}명 ({approvedLogs.length}회 인정)
                                </span>
                                <span className="font-mono font-bold text-amber-700 text-xs">
                                  총 {totalPointsPaid.toLocaleString()} P 지급됨
                                </span>
                              </div>

                              {approvedStudentIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {approvedStudentIds.map((sId) => {
                                    const sUser = users.find((u) => u.id === sId);
                                    return (
                                      <span
                                        key={sId}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                                      >
                                        <span>{sUser?.avatar || '👤'}</span>
                                        <span>{sUser?.name || '학생'}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Restore or Permanent Delete buttons */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                restoreQuest(quest.id);
                                showToast(`'${quest.title}' 퀘스트가 다시 진행 중으로 복원되었습니다.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> 다시 진행하기 (복원)
                            </button>

                            <button
                              type="button"
                              onClick={() => setPermanentDeleteTarget(quest)}
                              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-medium transition flex items-center gap-1 cursor-pointer"
                              title="영구 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> 영구 삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal: Confirm Quest Deletion & Moving to Archive */}
            {deletingQuestTarget && (() => {
              const approvedLogs = questLogs.filter((l) => l.questId === deletingQuestTarget.id && l.status === 'approved');
              const approvedCount = new Set(approvedLogs.map((l) => l.userId)).size;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-850">퀘스트 삭제 (완료함 보관)</h3>
                        <p className="text-xs text-slate-500">단발성 과제 종료 또는 퀘스트 목록 정리</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <span className="text-2xl">{deletingQuestTarget.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-850 truncate">{deletingQuestTarget.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">보상: +{deletingQuestTarget.rewardPoints} P</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p>
                          삭제 시 <strong>학생들의 오늘의 할 일 및 퀘스트 달력</strong>에서 더 이상 나타나지 않습니다.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p>
                          <strong>기존 완료 기록({approvedCount}명 완료)과 지급된 포인트</strong>는 사라지지 않고 <strong>'완료 퀘스트함'</strong>에 100% 안전하게 보존됩니다.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDeletingQuestTarget(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          archiveQuest(deletingQuestTarget.id);
                          showToast(`'${deletingQuestTarget.title}' 퀘스트가 삭제되어 완료 퀘스트함으로 이동되었습니다.`);
                          setDeletingQuestTarget(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition cursor-pointer"
                      >
                        삭제 및 완료함 이동
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal: Confirm Permanent Deletion */}
            {permanentDeleteTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-rose-700">퀘스트 영구 삭제</h3>
                      <p className="text-xs text-slate-500">완료 보관함에서도 완전히 제거</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    정말로 <strong>'{permanentDeleteTarget.title}'</strong> 퀘스트를 데이터베이스에서 영구 삭제하시겠습니까?
                    이 작업은 되돌릴 수 없습니다.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPermanentDeleteTarget(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteQuest(permanentDeleteTarget.id, true);
                        showToast('퀘스트가 영구 삭제되었습니다.');
                        setPermanentDeleteTarget(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition cursor-pointer"
                    >
                      영구 삭제 진행
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Quest Modal */}
            {showAddQuestModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
                <form
                  onSubmit={handleCreateQuest}
                  className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg">
                        {newQuestIcon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-850">새로운 숙제 & 할 일 퀘스트 등록</h3>
                        <p className="text-xs text-slate-500">배부 대상 학생, 반복 주기, 이모지를 선택하여 발행하세요.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1. Basic Info: Title & Description */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        퀘스트 제목 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 사회 3단원 요약 노트 정리 및 채점"
                        value={newQuestTitle}
                        onChange={(e) => setNewQuestTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-400 py-0.5">빠른 추천:</span>
                        {[
                          { title: '수학 익힘책 42~45쪽 풀기', icon: '📐', type: 'homework' as const },
                          { title: '아침 독서 20분 & 한 줄 독후감', icon: '📖', type: 'reading' as const },
                          { title: '오늘의 1인 1역 직업 실천', icon: '💼', type: 'job' as const },
                          { title: '교실 바닥 쓰레기 5개 줍기', icon: '🧹', type: 'special' as const },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewQuestTitle(preset.title);
                              setNewQuestIcon(preset.icon);
                              setNewQuestType(preset.type);
                            }}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition cursor-pointer"
                          >
                            {preset.icon} {preset.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">설명 및 수행 기준</label>
                      <input
                        type="text"
                        placeholder="예: 핵심 단어 3개 이상 포함하여 배움공책에 정리"
                        value={newQuestDesc}
                        onChange={(e) => setNewQuestDesc(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* 2. Type, Points, & Emoji Selector Dropdown */}
                  <div className={`grid gap-3.5 ${newQuestType === 'job' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">과제 분류</label>
                      <select
                        value={newQuestType}
                        onChange={(e) => {
                          const val = e.target.value as Quest['questType'];
                          setNewQuestType(val);
                          if (val === 'job') {
                            setNewQuestIcon('💼');
                            setNewQuestStatType('contribution');
                            setNewQuestStatAmount(1);
                            if (newQuestTargetJobId) {
                              const selJob = jobs.find((j) => j.id === newQuestTargetJobId);
                              if (selJob) {
                                setNewQuestReward(Math.round(selJob.weeklySalary / 5));
                              } else {
                                setNewQuestReward(100);
                              }
                            } else {
                              setNewQuestTargetJobId('');
                              setNewQuestReward(100);
                            }
                          } else {
                            if (val === 'homework') {
                              setNewQuestIcon('📝');
                              setNewQuestReward(100);
                              setNewQuestStatType('diligence');
                              setNewQuestStatAmount(1);
                            } else if (val === 'reading') {
                              setNewQuestIcon('📖');
                              setNewQuestReward(100);
                              setNewQuestStatType('wisdom');
                              setNewQuestStatAmount(1);
                            } else if (val === 'special') {
                              setNewQuestIcon('🌟');
                              setNewQuestReward(150);
                              setNewQuestStatType('contribution');
                              setNewQuestStatAmount(1);
                            }
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="homework">📝 배움 / 숙제</option>
                        <option value="reading">📖 독서 / 생각</option>
                        <option value="job">💼 1인 1역 / 직업 (주급 연동)</option>
                        <option value="special">🌟 자율 / 특별 공헌</option>
                      </select>
                    </div>

                    {newQuestType !== 'job' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">보상 포인트(P)</label>
                        </div>
                        <input
                          type="number"
                          min={10}
                          step={10}
                          value={newQuestReward}
                          onChange={(e) => setNewQuestReward(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 font-bold"
                        />
                      </div>
                    )}

                    {/* Emoji Selector with Dropdown */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-700 mb-1">퀘스트 이모지</label>
                      <button
                        type="button"
                        onClick={() => setShowEmojiDropdown((prev) => !prev)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between hover:bg-slate-100 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{newQuestIcon}</span>
                          <span className="font-semibold">이모지 선택</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showEmojiDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Emoji Dropdown Palette */}
                      {showEmojiDropdown && (
                        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                            <span>아이콘 드롭다운 팔레트</span>
                            <button
                              type="button"
                              onClick={() => setShowEmojiDropdown(false)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                            >
                              닫기 ✕
                            </button>
                          </div>

                          <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                            {QUEST_EMOJI_CATEGORIES.map((cat, cIdx) => (
                              <div key={cIdx} className="space-y-1">
                                <div className="text-[10px] font-bold text-slate-400">{cat.categoryName}</div>
                                <div className="grid grid-cols-6 gap-1">
                                  {cat.emojis.map((item, eIdx) => (
                                    <button
                                      key={eIdx}
                                      type="button"
                                      onClick={() => {
                                        setNewQuestIcon(item.emoji);
                                        setShowEmojiDropdown(false);
                                      }}
                                      title={item.label}
                                      className={`p-1.5 rounded-xl text-lg hover:scale-115 transition text-center cursor-pointer ${
                                        newQuestIcon === item.emoji
                                          ? 'bg-indigo-100 ring-2 ring-indigo-400'
                                          : 'hover:bg-slate-100'
                                      }`}
                                    >
                                      {item.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Direct Emoji Input */}
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 shrink-0">직접 입력:</span>
                            <input
                              type="text"
                              value={newQuestIcon}
                              onChange={(e) => setNewQuestIcon(e.target.value)}
                              maxLength={4}
                              className="w-14 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2-1. Job Quest Specific Settings: Target Job & Automatic 1/5 Salary calculation */}
                  {newQuestType === 'job' && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-indigo-600" /> 1인 1역 직업 연동 및 주급 1/5 자동 보상 계산
                        </label>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900">
                          자동 산정 시스템
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-indigo-900 mb-1">
                            연동 대상 직업 선택
                          </label>
                          <select
                            value={newQuestTargetJobId}
                            onChange={(e) => {
                              const jobId = e.target.value;
                              setNewQuestTargetJobId(jobId);
                              if (jobId === '') {
                                // 'all' jobs: each student gets 1/5th of their own job's salary dynamically!
                                setNewQuestReward(100);
                              } else {
                                const selectedJob = jobs.find((j) => j.id === jobId);
                                if (selectedJob) {
                                  const oneFifth = Math.round(selectedJob.weeklySalary / 5);
                                  setNewQuestReward(oneFifth);
                                  if (!newQuestTitle || newQuestTitle === '오늘의 1인 1역 직업 수행') {
                                    setNewQuestTitle(`[${selectedJob.title}] 일일 역할 수행`);
                                  }
                                }
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs text-indigo-950 focus:outline-none focus:border-indigo-500 font-semibold"
                          >
                            <option value="">🌟 모든 1인 1역 직업 (각 학생의 직업 주급의 1/5로 각자 자동 적용)</option>
                            {jobs.map((j) => (
                              <option key={j.id} value={j.id}>
                                {j.icon} {j.title} (주급 {j.weeklySalary}P ➡️ 일일 보상 {Math.round(j.weeklySalary / 5)}P)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col justify-center bg-white/90 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                          {newQuestTargetJobId ? (
                            (() => {
                              const targetJob = jobs.find((j) => j.id === newQuestTargetJobId);
                              return (
                                <div>
                                  <div className="font-bold flex items-center gap-1">
                                    <span>{targetJob?.icon}</span>
                                    <span>{targetJob?.title}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 mt-1">
                                    설정 주급: <strong className="font-mono text-indigo-700">{targetJob?.weeklySalary}P</strong> ÷ 5일 ={' '}
                                    <strong className="font-mono text-indigo-700 font-bold">
                                      일일 {Math.round((targetJob?.weeklySalary || 500) / 5)}P
                                    </strong>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div>
                              <div className="font-bold text-indigo-900">✨ 학생별 개인 직업 주급 1/5 자동 적용</div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                학생이 맡은 직업의 주급에 맞춰 <strong>승인 및 주급 정산 시 1/5 포인트</strong>가 각자 다르게 자동 계산됩니다.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2-2. Stat & EXP Reward Setting */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" /> 성장 스탯 & 경험치(EXP) 보상 설정
                      </label>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                        스탯 성장 연동
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-amber-900 mb-1">
                          보상 지급 스탯 종류
                        </label>
                        <select
                          value={newQuestStatType}
                          onChange={(e) => setNewQuestStatType(e.target.value as StatKey)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 focus:outline-none focus:border-amber-500 font-semibold"
                        >
                          <option value="diligence">⚡ 성실 (과제/배움 기본)</option>
                          <option value="contribution">🤝 기여 (직업/특별공헌 기본)</option>
                          <option value="wisdom">📖 지혜 (독서/생각 기본)</option>
                          <option value="frugality">💰 절약 (소비 절제)</option>
                          <option value="credit">⚖️ 신용 (신뢰/세금)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-900 mb-1">
                          지급 스탯(경험치) 수치
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={newQuestStatAmount}
                            onChange={(e) => setNewQuestStatAmount(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 font-bold focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-xs font-bold text-amber-800 shrink-0">EXP (점)</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-800/80 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/50">
                      💡 <strong>기본 규칙 안내</strong>: 배움/숙제(성실 +1), 직업/특별공헌(기여 +1), 독서/생각(지혜 +1). 여기서 원하는 스탯과 경험치를 커스텀 변경할 수 있습니다.
                    </div>
                  </div>

                  {/* 3. 과제 주기 / 반복 설정 (단발성 vs 요일 반복) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-indigo-600" /> 과제 주기 및 반복 설정
                      </label>
                    </div>

                    {/* Toggle buttons for Once vs Recurring */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQuestFrequencyType('once')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                          newQuestFrequencyType === 'once'
                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-400 shadow-2xs text-indigo-950 font-bold'
                            : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <Calendar className={`w-4 h-4 ${newQuestFrequencyType === 'once' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">📌 단발성 과제 (일회성)</div>
                          <div className="text-[10px] text-slate-500 font-normal">특정 일자 지정 또는 1회성 마감 과제</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewQuestFrequencyType('recurring')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                          newQuestFrequencyType === 'recurring'
                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-400 shadow-2xs text-indigo-950 font-bold'
                            : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <RotateCw className={`w-4 h-4 ${newQuestFrequencyType === 'recurring' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">🔁 요일 반복 과제</div>
                          <div className="text-[10px] text-slate-500 font-normal">매주 선택한 요일마다 반복되는 과제</div>
                        </div>
                      </button>
                    </div>

                    {/* If Once: Date Selector */}
                    {newQuestFrequencyType === 'once' && (
                      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 shrink-0">과제 수행일(마감일):</span>
                        <input
                          type="date"
                          value={newQuestDueDate}
                          onChange={(e) => setNewQuestDueDate(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[11px] text-slate-400">지정된 날짜에만 학생 달력 및 할 일 목록에 노출됩니다.</span>
                      </div>
                    )}

                    {/* If Recurring: Weekday multi-selection */}
                    {newQuestFrequencyType === 'recurring' && (
                      <div className="pt-2 space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700">반복할 요일 복수 선택:</span>
                          {/* Quick Weekday Presets */}
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setNewQuestRecurringDays([1, 2, 3, 4, 5])}
                              className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold cursor-pointer"
                            >
                              평일 매일(월~금)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewQuestRecurringDays([0, 1, 2, 3, 4, 5, 6])}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                            >
                              매일(월~일)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewQuestRecurringDays([1, 3, 5])}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                            >
                              월/수/금
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewQuestRecurringDays([2, 4])}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
                            >
                              화/목
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewQuestRecurringDays([6, 0])}
                              className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold cursor-pointer"
                            >
                              주말(토/일)
                            </button>
                          </div>
                        </div>

                        {/* Day of week chips */}
                        <div className="grid grid-cols-7 gap-1.5">
                          {WEEKDAYS.map((day) => {
                            const isSelected = newQuestRecurringDays.includes(day.index);
                            const isSun = day.index === 0;
                            const isSat = day.index === 6;

                            return (
                              <button
                                key={day.index}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setNewQuestRecurringDays((prev) => prev.filter((d) => d !== day.index));
                                  } else {
                                    setNewQuestRecurringDays((prev) => [...prev, day.index]);
                                  }
                                }}
                                className={`py-2 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                } ${!isSelected && isSun ? 'text-rose-500' : ''} ${!isSelected && isSat ? 'text-blue-500' : ''}`}
                              >
                                {day.name}
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium pt-1">
                          선택된 반복 요일: <strong className="text-indigo-700">{getRecurringDaysLabel(newQuestRecurringDays)}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. 배부 대상 학생 선택 (전체 학생 vs 특정 학생 선택) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> 배부 대상 학생 선택
                    </label>

                    {/* Mode Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewQuestTargetType('all');
                          setNewQuestTargetStudentIds([]);
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                          newQuestTargetType === 'all'
                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-400 shadow-2xs text-indigo-950 font-bold'
                            : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <Users className={`w-4 h-4 ${newQuestTargetType === 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">🌟 전체 학생에게 배부 (기본)</div>
                          <div className="text-[10px] text-slate-500 font-normal">학급의 모든 학생(총 {students.length}명)에게 일괄 발행</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewQuestTargetType('specific');
                          if (newQuestTargetStudentIds.length === 0 && students.length > 0) {
                            setNewQuestTargetStudentIds([students[0].id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                          newQuestTargetType === 'specific'
                            ? 'bg-white border-indigo-500 ring-2 ring-indigo-400 shadow-2xs text-indigo-950 font-bold'
                            : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 ${newQuestTargetType === 'specific' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">👤 특정 학생 선택 배부</div>
                          <div className="text-[10px] text-slate-500 font-normal">선택한 개별 학생 또는 소그룹에게만 부여</div>
                        </div>
                      </button>
                    </div>

                    {/* If Specific: Student Picker Grid */}
                    {newQuestTargetType === 'specific' && (
                      <div className="pt-2 space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            대상 학생 목록 ({newQuestTargetStudentIds.length} / {students.length}명 선택됨)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setNewQuestTargetStudentIds(students.map((s) => s.id))}
                              className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold cursor-pointer"
                            >
                              모두 선택
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewQuestTargetStudentIds([])}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
                            >
                              모두 해제
                            </button>
                          </div>
                        </div>

                        {/* Student Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                          {students.map((student) => {
                            const isSelected = newQuestTargetStudentIds.includes(student.id);

                            return (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setNewQuestTargetStudentIds((prev) => prev.filter((id) => id !== student.id));
                                  } else {
                                    setNewQuestTargetStudentIds((prev) => [...prev, student.id]);
                                  }
                                }}
                                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400 text-indigo-950 font-bold'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="text-base">{student.avatarEmoji}</div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold truncate">{student.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">#{student.studentNumber}</div>
                                </div>
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {newQuestTargetStudentIds.length === 0 && (
                          <p className="text-[11px] text-rose-500 font-semibold">
                            ⚠️ 배부할 학생을 1명 이상 선택해야 합니다.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      퀘스트 등록 완료
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      })()}

      {/* SUB TAB 4: TAXES */}
      {activeAdminSubTab === 'taxes' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                  ⚖️
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-850">
                  학급 세금 및 공제 정책 설정
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                주급 정산 시 자동 공제될 학급 세금 정책을 실시간으로 추가, 수정, 삭제 및 활성화/비활성화할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddTaxModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
              >
                <Plus className="w-4 h-4" /> 새 세금 정책 추가
              </button>
            </div>
          </div>

          {/* Quick Simulation & Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/40 border border-slate-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">📊 등록된 세금 정책</span>
              <div className="text-xl font-black font-mono text-slate-850">
                {taxSettings.length}개 <span className="text-xs font-normal text-slate-500">({taxSettings.filter(t => t.isActive).length}개 활성)</span>
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-[11px] font-bold text-slate-500">💡 기준 주급 (500P) 시뮬레이션</span>
              <div className="text-xl font-black font-mono text-rose-600">
                -{taxSettings.filter(t => t.isActive).reduce((sum, t) => {
                  if (t.id === 'tax-seat') return sum;
                  if (t.taxType === 'percent') return sum + Math.round(500 * (t.value / 100));
                  return sum + t.value;
                }, 0).toLocaleString()} P
              </div>
              <span className="text-[10px] text-slate-400 block">학급세 공제액 (자리세 별도)</span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-[11px] font-bold text-slate-500">⚡ 실시간 동기화 상태</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase 양방향 실시간 연동 중</span>
              </div>
              <span className="text-[10px] text-slate-400 block">수정 즉시 학생 캐릭터에 반영</span>
            </div>
          </div>

          {/* Tax Cards Grid */}
          {taxSettings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxSettings.map((tax) => {
                const sampleDeduction = tax.taxType === 'percent' ? Math.round(500 * (tax.value / 100)) : tax.value;

                return (
                  <div
                    key={tax.id}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                      tax.isActive
                        ? 'bg-white border-slate-200 shadow-sm hover:border-rose-300'
                        : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-850 leading-snug">
                            {tax.name}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                              tax.taxType === 'percent'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {tax.value}
                            {tax.taxType === 'percent' ? '% 소득세율' : 'P 고정 정액'}
                          </span>
                        </div>

                        {/* Active Toggle Switch */}
                        <button
                          onClick={() => updateTaxSetting(tax.id, { isActive: !tax.isActive })}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                            tax.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={tax.isActive ? '클릭 시 비활성화' : '클릭 시 활성화'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tax.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                          <span>{tax.isActive ? '적용 중' : '비활성'}</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                        {tax.description}
                      </p>

                      {/* Quick Inline Value Input & Calculation */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">세율/금액 빠른 변경</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {tax.taxType === 'percent' ? '500P 기준 ' + sampleDeduction + 'P 공제' : '주급 당 ' + tax.value + 'P'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={tax.taxType === 'percent' ? 100 : 10000}
                            value={tax.value}
                            onChange={(e) => updateTaxSetting(tax.id, { value: Number(e.target.value) })}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                          <span className="text-xs font-bold text-slate-600 shrink-0">
                            {tax.taxType === 'percent' ? '%' : 'P'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditTax(tax)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>상세 수정</span>
                      </button>
                      <button
                        onClick={() => setDeletingTaxTarget(tax)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        title="세금 정책 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl mx-auto">
                🏛️
              </div>
              <div className="font-extrabold text-slate-800 text-base">현재 등록된 세금 정책이 없습니다.</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                새로운 세금 정책을 등록하여 주급 정산 시 공제될 학급 기금 및 세금을 자유롭게 운영하세요.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAddTaxModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" /> 새 세금 정책 등록하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 5: SHOP ORDERS HISTORY */}
      {activeAdminSubTab === 'shop_history' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-850">학생 상점 구매 및 즉시 사용 기록 장부</h3>
            <span className="text-xs text-slate-500">{shopOrders.length}건 기록</span>
          </div>

          {shopOrders.length > 0 ? (
            <div className="space-y-2">
              {shopOrders.map((order) => {
                const student = users.find((u) => u.id === order.userId);
                return (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                        🛒
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {student?.name} ({student?.studentNumber}) 학생 -{' '}
                          <span className="text-pink-700 font-bold">{order.itemName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          구매일시: {new Date(order.purchasedAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-700">
                        {order.paidPrice.toLocaleString()} P
                      </span>
                      <div className="text-[10px] text-emerald-700 font-semibold">즉시 사용 처리됨</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              아직 학생들의 상점 구매 내역이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 6: STUDENTS ROSTER & POINT ADJUST */}
      {activeAdminSubTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-850">학생 화폐 잔액 & 수기 상벌점 조정</h3>
                <p className="text-xs text-slate-500">특별 기여 포인트를 주거나 벌점을 부과할 수 있습니다.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map((student) => {
                const studentJobList = getStudentJobs ? getStudentJobs(student.id) : [];
                return (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${student.avatarColor} flex items-center justify-center text-xl shadow-2xs shrink-0`}>
                        {student.avatarEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-850 truncate">
                          {student.name} #{student.studentNumber}
                        </div>
                        <div
                          className={`text-xs font-mono font-bold ${
                            student.points < 0 ? 'text-rose-600' : 'text-amber-700'
                          }`}
                        >
                          {student.points.toLocaleString()} P
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {studentJobList.length === 0
                            ? '현재 무직'
                            : studentJobList.map((j) => `${j.icon} ${j.title}`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setAdjustUserId(student.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer shrink-0 ml-2"
                    >
                      조정
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Reset Section for New Semester / Testing */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-rose-700 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>학급 경제 데이터 클린 초기화 (신학기 시작)</span>
                  {economyResetDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      📅 최근 초기화 기준일: {economyResetDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  이전 테스트로 발생한 모든 전자 통장 거래 기록, 퀘스트 승인 내역, 상점 주문 내역을 말끔히 비우고 모든 학생의 포인트를 초기값(500P) 및 5대 스탯을 1로 재설정합니다.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-1.5 inline-block">
                  💡 <strong>절약 스탯 자동 적립 규칙:</strong> 데이터 전체 초기화가 실행된 날짜({economyResetDate || '기준일'}) 이후부터 학생들이 상점 상품을 구매하지 않은 날마다 절약 스탯이 <strong>매일 +1씩 자동 누적</strong>됩니다.
                </div>
              </div>

              <button
                onClick={() => setShowResetConfirmModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-center"
              >
                <RotateCcw className="w-4 h-4" />
                <span>데이터 전체 초기화 실행</span>
              </button>
            </div>
          </div>

          {/* Adjust Dialog */}
          {adjustUserId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="font-bold text-base text-slate-850">
                  포인트 수기 조정 ({users.find((u) => u.id === adjustUserId)?.name} 학생)
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    조정 금액 (+입금, -차감)
                  </label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">사유</label>
                  <input
                    type="text"
                    placeholder="예: 학급 환경 미화 공헌 상점, 지각 벌점 등"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setAdjustUserId(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAdjustPointsSubmit}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-2xs cursor-pointer"
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Confirmation Modal */}
          {showResetConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-850">학급 데이터 전체 초기화</h3>
                    <p className="text-xs text-rose-600 font-bold">이 작업은 되돌릴 수 없습니다.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
                  <p className="font-bold">초기화 시 다음 데이터가 삭제 및 리셋됩니다:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>모든 전자 통장 거래 내역 (입출금 로그) 초기화</li>
                    <li>모든 학생 포인트 기본값(500P) 및 5대 스탯(각 1)으로 재설정</li>
                    <li>퀘스트 신청 및 승인 내역 초기화</li>
                    <li>상점 구매 주문 내역 초기화</li>
                    <li>연동된 Supabase DB 테이블 내역 동기화 삭제</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    disabled={isResetting}
                    onClick={() => setShowResetConfirmModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true);
                      try {
                        await resetClassroomEconomy();
                        showToast('학급 경제 데이터가 깨끗하게 초기화되었습니다! (학생 기본 500P / 스탯 1)');
                        setShowResetConfirmModal(false);
                      } catch (err) {
                        showToast('초기화 중 오류가 발생했습니다.');
                      } finally {
                        setIsResetting(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    {isResetting ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>초기화 진행 중...</span>
                      </>
                    ) : (
                      <span>네, 모두 초기화합니다</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB TAB 7: AUCTION MANAGEMENT */}
      {activeAdminSubTab === 'auctions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Gavel className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-850">학급 특권 경매 등록 및 통제</h3>
                {isSupabaseConfigured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Supabase DB 연동 활성
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                선생님과의 1:1 점심 식사, 독점 DJ 선곡권, 자리 자유 선택권 등 학생들의 학습 동기를 자극하는 희귀 특권을 경매로 등록합니다.
              </p>
            </div>

            <button
              onClick={() => setShowAddAuctionModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm shadow-amber-500/20 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 새 특권 경매 등록하기
            </button>
          </div>

          {/* Ongoing Auctions List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-850">진행 중인 경매 리스트</h4>
              <span className="text-xs text-slate-400">
                {auctions.filter((a) => a.status === 'ongoing').length}건 진행 중
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auctions
                .filter((a) => a.status === 'ongoing')
                .map((auction) => {
                  const bidder = users.find((u) => u.id === auction.currentHighestBidderId);
                  const endsAtDate = new Date(auction.endsAt);
                  const isExpired = endsAtDate.getTime() < Date.now();

                  return (
                    <div
                      key={auction.id}
                      className="p-5 rounded-3xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl">
                            {auction.icon}
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-900 block font-mono">
                              현재 최고: {auction.currentHighestBid.toLocaleString()} P
                            </span>
                            <span className="text-[10px] text-slate-400">
                              시작가 {auction.startPrice.toLocaleString()} P (단위 +{auction.minBidStep}P)
                            </span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-sm text-slate-850">{auction.title}</h5>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {auction.description}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs flex items-center justify-between">
                          <span className="text-slate-500">현재 최고 입찰자:</span>
                          {bidder ? (
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <span>{bidder.avatarEmoji}</span>
                              <span>{bidder.name} (#{bidder.studentNumber})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">입찰자 없음</span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>마감 예정: {endsAtDate.toLocaleString('ko-KR')}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 취소/삭제 (전액환불)
                        </button>

                        <button
                          onClick={() => handleCloseAuction(auction.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Award className="w-3.5 h-3.5" /> 즉시 마감 & 낙찰 처리
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Ended Auctions List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-850">마감된 경매 및 낙찰 기록</h4>
              <span className="text-xs text-slate-400">
                {auctions.filter((a) => a.status === 'ended').length}건 마감됨
              </span>
            </div>

            <div className="space-y-2">
              {auctions
                .filter((a) => a.status === 'ended')
                .map((auction) => {
                  const winner = users.find((u) => u.id === auction.winnerId);
                  return (
                    <div
                      key={auction.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          {auction.icon}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{auction.title}</div>
                          <div className="text-[10px] text-slate-400">
                            최종 낙찰자: {winner ? `${winner.avatarEmoji} ${winner.name}` : '유찰'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-purple-700">
                        {auction.winningPrice ? `${auction.winningPrice.toLocaleString()} P` : '0 P'}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Create Auction Modal */}
          {showAddAuctionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-850 flex items-center gap-2">
                    <span>👑</span> 새 학급 특권 경매 등록
                  </h3>
                  <button
                    onClick={() => setShowAddAuctionModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleCreateAuctionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      경매 특권 아이콘 & 제목
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newAuctionIcon}
                        onChange={(e) => setNewAuctionIcon(e.target.value)}
                        className="w-16 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-lg"
                        placeholder="👑"
                      />
                      <input
                        type="text"
                        placeholder="예: [특권] 선생님과 1:1 맛있는 점심 식사권"
                        value={newAuctionTitle}
                        onChange={(e) => setNewAuctionTitle(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-850"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">특권 상세 설명</label>
                    <textarea
                      placeholder="경매에 낙찰된 학생이 누리게 될 특별한 권리와 혜택을 적어주세요."
                      value={newAuctionDesc}
                      onChange={(e) => setNewAuctionDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-850"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        시작 입찰가 (P)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={50}
                        value={newAuctionStartPrice}
                        onChange={(e) => setNewAuctionStartPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        최소 입찰 단위 (P)
                      </label>
                      <input
                        type="number"
                        min={10}
                        step={10}
                        value={newAuctionMinStep}
                        onChange={(e) => setNewAuctionMinStep(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        경매 진행 시간
                      </label>
                      <select
                        value={newAuctionDuration}
                        onChange={(e) => setNewAuctionDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value={6}>6시간 후 마감</option>
                        <option value={12}>12시간 후 마감</option>
                        <option value={24}>24시간 (1일) 후 마감</option>
                        <option value={48}>48시간 (2일) 후 마감</option>
                        <option value={72}>72시간 (3일) 후 마감</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        특권 카테고리
                      </label>
                      <select
                        value={newAuctionCategory}
                        onChange={(e) => setNewAuctionCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <option value="privilege">특권 & 면제</option>
                        <option value="experience">특별 체험</option>
                        <option value="special">엔터테인먼트</option>
                        <option value="item">희귀 아이템</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAuctionModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-2xs transition cursor-pointer"
                    >
                      경매 시작하기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add New Shop Item */}
      {showAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                  🏪
                </div>
                <h3 className="font-black text-base text-slate-850">새 일반 상점 상품 등록</h3>
              </div>
              <button
                onClick={() => setShowAddShopModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShopItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 🎮 점심시간 태블릿 게임 15분권, 🍭 달콤 사탕 팩"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 상세 설명 및 사용 방법 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 구매 즉시 선생님께 쿠폰을 보여주고 원하는 게임을 15분 동안 즐깁니다."
                  value={newShopDesc}
                  onChange={(e) => setNewShopDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    가격 (포인트 P) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={newShopPrice}
                    onChange={(e) => setNewShopPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    초기 수량 (재고) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={newShopStock}
                    onChange={(e) => setNewShopStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newShopCategory}
                    onChange={(e) => setNewShopCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="privilege">특권 & 쿠폰 (자리, 면제권 등)</option>
                    <option value="snack">간식 & 먹거리</option>
                    <option value="fun">재미 & 엔터테인먼트</option>
                    <option value="item">학급 실물 아이템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이모지 아이콘
                  </label>
                  <select
                    value={newShopIcon}
                    onChange={(e) => setNewShopIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="🎟️">🎟️ 특권 티켓</option>
                    <option value="🎮">🎮 게임 / 태블릿</option>
                    <option value="🎵">🎵 음악 / 노래</option>
                    <option value="🍫">🍫 초콜릿 / 젤리</option>
                    <option value="🍬">🍬 달콤 사탕</option>
                    <option value="👥">👥 짝꿍 / 자리</option>
                    <option value="🍱">🍱 급식 1등</option>
                    <option value="✏️">✏️ 고급 학용품</option>
                    <option value="🎁">🎁 보물 상자</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  상품 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Shop Item */}
      {editingShopItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                  ✏️
                </div>
                <h3 className="font-black text-base text-slate-850">상품 정보 & 수량 수정</h3>
              </div>
              <button
                onClick={() => setEditingShopItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateShopItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 상세 설명 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editShopDesc}
                  onChange={(e) => setEditShopDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    가격 (포인트 P) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={editShopPrice}
                    onChange={(e) => setEditShopPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    수량 (재고 개수) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={editShopStock}
                    onChange={(e) => setEditShopStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={editShopCategory}
                    onChange={(e) => setEditShopCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="privilege">특권 & 쿠폰</option>
                    <option value="snack">간식 & 먹거리</option>
                    <option value="fun">재미 & 놀이</option>
                    <option value="item">학급 아이템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이모지
                  </label>
                  <select
                    value={editShopIcon}
                    onChange={(e) => setEditShopIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="🎟️">🎟️ 특권 티켓</option>
                    <option value="🎮">🎮 게임 / 태블릿</option>
                    <option value="🎵">🎵 음악 / 노래</option>
                    <option value="🍫">🍫 초콜릿 / 젤리</option>
                    <option value="🍬">🍬 달콤 사탕</option>
                    <option value="👥">👥 짝꿍 / 자리</option>
                    <option value="🍱">🍱 급식 1등</option>
                    <option value="✏️">✏️ 고급 학용품</option>
                    <option value="🎁">🎁 보물 상자</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShopItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  수정 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Shop Item Confirmation */}
      {deletingShopItemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-xl">
                🗑️
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-850">상품 삭제 확인</h3>
                <p className="text-xs text-slate-500">상점에서 해당 상품을 완전히 삭제합니다.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{deletingShopItemTarget.icon}</span>
                <span className="font-bold text-slate-850">{deletingShopItemTarget.name}</span>
                <span className="font-mono text-amber-700 font-bold ml-auto">{deletingShopItemTarget.price.toLocaleString()} P</span>
              </div>
              <p className="text-slate-500 text-[11px]">{deletingShopItemTarget.description}</p>
              <p className="text-rose-600 font-semibold text-[11px] pt-1 border-t border-slate-200">
                삭제 후에는 학생들이 상점에서 이 상품을 더 이상 구매할 수 없습니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingShopItemTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteShopItem}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Tax Policy */}
      {showAddTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold">
                  ⚖️
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-850">새 세금 / 공제 정책 등록</h3>
                  <p className="text-xs text-slate-400">주급 정산 시 자동 공제될 정책을 생성합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTaxModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  세금 정책 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 학급 소득세, 환경 보전 기금, 청소 지각 벌금"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  정책 설명 및 목적 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 학생 주급에서 공제되어 학급 비품 및 이벤트 기금으로 활용됩니다."
                  value={newTaxDesc}
                  onChange={(e) => setNewTaxDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    과세 방식
                  </label>
                  <select
                    value={newTaxType}
                    onChange={(e) => setNewTaxType(e.target.value as 'percent' | 'fixed')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="percent">비율 과세 (% 소득세율)</option>
                    <option value="fixed">고정 정액 과세 (P 고정)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {newTaxType === 'percent' ? '세율 (%)' : '공제 금액 (P)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newTaxType === 'percent' ? 100 : 10000}
                    value={newTaxValue}
                    onChange={(e) => setNewTaxValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="newTaxIsActive"
                  checked={newTaxIsActive}
                  onChange={(e) => setNewTaxIsActive(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="newTaxIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  즉시 활성화하여 이번 주 주급 정산부터 적용
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaxModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  새 세금 정책 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Tax Policy */}
      {editingTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold">
                  ✏️
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-850">세금 / 공제 정책 수정</h3>
                  <p className="text-xs text-slate-400">세율, 금액, 설명 및 활성화 상태를 변경합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTax(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTaxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  세금 정책 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTaxName}
                  onChange={(e) => setEditTaxName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  정책 상세 설명 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editTaxDesc}
                  onChange={(e) => setEditTaxDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    과세 방식
                  </label>
                  <select
                    value={editTaxType}
                    onChange={(e) => setEditTaxType(e.target.value as 'percent' | 'fixed')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="percent">비율 과세 (% 소득세율)</option>
                    <option value="fixed">고정 정액 과세 (P 고정)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editTaxType === 'percent' ? '세율 (%)' : '공제 금액 (P)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={editTaxType === 'percent' ? 100 : 10000}
                    value={editTaxValue}
                    onChange={(e) => setEditTaxValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="editTaxIsActive"
                  checked={editTaxIsActive}
                  onChange={(e) => setEditTaxIsActive(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="editTaxIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  이 세금 정책을 활성화 상태로 유지
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTax(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  수정 내용 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Tax Policy Confirmation */}
      {deletingTaxTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-xl">
                🗑️
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-850">세금 정책 삭제</h3>
                <p className="text-xs text-slate-500">해당 세금 항목을 완전히 삭제합니다.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-850">{deletingTaxTarget.name}</span>
                <span className="font-mono text-rose-600 font-bold ml-auto">
                  {deletingTaxTarget.value}{deletingTaxTarget.taxType === 'percent' ? '%' : 'P'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{deletingTaxTarget.description}</p>
              <p className="text-rose-600 font-semibold text-[11px] pt-1 border-t border-slate-200">
                삭제 시 앞으로 주급 정산에서 이 세금이 더 이상 부과되지 않으며 Supabase에서도 삭제됩니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaxTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteTax}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
