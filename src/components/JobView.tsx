import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  Users,
  Search,
  ChevronRight,
  Shield,
  Lightbulb,
  FileText,
  Trash2,
  ExternalLink,
  Award,
  Send,
  AlertCircle,
  HelpCircle,
  Edit2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Job, JobApplication } from '../types';

interface JobViewProps {
  onNavigateToAdmin?: () => void;
}

export const JobView: React.FC<JobViewProps> = ({ onNavigateToAdmin }) => {
  const {
    currentUser,
    users,
    jobs,
    studentJobs,
    jobApplications,
    submitJobApplication,
    approveJobApplication,
    rejectJobApplication,
    cancelJobApplication,
    addJob,
    updateJob,
    deleteJob,
    assignStudentJob,
    unassignStudentJob,
    triggerCelebration,
  } = useApp();

  const isTeacher = currentUser.role === 'teacher';
  const currentStudentJob = !isTeacher ? jobs.find((j) => {
    const sj = studentJobs.find((s) => s.userId === currentUser.id && s.isActive);
    return sj && sj.jobId === j.id;
  }) : undefined;

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'my_applications' | 'pending_reviews'>('directory');
  const [teacherReviewInboxTab, setTeacherReviewInboxTab] = useState<'pending' | 'completed'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyMode, setApplyMode] = useState<'existing' | 'custom'>('existing');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  // Custom job proposal fields
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customSalary, setCustomSalary] = useState(500);
  const [customIcon, setCustomIcon] = useState('🌟');
  const [customCategory, setCustomCategory] = useState<'cleaning' | 'learning' | 'order' | 'environment' | 'service'>('service');

  // Application details
  const [appReason, setAppReason] = useState('');
  const [appPledge, setAppPledge] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Teacher review modal state
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Teacher add job modal
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobSalary, setNewJobSalary] = useState(500);
  const [newJobDifficulty, setNewJobDifficulty] = useState(3);
  const [newJobMaxCount, setNewJobMaxCount] = useState(2);
  const [newJobIcon, setNewJobIcon] = useState('💼');
  const [newJobCategory, setNewJobCategory] = useState<'cleaning' | 'learning' | 'order' | 'environment' | 'service'>('service');

  // Teacher edit job modal
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobDesc, setEditJobDesc] = useState('');
  const [editJobSalary, setEditJobSalary] = useState(500);
  const [editJobDifficulty, setEditJobDifficulty] = useState(3);
  const [editJobMaxCount, setEditJobMaxCount] = useState(2);
  const [editJobIcon, setEditJobIcon] = useState('💼');
  const [editJobCategory, setEditJobCategory] = useState<Job['category']>('service');

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchQuery =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // Student's own applications & Teacher pending/completed separation
  const myApplications = jobApplications.filter((a) => a.userId === currentUser.id);
  const pendingApplications = jobApplications.filter((a) => a.status === 'pending');
  const completedApplications = jobApplications.filter((a) => a.status === 'approved' || a.status === 'rejected');

  const handleOpenApplyModal = (preselectedJobId?: string) => {
    if (preselectedJobId) {
      setSelectedJobId(preselectedJobId);
      setApplyMode('existing');
    } else {
      setSelectedJobId(jobs[0]?.id || '');
      setApplyMode('existing');
    }
    setAppReason('');
    setAppPledge('');
    setFormError(null);
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (appReason.trim().length < 5) {
      setFormError('이 직업이 우리 반에서 필요한 이유를 5자 이상 작성해 주세요.');
      return;
    }
    if (appPledge.trim().length < 5) {
      setFormError('나의 장점 및 활동 다짐을 5자 이상 작성해 주세요.');
      return;
    }

    if (applyMode === 'custom') {
      if (customTitle.trim().length < 2) {
        setFormError('제안할 직업명을 2자 이상 입력해 주세요.');
        return;
      }
      if (customDesc.trim().length < 5) {
        setFormError('제안할 직업의 역할 설명을 5자 이상 입력해 주세요.');
        return;
      }

      const res = submitJobApplication({
        userId: currentUser.id,
        jobId: 'custom',
        proposedJobTitle: customTitle.trim(),
        proposedJobDescription: customDesc.trim(),
        proposedWeeklySalary: Number(customSalary),
        proposedIcon: customIcon,
        proposedCategory: customCategory,
        reason: appReason.trim(),
        pledge: appPledge.trim(),
      });

      if (res.success) {
        setIsApplyModalOpen(false);
        setFeedbackMsg({ text: res.message, type: 'success' });
        setActiveSubTab('my_applications');
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setFormError(res.message);
      }
    } else {
      if (!selectedJobId) {
        setFormError('지원할 직업을 선택해 주세요.');
        return;
      }

      const res = submitJobApplication({
        userId: currentUser.id,
        jobId: selectedJobId,
        reason: appReason.trim(),
        pledge: appPledge.trim(),
      });

      if (res.success) {
        setIsApplyModalOpen(false);
        setFeedbackMsg({ text: res.message, type: 'success' });
        setActiveSubTab('my_applications');
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setFormError(res.message);
      }
    }
  };

  const handleApprove = (appId: string) => {
    const res = approveJobApplication(appId, currentUser.id);
    if (res.success) {
      setFeedbackMsg({ text: res.message, type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleReject = () => {
    if (!rejectingAppId) return;
    const res = rejectJobApplication(rejectingAppId, currentUser.id, rejectReasonInput.trim());
    if (res.success) {
      setRejectingAppId(null);
      setRejectReasonInput('');
      setFeedbackMsg({ text: res.message, type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleCancelApplication = (appId: string) => {
    if (window.confirm('제출한 지원서를 정말로 취소하시겠습니까?')) {
      const res = cancelJobApplication(appId, currentUser.id);
      if (res.success) {
        setFeedbackMsg({ text: res.message, type: 'success' });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    }
  };

  const handleCreateNewJobByTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    addJob({
      title: newJobTitle.trim(),
      description: newJobDesc.trim() || '학급 1인 1역 직업입니다.',
      weeklySalary: Number(newJobSalary),
      difficulty: Number(newJobDifficulty),
      maxCount: Number(newJobMaxCount),
      icon: newJobIcon,
      category: newJobCategory,
    });

    setIsAddJobModalOpen(false);
    setNewJobTitle('');
    setNewJobDesc('');
    setFeedbackMsg({ text: `[${newJobTitle}] 직업이 성공적으로 등록되었습니다! (정원: ${newJobMaxCount}명)`, type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 4000);
    triggerCelebration();
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

    setFeedbackMsg({ text: `[${editJobTitle}] 직업 설정 및 정원(${editJobMaxCount}명) 수정이 완료되었습니다!`, type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 4000);
    setEditingJob(null);
  };

  const handleAdjustJobQuota = (jobId: string, delta: number) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const currentAssigned = studentJobs.filter((sj) => sj.jobId === jobId && sj.isActive).length;
    const newCount = Math.max(1, Math.max(currentAssigned, job.maxCount + delta));
    updateJob(jobId, { maxCount: newCount });
    setFeedbackMsg({ text: `[${job.title}] 직업 정원이 ${newCount}명으로 조정되었습니다.`, type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'cleaning':
        return { label: '청소 & 환경', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'learning':
        return { label: '학습 & 독서', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'order':
        return { label: '질서 & 알림', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'environment':
        return { label: '생태 & 식물', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'service':
        return { label: '봉사 & 복지', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: '일반 직업', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl shadow-lg border flex items-center justify-between text-sm font-bold ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-xs opacity-60 hover:opacity-100 px-2 py-1"
            >
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner: My Job Status (for Student) or Quick Management Bar (for Teacher) */}
      {!isTeacher ? (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-indigo-950/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                <span>나의 1인 1역 학급 직업 센터</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {currentStudentJob ? (
                  <span className="flex items-center gap-2.5 flex-wrap">
                    <span>현재 직업:</span>
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <span>{currentStudentJob.icon}</span>
                      <span>{currentStudentJob.title}</span>
                    </span>
                  </span>
                ) : (
                  <span>현재 배정된 직업이 없습니다</span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
                {currentStudentJob ? (
                  <span>
                    {currentStudentJob.description} (매주 주급 정산 시{' '}
                    <strong className="text-amber-300 font-mono font-bold">
                      +{currentStudentJob.weeklySalary}P
                    </strong>{' '}
                    기본 지급)
                  </span>
                ) : (
                  <span>
                    원하는 학급 직업에 지원서를 작성하거나, 우리 반에 꼭 필요한 새로운 직업을 직접 제안해 보세요!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-purple-950/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>교사 전용 1인 1역 직업 & 채용 행정</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                <span>학급 직업 ({jobs.length}개) & 지원서 심사</span>
                {pendingApplications.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                    심사 대기 {pendingApplications.length}건
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
                학생들이 제출한 직업 지원서와 신설 직업 제안서를 검토하고 채용을 승인하거나, 직업 목록을 자유롭게 추가/관리하세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddJobModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>새 직업 등록</span>
              </button>
              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>종합 교사 관리실</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>전체 1인 1역 공고 ({jobs.length})</span>
        </button>

        {!isTeacher ? (
          <button
            onClick={() => setActiveSubTab('my_applications')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'my_applications'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>내 지원서 이력</span>
            {myApplications.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                {myApplications.length}
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => setActiveSubTab('pending_reviews')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'pending_reviews'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>지원서 심사함</span>
            {pendingApplications.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                {pendingApplications.length}건 대기
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => handleOpenApplyModal()}
          className="ml-auto px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition"
        >
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>직업 지원 / 새 직업 제안</span>
        </button>
      </div>

      {/* 1. DIRECTORY VIEW (JOB CARDS) */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: '전체 보기' },
                { id: 'service', label: '🤝 봉사 & 복지' },
                { id: 'cleaning', label: '🧹 청소 & 환경' },
                { id: 'learning', label: '📚 학습 & 독서' },
                { id: 'order', label: '📢 질서 & 알림' },
                { id: 'environment', label: '🌿 생태 & 식물' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="직업명 또는 설명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => {
              const assignedStudents = studentJobs
                .filter((sj) => sj.jobId === job.id && sj.isActive)
                .map((sj) => users.find((u) => u.id === sj.userId))
                .filter(Boolean);

              const isMyJob = !isTeacher && assignedStudents.some((s) => s?.id === currentUser.id);
              const isFull = assignedStudents.length >= job.maxCount;
              const catInfo = getCategoryLabel(job.category);

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                    isMyJob
                      ? 'border-indigo-400 ring-2 ring-indigo-300/40 bg-indigo-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                          {job.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                            {isMyJob && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                                내가 담당 중
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-base text-slate-850 mt-0.5">{job.title}</h3>
                        </div>
                      </div>

                      {isTeacher && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditJob(job)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="직업 설정 및 정원 수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`[${job.title}] 직업을 삭제하시겠습니까?`)) {
                                const res = deleteJob(job.id);
                                if (!res.success) {
                                  alert(res.message);
                                }
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="직업 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {job.description}
                    </p>

                    {/* Stats & Salary Row */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-150 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">주급 (급여)</span>
                        <span className="text-amber-700 font-mono font-extrabold text-sm">
                          {job.weeklySalary.toLocaleString()} P
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">업무 난이도</span>
                        <span className="text-amber-500 font-bold tracking-tight">
                          {'★'.repeat(job.difficulty)}
                          {'☆'.repeat(Math.max(0, 5 - job.difficulty))}
                        </span>
                      </div>
                    </div>

                    {/* Assigned students */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>담당 인원 ({assignedStudents.length} / {job.maxCount}명)</span>
                        </span>
                        
                        {isTeacher ? (
                          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold">정원:</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustJobQuota(job.id, -1)}
                              disabled={job.maxCount <= Math.max(1, assignedStudents.length)}
                              className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-[11px]"
                              title="정원 1명 감소"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-slate-700 text-[11px]">
                              {job.maxCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustJobQuota(job.id, 1)}
                              className="w-4 h-4 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center cursor-pointer text-[11px]"
                              title="정원 1명 증가"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className={isFull ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {isFull ? '정원 마감' : '지원 가능'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 min-h-[26px] items-center">
                        {assignedStudents.length > 0 ? (
                          assignedStudents.map((st) => (
                            <span
                              key={st?.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
                            >
                              <span>{st?.avatarEmoji}</span>
                              <span>{st?.name}</span>
                              {isTeacher && (
                                <button
                                  onClick={() => st && unassignStudentJob(st.id)}
                                  className="ml-1 text-slate-400 hover:text-rose-600"
                                  title="배정 해제"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">현재 배정된 학생이 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    {!isTeacher ? (
                      <button
                        onClick={() => handleOpenApplyModal(job.id)}
                        className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isMyJob
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isMyJob ? '지원 동기 / 다짐 수정 지원' : '이 직업에 지원하기'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStudentJob(e.target.value, job.id);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-bold"
                        >
                          <option value="" disabled>
                            ➕ 학생 직접 배정...
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">해당 조건의 직업이 없습니다</h3>
              <p className="text-xs text-slate-500">새로운 직업을 직접 제안하거나 검색어를 변경해 보세요.</p>
              <button
                onClick={() => handleOpenApplyModal()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" /> 새 직업 제안하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. MY APPLICATIONS VIEW (FOR STUDENTS) */}
      {activeSubTab === 'my_applications' && !isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-850">내가 제출한 직업 지원서 이력</h3>
              <p className="text-xs text-slate-500">선생님의 심사 결과와 피드백을 실시간으로 확인할 수 있습니다.</p>
            </div>
            <button
              onClick={() => handleOpenApplyModal()}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 새 지원서 작성
            </button>
          </div>

          <div className="space-y-3">
            {myApplications.map((app) => {
              const targetJob = app.jobId !== 'custom' ? jobs.find((j) => j.id === app.jobId) : null;
              const isCustom = app.jobId === 'custom';
              const jobTitle = isCustom ? app.proposedJobTitle : targetJob?.title;
              const jobIcon = isCustom ? app.proposedIcon || '🌟' : targetJob?.icon || '💼';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                        {jobIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-slate-850">{jobTitle}</h4>
                          {isCustom && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                              💡 신규 직업 제안
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          신청 일시: {new Date(app.appliedAt).toLocaleDateString()} {new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {app.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>심사 대기 중</span>
                          </span>
                          <button
                            onClick={() => handleCancelApplication(app.id)}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            취소
                          </button>
                        </div>
                      )}
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>채용 승인 완료 🎉</span>
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-extrabold">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>미채용 (반려)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Application Content Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
                      <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                        <span>🎯</span> 이 직업이 우리 반에서 필요한 이유
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <span>💪</span> 나의 장점 및 활동 다짐
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.pledge}</p>
                    </div>
                  </div>

                  {/* Rejection Feedback Note if any */}
                  {app.status === 'rejected' && app.rejectReason && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> 선생님 피드백 사유
                      </span>
                      <p>{app.rejectReason}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {myApplications.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700">제출한 직업 지원서가 없습니다</h3>
                <p className="text-xs text-slate-500">관심 있는 학급 직업에 지원서를 작성해 보세요.</p>
                <button
                  onClick={() => handleOpenApplyModal()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> 지원서 작성하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TEACHER REVIEW INBOX VIEW (Separated into Pending & Completed) */}
      {activeSubTab === 'pending_reviews' && isTeacher && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-extrabold text-base text-slate-850 flex items-center gap-2">
                <span>직업 지원서 심사함</span>
                <span className="text-xs font-normal text-slate-400">|</span>
                <span className="text-xs font-semibold text-slate-500">
                  전체 {jobApplications.length}건 (대기 {pendingApplications.length} / 완료 {completedApplications.length})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                학생들이 제출한 직업 지원서와 제안서를 심사하고 채용을 승인하세요. 완료된 지원서는 완료함에서 보관됩니다.
              </p>
            </div>

            {/* Pending vs Completed Tab Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shrink-0">
              <button
                onClick={() => setTeacherReviewInboxTab('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  teacherReviewInboxTab === 'pending'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⏳ 심사 대기함</span>
                {pendingApplications.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {pendingApplications.length}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                    0
                  </span>
                )}
              </button>
              <button
                onClick={() => setTeacherReviewInboxTab('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  teacherReviewInboxTab === 'completed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📁 심사 완료함</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  {completedApplications.length}
                </span>
              </button>
            </div>
          </div>

          {/* Pending Applications List */}
          {teacherReviewInboxTab === 'pending' && (
            <div className="space-y-4">
              {pendingApplications.map((app) => {
                const student = users.find((u) => u.id === app.userId);
                const targetJob = app.jobId !== 'custom' ? jobs.find((j) => j.id === app.jobId) : null;
                const isCustom = app.jobId === 'custom';
                const jobTitle = isCustom ? app.proposedJobTitle : targetJob?.title;
                const jobIcon = isCustom ? app.proposedIcon || '🌟' : targetJob?.icon || '💼';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl border border-indigo-200/90 ring-2 ring-indigo-100 p-6 shadow-xs space-y-4 bg-indigo-50/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-xs">
                          {student?.avatarEmoji || '🧑‍🎓'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-slate-850">{student?.name}</span>
                            <span className="text-xs text-slate-500">({student?.studentNumber || '학생'})</span>
                            {isCustom ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-200 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3 text-amber-600" />
                                신규 직업 제안
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-extrabold border border-indigo-200">
                                기존 직업 지원
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            신청 직업: <strong className="text-slate-800">{jobIcon} {jobTitle}</strong> •{' '}
                            {new Date(app.appliedAt).toLocaleDateString()} {new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> 채용 승인
                        </button>
                        <button
                          onClick={() => {
                            setRejectingAppId(app.id);
                            setRejectReasonInput('');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                        >
                          반려
                        </button>
                      </div>
                    </div>

                    {/* Proposed New Job details if custom */}
                    {isCustom && (
                      <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-1 text-amber-900">
                        <span className="font-extrabold flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-700" /> 학생이 제안한 신규 직업 정보
                        </span>
                        <p className="text-amber-800">
                          <strong>직업명:</strong> {app.proposedJobTitle} ({app.proposedIcon}) • <strong>제안 주급:</strong> {app.proposedWeeklySalary}P
                        </p>
                        <p className="text-amber-800">
                          <strong>역할 설명:</strong> {app.proposedJobDescription}
                        </p>
                      </div>
                    )}

                    {/* Application Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-1.5">
                        <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                          <span>🎯</span> 이 직업이 우리 반에서 필요한 이유
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-1.5">
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                          <span>💪</span> 나의 장점 및 활동 다짐
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.pledge}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingApplications.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                    🎉
                  </div>
                  <h3 className="font-bold text-base text-slate-800">심사 대기 중인 지원서가 없습니다</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    모든 학생의 지원서 심사가 완료되었습니다. 처리된 결과는 '심사 완료함'에서 확인하실 수 있습니다.
                  </p>
                  {completedApplications.length > 0 && (
                    <button
                      onClick={() => setTeacherReviewInboxTab('completed')}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition cursor-pointer"
                    >
                      📁 심사 완료함 ({completedApplications.length}건) 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Completed Applications List */}
          {teacherReviewInboxTab === 'completed' && (
            <div className="space-y-4">
              {completedApplications.map((app) => {
                const student = users.find((u) => u.id === app.userId);
                const targetJob = app.jobId !== 'custom' ? jobs.find((j) => j.id === app.jobId) : null;
                const isCustom = app.jobId === 'custom';
                const jobTitle = isCustom ? app.proposedJobTitle : targetJob?.title;
                const jobIcon = isCustom ? app.proposedIcon || '🌟' : targetJob?.icon || '💼';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 opacity-95"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl shadow-2xs">
                          {student?.avatarEmoji || '🧑‍🎓'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-slate-850">{student?.name}</span>
                            <span className="text-xs text-slate-500">({student?.studentNumber || '학생'})</span>
                            {isCustom ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                                💡 신규 직업 제안
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold border border-indigo-200">
                                기존 직업 지원
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            신청 직업: <strong className="text-slate-800">{jobIcon} {jobTitle}</strong> • 지원일:{' '}
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {app.status === 'approved' ? (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> 채용 승인 완료
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-200 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 text-rose-600" /> 반려 처리됨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Proposed Job Details if custom */}
                    {isCustom && app.proposedJobDescription && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                        <strong>학생 제안 역할 설명:</strong> {app.proposedJobDescription}
                      </div>
                    )}

                    {/* Application Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
                        <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                          <span>🎯</span> 이 직업이 우리 반에서 필요한 이유
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.reason}</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                          <span>💪</span> 나의 장점 및 활동 다짐
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{app.pledge}</p>
                      </div>
                    </div>

                    {app.status === 'rejected' && app.rejectReason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <strong>반려 사유:</strong> {app.rejectReason}
                      </div>
                    )}
                  </div>
                );
              })}

              {completedApplications.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700">완료된 지원서가 없습니다</h3>
                  <p className="text-xs text-slate-500">승인 또는 반려 처리된 지원서가 이곳에 보관됩니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: JOB APPLICATION / NEW JOB PROPOSAL (FOR STUDENTS & ALL USERS) */}
      {/* ========================================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
                  📝
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-850">1인 1역 직업 지원서 작성</h3>
                  <p className="text-xs text-slate-500">원하는 직업을 선택하거나 새로운 직업을 직접 제안해 보세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setApplyMode('existing')}
                className={`py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  applyMode === 'existing'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>기존 개설 직업 지원</span>
              </button>
              <button
                type="button"
                onClick={() => setApplyMode('custom')}
                className={`py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  applyMode === 'custom'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>💡 새로운 직업 직접 제안</span>
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Mode 1: Select Existing Job */}
              {applyMode === 'existing' ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">지원할 직업 선택</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-indigo-400"
                  >
                    {jobs.map((job) => {
                      const assigned = studentJobs.filter((sj) => sj.jobId === job.id && sj.isActive).length;
                      return (
                        <option key={job.id} value={job.id}>
                          {job.icon} {job.title} (주급 {job.weeklySalary}P | 현재 {assigned}/{job.maxCount}명)
                        </option>
                      );
                    })}
                  </select>

                  {/* Selected Job Mini Card */}
                  {(() => {
                    const selJob = jobs.find((j) => j.id === selectedJobId);
                    if (!selJob) return null;
                    return (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{selJob.icon} {selJob.title}</span>
                          <span className="text-amber-700 font-mono">주급 {selJob.weeklySalary} P</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{selJob.description}</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Mode 2: Propose Custom Job */
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>우리 반을 위한 새로운 1인 1역 제안하기</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">제안할 직업명</label>
                      <input
                        type="text"
                        placeholder="예: 생일 축하 DJ, 학급 보드게임 지킴이"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">대표 아이콘</label>
                      <select
                        value={customIcon}
                        onChange={(e) => setCustomIcon(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-xs text-center font-bold"
                      >
                        {['🌟', '🎵', '🎲', '📸', '🎨', '🏆', '📢', '🌿', '🥛', '🧹', '🛡️', '📦', '💻', '🎬'].map((emoji) => (
                          <option key={emoji} value={emoji}>
                            {emoji}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">어떤 역할을 수행하나요? (업무 설명)</label>
                    <input
                      type="text"
                      placeholder="예: 점심시간에 신청곡을 틀어주고 반 친구들의 생일을 챙깁니다."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">희망 주급 (P)</label>
                      <input
                        type="number"
                        min="200"
                        max="1000"
                        step="50"
                        value={customSalary}
                        onChange={(e) => setCustomSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-amber-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">카테고리</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                      >
                        <option value="service">🤝 봉사 & 복지</option>
                        <option value="cleaning">🧹 청소 & 환경</option>
                        <option value="learning">📚 학습 & 독서</option>
                        <option value="order">📢 질서 & 알림</option>
                        <option value="environment">🌿 생태 & 식물</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Required Application Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>🎯</span> 이 직업이 우리 반에서 필요한 이유 <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">우리 반에 왜 이 역할이 필요한지 작성해 보세요</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="예: 친구들이 쾌적하고 집중하기 좋은 교실 환경을 만들고, 원활한 학급 생활이 이루어지도록 돕기 위해 꼭 필요한 역할입니다."
                    value={appReason}
                    onChange={(e) => setAppReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-400 focus:bg-white transition leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>💪</span> 나의 장점 및 활동 다짐 <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">나의 장점과 성실한 실천 약속</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="예: 저는 꼼꼼하고 성실한 성격이라 매일 잊지 않고 1인 1역을 완수하겠습니다. 친구들을 위해 최선을 다하겠습니다!"
                    value={appPledge}
                    onChange={(e) => setAppPledge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-400 focus:bg-white transition leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>지원서 제출하기</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: TEACHER REJECT REASON DIALOG */}
      {/* ========================================================================= */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-850 flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" /> 지원서 반려 사유 입력
            </h3>
            <p className="text-xs text-slate-500">
              학생에게 전할 피드백이나 반려 사유를 작성해 주세요.
            </p>

            <textarea
              rows={3}
              placeholder="예: 이번 선발에는 다른 지원자가 우선 배정되었습니다. 다음 기회나 다른 직업에 다시 지원해 주세요!"
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingAppId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition"
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: TEACHER ADD NEW JOB DIALOG */}
      {/* ========================================================================= */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateNewJobByTeacher}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-850">새로운 1인 1역 직업 등록</h3>
              <button
                type="button"
                onClick={() => setIsAddJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">직업명</label>
              <input
                type="text"
                required
                placeholder="예: 칠판 도우미, 식물 집사, 정보 방송 부장"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
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

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">주급 (P)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={newJobSalary}
                  onChange={(e) => setNewJobSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-amber-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">난이도 (1~5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newJobDifficulty}
                  onChange={(e) => setNewJobDifficulty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">정원 (명)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newJobMaxCount}
                  onChange={(e) => setNewJobMaxCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">아이콘 이모지</label>
                <input
                  type="text"
                  value={newJobIcon}
                  onChange={(e) => setNewJobIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">카테고리</label>
                <select
                  value={newJobCategory}
                  onChange={(e) => setNewJobCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                >
                  <option value="service">🤝 봉사 & 복지</option>
                  <option value="cleaning">🧹 청소 & 환경</option>
                  <option value="learning">📚 학습 & 독서</option>
                  <option value="order">📢 질서 & 알림</option>
                  <option value="environment">🌿 생태 & 식물</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddJobModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition cursor-pointer"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleUpdateJobSubmit}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-850 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>직업 설정 & 정원 수정</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">직업 카테고리</label>
                <select
                  value={editJobCategory}
                  onChange={(e) => setEditJobCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
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

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">주급 (P)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={editJobSalary}
                  onChange={(e) => setEditJobSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-amber-800"
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">아이콘 이모지</label>
                <input
                  type="text"
                  value={editJobIcon}
                  onChange={(e) => setEditJobIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition cursor-pointer"
              >
                수정 저장
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
