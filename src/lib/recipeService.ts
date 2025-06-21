import { supabase, TABLES } from './supabase';
import { WHEEL_COLORS } from '@/types';
import type { 
  PopularRecipe, 
  UserCustomRecipe, 
  UserWheelItem, 
  WheelSegment,
  WheelColor
} from '@/types';

/**
 * 获取所有流行菜谱
 * @returns Promise<PopularRecipe[]>
 */
export async function getPopularRecipes(): Promise<PopularRecipe[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.POPULAR_RECIPES)
      .select('*')
      .order('name');

    if (error) {
      console.error('获取流行菜谱时出错:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取流行菜谱时出错:', error);
    return [];
  }
}

/**
 * 获取用户的转盘项目
 * @param userId 用户ID
 * @returns Promise<UserWheelItem[]>
 */
export async function getUserWheelItems(userId: string): Promise<UserWheelItem[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at');

    if (error) {
      console.error('获取用户转盘项目时出错:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取用户转盘项目时出错:', error);
    return [];
  }
}

/**
 * 添加自定义菜谱到转盘
 * @param userId 用户ID
 * @param recipeName 菜谱名称
 * @returns Promise<boolean>
 */
export async function addCustomRecipeToWheel(userId: string, recipeName: string): Promise<boolean> {
  try {
    // 获取用户当前所有转盘项目（用于重复检查和计数）
    const { data: allItems, error: fetchError } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .select('recipe_name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('获取用户转盘项目时出错:', fetchError);
      return false;
    }

    // 客户端检查是否已存在同名菜谱
    const existing = allItems?.find(item => item.recipe_name === recipeName);
    if (existing) {
      console.warn('菜谱已存在于转盘中');
      return false;
    }

    // 检查转盘项目数量限制
    const currentCount = allItems?.length || 0;
    if (currentCount >= 12) {
      console.warn('转盘项目已达到最大数量（12个）');
      return false;
    }

    // 为新项目分配颜色
    const color = getNextAvailableColor(currentCount);

    // 添加到转盘项目
    const { error } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .insert([{
        user_id: userId,
        recipe_name: recipeName,
        source_type: 'custom' as const,
        color: color
      }]);

    if (error) {
      console.error('添加自定义菜谱时出错:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('添加自定义菜谱时出错:', error);
    return false;
  }
}

/**
 * 添加流行菜谱到转盘
 * @param userId 用户ID
 * @param recipe 流行菜谱
 * @returns Promise<boolean>
 */
export async function addPopularRecipeToWheel(userId: string, recipe: PopularRecipe): Promise<boolean> {
  try {
    // 获取用户当前所有转盘项目（用于重复检查和计数）
    const { data: allItems, error: fetchError } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .select('recipe_name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('获取用户转盘项目时出错:', fetchError);
      return false;
    }

    // 客户端检查是否已存在同名菜谱
    const existing = allItems?.find(item => item.recipe_name === recipe.name);
    if (existing) {
      console.warn('菜谱已存在于转盘中');
      return false;
    }

    // 检查转盘项目数量限制
    const currentCount = allItems?.length || 0;
    if (currentCount >= 12) {
      console.warn('转盘项目已达到最大数量（12个）');
      return false;
    }

    // 为新项目分配颜色
    const color = getNextAvailableColor(currentCount);

    // 添加到转盘项目
    const { error } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .insert([{
        user_id: userId,
        recipe_name: recipe.name,
        source_type: 'popular' as const,
        color: color
      }]);

    if (error) {
      console.error('添加流行菜谱时出错:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('添加流行菜谱时出错:', error);
    return false;
  }
}

/**
 * 从转盘中移除菜谱
 * @param itemId 转盘项目ID
 * @returns Promise<boolean>
 */
export async function removeRecipeFromWheel(itemId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES.USER_WHEEL_ITEMS)
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('移除菜谱时出错:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('移除菜谱时出错:', error);
    return false;
  }
}

/**
 * 将转盘项目转换为转盘片段
 * @param items 用户转盘项目
 * @returns WheelSegment[]
 */
export function convertToWheelSegments(items: UserWheelItem[]): WheelSegment[] {
  if (items.length === 0) return [];

  const segmentAngle = 360 / items.length;
  
  return items.map((item, index) => ({
    id: item.id,
    name: item.recipe_name,
    color: item.color,
    angle: segmentAngle,
    startAngle: index * segmentAngle,
    endAngle: (index + 1) * segmentAngle,
  }));
}

/**
 * 获取下一个可用的颜色
 * @param currentCount 当前项目数量
 * @returns 颜色值
 */
function getNextAvailableColor(currentCount: number): string {
  return WHEEL_COLORS[currentCount % WHEEL_COLORS.length];
}

/**
 * 验证菜谱名称
 * @param name 菜谱名称
 * @returns 是否有效
 */
export function validateRecipeName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 50;
} 