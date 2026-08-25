export type UserRole = 'teacher' | 'student';

export interface Profile {
  id: string;
  studentNumber?: string; // e.g. "60101", "60102" (teacher is undefined)
  name: string; // e.g. "강민우"
  nickname: string; // e.g. "골드헌터 민우"
  passwordHash: string; // default "1234"
  role: UserRole;
  points: number; // Point/Coin balance (supports minus debt)
  mainTitleId?: string; // Current equipped title ID
  avatarEmoji: string; // e.g. "🧙‍♂️", "⚔️", "🏹", "👑", "🛡️", "🐉"
  avatarColor: string; // border/bg theme for avatar
  consecutiveSuccessDays: number;
  unspentDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStats {
  userId: string;
  diligence: number; // 성실 (숙제/직업 연속 승인 시 상승, 주급 보너스 연계)
  frugality: number; // 절약 (상점 미소비 시 상승)
  contribution: number; // 기여 (힘든 직업/특수 퀘스트 수행 시 상승)
  wisdom: number; // 지혜 (독서/고난도 퀘스트 완료 시 상승)
  credit: number; // 신용 (세금 성실 납부 시 상승, 마이너스 지속 시 하락)
}

export type StatKey = keyof Omit<StudentStats, 'userId'>;

export interface Job {
  id: string;
  title: string; // e.g. "칠판 마스터", "에너지 지킴이", "우유 급식 대장"
  description: string;
  weeklySalary: number; // 주급 (예: 500P)
  difficulty: number; // 1~5
  maxCount: number;
  icon: string;
  category: 'cleaning' | 'learning' | 'order' | 'environment' | 'service';
}

export interface StudentJobAssignment {
  id: string;
  userId: string;
  jobId: string;
  assignedAt: string;
  isActive: boolean;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string; // existing job id, or 'custom'
  proposedJobTitle?: string;
  proposedJobDescription?: string;
  proposedWeeklySalary?: number;
  proposedIcon?: string;
  proposedCategory?: 'cleaning' | 'learning' | 'order' | 'environment' | 'service';
  reason: string; // 지원 동기 및 내가 해야 하는 이유
  pledge: string; // 활동 다짐 및 나의 각오/장점
  status: ApplicationStatus;
  rejectReason?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type QuestType = 'job' | 'homework' | 'reading' | 'special';
export type QuestStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted';
export type QuestFrequencyType = 'once' | 'recurring';
export type QuestTargetType = 'all' | 'specific';

export interface Quest {
  id: string;
  title: string;
  description: string;
  questType: QuestType;
  rewardPoints: number;
  statRewardType?: StatKey;
  statRewardAmount?: number;
  isRecurring: boolean;
  frequencyType?: QuestFrequencyType; // 'once' (단발성) | 'recurring' (요일 반복)
  recurringDays?: number[]; // [0,1,2,3,4,5,6] (0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토)
  targetStudentType?: QuestTargetType; // 'all' (전체 학생) | 'specific' (선택 학생)
  targetStudentIds?: string[]; // Array of student user IDs if targetStudentType === 'specific'
  targetJobId?: string;
  dueDate?: string; // YYYY-MM-DD for single / target deadline
  icon: string;
  isArchived?: boolean; // 교사가 삭제/종료하여 완료 퀘스트함에 보관된 상태
  archivedAt?: string; // 보관/종료 처리된 시각
}

export interface QuestLog {
  id: string;
  questId: string;
  userId: string;
  targetDate: string; // YYYY-MM-DD (supports retroactive completion)
  status: QuestStatus;
  studentMemo?: string;
  rejectReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  isPaid: boolean;
  submittedAt: string;
}

export interface CalendarMemo {
  id: string;
  userId: string;
  targetDate: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxSetting {
  id: string;
  name: string; // 소득세, 건강보험료, 국세, 자리세 등
  taxType: 'percent' | 'fixed';
  value: number; // e.g. 10(%), or 50(P)
  description: string;
  isActive: boolean;
}

export interface Seat {
  id: string;
  seatNumber: number; // 1~30
  rowIdx: number; // 1~N (행)
  colIdx: number; // 1~M (열)
  ownerId: string | null; // null = Teacher/National Owned (rental fee applies)
  currentOccupantId: string | null;
  rentalFee: number; // default 50P / week (기본 주당 자리세)
  purchasePrice: number; // default 600P (교사 기본 분양가)
  isForSale: boolean;
  salePrice: number;
  zone: 'front' | 'middle' | 'window' | 'back' | 'vip';
  isActive: boolean; // true = 실제 자리, false = 빈자리/통로 (미노출)
}

export interface SeatTransaction {
  id: string;
  seatId: string;
  sellerId: string | null;
  buyerId: string;
  price: number;
  transactedAt: string;
}

export interface Title {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badgeStyle: string;
  isDynamic: boolean; // e.g. 'mansour' (transferred dynamically to #1 point holder)
  category: 'economic' | 'stat' | 'honor' | 'humorous';
}

export interface UserTitle {
  id: string;
  userId: string;
  titleId: string;
  acquiredAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number; // 0 = sold out
  icon: string;
  category: 'snack' | 'privilege' | 'item' | 'fun';
  isActive: boolean;
}

export interface ShopOrder {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  paidPrice: number;
  isUsed: boolean; // Instant use
  purchasedAt: string;
}

export type TransactionCategory =
  | 'salary'
  | 'tax'
  | 'quest_bonus'
  | 'seat_rental'
  | 'seat_trade'
  | 'shop_purchase'
  | 'auction_bid'
  | 'auction_refund'
  | 'auction_win'
  | 'teacher_adjust';

export interface PointLedger {
  id: string;
  userId: string;
  amount: number; // + or -
  balanceAfter: number;
  category: TransactionCategory;
  description: string;
  createdAt: string;
}

export type AuctionStatus = 'ongoing' | 'ended' | 'cancelled';

export interface AuctionBid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  bidAt: string;
}

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  startPrice: number;
  currentHighestBid: number;
  currentHighestBidderId: string | null;
  minBidStep: number;
  endsAt: string; // ISO date string
  status: AuctionStatus;
  winnerId: string | null;
  winningPrice: number | null;
  category: 'privilege' | 'experience' | 'item' | 'special';
  createdAt: string;
}
