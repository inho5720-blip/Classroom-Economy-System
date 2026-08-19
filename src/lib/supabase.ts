import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, StudentStats } from '../types';

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
    return data.map((row: any) => ({
      id: row.id,
      studentNumber: row.student_number || undefined,
      name: row.name,
      nickname: row.nickname,
      passwordHash: row.password_hash || '1234',
      role: row.role as 'teacher' | 'student',
      points: Number(row.points ?? 1000),
      mainTitleId: row.main_title_id || undefined,
      avatarEmoji: row.avatar_emoji || (row.role === 'teacher' ? '👨‍🏫' : '🧙‍♂️'),
      avatarColor: row.avatar_color || 'from-amber-400 to-orange-500',
      consecutiveSuccessDays: Number(row.consecutive_success_days ?? 0),
      unspentDays: Number(row.unspent_days ?? 0),
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
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
        diligence: Number(row.diligence ?? 10),
        frugality: Number(row.frugality ?? 10),
        contribution: Number(row.contribution ?? 10),
        wisdom: Number(row.wisdom ?? 10),
        credit: Number(row.credit ?? 10),
      };
    });
    return statsMap;
  } catch (err) {
    console.warn('[Supabase] Error connecting to stats DB:', err);
    return null;
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

    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.nickname !== undefined) dbPayload.nickname = updates.nickname;
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
      console.warn('[Supabase] Profile update failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error updating profile:', err);
    return false;
  }
}
