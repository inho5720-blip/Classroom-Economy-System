import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserCheck, ShieldAlert, Sparkles, UserPlus, KeyRound, Check, X, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    users,
    loginAsUser,
    loginWithCredentials,
    batchCreateStudents,
    getStudentJob,
    titles,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quick' | 'login' | 'batch'>('quick');
  
  // Credentials login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Batch create state
  const [batchText, setBatchText] = useState(
    '1번 강민우\n2번 김서연\n3번 박도윤\n4번 이지안\n5번 정시우\n6번 최예은\n7번 윤하준\n8번 한지민'
  );
  const [batchDefaultPassword, setBatchDefaultPassword] = useState('1234');
  const [batchMessage, setBatchMessage] = useState('');

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!identifier || !password) {
      setLoginError('아이디(학번/이름)와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    const res = loginWithCredentials(identifier, password);
    if (res.success) {
      setLoginSuccess(res.message);
      setTimeout(() => {
        onClose();
        setIdentifier('');
        setPassword('');
        setLoginSuccess('');
      }, 600);
    } else {
      setLoginError(res.message);
    }
  };

  const handleBatchCreate = () => {
    setBatchMessage('');
    if (!batchText.trim()) {
      setBatchMessage('학생 명단을 한 줄에 한 명씩 입력해 주세요.');
      return;
    }

    const res = batchCreateStudents(batchText, batchDefaultPassword);
    setBatchMessage(`총 ${res.count}명의 학생 계정이 일괄 생성되었습니다! (초기 비밀번호: ${batchDefaultPassword})`);
  };

  if (!isOpen) return null;

  const students = users.filter((u) => u.role === 'student');
  const teacher = users.find((u) => u.role === 'teacher');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50/40 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs">
                🏰
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  계정 로그인 & 사용자 전환
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold">
                    6학년 학급 모험단
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  학생 로그인, 빠른 전환(데모용), 또는 교사 일괄 계정 생성을 지원합니다.
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

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 text-sm">
            <button
              onClick={() => setActiveTab('quick')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" /> 빠른 전환 (체험/데모)
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" /> 정식 로그인
            </button>
            {currentUser.role === 'teacher' && (
              <button
                onClick={() => setActiveTab('batch')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'batch'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" /> 학생 계정 일괄 생성
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: Quick Switcher */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                {/* Teacher Card */}
                {teacher && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> 관리자(교사) 계정
                    </div>
                    <button
                      onClick={() => {
                        loginAsUser(teacher.id);
                        onClose();
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        currentUser.id === teacher.id
                          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-300/50'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-purple-50/50 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shadow-2xs">
                          👨‍🏫
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            {teacher.name}
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                              총괄 관리자
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">퀘스트 승인, 주급 정산, 세금/부동산/상점 통제</div>
                        </div>
                      </div>
                      {currentUser.id === teacher.id && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> 현재 접속 중
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Students List */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 학생 모험가 목록 ({students.length}명)
                    </span>
                    <span className="text-[11px] text-slate-400">클릭 시 즉시 해당 학생으로 전환</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {students.map((student) => {
                      const isCurrent = currentUser.id === student.id;
                      const job = getStudentJob(student.id);
                      const title = titles.find((t) => t.id === student.mainTitleId);

                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            loginAsUser(student.id);
                            onClose();
                          }}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer group ${
                            isCurrent
                              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/50'
                              : 'bg-slate-50/80 border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${student.avatarColor} flex items-center justify-center text-lg shadow-2xs shrink-0`}
                            >
                              {student.avatarEmoji}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-800 truncate flex items-center gap-1.5">
                                <span>{student.name}</span>
                                {student.studentNumber && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    #{student.studentNumber}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {job ? `${job.icon} ${job.title}` : '직업 미배정'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <div
                              className={`text-xs font-mono font-bold ${
                                student.points < 0 ? 'text-rose-600' : 'text-amber-700'
                              }`}
                            >
                              {student.points.toLocaleString()} P
                            </div>
                            {title ? (
                              <div className="text-[10px] font-bold text-amber-800 truncate max-w-[80px]">
                                {title.icon} {title.name.replace(/^[^\s]+\s/, '')}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">모험가</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Credentials Login */}
            {activeTab === 'login' && (
              <form onSubmit={handleCredentialsLogin} className="max-w-md mx-auto space-y-4 py-2">
                <div className="text-center space-y-1 mb-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs">
                    🔑
                  </div>
                  <h3 className="font-bold text-base text-slate-800">학생 / 교사 로그인</h3>
                  <p className="text-xs text-slate-500">
                    부여받은 학번(예: 60101) 또는 실명과 비밀번호를 입력해 주세요. (기본 비밀번호: 1234)
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {loginError}
                  </div>
                )}
                {loginSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    {loginSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    학번 또는 이름
                  </label>
                  <input
                    type="text"
                    placeholder="예: 60101 또는 강민우 (교사는 김선생님)"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="초기 비밀번호: 1234"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> 로그인하기
                </button>
              </form>
            )}

            {/* TAB 3: Teacher Batch Create */}
            {activeTab === 'batch' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                  💡 <strong>교사 전용 학급 계정 일괄 등록:</strong> 아래 입력창에 학생 명단을 한 줄에 한 명씩 붙여넣으세요.
                  (예: "1번 강민우" 또는 "김서연") 초기 기본 정착금(500P)과 5대 스탯(기본 10)이 자동으로 세팅됩니다.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    학생 명단 (한 줄에 한 명씩)
                  </label>
                  <textarea
                    rows={7}
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder="1번 강민우&#10;2번 김서연&#10;3번 박도윤"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-48">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      공통 초기 비밀번호
                    </label>
                    <input
                      type="text"
                      value={batchDefaultPassword}
                      onChange={(e) => setBatchDefaultPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="flex-1 pt-5">
                    <button
                      onClick={handleBatchCreate}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> 일괄 계정 생성 실행
                    </button>
                  </div>
                </div>

                {batchMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {batchMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <span>현재 접속:</span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                {currentUser.role === 'teacher' ? '선생님' : '학생'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃 (로그인 화면으로)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
