import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Profile,
  StudentStats,
  Job,
  StudentJobAssignment,
  JobApplication,
  Quest,
  QuestLog,
  TaxSetting,
  Seat,
  Title,
  UserTitle,
  ShopItem,
  ShopOrder,
  PointLedger,
  StatKey,
  TransactionCategory,
  AuctionItem,
  AuctionBid,
} from '../types';
import { getQuestRewardForStudent } from '../utils/questUtils';
import {
  INITIAL_TEACHER,
  INITIAL_STUDENTS,
  INITIAL_STATS,
  INITIAL_JOBS,
  INITIAL_STUDENT_JOBS,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_QUESTS,
  INITIAL_QUEST_LOGS,
  INITIAL_TAX_SETTINGS,
  INITIAL_SEATS,
  INITIAL_TITLES,
  INITIAL_USER_TITLES,
  INITIAL_SHOP_ITEMS,
  INITIAL_SHOP_ORDERS,
  INITIAL_POINT_LEDGER,
  INITIAL_AUCTION_ITEMS,
  INITIAL_AUCTION_BIDS,
} from '../data/initialData';
import {
  fetchProfilesFromSupabase,
  fetchStatsFromSupabase,
  fetchPointLedgersFromSupabase,
  insertPointTransactionToSupabase,
  resetPointTransactionsInSupabase,
  updateProfileInSupabase,
  isSupabaseConfigured,
} from '../lib/supabase';

export interface PointTrendData {
  date: string;
  displayDate: string;
  balance: number;
  change: number;
  category: string;
  description: string;
}

interface AppContextType {
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
  isLoggedIn: boolean;
  logout: () => void;
  users: Profile[];
  stats: Record<string, StudentStats>;
  jobs: Job[];
  studentJobs: StudentJobAssignment[];
  jobApplications: JobApplication[];
  quests: Quest[];
  questLogs: QuestLog[];
  taxSettings: TaxSetting[];
  seats: Seat[];
  titles: Title[];
  userTitles: UserTitle[];
  shopItems: ShopItem[];
  shopOrders: ShopOrder[];
  pointLedger: PointLedger[];
  auctions: AuctionItem[];
  auctionBids: AuctionBid[];
  isRankingPublic: boolean;
  setIsRankingPublic: (val: boolean) => void;
  
  // Auth & Account actions
  loginWithCredentials: (studentNumberOrName: string, password: string) => { success: boolean; role?: 'teacher' | 'student'; message: string; user?: Profile };
  batchCreateStudents: (studentListText: string, defaultPassword?: string) => { count: number };
  updateProfile: (userId: string, updates: Partial<Profile>) => void;
  resetClassroomEconomy: (defaultPoints?: number) => Promise<{ success: boolean; message: string }>;
  
  // Job management (Teacher can add/delete/update & assign)
  addJob: (jobData: Omit<Job, 'id'>) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  deleteJob: (jobId: string) => { success: boolean; message: string };
  assignStudentJob: (userId: string, jobId: string) => void;
  unassignStudentJob: (userId: string) => void;

  // Job Application actions (Students apply/propose & Teacher reviews)
  submitJobApplication: (applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>) => { success: boolean; message: string };
  approveJobApplication: (applicationId: string, teacherId: string, customSalary?: number) => { success: boolean; message: string };
  rejectJobApplication: (applicationId: string, teacherId: string, reason: string) => { success: boolean; message: string };
  cancelJobApplication: (applicationId: string, userId: string) => { success: boolean; message: string };

  // Quest actions
  submitQuestLog: (questId: string, userId: string, targetDate: string, memo?: string) => void;
  approveQuestLog: (logId: string, teacherId: string) => void;
  rejectQuestLog: (logId: string, teacherId: string, reason: string) => void;
  createQuest: (questData: Omit<Quest, 'id'>) => void;
  deleteQuest: (questId: string, permanent?: boolean) => void;
  archiveQuest: (questId: string) => void;
  restoreQuest: (questId: string) => void;

  // Salary & Economy actions
  executeWeeklySalarySettlement: () => { totalPaid: number; totalTax: number; count: number };
  updateTaxSetting: (taxId: string, updates: Partial<TaxSetting>) => void;
  adjustStudentPoints: (userId: string, amount: number, reason: string) => void;

  // Real Estate (Seat) actions
  buySeatFromTeacher: (seatIdOrNumber: string | number, studentId: string) => { success: boolean; message: string };
  buySeatFromNation: (seatIdOrNumber: string | number, studentId: string) => { success: boolean; message: string };
  buySeatFromStudent: (seatIdOrNumber: string | number, buyerId: string) => { success: boolean; message: string };
  buySeatFromPeer: (seatIdOrNumber: string | number, buyerId: string) => { success: boolean; message: string };
  listSeatForSale: (seatIdOrNumber: string | number, sellerId: string, price: number) => { success: boolean; message: string };
  cancelSeatSale: (seatIdOrNumber: string | number, sellerId: string) => void;
  updateSeat: (seatId: string, updates: Partial<Seat>) => void;
  updateAllSeats: (newSeats: Seat[]) => void;
  toggleSeatActive: (seatId: string) => void;
  rebuildSeatGrid: (rows: number, cols: number, defaultRentalFee?: number, defaultPurchasePrice?: number) => void;
  bulkUpdateSeatTaxes: (rentalFee: number, purchasePrice: number) => void;
  autoRenumberSeats: () => void;
  assignSeatOccupant: (seatId: string, studentId: string | null) => void;
  resetSeatOwnership: (seatId: string) => void;

  // Shop actions
  createShopItem: (itemData: Omit<ShopItem, 'id'>) => void;
  updateShopItem: (itemId: string, updates: Partial<ShopItem>) => void;
  deleteShopItem: (itemId: string) => void;
  purchaseShopItem: (itemId: string, studentId: string) => { success: boolean; message: string };

  // Auction actions
  placeBid: (auctionId: string, userId: string, amount: number) => { success: boolean; message: string };
  createAuction: (auctionData: {
    title: string;
    description: string;
    icon: string;
    startPrice: number;
    minBidStep?: number;
    durationHours: number;
    category: AuctionItem['category'];
  }) => void;
  closeAuction: (auctionId: string) => { success: boolean; message: string };
  deleteAuction: (auctionId: string) => { success: boolean; message: string };

  // RPG Stat & Title actions
  equipTitle: (userId: string, titleId: string | null) => void;
  updateStats: (userId: string, statUpdates: Partial<Omit<StudentStats, 'userId'>>) => void;
  
  // Helper queries
  getStudentJob: (userId: string) => Job | undefined;
  getStudentTitles: (userId: string) => Title[];
  getRankings: () => { pointsRanking: Profile[]; statRankings: Record<StatKey, { user: Profile; value: number }[]> };
  getUserPointTrend: (userId: string) => PointTrendData[];
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'CLASS_RPG_ECONOMY_STATE_V2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or initial values
  const [users, setUsers] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Profile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return [INITIAL_TEACHER, ...INITIAL_STUDENTS];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved || 'student-1';
  });

  const setCurrentUser = (user: Profile) => {
    setCurrentUserId(user.id);
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_isLoggedIn`);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [stats, setStats] = useState<Record<string, StudentStats>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stats`);
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [studentJobs, setStudentJobs] = useState<StudentJobAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_studentJobs`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_JOBS;
  });

  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_jobApplications`);
    return saved ? JSON.parse(saved) : INITIAL_JOB_APPLICATIONS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [questLogs, setQuestLogs] = useState<QuestLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_questLogs`);
    return saved ? JSON.parse(saved) : INITIAL_QUEST_LOGS;
  });

  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_taxSettings`);
    return saved ? JSON.parse(saved) : INITIAL_TAX_SETTINGS;
  });

  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_seats`);
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });

  const [titles] = useState<Title[]>(INITIAL_TITLES);

  const [userTitles, setUserTitles] = useState<UserTitle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_userTitles`);
    return saved ? JSON.parse(saved) : INITIAL_USER_TITLES;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shopItems`);
    return saved ? JSON.parse(saved) : INITIAL_SHOP_ITEMS;
  });

  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shopOrders`);
    return saved ? JSON.parse(saved) : INITIAL_SHOP_ORDERS;
  });

  const [pointLedger, setPointLedger] = useState<PointLedger[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pointLedger`);
    return saved ? JSON.parse(saved) : INITIAL_POINT_LEDGER;
  });

  const [auctions, setAuctions] = useState<AuctionItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auctions`);
    return saved ? JSON.parse(saved) : INITIAL_AUCTION_ITEMS;
  });

  const [auctionBids, setAuctionBids] = useState<AuctionBid[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auctionBids`);
    return saved ? JSON.parse(saved) : INITIAL_AUCTION_BIDS;
  });

  const [isRankingPublic, setIsRankingPublic] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_isRankingPublic`);
    return saved ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isLoggedIn`, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stats`, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_studentJobs`, JSON.stringify(studentJobs));
  }, [studentJobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_jobApplications`, JSON.stringify(jobApplications));
  }, [jobApplications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_questLogs`, JSON.stringify(questLogs));
  }, [questLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_taxSettings`, JSON.stringify(taxSettings));
  }, [taxSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_seats`, JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_userTitles`, JSON.stringify(userTitles));
  }, [userTitles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shopItems`, JSON.stringify(shopItems));
  }, [shopItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shopOrders`, JSON.stringify(shopOrders));
  }, [shopOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pointLedger`, JSON.stringify(pointLedger));
  }, [pointLedger]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auctions`, JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auctionBids`, JSON.stringify(auctionBids));
  }, [auctionBids]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isRankingPublic`, JSON.stringify(isRankingPublic));
  }, [isRankingPublic]);

  // 🌐 Supabase Cloud Database Realtime Sync on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    async function syncFromSupabase() {
      try {
        const [cloudProfiles, cloudStats, cloudLedger] = await Promise.all([
          fetchProfilesFromSupabase(),
          fetchStatsFromSupabase(),
          fetchPointLedgersFromSupabase(),
        ]);

        if (!isMounted) return;

        if (cloudProfiles && cloudProfiles.length > 0) {
          console.log(`[Supabase] Successfully loaded ${cloudProfiles.length} profiles from DB.`);
          setUsers(cloudProfiles);

          setCurrentUserId((prev) => {
            const exists = cloudProfiles.some((u) => u.id === prev);
            return exists ? prev : cloudProfiles[0].id;
          });
        }

        if (cloudStats && Object.keys(cloudStats).length > 0) {
          console.log(`[Supabase] Successfully loaded stats from DB.`);
          setStats((prev) => ({ ...prev, ...cloudStats }));
        }

        if (cloudLedger !== null) {
          console.log(`[Supabase] Successfully loaded ${cloudLedger.length} point transactions from DB.`);
          // 최신순 정렬
          const sorted = [...cloudLedger].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPointLedger(sorted);
        }
      } catch (e) {
        console.warn('[Supabase] Initial sync warning:', e);
      }
    }

    syncFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // 💰 전용 포인트 트랜잭션 기록 및 Supabase 실시간 동기화 헬퍼
  const recordPointTransaction = (
    userId: string,
    amount: number,
    category: TransactionCategory,
    description: string,
    balanceAfter: number
  ): PointLedger => {
    const newLedger: PointLedger = {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      amount,
      balanceAfter,
      category,
      description,
      createdAt: new Date().toISOString(),
    };

    // 1. 로컬 상태 반영
    setPointLedger((prev) => [newLedger, ...prev]);

    // 2. Supabase Cloud DB 동기화
    if (isSupabaseConfigured) {
      insertPointTransactionToSupabase(newLedger).catch((err) =>
        console.warn('[Supabase] Failed to persist point transaction:', err)
      );
      updateProfileInSupabase(userId, { points: balanceAfter }).catch((err) =>
        console.warn('[Supabase] Failed to update profile points in DB:', err)
      );
    }

    return newLedger;
  };

  // Current active user
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_TEACHER;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
      });
    } catch {
      // ignore
    }
  };

  // 👑 Dynamic Mansour Title Checker
  useEffect(() => {
    const mansourTitle = titles.find((t) => t.code === 'mansour');
    if (!mansourTitle) return;

    const studentList = users.filter((u) => u.role === 'student');
    if (studentList.length === 0) return;

    // Find highest point holder
    const sorted = [...studentList].sort((a, b) => b.points - a.points);
    const topStudent = sorted[0];

    // Find who currently has Mansour title
    const currentMansourHolderId = userTitles.find((ut) => ut.titleId === mansourTitle.id)?.userId;

    if (topStudent && topStudent.points > 0 && topStudent.id !== currentMansourHolderId) {
      // Remove old Mansour
      setUserTitles((prev) => prev.filter((ut) => ut.titleId !== mansourTitle.id));
      // Add new Mansour
      setUserTitles((prev) => [
        ...prev.filter((ut) => ut.titleId !== mansourTitle.id),
        {
          id: `ut-mansour-${Date.now()}`,
          userId: topStudent.id,
          titleId: mansourTitle.id,
          acquiredAt: new Date().toISOString().split('T')[0],
        },
      ]);
      // If previous user had Mansour as main title, reset it
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === topStudent.id) {
            return { ...u, mainTitleId: mansourTitle.id };
          }
          if (u.mainTitleId === mansourTitle.id) {
            return { ...u, mainTitleId: undefined };
          }
          return u;
        })
      );
    }
  }, [users, titles, userTitles]);

  // Auth actions
  const loginWithCredentials = (
    studentNumberOrName: string,
    password: string
  ): { success: boolean; role?: 'teacher' | 'student'; message: string; user?: Profile } => {
    const term = studentNumberOrName.trim();
    const pw = password.trim();

    if (!term) {
      return { success: false, message: '아이디(학번, 아이디 또는 성함)를 입력해주세요.' };
    }
    if (!pw) {
      return { success: false, message: '비밀번호를 입력해주세요.' };
    }

    const termLower = term.toLowerCase();

    // Look for matching user directly in `users` (which loads from Supabase DB `profiles`)
    // Supports studentNumber (e.g. inho5720, 60101), id (e.g. teacher-1, student-1), name (e.g. 6학년 담임선생님), or nickname
    const targetUser = users.find((u) => {
      const matchId = u.id?.toLowerCase() === termLower;
      const matchStudentNum = u.studentNumber && u.studentNumber.toString().toLowerCase() === termLower;
      const matchName = u.name?.trim().toLowerCase() === termLower;
      const matchNickname = u.nickname && u.nickname.trim().toLowerCase() === termLower;

      // Suffix match for numeric student numbers (e.g. student number 60101 matching '1' or '01')
      const matchShortNumber =
        u.role === 'student' &&
        u.studentNumber &&
        /^\d+$/.test(u.studentNumber) &&
        (u.studentNumber.endsWith(term.padStart(2, '0')) ||
          parseInt(u.studentNumber.slice(-2), 10).toString() === term);

      return matchStudentNum || matchId || matchName || matchNickname || matchShortNumber;
    });

    if (!targetUser) {
      return {
        success: false,
        message: '일치하는 계정 정보를 찾을 수 없습니다. 아이디를 확인해주세요.',
      };
    }

    const expectedPw = targetUser.passwordHash || '1234';
    if (pw !== expectedPw) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      };
    }

    setCurrentUserId(targetUser.id);
    setIsLoggedIn(true);

    return {
      success: true,
      role: targetUser.role,
      message: targetUser.role === 'teacher' ? '선생님 계정으로 접속했습니다.' : `${targetUser.name} 학생으로 로그인되었습니다.`,
      user: targetUser,
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // Batch create students from list
  const batchCreateStudents = (studentListText: string, defaultPassword = '1234') => {
    const lines = studentListText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const existingStudentNumbers = users
      .filter((u) => u.role === 'student' && u.studentNumber)
      .map((u) => parseInt(u.studentNumber!.slice(-2), 10));

    let nextNumber = existingStudentNumbers.length > 0 ? Math.max(...existingStudentNumbers) + 1 : 1;

    const emojis = ['🧙‍♂️', '🏹', '⚔️', '🧚‍♀️', '🛡️', '🎨', '⚡', '🌱', '🦉', '🦁', '🐬', '🦄', '🔥', '💎', '🚀'];
    const colors = [
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-indigo-600',
      'from-rose-500 to-red-600',
      'from-pink-500 to-rose-500',
      'from-zinc-500 to-slate-700',
      'from-green-500 to-emerald-600',
    ];

    const newStudents: Profile[] = [];
    const newStatsMap: Record<string, StudentStats> = { ...stats };

    lines.forEach((line) => {
      let name = line;
      let sNum = `601${String(nextNumber).padStart(2, '0')}`;

      const match = line.match(/^(\d+)[\.\s,\-\/번]+\s*(.+)$/);
      if (match) {
        const numPart = parseInt(match[1], 10);
        name = match[2].trim();
        sNum = `601${String(numPart).padStart(2, '0')}`;
        nextNumber = Math.max(nextNumber, numPart);
      }

      const id = `student-gen-${Date.now()}-${nextNumber}`;
      const newStudent: Profile = {
        id,
        studentNumber: sNum,
        name,
        nickname: `${name} 탐험가`,
        passwordHash: defaultPassword,
        role: 'student',
        points: 1000, // 기본 정착금 1000P
        avatarEmoji: emojis[nextNumber % emojis.length],
        avatarColor: colors[nextNumber % colors.length],
        consecutiveSuccessDays: 0,
        unspentDays: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newStudents.push(newStudent);
      newStatsMap[id] = {
        userId: id,
        diligence: 10,
        frugality: 10,
        contribution: 10,
        wisdom: 10,
        credit: 10,
      };

      nextNumber++;
    });

    if (newStudents.length > 0) {
      setUsers((prev) => [...prev, ...newStudents]);
      setStats(newStatsMap);
    }

    return { count: newStudents.length };
  };

  const updateProfile = (userId: string, updates: Partial<Profile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, ...updates, updatedAt: new Date().toISOString() };
        }
        return u;
      })
    );

    // Sync to Supabase DB if configured
    if (isSupabaseConfigured) {
      updateProfileInSupabase(userId, updates).catch((err) =>
        console.warn('[Supabase] Failed to persist profile updates:', err)
      );
    }
  };

  // 🧹 신학기 학급 경제 데이터 전체 초기화 (Clean Slate)
  const resetClassroomEconomy = async (defaultPoints = 500): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Reset all student balances to defaultPoints (500), teacher to 999999
      const cleanUsers = users.map((u) => ({
        ...u,
        points: u.role === 'teacher' ? 999999 : defaultPoints,
        consecutiveSuccessDays: 0,
        unspentDays: 0,
        mainTitleId: undefined,
        updatedAt: new Date().toISOString(),
      }));
      setUsers(cleanUsers);

      // 2. Reset 5 stats to 1
      const cleanStats: Record<string, StudentStats> = {};
      cleanUsers.forEach((u) => {
        if (u.role === 'student') {
          cleanStats[u.id] = {
            userId: u.id,
            diligence: 1,
            frugality: 1,
            contribution: 1,
            wisdom: 1,
            credit: 1,
          };
        }
      });
      setStats(cleanStats);

      // 3. Clear logs, orders, applications, ledger, bids
      setPointLedger([]);
      setQuestLogs([]);
      setShopOrders([]);
      setJobApplications([]);
      setAuctionBids([]);
      setUserTitles([]);

      // 4. Reset seats to public state (no private owners)
      setSeats((prev) =>
        prev.map((s) => ({
          ...s,
          ownerId: null,
          isForSale: false,
          salePrice: 0,
        }))
      );

      // 5. Reset ongoing auctions to startPrice with no bidders
      setAuctions((prev) =>
        prev.map((a) => ({
          ...a,
          currentHighestBid: a.startPrice,
          currentHighestBidderId: null,
          winnerId: null,
          winningPrice: null,
        }))
      );

      // 6. Supabase reset if configured
      if (isSupabaseConfigured) {
        await resetPointTransactionsInSupabase();
        // Update all profiles' points to default in Supabase
        await Promise.all(
          cleanUsers.map((u) =>
            updateProfileInSupabase(u.id, {
              points: u.points,
              consecutiveSuccessDays: 0,
              unspentDays: 0,
              mainTitleId: undefined,
            })
          )
        );
      }

      return {
        success: true,
        message: '학급 경제 데이터와 통장 기록이 성공적으로 초기화되었습니다.',
      };
    } catch (err: any) {
      console.error('Reset economy failed:', err);
      return {
        success: false,
        message: `초기화 중 오류가 발생했습니다: ${err?.message || '알 수 없는 에러'}`,
      };
    }
  };

  // Job management
  const addJob = (jobData: Omit<Job, 'id'>) => {
    const id = `job-${Date.now()}`;
    setJobs((prev) => [...prev, { ...jobData, id }]);
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j)));
  };

  const deleteJob = (jobId: string) => {
    const assigned = studentJobs.filter((sj) => sj.jobId === jobId && sj.isActive);
    if (assigned.length > 0) {
      return {
        success: false,
        message: `현재 이 직업을 수행 중인 학생이 ${assigned.length}명 있습니다. 먼저 배정을 해제해 주세요.`,
      };
    }
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    return { success: true, message: '직업이 성공적으로 삭제되었습니다.' };
  };

  const assignStudentJob = (userId: string, jobId: string) => {
    setStudentJobs((prev) => {
      const filtered = prev.filter((sj) => sj.userId !== userId);
      return [
        ...filtered,
        {
          id: `assign-${Date.now()}`,
          userId,
          jobId,
          assignedAt: new Date().toISOString().split('T')[0],
          isActive: true,
        },
      ];
    });
  };

  const unassignStudentJob = (userId: string) => {
    setStudentJobs((prev) => prev.filter((sj) => sj.userId !== userId));
  };

  // Job Application actions
  const submitJobApplication = (
    applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>
  ) => {
    const existing = jobApplications.find(
      (a) => a.userId === applicationData.userId && a.status === 'pending'
    );
    if (existing) {
      return {
        success: false,
        message: '이미 심사 대기 중인 직업 신청서가 있습니다. 결과 발표 후 다시 신청할 수 있습니다.',
      };
    }

    const id = `app-${Date.now()}`;
    const newApp: JobApplication = {
      ...applicationData,
      id,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    setJobApplications((prev) => [newApp, ...prev]);
    return {
      success: true,
      message: '직업 신청서가 성공적으로 제출되었습니다! 선생님 승인 후 정식 배정됩니다.',
    };
  };

  const approveJobApplication = (
    applicationId: string,
    teacherId: string,
    customSalary?: number
  ) => {
    const app = jobApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: '지원서를 찾을 수 없습니다.' };

    let targetJobId = app.jobId;

    // Custom proposed job creation if needed
    if (app.applicationType === 'custom_proposal' && app.proposedJob) {
      const newJobId = `job-prop-${Date.now()}`;
      const newJob: Job = {
        id: newJobId,
        title: app.proposedJob.title,
        description: app.proposedJob.description,
        weeklySalary: customSalary || app.proposedJob.suggestedSalary || 500,
        difficulty: app.proposedJob.difficulty || 2,
        maxCount: 1,
        icon: app.proposedJob.icon || '✨',
        category: app.proposedJob.category || 'service',
      };
      setJobs((prev) => [...prev, newJob]);
      targetJobId = newJobId;
    }

    if (targetJobId) {
      assignStudentJob(app.userId, targetJobId);
    }

    setJobApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: teacherId,
            }
          : a
      )
    );

    triggerCelebration();
    return {
      success: true,
      message: '직업 지원서가 승인되었으며 학생에게 정식 직업이 배정되었습니다! 🎉',
    };
  };

  const rejectJobApplication = (
    applicationId: string,
    teacherId: string,
    reason: string
  ) => {
    const app = jobApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: '지원서를 찾을 수 없습니다.' };

    setJobApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: teacherId,
              rejectReason: reason || '선생님 검토 결과 이번 선발에서는 배정되지 않았습니다.',
            }
          : a
      )
    );

    return {
      success: true,
      message: '직업 지원서가 반려 처리되었습니다.',
    };
  };

  const cancelJobApplication = (applicationId: string, userId: string) => {
    const app = jobApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: '지원서를 찾을 수 없습니다.' };
    if (app.userId !== userId) return { success: false, message: '본인의 지원서만 취소할 수 있습니다.' };
    if (app.status !== 'pending') return { success: false, message: '이미 심사가 완료된 지원서는 취소할 수 없습니다.' };

    setJobApplications((prev) => prev.filter((a) => a.id !== applicationId));
    return { success: true, message: '지원서가 성공적으로 취소되었습니다.' };
  };

  // Quest actions
  const submitQuestLog = (questId: string, userId: string, targetDate: string, memo?: string) => {
    setQuestLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.questId === questId && l.userId === userId && l.targetDate === targetDate);
      const newLog: QuestLog = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `log-${Date.now()}`,
        questId,
        userId,
        targetDate,
        status: 'pending',
        studentMemo: memo,
        isPaid: false,
        submittedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newLog;
        return copy;
      }
      return [newLog, ...prev];
    });
  };

  const approveQuestLog = (logId: string, teacherId: string) => {
    const log = questLogs.find((l) => l.id === logId);
    if (!log) return;

    setQuestLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: teacherId, rejectReason: undefined }
          : l
      )
    );

    // Apply stat bonus according to quest settings or defaults
    const quest = quests.find((q) => q.id === log.questId);
    if (quest) {
      let statType: StatKey = quest.statRewardType || 'diligence';
      let statAmount = quest.statRewardAmount ?? 1;

      if (!quest.statRewardType) {
        if (quest.questType === 'homework') {
          statType = 'diligence';
          statAmount = 1;
        } else if (quest.questType === 'job' || quest.questType === 'special') {
          statType = 'contribution';
          statAmount = 1;
        } else if (quest.questType === 'reading') {
          statType = 'wisdom';
          statAmount = 1;
        }
      }

      const currentVal = stats[log.userId]?.[statType] ?? 10;
      updateStats(log.userId, {
        [statType]: Math.min(100, currentVal + statAmount),
      });
    }

    // Increment consecutive success days for diligence
    setUsers((prev) =>
      prev.map((u) => (u.id === log.userId ? { ...u, consecutiveSuccessDays: u.consecutiveSuccessDays + 1 } : u))
    );
  };

  const rejectQuestLog = (logId: string, teacherId: string, reason: string) => {
    setQuestLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: teacherId,
              rejectReason: reason,
            }
          : l
      )
    );
  };

  const createQuest = (questData: Omit<Quest, 'id'>) => {
    const id = `quest-${Date.now()}`;
    setQuests((prev) => [...prev, { ...questData, id }]);
  };

  const deleteQuest = (questId: string, permanent = false) => {
    if (permanent) {
      setQuests((prev) => prev.filter((q) => q.id !== questId));
    } else {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId
            ? { ...q, isArchived: true, archivedAt: new Date().toISOString() }
            : q
        )
      );
    }
  };

  const archiveQuest = (questId: string) => {
    deleteQuest(questId, false);
  };

  const restoreQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? { ...q, isArchived: false, archivedAt: undefined }
          : q
      )
    );
  };

  // Salary & Economy actions
  const executeWeeklySalarySettlement = () => {
    let totalGrossPaid = 0;
    let totalTaxCollected = 0;
    let count = 0;

    const studentList = users.filter((u) => u.role === 'student');

    const updatedStudents = studentList.map((student) => {
      // 1. Approved Quests Points for unpaid logs
      const unpaidLogs = questLogs.filter((l) => l.userId === student.id && l.status === 'approved' && !l.isPaid);
      const questRewards = unpaidLogs.reduce((acc, log) => {
        const q = quests.find((item) => item.id === log.questId);
        if (!q) return acc;
        return acc + getQuestRewardForStudent(q, student.id, jobs, studentJobs);
      }, 0);

      // 2. Diligence Bonus based on diligence stat
      const studentStat = stats[student.id];
      const diligenceLevel = studentStat?.diligence || 10;
      const diligenceBonusPercent = Math.min(30, Math.floor(diligenceLevel / 5));
      const diligenceBonus = Math.round(questRewards * (diligenceBonusPercent / 100));

      const grossSalary = questRewards + diligenceBonus;

      // 3. Calculate Taxes
      let studentTax = 0;
      taxSettings.forEach((tax) => {
        if (!tax.isActive) return;
        if (tax.id === 'tax-seat') return;

        if (tax.taxType === 'percent') {
          studentTax += Math.round(grossSalary * (tax.value / 100));
        } else {
          studentTax += tax.value;
        }
      });

      // 4. Seat Rental Fee (if student does NOT own their current seat)
      const currentSeat = seats.find((s) => s.currentOccupantId === student.id);
      let seatTax = 0;
      if (currentSeat && currentSeat.ownerId !== student.id) {
        const seatTaxSetting = taxSettings.find((t) => t.id === 'tax-seat' && t.isActive);
        seatTax = seatTaxSetting ? currentSeat.rentalFee : 0;
      }

      const totalDeduction = studentTax + seatTax;
      const netPay = grossSalary - totalDeduction;
      const newPoints = student.points + netPay;

      totalGrossPaid += grossSalary;
      totalTaxCollected += totalDeduction;
      count++;

      // Credit stat update: +5 on successful salary & tax payment
      if (newPoints < 0) {
        updateStats(student.id, {
          credit: Math.max(0, (stats[student.id]?.credit ?? 10) - 5),
        });
      } else {
        updateStats(student.id, {
          credit: Math.min(100, (stats[student.id]?.credit ?? 10) + 5),
        });
      }

      // Ledger recording & Supabase Sync
      recordPointTransaction(
        student.id,
        netPay,
        'salary',
        `주급 정산 (승인 퀘스트: ${questRewards}P + 성실보너스: ${diligenceBonus}P - 세금/자리세: ${totalDeduction}P)`,
        newPoints
      );

      return {
        ...student,
        points: newPoints,
      };
    });

    // Mark unpaid logs as paid
    setQuestLogs((prev) => prev.map((l) => (l.status === 'approved' ? { ...l, isPaid: true } : l)));
    setUsers((prev) => prev.map((u) => updatedStudents.find((s) => s.id === u.id) || u));

    triggerCelebration();
    return { totalPaid: totalGrossPaid, totalTax: totalTaxCollected, count };
  };

  const updateTaxSetting = (taxId: string, updates: Partial<TaxSetting>) => {
    setTaxSettings((prev) => prev.map((t) => (t.id === taxId ? { ...t, ...updates } : t)));
  };

  const adjustStudentPoints = (userId: string, amount: number, reason: string) => {
    const student = users.find((u) => u.id === userId);
    if (!student) return;

    const newPoints = student.points + amount;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, points: newPoints } : u)));

    recordPointTransaction(
      userId,
      amount,
      'teacher_adjust',
      `선생님 수기 조정: ${reason}`,
      newPoints
    );
  };

  // Real Estate (Seats)
  const buySeatFromTeacher = (seatIdOrNumber: string | number, studentId: string) => {
    const seat = seats.find((s) => s.id === String(seatIdOrNumber) || s.seatNumber === Number(seatIdOrNumber));
    const student = users.find((u) => u.id === studentId);

    if (!seat || !student) return { success: false, message: '자리 또는 학생 정보를 찾을 수 없습니다.' };
    if (!seat.isActive) return { success: false, message: '빈자리(통로)는 구매할 수 없습니다.' };
    if (seat.ownerId !== null) return { success: false, message: '이미 개인 소유인 자리입니다.' };

    const price = seat.purchasePrice || 600;
    if (student.points < price) {
      return { success: false, message: `포인트가 부족합니다. (필요: ${price}P / 보유: ${student.points}P)` };
    }

    // Deduct points & update seat
    const newPoints = student.points - price;
    setUsers((prev) => prev.map((u) => (u.id === studentId ? { ...u, points: newPoints } : u)));
    setSeats((prev) => prev.map((s) => (s.id === seat.id ? { ...s, ownerId: studentId } : s)));

    // Record ledger & Supabase Sync
    recordPointTransaction(
      studentId,
      -price,
      'seat_trade',
      `교사(국가)로부터 ${seat.seatNumber}번 자리 분양 매입 (자가 마련 완료)`,
      newPoints
    );

    // Give homeowner title
    const homeownerTitle = titles.find((t) => t.code === 'home_owner');
    if (homeownerTitle) {
      setUserTitles((prev) => [
        ...prev.filter((ut) => !(ut.userId === studentId && ut.titleId === homeownerTitle.id)),
        { id: `ut-${Date.now()}`, userId: studentId, titleId: homeownerTitle.id, acquiredAt: new Date().toISOString().split('T')[0] },
      ]);
    }

    triggerCelebration();
    return { success: true, message: `${seat.seatNumber}번 자리를 ${price}P에 성공적으로 매입했습니다! 이제 주당 자리세(${seat.rentalFee}P)가 면제됩니다.` };
  };

  const buySeatFromNation = buySeatFromTeacher;

  const listSeatForSale = (seatIdOrNumber: string | number, sellerId: string, price: number) => {
    const seat = seats.find((s) => s.id === String(seatIdOrNumber) || s.seatNumber === Number(seatIdOrNumber));
    if (!seat || seat.ownerId !== sellerId) {
      return { success: false, message: '본인이 소유한 자리만 판매 등록할 수 있습니다.' };
    }
    if (price <= 0) {
      return { success: false, message: '판매 가격은 1P 이상이어야 합니다.' };
    }

    setSeats((prev) => prev.map((s) => (s.id === seat.id ? { ...s, isForSale: true, salePrice: price } : s)));
    return { success: true, message: `${seat.seatNumber}번 자리가 ${price}P에 당근마켓에 등록되었습니다!` };
  };

  const cancelSeatSale = (seatIdOrNumber: string | number, sellerId: string) => {
    setSeats((prev) =>
      prev.map((s) =>
        (s.id === String(seatIdOrNumber) || s.seatNumber === Number(seatIdOrNumber)) && s.ownerId === sellerId
          ? { ...s, isForSale: false, salePrice: 0 }
          : s
      )
    );
  };

  const buySeatFromStudent = (seatIdOrNumber: string | number, buyerId: string) => {
    const seat = seats.find((s) => s.id === String(seatIdOrNumber) || s.seatNumber === Number(seatIdOrNumber));
    const buyer = users.find((u) => u.id === buyerId);

    if (!seat || !buyer || !seat.isForSale || !seat.ownerId) {
      return { success: false, message: '구매 가능한 매물이 아닙니다.' };
    }
    if (seat.ownerId === buyerId) {
      return { success: false, message: '자신이 등록한 자리는 구매할 수 없습니다.' };
    }
    if (buyer.points < seat.salePrice) {
      return { success: false, message: `포인트가 부족합니다. (필요: ${seat.salePrice}P / 보유: ${buyer.points}P)` };
    }

    const sellerId = seat.ownerId;
    const seller = users.find((u) => u.id === sellerId);
    const price = seat.salePrice;

    // Transfer points
    const buyerNewPoints = buyer.points - price;
    const sellerNewPoints = (seller?.points || 0) + price;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === buyerId) return { ...u, points: buyerNewPoints };
        if (u.id === sellerId) return { ...u, points: sellerNewPoints };
        return u;
      })
    );

    // Transfer seat ownership
    setSeats((prev) =>
      prev.map((s) => (s.id === seat.id ? { ...s, ownerId: buyerId, isForSale: false, salePrice: 0 } : s))
    );

    // Point ledgers & Supabase sync
    recordPointTransaction(
      buyerId,
      -price,
      'seat_trade',
      `당근마켓 ${seat.seatNumber}번 자리 구매 (판매자: ${seller?.name || '친구'})`,
      buyerNewPoints
    );

    if (sellerId) {
      recordPointTransaction(
        sellerId,
        price,
        'seat_trade',
        `당근마켓 ${seat.seatNumber}번 자리 판매 완료 (구매자: ${buyer.name})`,
        sellerNewPoints
      );
    }

    triggerCelebration();
    return { success: true, message: `${seller?.name} 친구로부터 ${seat.seatNumber}번 자리를 ${price}P에 매입했습니다!` };
  };

  const buySeatFromPeer = buySeatFromStudent;

  const updateSeat = (seatId: string, updates: Partial<Seat>) => {
    setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, ...updates } : s)));
  };

  const updateAllSeats = (newSeats: Seat[]) => {
    setSeats(newSeats);
  };

  const toggleSeatActive = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id !== seatId) return s;
        const willBeActive = !s.isActive;
        return {
          ...s,
          isActive: willBeActive,
          currentOccupantId: willBeActive ? s.currentOccupantId : null,
          isForSale: willBeActive ? s.isForSale : false,
          salePrice: willBeActive ? s.salePrice : 0,
        };
      })
    );
  };

  const rebuildSeatGrid = (
    rows: number,
    cols: number,
    defaultRentalFee = 50,
    defaultPurchasePrice = 600
  ) => {
    const newSeatsList: Seat[] = [];
    let seatCount = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const existing = seats.find((s) => s.rowIdx === r && s.colIdx === c);
        
        let zone: Seat['zone'] = 'middle';
        if (r === 1) zone = 'front';
        else if (r === rows) zone = 'back';
        else if (c === 1 || c === cols) zone = 'window';
        else if (r === Math.ceil(rows / 2) && (c === 2 || c === 3)) zone = 'vip';

        if (existing) {
          if (existing.isActive) seatCount++;
          newSeatsList.push({
            ...existing,
            rowIdx: r,
            colIdx: c,
            zone: existing.zone || zone,
            rentalFee: existing.rentalFee ?? defaultRentalFee,
            purchasePrice: existing.purchasePrice ?? defaultPurchasePrice,
          });
        } else {
          seatCount++;
          newSeatsList.push({
            id: `seat-${r}-${c}-${Date.now()}`,
            seatNumber: seatCount,
            rowIdx: r,
            colIdx: c,
            ownerId: null,
            currentOccupantId: null,
            rentalFee: defaultRentalFee,
            purchasePrice: defaultPurchasePrice,
            isForSale: false,
            salePrice: 0,
            zone,
            isActive: true,
          });
        }
      }
    }

    setSeats(newSeatsList);
  };

  const bulkUpdateSeatTaxes = (rentalFee: number, purchasePrice: number) => {
    setSeats((prev) =>
      prev.map((s) => ({
        ...s,
        rentalFee: Number(rentalFee),
        purchasePrice: Number(purchasePrice),
      }))
    );
    // Sync taxSettings for 'tax-seat'
    setTaxSettings((prev) =>
      prev.map((t) => (t.id === 'tax-seat' ? { ...t, value: Number(rentalFee) } : t))
    );
  };

  const autoRenumberSeats = () => {
    setSeats((prev) => {
      const sorted = [...prev].sort((a, b) => {
        if (a.rowIdx !== b.rowIdx) return a.rowIdx - b.rowIdx;
        return a.colIdx - b.colIdx;
      });
      let num = 1;
      return sorted.map((s) => {
        if (s.isActive) {
          const seatNum = num++;
          return { ...s, seatNumber: seatNum };
        }
        return { ...s, seatNumber: 0 };
      });
    });
  };

  const assignSeatOccupant = (seatId: string, studentId: string | null) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (studentId && s.currentOccupantId === studentId && s.id !== seatId) {
          return { ...s, currentOccupantId: null };
        }
        if (s.id === seatId) {
          return { ...s, currentOccupantId: studentId };
        }
        return s;
      })
    );
  };

  const resetSeatOwnership = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, ownerId: null, isForSale: false, salePrice: 0 } : s))
    );
  };

  // Shop actions
  const createShopItem = (itemData: Omit<ShopItem, 'id'>) => {
    const id = `item-${Date.now()}`;
    setShopItems((prev) => [...prev, { ...itemData, id }]);
  };

  const updateShopItem = (itemId: string, updates: Partial<ShopItem>) => {
    setShopItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
  };

  const deleteShopItem = (itemId: string) => {
    setShopItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const purchaseShopItem = (itemId: string, studentId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    const student = users.find((u) => u.id === studentId);

    if (!item || !student) return { success: false, message: '상품 또는 학생 정보를 찾을 수 없습니다.' };
    if (item.stock <= 0) return { success: false, message: '해당 상품은 품절되었습니다.' };
    if (student.points < item.price) {
      return { success: false, message: `포인트가 부족합니다. (필요: ${item.price}P / 보유: ${student.points}P)` };
    }

    // Decrement stock
    setShopItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, stock: i.stock - 1 } : i)));

    // Deduct student points
    const newPoints = student.points - item.price;
    setUsers((prev) => prev.map((u) => (u.id === studentId ? { ...u, points: newPoints, unspentDays: 0 } : u)));

    // Record order
    setShopOrders((prev) => [
      {
        id: `order-${Date.now()}`,
        userId: studentId,
        itemId,
        itemName: item.name,
        paidPrice: item.price,
        isUsed: true,
        purchasedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    // Record point ledger & Supabase Sync
    recordPointTransaction(
      studentId,
      -item.price,
      'shop_purchase',
      `상점 상품 즉시 구매: ${item.name}`,
      newPoints
    );

    triggerCelebration();
    return { success: true, message: `${item.name}을(를) 성공적으로 구매했습니다! 즉시 교표/쿠폰으로 적용되었습니다.` };
  };

  // Auction actions
  const placeBid = (auctionId: string, userId: string, amount: number) => {
    const auction = auctions.find((a) => a.id === auctionId);
    const bidder = users.find((u) => u.id === userId);

    if (!auction || !bidder) {
      return { success: false, message: '경매 또는 입찰자 정보를 찾을 수 없습니다.' };
    }

    if (auction.status !== 'ongoing') {
      return { success: false, message: '이미 마감되었거나 진행 중이지 않은 경매입니다.' };
    }

    if (new Date(auction.endsAt).getTime() < Date.now()) {
      return { success: false, message: '경매 마감 시간이 종료되었습니다.' };
    }

    const minRequired =
      auction.currentHighestBidderId === null
        ? auction.startPrice
        : auction.currentHighestBid + auction.minBidStep;

    if (amount < minRequired) {
      return {
        success: false,
        message: `최소 입찰 금액은 ${minRequired.toLocaleString()} P 이상이어야 합니다.`,
      };
    }

    if (bidder.points < amount) {
      return {
        success: false,
        message: `보유 포인트가 부족합니다. (필요: ${amount.toLocaleString()}P / 보유: ${bidder.points.toLocaleString()}P)`,
      };
    }

    if (auction.currentHighestBidderId === userId) {
      return {
        success: false,
        message: '이미 회원님이 현재 최고 입찰자입니다!',
      };
    }

    // 1. If previous highest bidder existed, refund their bid amount
    const prevBidderId = auction.currentHighestBidderId;
    const prevBidAmount = auction.currentHighestBid;

    if (prevBidderId && prevBidAmount > 0) {
      const prevBidder = users.find((u) => u.id === prevBidderId);
      const refundedBalance = (prevBidder?.points || 0) + prevBidAmount;

      setUsers((prev) =>
        prev.map((u) => (u.id === prevBidderId ? { ...u, points: refundedBalance } : u))
      );

      recordPointTransaction(
        prevBidderId,
        prevBidAmount,
        'auction_refund',
        `경매 입찰 환불 (${auction.title} - 상위 입찰 발생)`,
        refundedBalance
      );
    }

    // 2. Deduct points from current bidder
    const newBidderBalance = bidder.points - amount;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, points: newBidderBalance, unspentDays: 0 };
        }
        return u;
      })
    );

    // 3. Record point ledger for new bid
    recordPointTransaction(
      userId,
      -amount,
      'auction_bid',
      `경매 최고 입찰: ${auction.title} (${amount.toLocaleString()}P)`,
      newBidderBalance
    );

    // 4. Record new bid in bids list
    const newBid: AuctionBid = {
      id: `bid-${Date.now()}`,
      auctionId,
      userId,
      amount,
      bidAt: new Date().toISOString(),
    };
    setAuctionBids((prev) => [newBid, ...prev]);

    // 5. Update auction highest bid
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? {
              ...a,
              currentHighestBid: amount,
              currentHighestBidderId: userId,
            }
          : a
      )
    );

    triggerCelebration();
    return {
      success: true,
      message: `${amount.toLocaleString()} P로 최고 입찰에 성공했습니다! 🎉`,
    };
  };

  const createAuction = (auctionData: {
    title: string;
    description: string;
    icon: string;
    startPrice: number;
    minBidStep?: number;
    durationHours: number;
    category: AuctionItem['category'];
  }) => {
    const endsAt = new Date(Date.now() + 1000 * 60 * 60 * auctionData.durationHours).toISOString();
    const newAuction: AuctionItem = {
      id: `auction-${Date.now()}`,
      title: auctionData.title,
      description: auctionData.description,
      icon: auctionData.icon || '🎁',
      startPrice: auctionData.startPrice,
      currentHighestBid: auctionData.startPrice,
      currentHighestBidderId: null,
      minBidStep: auctionData.minBidStep || 50,
      endsAt,
      status: 'ongoing',
      winnerId: null,
      winningPrice: null,
      category: auctionData.category,
      createdAt: new Date().toISOString(),
    };

    setAuctions((prev) => [newAuction, ...prev]);
  };

  const closeAuction = (auctionId: string) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return { success: false, message: '경매를 찾을 수 없습니다.' };

    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? {
              ...a,
              status: 'ended',
              winnerId: a.currentHighestBidderId,
              winningPrice: a.currentHighestBidderId ? a.currentHighestBid : null,
            }
          : a
      )
    );

    const winner = users.find((u) => u.id === auction.currentHighestBidderId);
    if (winner) {
      recordPointTransaction(
        winner.id,
        0,
        'auction_win',
        `🎉 [경매 최종 낙찰] ${auction.title} 낙찰 확정 (${auction.currentHighestBid.toLocaleString()}P)`,
        winner.points
      );
    }

    return {
      success: true,
      message: winner
        ? `${winner.name} 학생에게 ${auction.currentHighestBid.toLocaleString()}P로 최종 낙찰 처리되었습니다!`
        : '입찰자 없이 경매가 종료되었습니다.',
    };
  };

  const deleteAuction = (auctionId: string) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return { success: false, message: '경매를 찾을 수 없습니다.' };

    // If ongoing and has bidder, refund them
    if (auction.status === 'ongoing' && auction.currentHighestBidderId) {
      const highestBidderId = auction.currentHighestBidderId;
      const refundAmt = auction.currentHighestBid;
      const target = users.find((u) => u.id === highestBidderId);
      const refundedBalance = (target?.points || 0) + refundAmt;

      setUsers((prev) =>
        prev.map((u) => (u.id === highestBidderId ? { ...u, points: refundedBalance } : u))
      );

      recordPointTransaction(
        highestBidderId,
        refundAmt,
        'auction_refund',
        `경매 취소에 따른 전액 환불: ${auction.title}`,
        refundedBalance
      );
    }

    setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
    return { success: true, message: '경매가 성공적으로 삭제/취소되었습니다.' };
  };

  // RPG Stat & Title actions
  const equipTitle = (userId: string, titleId: string | null) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, mainTitleId: titleId || undefined } : u)));
  };

  const updateStats = (userId: string, statUpdates: Partial<Omit<StudentStats, 'userId'>>) => {
    setStats((prev) => {
      const current = prev[userId] || {
        userId,
        diligence: 10,
        frugality: 10,
        contribution: 10,
        wisdom: 10,
        credit: 10,
      };

      const clamped: Partial<Omit<StudentStats, 'userId'>> = {};
      (Object.keys(statUpdates) as StatKey[]).forEach((key) => {
        const val = statUpdates[key];
        if (typeof val === 'number') {
          clamped[key] = Math.min(100, Math.max(0, val));
        }
      });

      return {
        ...prev,
        [userId]: { ...current, ...clamped },
      };
    });
  };

  // Helper queries
  const getStudentJob = (userId: string) => {
    const assign = studentJobs.find((sj) => sj.userId === userId && sj.isActive);
    if (!assign) return undefined;
    return jobs.find((j) => j.id === assign.jobId);
  };

  const getStudentTitles = (userId: string) => {
    const userTitleIds = userTitles.filter((ut) => ut.userId === userId).map((ut) => ut.titleId);
    return titles.filter((t) => userTitleIds.includes(t.id));
  };

  const getRankings = () => {
    const studentList = users.filter((u) => u.role === 'student');
    const pointsRanking = [...studentList].sort((a, b) => b.points - a.points);

    const statRankings: Record<StatKey, { user: Profile; value: number }[]> = {
      diligence: [],
      frugality: [],
      contribution: [],
      wisdom: [],
      credit: [],
    };

    const keys: StatKey[] = ['diligence', 'frugality', 'contribution', 'wisdom', 'credit'];
    keys.forEach((key) => {
      statRankings[key] = [...studentList]
        .map((student) => ({
          user: student,
          value: stats[student.id]?.[key] || 10,
        }))
        .sort((a, b) => b.value - a.value);
    });

    return { pointsRanking, statRankings };
  };

  // Generate date-based point trend data for chart
  const getUserPointTrend = (userId: string): PointTrendData[] => {
    const userLedgers = pointLedger
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (userLedgers.length === 0) {
      const user = users.find((u) => u.id === userId);
      const currentPts = user?.points || 0;
      const todayStr = new Date().toISOString().split('T')[0];
      return [
        {
          date: todayStr,
          displayDate: `${new Date().getMonth() + 1}월 ${new Date().getDate()}일`,
          balance: currentPts,
          change: 0,
          category: '기본 잔액',
          description: '현재 보유 포인트',
        },
      ];
    }

    return userLedgers.map((l) => {
      const d = new Date(l.createdAt);
      const displayDate = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
        d.getMinutes()
      ).padStart(2, '0')}`;
      return {
        date: l.createdAt,
        displayDate,
        balance: l.balanceAfter,
        change: l.amount,
        category: l.category,
        description: l.description,
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        logout,
        users,
        stats,
        jobs,
        studentJobs,
        jobApplications,
        quests,
        questLogs,
        taxSettings,
        seats,
        titles,
        userTitles,
        shopItems,
        shopOrders,
        pointLedger,
        auctions,
        auctionBids,
        isRankingPublic,
        setIsRankingPublic,
        loginWithCredentials,
        batchCreateStudents,
        updateProfile,
        resetClassroomEconomy,
        addJob,
        updateJob,
        deleteJob,
        assignStudentJob,
        unassignStudentJob,
        submitJobApplication,
        approveJobApplication,
        rejectJobApplication,
        cancelJobApplication,
        submitQuestLog,
        approveQuestLog,
        rejectQuestLog,
        createQuest,
        deleteQuest,
        archiveQuest,
        restoreQuest,
        executeWeeklySalarySettlement,
        updateTaxSetting,
        adjustStudentPoints,
        buySeatFromTeacher,
        buySeatFromNation,
        buySeatFromStudent,
        buySeatFromPeer,
        listSeatForSale,
        cancelSeatSale,
        updateSeat,
        updateAllSeats,
        toggleSeatActive,
        rebuildSeatGrid,
        bulkUpdateSeatTaxes,
        autoRenumberSeats,
        assignSeatOccupant,
        resetSeatOwnership,
        createShopItem,
        updateShopItem,
        deleteShopItem,
        purchaseShopItem,
        placeBid,
        createAuction,
        closeAuction,
        deleteAuction,
        equipTitle,
        updateStats,
        getStudentJob,
        getStudentTitles,
        getRankings,
        getUserPointTrend,
        triggerCelebration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
