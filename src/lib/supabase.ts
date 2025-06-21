import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 由于我们使用UUID，不需要持久化session
  },
});

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  POPULAR_RECIPES: 'popular_recipes',
  USER_CUSTOM_RECIPES: 'user_custom_recipes',
  USER_WHEEL_ITEMS: 'user_wheel_items',
} as const; 