import { v4 as uuidv4 } from 'uuid';
import { supabase, TABLES } from './supabase';
import type { User } from '@/types';

const USER_ID_KEY = 'food_wheel_user_id';

/**
 * 生成并存储新的用户ID
 * @returns 新生成的用户ID
 */
export function generateUserId(): string {
  const userId = uuidv4();
  
  // 存储到LocalStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * 从LocalStorage获取用户ID
 * @returns 用户ID或null
 */
export function getUserIdFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * 获取或生成用户ID
 * @returns 用户ID
 */
export function getCurrentUserId(): string {
  let userId = getUserIdFromStorage();
  
  if (!userId) {
    userId = generateUserId();
  }
  
  return userId;
}

/**
 * 初始化用户数据到数据库
 * @param userId 用户ID
 * @returns Promise<boolean> 成功返回true，失败返回false
 */
export async function initializeUser(userId: string): Promise<boolean> {
  try {
    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116是"未找到记录"的错误码，这是正常的
      console.error('检查用户存在性时出错:', checkError);
      return false;
    }

    // 如果用户不存在，创建新用户
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from(TABLES.USERS)
        .insert([{ id: userId }]);

      if (insertError) {
        console.error('创建用户时出错:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('初始化用户时出错:', error);
    return false;
  }
}

/**
 * 清除用户数据（用于调试）
 */
export function clearUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
}

/**
 * 验证用户ID格式
 * @param userId 用户ID
 * @returns 是否为有效的UUID格式
 */
export function isValidUserId(userId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
} 