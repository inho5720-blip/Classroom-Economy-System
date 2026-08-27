import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  StudentStats,
  StatKey,
  PointLedger,
  Job,
  JobApplication,
  StudentJobAssignment,
  Seat,
  ShopItem,
  ShopOrder,
  AuctionItem,
  AuctionBid,
  Quest,
  QuestLog,
  CalendarMemo,
  TaxSetting,
  QuestFrequencyType,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase DB의 profiles 테이블에서 모든 계정 조회
 */
export async function fetchProfilesFromSupabase(): Promise<Profile[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('student_number', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch profiles:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // snake_case ➡️ camelCase 변환
    return data.map((row: any) => {
      const nickname = row.nickname || row.name || '학생';
      const statusMessage = row.status_message || row.statusMessage || (row.name && row.nickname && row.name !== row.nickname ? row.nickname : '') || '';

      return {
        id: row.id,
        studentNumber: row.student_number || undefined,
        name: nickname,
        nickname: nickname,
        statusMessage: statusMessage,
        passwordHash: row.password_hash || '1234',
        role: row.role as 'teacher' | 'student',
        points: Number(row.points ?? 500),
        mainTitleId: row.main_title_id || undefined,
        avatarEmoji: row.avatar_emoji || (row.role === 'teacher' ? '👨‍🏫' : '🧙‍♂️'),
        avatarColor: row.avatar_color || 'from-amber-400 to-orange-500',
        consecutiveSuccessDays: Number(row.consecutive_success_days ?? 0),
        unspentDays: Number(row.unspent_days ?? 0),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[Supabase] Error connecting to DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 student_stats 테이블에서 스탯 조회
 */
export async function fetchStatsFromSupabase(): Promise<Record<string, StudentStats> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('student_stats').select('*');

    if (error) {
      console.warn('[Supabase] Failed to fetch stats:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    const statsMap: Record<string, StudentStats> = {};
    data.forEach((row: any) => {
      statsMap[row.user_id] = {
        userId: row.user_id,
        diligence: Number(row.diligence ?? 1),
        frugality: Number(row.frugality ?? 1),
        contribution: Number(row.contribution ?? 1),
        wisdom: Number(row.wisdom ?? 1),
        credit: Number(row.credit ?? 1),
      };
    });
    return statsMap;
  } catch (err) {
    console.warn('[Supabase] Error connecting to stats DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 student_stats 테이블에 학생 스탯 저장 또는 업데이트
 */
export async function upsertStudentStatsToSupabase(stats: StudentStats): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = {
      user_id: stats.userId,
      diligence: stats.diligence,
      frugality: stats.frugality,
      contribution: stats.contribution,
      wisdom: stats.wisdom,
      credit: stats.credit,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('student_stats').upsert(row, { onConflict: 'user_id' });
    if (error) {
      console.warn('[Supabase] Failed to upsert student_stats:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting student_stats:', err);
    return false;
  }
}

/**
 * Supabase DB에 프로필 변경사항(이름, 닉네임, 아바타, 포인트 등) 동기화
 */
export async function updateProfileInSupabase(
  userId: string,
  updates: Partial<Profile>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.nickname !== undefined || updates.name !== undefined) {
      dbPayload.nickname = updates.nickname || updates.name;
    }
    if (updates.statusMessage !== undefined) {
      dbPayload.status_message = updates.statusMessage;
    }
    if (updates.studentNumber !== undefined) dbPayload.student_number = updates.studentNumber;
    if (updates.passwordHash !== undefined) dbPayload.password_hash = updates.passwordHash;
    if (updates.points !== undefined) dbPayload.points = updates.points;
    if (updates.mainTitleId !== undefined) dbPayload.main_title_id = updates.mainTitleId;
    if (updates.avatarEmoji !== undefined) dbPayload.avatar_emoji = updates.avatarEmoji;
    if (updates.avatarColor !== undefined) dbPayload.avatar_color = updates.avatarColor;
    if (updates.consecutiveSuccessDays !== undefined)
      dbPayload.consecutive_success_days = updates.consecutiveSuccessDays;
    if (updates.unspentDays !== undefined) dbPayload.unspent_days = updates.unspentDays;

    const { error } = await supabase.from('profiles').update(dbPayload).eq('id', userId);

    if (error) {
      // Fallback in case columns are in legacy format (name, nickname) before user runs migration
      if (error.message.includes('status_message') || error.message.includes('column')) {
        const legacyPayload: Record<string, any> = { ...dbPayload };
        delete legacyPayload.status_message;
        if (updates.name !== undefined || updates.nickname !== undefined) {
          legacyPayload.name = updates.nickname || updates.name;
        }
        if (updates.statusMessage !== undefined) {
          legacyPayload.nickname = updates.statusMessage;
        }
        const { error: legacyError } = await supabase.from('profiles').update(legacyPayload).eq('id', userId);
        if (!legacyError) return true;
      }
      console.warn('[Supabase] Profile update failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating profile:', err);
    return false;
  }
}

/**
 * Supabase DB의 point_transactions / point_ledgers 테이블에서 전자 통장 거래 로그 조회
 */
export async function fetchPointLedgersFromSupabase(): Promise<PointLedger[] | null> {
  if (!supabase) return null;
  try {
    let response = await supabase
      .from('point_transactions')
      .select('*')
      .order('created_at', { ascending: true });

    if (response.error) {
      // 'point_ledgers' 대체 테이블명 시도
      response = await supabase
        .from('point_ledgers')
        .select('*')
        .order('created_at', { ascending: true });
    }

    if (response.error) {
      console.warn('[Supabase] Failed to fetch point transactions:', response.error.message);
      return null;
    }

    if (!response.data) return null;

    return response.data.map((row: any) => ({
      id: String(row.id),
      userId: row.user_id || row.userId || row.student_id,
      amount: Number(row.amount ?? 0),
      balanceAfter: Number(row.balance_after ?? row.balanceAfter ?? row.balance ?? 0),
      category: row.category || 'teacher_adjust',
      description: row.description || '',
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error connecting to point_transactions DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 point_transactions 테이블에 포인트 증감 로그 1건 추가
 */
export async function insertPointTransactionToSupabase(
  transaction: PointLedger
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: transaction.id,
      user_id: transaction.userId,
      amount: transaction.amount,
      balance_after: transaction.balanceAfter,
      category: transaction.category,
      description: transaction.description,
      created_at: transaction.createdAt,
    };

    let { error } = await supabase.from('point_transactions').upsert(payload);

    if (error) {
      // point_ledgers 테이블명 대체 시도
      const res = await supabase.from('point_ledgers').upsert(payload);
      if (res.error) {
        console.warn('[Supabase] Failed to insert point transaction to both tables:', error.message, res.error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error inserting point transaction:', err);
    return false;
  }
}

/**
 * Supabase DB의 전체 point_transactions 삭제 (신학기 리셋)
 */
export async function resetPointTransactionsInSupabase(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('point_transactions').delete().neq('id', 'placeholder');
    if (error) {
      console.warn('[Supabase] Failed to reset transactions:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error resetting transactions:', err);
    return false;
  }
}

/**
 * Supabase DB의 jobs 테이블에서 모든 1인 1역 직업 목록 조회
 */
export async function fetchJobsFromSupabase(): Promise<Job[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch jobs:', error.message);
      return null;
    }

    if (!data) return null;
    if (data.length === 0) return [];

    // DB 컬럼 snake_case 및 camelCase 호환 매핑
    return data.map((row: any) => ({
      id: String(row.id),
      title: row.title || '직업',
      description: row.description || '',
      weeklySalary: Number(row.weekly_salary ?? row.weeklySalary ?? 500),
      difficulty: Number(row.difficulty ?? 2),
      maxCount: Number(row.max_count ?? row.maxCount ?? 2),
      icon: row.icon || '💼',
      category: (row.category || 'service') as Job['category'],
    }));
  } catch (err) {
    console.warn('[Supabase] Error connecting to jobs DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 jobs 테이블에 직업 1건 추가 (또는 Upsert)
 */
export async function insertJobToSupabase(job: Job): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: job.id,
      title: job.title,
      description: job.description,
      weekly_salary: job.weeklySalary,
      difficulty: job.difficulty,
      max_count: job.maxCount,
      icon: job.icon,
      category: job.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('jobs').upsert(payload);

    if (error) {
      console.warn('[Supabase] Failed to insert/upsert job:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error inserting job to DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 jobs 테이블에서 직업 정보 수정
 */
export async function updateJobInSupabase(
  jobId: string,
  updates: Partial<Job>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    if (updates.weeklySalary !== undefined) dbPayload.weekly_salary = updates.weeklySalary;
    if (updates.difficulty !== undefined) dbPayload.difficulty = updates.difficulty;
    if (updates.maxCount !== undefined) dbPayload.max_count = updates.maxCount;
    if (updates.icon !== undefined) dbPayload.icon = updates.icon;
    if (updates.category !== undefined) dbPayload.category = updates.category;

    const { error } = await supabase.from('jobs').update(dbPayload).eq('id', jobId);

    if (error) {
      console.warn('[Supabase] Failed to update job in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating job in DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 jobs 테이블에서 직업 1건 삭제
 */
export async function deleteJobFromSupabase(jobId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);

    if (error) {
      console.warn('[Supabase] Failed to delete job from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting job from DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 jobs 테이블에 여러 직업 일괄 저장 (초기 동기화/시딩)
 */
export async function bulkUpsertJobsToSupabase(jobsList: Job[]): Promise<boolean> {
  if (!supabase || jobsList.length === 0) return false;
  try {
    const rows = jobsList.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      weekly_salary: job.weeklySalary,
      difficulty: job.difficulty,
      max_count: job.maxCount,
      icon: job.icon,
      category: job.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('jobs').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to bulk upsert jobs:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error bulk upserting jobs to DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 seats 테이블에서 모든 자리 배치도 및 부동산 데이터 조회
 */
export async function fetchSeatsFromSupabase(): Promise<Seat[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .order('row_idx', { ascending: true })
      .order('col_idx', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch seats:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // snake_case ➡️ camelCase 변환
    return data.map((row: any) => ({
      id: row.id,
      seatNumber: Number(row.seat_number ?? 0),
      rowIdx: Number(row.row_idx ?? 1),
      colIdx: Number(row.col_idx ?? 1),
      ownerId: row.owner_id || null,
      currentOccupantId: row.current_occupant_id || null,
      rentalFee: Number(row.rental_fee ?? 50),
      purchasePrice: Number(row.purchase_price ?? 600),
      isForSale: Boolean(row.is_for_sale),
      salePrice: Number(row.sale_price ?? 0),
      zone: (row.zone as Seat['zone']) || 'middle',
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching seats from DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 seats 테이블에 단일 자리 상태 업데이트 (소유권, 당근마켓 판매, 점유자 등)
 */
export async function updateSeatInSupabase(
  seatId: string,
  updates: Partial<Seat>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload: Record<string, any> = {};
    if (updates.seatNumber !== undefined) dbPayload.seat_number = updates.seatNumber;
    if (updates.rowIdx !== undefined) dbPayload.row_idx = updates.rowIdx;
    if (updates.colIdx !== undefined) dbPayload.col_idx = updates.colIdx;
    if (updates.ownerId !== undefined) dbPayload.owner_id = updates.ownerId;
    if (updates.currentOccupantId !== undefined) dbPayload.current_occupant_id = updates.currentOccupantId;
    if (updates.rentalFee !== undefined) dbPayload.rental_fee = updates.rentalFee;
    if (updates.purchasePrice !== undefined) dbPayload.purchase_price = updates.purchasePrice;
    if (updates.isForSale !== undefined) dbPayload.is_for_sale = updates.isForSale;
    if (updates.salePrice !== undefined) dbPayload.sale_price = updates.salePrice;
    if (updates.zone !== undefined) dbPayload.zone = updates.zone;
    if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

    const { error } = await supabase.from('seats').update(dbPayload).eq('id', seatId);

    if (error) {
      console.warn('[Supabase] Failed to update seat in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating seat in DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 seats 테이블에 전체 자리 배치도 일괄 저장 (신규 배치도 생성, 일괄 세금 변경, 번호 매기기 등)
 */
export async function saveAllSeatsToSupabase(seatsList: Seat[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const rows = seatsList.map((s) => ({
      id: s.id,
      seat_number: s.seatNumber,
      row_idx: s.rowIdx,
      col_idx: s.colIdx,
      owner_id: s.ownerId,
      current_occupant_id: s.currentOccupantId,
      rental_fee: s.rentalFee,
      purchase_price: s.purchasePrice,
      is_for_sale: s.isForSale,
      sale_price: s.salePrice,
      zone: s.zone,
      is_active: s.isActive,
      updated_at: new Date().toISOString(),
    }));

    // 전체 테이블 교체 방식 지원: 먼저 기존 행들을 정리하거나 upsert
    const { error: upsertError } = await supabase.from('seats').upsert(rows, { onConflict: 'id' });
    if (upsertError) {
      console.warn('[Supabase] Failed to upsert seats:', upsertError.message);
      return false;
    }

    // 만약 기존에 있던 ID 중 이번 리스트에 없는 id가 있다면 삭제(그리드 크기 축소 시)
    const currentIds = seatsList.map((s) => s.id);
    if (currentIds.length > 0) {
      await supabase.from('seats').delete().not('id', 'in', `(${currentIds.map((id) => `"${id}"`).join(',')})`);
    }

    return true;
  } catch (err) {
    console.warn('[Supabase] Error saving all seats to DB:', err);
    return false;
  }
}

/**
 * ==========================================================
 * 5. 상점 상품 (shop_items) & 구매 주문 (shop_orders) DB 연동
 * ==========================================================
 */

/**
 * Supabase DB의 shop_items 테이블에서 모든 상품 조회
 */
export async function fetchShopItemsFromSupabase(): Promise<ShopItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch shop_items:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      icon: row.icon || '🎟️',
      category: (row.category as ShopItem['category']) || 'privilege',
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching shop_items from DB:', err);
    return null;
  }
}

/**
 * Supabase DB에 단일 상품 등록 또는 업서트
 */
export async function upsertShopItemToSupabase(item: ShopItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      stock: item.stock,
      icon: item.icon,
      category: item.category,
      is_active: item.isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('shop_items').upsert(payload);
    if (error) {
      console.warn('[Supabase] Failed to upsert shop_item:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting shop_item:', err);
    return false;
  }
}

/**
 * Supabase DB의 특정 상품 정보/재고 수정
 */
export async function updateShopItemInSupabase(
  itemId: string,
  updates: Partial<ShopItem>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    if (updates.price !== undefined) dbPayload.price = updates.price;
    if (updates.stock !== undefined) dbPayload.stock = updates.stock;
    if (updates.icon !== undefined) dbPayload.icon = updates.icon;
    if (updates.category !== undefined) dbPayload.category = updates.category;
    if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

    const { error } = await supabase.from('shop_items').update(dbPayload).eq('id', itemId);
    if (error) {
      console.warn('[Supabase] Failed to update shop_item in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating shop_item in DB:', err);
    return false;
  }
}

/**
 * Supabase DB에서 특정 상품 삭제
 */
export async function deleteShopItemFromSupabase(itemId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shop_items').delete().eq('id', itemId);
    if (error) {
      console.warn('[Supabase] Failed to delete shop_item from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting shop_item from DB:', err);
    return false;
  }
}

/**
 * Supabase DB에 초기 상품 목록 일괄 시딩/저장
 */
export async function bulkUpsertShopItemsToSupabase(items: ShopItem[]): Promise<boolean> {
  if (!supabase || items.length === 0) return false;
  try {
    const rows = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      stock: item.stock,
      icon: item.icon,
      category: item.category,
      is_active: item.isActive,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('shop_items').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to bulk upsert shop_items:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error in bulkUpsertShopItemsToSupabase:', err);
    return false;
  }
}

/**
 * Supabase DB의 shop_orders 테이블에서 모든 구매 주문 내역 조회
 */
export async function fetchShopOrdersFromSupabase(): Promise<ShopOrder[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shop_orders')
      .select('*')
      .order('purchased_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch shop_orders:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      itemId: row.item_id,
      itemName: row.item_name,
      paidPrice: Number(row.paid_price ?? 0),
      isUsed: Boolean(row.is_used),
      purchasedAt: row.purchased_at,
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching shop_orders from DB:', err);
    return null;
  }
}

/**
 * Supabase DB에 신규 상품 구매 주문 내역 삽입
 */
export async function insertShopOrderToSupabase(order: ShopOrder): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('shop_orders').insert({
      id: order.id,
      user_id: order.userId,
      item_id: order.itemId,
      item_name: order.itemName,
      paid_price: order.paidPrice,
      is_used: order.isUsed,
      purchased_at: order.purchasedAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] Failed to insert shop_order to DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error inserting shop_order to DB:', err);
    return false;
  }
}

/**
 * ==========================================================
 * 6. 특권 경매 (auctions) & 입찰 내역 (auction_bids) DB 연동
 * ==========================================================
 */

/**
 * Supabase DB의 auctions 테이블에서 모든 경매 항목 조회
 */
export async function fetchAuctionsFromSupabase(): Promise<AuctionItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch auctions:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      icon: row.icon || '🎁',
      startPrice: Number(row.start_price ?? 0),
      currentHighestBid: Number(row.current_highest_bid ?? row.start_price ?? 0),
      currentHighestBidderId: row.current_highest_bidder_id || null,
      minBidStep: Number(row.min_bid_step ?? 50),
      endsAt: row.ends_at,
      status: (row.status as AuctionItem['status']) || 'ongoing',
      winnerId: row.winner_id || null,
      winningPrice: row.winning_price !== null && row.winning_price !== undefined ? Number(row.winning_price) : null,
      category: (row.category as AuctionItem['category']) || 'privilege',
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching auctions from DB:', err);
    return null;
  }
}

/**
 * Supabase DB에 신규 경매 등록 또는 업서트
 */
export async function upsertAuctionToSupabase(auction: AuctionItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      icon: auction.icon,
      start_price: auction.startPrice,
      current_highest_bid: auction.currentHighestBid,
      current_highest_bidder_id: auction.currentHighestBidderId,
      min_bid_step: auction.minBidStep,
      ends_at: auction.endsAt,
      status: auction.status,
      winner_id: auction.winnerId,
      winning_price: auction.winningPrice,
      category: auction.category,
      created_at: auction.createdAt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('auctions').upsert(payload);
    if (error) {
      console.warn('[Supabase] Failed to upsert auction:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting auction:', err);
    return false;
  }
}

/**
 * Supabase DB의 특정 경매 상태 / 최고 입찰가 / 낙찰 정보 수정
 */
export async function updateAuctionInSupabase(
  auctionId: string,
  updates: Partial<AuctionItem>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    if (updates.icon !== undefined) dbPayload.icon = updates.icon;
    if (updates.startPrice !== undefined) dbPayload.start_price = updates.startPrice;
    if (updates.currentHighestBid !== undefined) dbPayload.current_highest_bid = updates.currentHighestBid;
    if (updates.currentHighestBidderId !== undefined) dbPayload.current_highest_bidder_id = updates.currentHighestBidderId;
    if (updates.minBidStep !== undefined) dbPayload.min_bid_step = updates.minBidStep;
    if (updates.endsAt !== undefined) dbPayload.ends_at = updates.endsAt;
    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.winnerId !== undefined) dbPayload.winner_id = updates.winnerId;
    if (updates.winningPrice !== undefined) dbPayload.winning_price = updates.winningPrice;
    if (updates.category !== undefined) dbPayload.category = updates.category;

    const { error } = await supabase.from('auctions').update(dbPayload).eq('id', auctionId);
    if (error) {
      console.warn('[Supabase] Failed to update auction in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating auction in DB:', err);
    return false;
  }
}

/**
 * Supabase DB에서 특정 경매 삭제
 */
export async function deleteAuctionFromSupabase(auctionId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 해당 경매의 입찰 기록도 함께 정리
    await supabase.from('auction_bids').delete().eq('auction_id', auctionId);

    const { error } = await supabase.from('auctions').delete().eq('id', auctionId);
    if (error) {
      console.warn('[Supabase] Failed to delete auction from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting auction from DB:', err);
    return false;
  }
}

/**
 * Supabase DB에 초기 경매 목록 일괄 시딩/저장
 */
export async function bulkUpsertAuctionsToSupabase(auctionsList: AuctionItem[]): Promise<boolean> {
  if (!supabase || auctionsList.length === 0) return false;
  try {
    const rows = auctionsList.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      start_price: a.startPrice,
      current_highest_bid: a.currentHighestBid,
      current_highest_bidder_id: a.currentHighestBidderId,
      min_bid_step: a.minBidStep,
      ends_at: a.endsAt,
      status: a.status,
      winner_id: a.winnerId,
      winning_price: a.winningPrice,
      category: a.category,
      created_at: a.createdAt,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('auctions').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to bulk upsert auctions:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error in bulkUpsertAuctionsToSupabase:', err);
    return false;
  }
}

/**
 * Supabase DB의 auction_bids 테이블에서 모든 입찰 기록 조회
 */
export async function fetchAuctionBidsFromSupabase(): Promise<AuctionBid[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('auction_bids')
      .select('*')
      .order('bid_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch auction_bids:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: row.id,
      auctionId: row.auction_id,
      userId: row.user_id,
      amount: Number(row.amount ?? 0),
      bidAt: row.bid_at,
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching auction_bids from DB:', err);
    return null;
  }
}

/**
 * Supabase DB에 신규 경매 입찰 기록 삽입
 */
export async function insertAuctionBidToSupabase(bid: AuctionBid): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('auction_bids').insert({
      id: bid.id,
      auction_id: bid.auctionId,
      user_id: bid.userId,
      amount: bid.amount,
      bid_at: bid.bidAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] Failed to insert auction_bid to DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error inserting auction_bid to DB:', err);
    return false;
  }
}

/**
 * ============================================================================
 * [퀘스트 & 할 일 / 숙제 관리 및 수행 로그] Supabase 실시간 연동 함수
 * ============================================================================
 */

/**
 * Supabase DB의 quests 테이블에서 모든 퀘스트 목록 조회
 */
export async function fetchQuestsFromSupabase(): Promise<Quest[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch quests from DB:', error.message);
      // Try fetching without order by created_at if created_at column is missing
      const fallbackRes = await supabase.from('quests').select('*');
      if (fallbackRes.error || !fallbackRes.data) {
        return null;
      }
      return fallbackRes.data.map((row: any) => parseQuestRow(row));
    }

    if (!data) return null;
    return data.map((row: any) => parseQuestRow(row));
  } catch (err) {
    console.warn('[Supabase] Error connecting to quests DB:', err);
    return null;
  }
}

function parseQuestRow(row: any): Quest {
  // JSON array parsing for recurring_days and target_student_ids
  let recurringDays: number[] | undefined = undefined;
  if (row.recurring_days || row.recurringDays) {
    const val = row.recurring_days || row.recurringDays;
    recurringDays = Array.isArray(val)
      ? val
      : typeof val === 'string'
      ? (() => { try { return JSON.parse(val); } catch (e) { return undefined; } })()
      : undefined;
  }

  let targetStudentIds: string[] | undefined = undefined;
  if (row.target_student_ids || row.targetStudentIds) {
    const val = row.target_student_ids || row.targetStudentIds;
    targetStudentIds = Array.isArray(val)
      ? val
      : typeof val === 'string'
      ? (() => { try { return JSON.parse(val); } catch (e) { return undefined; } })()
      : undefined;
  }

  const rawReward = row.reward_points ?? row.reward ?? row.rewardPoints ?? 100;
  const rawTargetType = row.target_student_type || row.target_type || row.targetStudentType || 'all';

  // Determine frequencyType and isRecurring smartly
  const rawFreq = row.frequency_type || row.frequencyType;
  const rawRecurring = row.is_recurring ?? row.isRecurring;
  
  let frequencyType: QuestFrequencyType = 'recurring';
  let isRecurring = true;

  if (rawFreq === 'once' || rawFreq === 'recurring') {
    frequencyType = rawFreq;
    isRecurring = frequencyType === 'recurring';
  } else if (rawRecurring !== undefined && rawRecurring !== null) {
    isRecurring = Boolean(rawRecurring);
    frequencyType = isRecurring ? 'recurring' : 'once';
  } else if (row.due_date || row.dueDate) {
    frequencyType = 'once';
    isRecurring = false;
  }

  return {
    id: String(row.id),
    title: row.title || '퀘스트',
    description: row.description || '',
    questType: row.quest_type || row.questType || 'homework',
    rewardPoints: Number(rawReward),
    statRewardType: (row.stat_reward_type || row.statRewardType || undefined) as StatKey | undefined,
    statRewardAmount:
      row.stat_reward_amount !== undefined && row.stat_reward_amount !== null
        ? Number(row.stat_reward_amount)
        : row.statRewardAmount !== undefined && row.statRewardAmount !== null
        ? Number(row.statRewardAmount)
        : 1,
    isRecurring,
    frequencyType,
    recurringDays,
    targetStudentType: rawTargetType,
    targetStudentIds,
    targetJobId: row.target_job_id || row.targetJobId || undefined,
    dueDate: row.due_date || row.dueDate || undefined,
    icon: row.icon || '📝',
    isArchived: Boolean(row.is_archived ?? row.isArchived ?? false),
    archivedAt: row.archived_at || row.archivedAt || undefined,
  };
}

/**
 * Supabase DB의 quests 테이블에 퀘스트 1건 추가 또는 Upsert (다중 스키마 적응형)
 */
export async function upsertQuestToSupabase(quest: Quest): Promise<boolean> {
  if (!supabase) return false;

  // 1순위: 표준 전체 스키마 (Full modern schema)
  const fullRow: Record<string, any> = {
    id: quest.id,
    title: quest.title,
    description: quest.description || '',
    quest_type: quest.questType,
    reward_points: quest.rewardPoints,
    stat_reward_type: quest.statRewardType || null,
    stat_reward_amount: quest.statRewardAmount !== undefined && quest.statRewardAmount !== null ? Number(quest.statRewardAmount) : 1,
    is_recurring: Boolean(quest.isRecurring),
    frequency_type: quest.frequencyType || 'recurring',
    recurring_days: quest.recurringDays || null,
    target_student_type: quest.targetStudentType || 'all',
    target_student_ids: quest.targetStudentIds || null,
    target_job_id: quest.targetJobId || null,
    due_date: quest.dueDate || null,
    icon: quest.icon || '📝',
    is_archived: Boolean(quest.isArchived),
    archived_at: quest.archivedAt || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { error: fullError } = await supabase.from('quests').upsert(fullRow, { onConflict: 'id' });
    if (!fullError) {
      console.log(`[Supabase] Successfully saved quest (${quest.title}) with full schema.`);
      return true;
    }

    console.warn('[Supabase] Full schema upsert failed, attempting adaptive schema mapping:', fullError.message);

    // 2순위: 사용자 DB 컬럼명 매핑 (reward, target_type 호환)
    const adaptiveRow: Record<string, any> = {
      id: quest.id,
      title: quest.title,
      description: quest.description || '',
      quest_type: quest.questType,
      reward: quest.rewardPoints, // DB 컬럼: reward
      icon: quest.icon || '📝',
      target_type: quest.targetStudentType || 'all', // DB 컬럼: target_type
      target_job_id: quest.targetJobId || null,
      due_date: quest.dueDate || null,
      is_recurring: Boolean(quest.isRecurring),
      recurring_days: quest.recurringDays || null,
      target_student_ids: quest.targetStudentIds || null,
      stat_reward_type: quest.statRewardType || null,
      stat_reward_amount: quest.statRewardAmount || 1,
      frequency_type: quest.frequencyType || 'recurring',
      is_archived: Boolean(quest.isArchived),
    };

    const { error: adaptiveError } = await supabase.from('quests').upsert(adaptiveRow, { onConflict: 'id' });
    if (!adaptiveError) {
      console.log(`[Supabase] Successfully saved quest (${quest.title}) with adaptive schema.`);
      return true;
    }

    console.warn('[Supabase] Adaptive schema upsert failed, attempting minimal core row:', adaptiveError.message);

    // 3순위: 최소 컬럼 (id, title, description, reward, quest_type, icon, target_type, target_job_id)
    const minimalRow: Record<string, any> = {
      id: quest.id,
      title: quest.title,
      description: quest.description || '',
      quest_type: quest.questType,
      reward: quest.rewardPoints,
      icon: quest.icon || '📝',
      target_type: quest.targetStudentType || 'all',
      target_job_id: quest.targetJobId || null,
    };

    const { error: minimalError } = await supabase.from('quests').upsert(minimalRow, { onConflict: 'id' });
    if (!minimalError) {
      console.log(`[Supabase] Successfully saved quest (${quest.title}) with minimal schema.`);
      return true;
    }

    // 4순위: 절대 최소 컬럼
    const absoluteRow: Record<string, any> = {
      id: quest.id,
      title: quest.title,
      reward: quest.rewardPoints,
    };

    const { error: absError } = await supabase.from('quests').upsert(absoluteRow, { onConflict: 'id' });
    if (!absError) {
      console.log(`[Supabase] Successfully saved quest (${quest.title}) with absolute minimal schema.`);
      return true;
    }

    console.error('[Supabase] All upsert attempts failed for quest:', absError.message);
    return false;
  } catch (err) {
    console.error('[Supabase] Error upserting quest in DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 quests 테이블 퀘스트 부분 필드 업데이트 (보관/복원/수정)
 */
export async function updateQuestInSupabase(questId: string, updates: Partial<Quest>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const rowUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.questType !== undefined) rowUpdates.quest_type = updates.questType;
    if (updates.rewardPoints !== undefined) {
      rowUpdates.reward_points = updates.rewardPoints;
      rowUpdates.reward = updates.rewardPoints; // Dual column support
    }
    if (updates.statRewardType !== undefined) rowUpdates.stat_reward_type = updates.statRewardType;
    if (updates.statRewardAmount !== undefined) rowUpdates.stat_reward_amount = updates.statRewardAmount;
    if (updates.isRecurring !== undefined) rowUpdates.is_recurring = updates.isRecurring;
    if (updates.frequencyType !== undefined) rowUpdates.frequency_type = updates.frequencyType;
    if (updates.recurringDays !== undefined) rowUpdates.recurring_days = updates.recurringDays;
    if (updates.targetStudentType !== undefined) {
      rowUpdates.target_student_type = updates.targetStudentType;
      rowUpdates.target_type = updates.targetStudentType; // Dual column support
    }
    if (updates.targetStudentIds !== undefined) rowUpdates.target_student_ids = updates.targetStudentIds;
    if (updates.targetJobId !== undefined) rowUpdates.target_job_id = updates.targetJobId;
    if (updates.dueDate !== undefined) rowUpdates.due_date = updates.dueDate;
    if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
    if (updates.isArchived !== undefined) rowUpdates.is_archived = updates.isArchived;
    if (updates.archivedAt !== undefined) rowUpdates.archived_at = updates.archivedAt;

    const { error } = await supabase.from('quests').update(rowUpdates).eq('id', questId);
    if (error) {
      console.warn('[Supabase] Primary update failed, trying fallback updates:', error.message);
      // Try updating only standard columns
      const fallbackUpdates: Record<string, any> = {};
      if (updates.title !== undefined) fallbackUpdates.title = updates.title;
      if (updates.rewardPoints !== undefined) fallbackUpdates.reward = updates.rewardPoints;
      if (updates.description !== undefined) fallbackUpdates.description = updates.description;
      if (updates.targetStudentType !== undefined) fallbackUpdates.target_type = updates.targetStudentType;
      if (updates.isArchived !== undefined) fallbackUpdates.is_archived = updates.isArchived;

      const fallbackRes = await supabase.from('quests').update(fallbackUpdates).eq('id', questId);
      if (fallbackRes.error) {
        console.error('[Supabase] Failed to update quest with fallback in DB:', fallbackRes.error.message);
        return false;
      }
      return true;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating quest in DB:', err);
    return false;
  }
}

/**
 * Supabase DB에서 특정 퀘스트 영구 삭제
 */
export async function deleteQuestFromSupabase(questId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 관련 로그도 함께 정리
    await supabase.from('quest_logs').delete().eq('quest_id', questId);

    const { error } = await supabase.from('quests').delete().eq('id', questId);
    if (error) {
      console.warn('[Supabase] Failed to delete quest from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting quest from DB:', err);
    return false;
  }
}

/**
 * Supabase DB에 초기 퀘스트 목록 일괄 시딩/저장
 */
export async function bulkUpsertQuestsToSupabase(questsList: Quest[]): Promise<boolean> {
  if (!supabase || questsList.length === 0) return false;
  try {
    // Loop through quests and use adaptive upsert for each to guarantee resilience
    let allSuccess = true;
    for (const q of questsList) {
      const ok = await upsertQuestToSupabase(q);
      if (!ok) allSuccess = false;
    }
    return allSuccess;
  } catch (err) {
    console.warn('[Supabase] Error in bulkUpsertQuestsToSupabase:', err);
    return false;
  }
}

/**
 * Supabase DB의 quest_logs 테이블에서 모든 제출/수행 기록 조회
 */
export async function fetchQuestLogsFromSupabase(): Promise<QuestLog[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('quest_logs')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch quest_logs from DB:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: String(row.id),
      questId: row.quest_id || row.questId,
      userId: row.user_id || row.userId,
      targetDate: row.target_date || row.targetDate || new Date().toISOString().split('T')[0],
      status: row.status as QuestLog['status'],
      studentMemo: row.student_memo || row.studentMemo || undefined,
      rejectReason: row.reject_reason || row.rejectReason || undefined,
      reviewedAt: row.reviewed_at || row.reviewedAt || undefined,
      reviewedBy: row.reviewed_by || row.reviewedBy || undefined,
      isPaid: Boolean(row.is_paid ?? row.isPaid ?? false),
      submittedAt: row.submitted_at || row.submittedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error connecting to quest_logs DB:', err);
    return null;
  }
}

/**
 * Supabase DB의 quest_logs 테이블에 수행 기록 삽입 또는 Upsert (학생 제출, 교사 승인/반려)
 */
export async function upsertQuestLogToSupabase(log: QuestLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = {
      id: log.id,
      quest_id: log.questId,
      user_id: log.userId,
      target_date: log.targetDate,
      status: log.status,
      student_memo: log.studentMemo || null,
      reject_reason: log.rejectReason || null,
      reviewed_at: log.reviewedAt || null,
      reviewed_by: log.reviewedBy || null,
      is_paid: Boolean(log.isPaid),
      submitted_at: log.submittedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('quest_logs').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to upsert quest_log in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting quest_log in DB:', err);
    return false;
  }
}

/**
 * Supabase DB에서 특정 quest_log 삭제
 */
export async function deleteQuestLogFromSupabase(logId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('quest_logs').delete().eq('id', logId);
    if (error) {
      console.warn('[Supabase] Failed to delete quest_log from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting quest_log from DB:', err);
    return false;
  }
}

/**
 * Supabase DB에 초기 퀘스트 로그 일괄 시딩
 */
export async function bulkUpsertQuestLogsToSupabase(logsList: QuestLog[]): Promise<boolean> {
  if (!supabase || logsList.length === 0) return false;
  try {
    const rows = logsList.map((l) => ({
      id: l.id,
      quest_id: l.questId,
      user_id: l.userId,
      target_date: l.targetDate,
      status: l.status,
      student_memo: l.studentMemo || null,
      reject_reason: l.rejectReason || null,
      reviewed_at: l.reviewedAt || null,
      reviewed_by: l.reviewedBy || null,
      is_paid: Boolean(l.isPaid),
      submitted_at: l.submittedAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from('quest_logs').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to bulk upsert quest_logs:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error bulk upserting quest_logs:', err);
    return false;
  }
}

/**
 * Supabase DB의 tax_settings 테이블에서 모든 세금 정책 조회
 */
export async function fetchTaxSettingsFromSupabase(): Promise<TaxSetting[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Failed to fetch tax_settings from DB:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: String(row.id),
      name: row.name || '세금',
      taxType: (row.tax_type || row.taxType || 'percent') as 'percent' | 'fixed',
      value: Number(row.value ?? 0),
      description: row.description || '',
      isActive: Boolean(row.is_active ?? row.isActive ?? true),
    }));
  } catch (err) {
    console.warn('[Supabase] Error connecting to tax_settings DB:', err);
    return null;
  }
}

/**
 * Supabase DB에 세금 정책 1건 추가 또는 Upsert
 */
export async function upsertTaxSettingToSupabase(tax: TaxSetting): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = {
      id: tax.id,
      name: tax.name,
      tax_type: tax.taxType,
      value: tax.value,
      description: tax.description || '',
      is_active: Boolean(tax.isActive),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('tax_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to upsert tax_setting in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting tax_setting in DB:', err);
    return false;
  }
}

/**
 * Supabase DB의 세금 정책 부분 필드 수정
 */
export async function updateTaxSettingInSupabase(taxId: string, updates: Partial<TaxSetting>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const rowUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.taxType !== undefined) rowUpdates.tax_type = updates.taxType;
    if (updates.value !== undefined) rowUpdates.value = updates.value;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.isActive !== undefined) rowUpdates.is_active = updates.isActive;

    const { error } = await supabase.from('tax_settings').update(rowUpdates).eq('id', taxId);
    if (error) {
      console.warn('[Supabase] Failed to update tax_setting in DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating tax_setting in DB:', err);
    return false;
  }
}

/**
 * Supabase DB에서 특정 세금 정책 삭제
 */
export async function deleteTaxSettingFromSupabase(taxId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('tax_settings').delete().eq('id', taxId);
    if (error) {
      console.warn('[Supabase] Failed to delete tax_setting from DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting tax_setting from DB:', err);
    return false;
  }
}

/**
 * Supabase DB에 세금 정책 일괄 업서트/시딩
 */
export async function bulkUpsertTaxSettingsToSupabase(taxList: TaxSetting[]): Promise<boolean> {
  if (!supabase || taxList.length === 0) return false;
  try {
    const rows = taxList.map((tax) => ({
      id: tax.id,
      name: tax.name,
      tax_type: tax.taxType,
      value: tax.value,
      description: tax.description || '',
      is_active: Boolean(tax.isActive),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('tax_settings').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to bulk upsert tax_settings:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error in bulkUpsertTaxSettingsToSupabase:', err);
    return false;
  }
}

/**
 * Supabase DB의 job_applications 테이블에서 모든 직업 지원서 조회
 */
export async function fetchJobApplicationsFromSupabase(): Promise<JobApplication[] | null> {
  if (!supabase) return null;
  try {
    let response = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (response.error) {
      console.warn('[Supabase] Failed to fetch job applications:', response.error.message);
      return null;
    }

    if (!response.data) return null;

    return response.data.map((row: any) => ({
      id: String(row.id),
      userId: row.user_id || row.userId || row.student_id,
      jobId: String(row.job_id || row.jobId),
      proposedJobTitle: row.proposed_job_title || row.proposedJobTitle,
      proposedJobDescription: row.proposed_job_description || row.proposedJobDescription,
      proposedWeeklySalary: row.proposed_weekly_salary !== undefined && row.proposed_weekly_salary !== null ? Number(row.proposed_weekly_salary) : row.proposedWeeklySalary ? Number(row.proposedWeeklySalary) : undefined,
      proposedIcon: row.proposed_icon || row.proposedIcon,
      proposedCategory: row.proposed_category || row.proposedCategory,
      reason: row.reason || '',
      pledge: row.pledge || '',
      status: (row.status || 'pending') as JobApplication['status'],
      rejectReason: row.reject_reason || row.rejectReason,
      appliedAt: row.applied_at || row.appliedAt || new Date().toISOString(),
      reviewedAt: row.reviewed_at || row.reviewedAt,
      reviewedBy: row.reviewed_by || row.reviewedBy,
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching job applications:', err);
    return null;
  }
}

/**
 * Supabase DB의 job_applications 테이블에 지원서 저장/업서트
 */
export async function upsertJobApplicationToSupabase(app: JobApplication): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: app.id,
      user_id: app.userId,
      job_id: app.jobId,
      proposed_job_title: app.proposedJobTitle || null,
      proposed_job_description: app.proposedJobDescription || null,
      proposed_weekly_salary: app.proposedWeeklySalary || null,
      proposed_icon: app.proposedIcon || null,
      proposed_category: app.proposedCategory || null,
      reason: app.reason || '',
      pledge: app.pledge || '',
      status: app.status,
      reject_reason: app.rejectReason || null,
      applied_at: app.appliedAt,
      reviewed_at: app.reviewedAt || null,
      reviewed_by: app.reviewedBy || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('job_applications').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Failed to upsert job application:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting job application:', err);
    return false;
  }
}

/**
 * Supabase DB의 job_applications 테이블에서 특정 지원서 업데이트
 */
export async function updateJobApplicationInSupabase(
  appId: string,
  updates: Partial<JobApplication>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const rowUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.rejectReason !== undefined) rowUpdates.reject_reason = updates.rejectReason;
    if (updates.reviewedAt !== undefined) rowUpdates.reviewed_at = updates.reviewedAt;
    if (updates.reviewedBy !== undefined) rowUpdates.reviewed_by = updates.reviewedBy;

    const { error } = await supabase.from('job_applications').update(rowUpdates).eq('id', appId);
    if (error) {
      console.warn('[Supabase] Failed to update job application:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating job application:', err);
    return false;
  }
}

/**
 * Supabase DB의 job_applications 테이블에서 지원서 삭제 (취소)
 */
export async function deleteJobApplicationFromSupabase(appId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('job_applications').delete().eq('id', appId);
    if (error) {
      console.warn('[Supabase] Failed to delete job application:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting job application:', err);
    return false;
  }
}

/**
 * Supabase DB의 student_job_assignments 테이블에서 학생 직업 배정 목록 조회
 */
export async function fetchStudentJobAssignmentsFromSupabase(): Promise<StudentJobAssignment[] | null> {
  if (!supabase) return null;
  try {
    let response = await supabase
      .from('student_job_assignments')
      .select('*');

    if (response.error) {
      // 대체 테이블명 시도
      response = await supabase.from('student_jobs').select('*');
    }

    if (response.error) {
      console.warn('[Supabase] Failed to fetch student job assignments:', response.error.message);
      return null;
    }

    if (!response.data) return null;

    return response.data.map((row: any) => ({
      id: String(row.id),
      userId: row.user_id || row.userId || row.student_id,
      jobId: String(row.job_id || row.jobId),
      assignedAt: row.assigned_at || row.assignedAt || new Date().toISOString(),
      isActive: Boolean(row.is_active ?? row.isActive ?? true),
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching student job assignments:', err);
    return null;
  }
}

/**
 * Supabase DB의 student_job_assignments 테이블에 배정 추가 또는 업서트
 */
export async function upsertStudentJobAssignmentToSupabase(
  assignment: StudentJobAssignment
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: assignment.id,
      user_id: assignment.userId,
      job_id: assignment.jobId,
      assigned_at: assignment.assignedAt,
      is_active: assignment.isActive,
    };

    let { error } = await supabase.from('student_job_assignments').upsert(payload, { onConflict: 'id' });
    if (error) {
      const res = await supabase.from('student_jobs').upsert(payload, { onConflict: 'id' });
      if (res.error) {
        console.warn('[Supabase] Failed to upsert student job assignment:', error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting student job assignment:', err);
    return false;
  }
}

/**
 * Supabase DB의 student_job_assignments 테이블에서 배정 삭제
 */
export async function deleteStudentJobAssignmentFromSupabase(
  userId: string,
  jobId?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    let query = supabase.from('student_job_assignments').delete().eq('user_id', userId);
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    const { error } = await query;
    if (error) {
      // student_jobs fallback
      let altQuery = supabase.from('student_jobs').delete().eq('user_id', userId);
      if (jobId) altQuery = altQuery.eq('job_id', jobId);
      await altQuery;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting student job assignment:', err);
    return false;
  }
}

/**
 * Supabase DB의 calendar_memos 테이블에서 일별 메모 목록 조회
 */
export async function fetchCalendarMemosFromSupabase(userId?: string): Promise<CalendarMemo[] | null> {
  if (!supabase) return null;
  try {
    let query = supabase.from('calendar_memos').select('*').order('created_at', { ascending: true });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    let response = await query;

    if (response.error) {
      // 대체 테이블명 시도
      let altQuery = supabase.from('student_memos').select('*');
      if (userId) altQuery = altQuery.eq('user_id', userId);
      response = await altQuery;
    }

    if (response.error) {
      console.warn('[Supabase] Failed to fetch calendar memos:', response.error.message);
      return null;
    }

    if (!response.data) return null;

    return response.data.map((row: any) => ({
      id: String(row.id),
      userId: row.user_id || row.userId || row.student_id,
      targetDate: row.target_date || row.targetDate || row.date,
      content: row.content || row.memo || '',
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetching calendar memos:', err);
    return null;
  }
}

/**
 * Supabase DB의 calendar_memos 테이블에 일별 메모 저장/수정
 */
export async function upsertCalendarMemoToSupabase(memo: CalendarMemo): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: memo.id,
      user_id: memo.userId,
      target_date: memo.targetDate,
      content: memo.content,
      created_at: memo.createdAt,
      updated_at: memo.updatedAt,
    };

    let { error } = await supabase.from('calendar_memos').upsert(payload, { onConflict: 'id' });
    if (error) {
      const altRes = await supabase.from('student_memos').upsert(payload, { onConflict: 'id' });
      if (altRes.error) {
        console.warn('[Supabase] Failed to upsert calendar memo:', error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upserting calendar memo:', err);
    return false;
  }
}

/**
 * Supabase DB의 calendar_memos 테이블에서 일별 메모 삭제
 */
export async function deleteCalendarMemoFromSupabase(memoId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    let { error } = await supabase.from('calendar_memos').delete().eq('id', memoId);
    if (error) {
      await supabase.from('student_memos').delete().eq('id', memoId);
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting calendar memo:', err);
    return false;
  }
}




