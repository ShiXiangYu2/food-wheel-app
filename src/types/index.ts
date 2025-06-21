// 用户相关类型
export interface User {
  id: string;
  created_at: string;
}

// 菜谱相关类型
export interface PopularRecipe {
  id: number;
  name: string;
  created_at: string;
}

export interface UserCustomRecipe {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
}

export interface UserWheelItem {
  id: number;
  user_id: string;
  recipe_name: string;
  source_type: 'popular' | 'custom';
  color: string;
  created_at: string;
}

// 转盘相关类型
export interface WheelSegment {
  id: number;
  name: string;
  color: string;
  angle: number;
  startAngle: number;
  endAngle: number;
}

export interface SpinResult {
  selectedItem: WheelSegment;
  rotation: number;
  duration: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

// 组件Props类型
export interface WheelProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  onSpinComplete: (result: SpinResult) => void;
}

export interface RecipeManagerProps {
  userItems: UserWheelItem[];
  popularRecipes: PopularRecipe[];
  onAddCustomRecipe: (name: string) => Promise<void>;
  onAddPopularRecipe: (recipe: PopularRecipe) => Promise<void>;
  onRemoveRecipe: (id: number) => Promise<void>;
}

// 表单类型
export interface AddRecipeForm {
  name: string;
}

// 工具类型
export type RecipeSource = 'popular' | 'custom';

// 常量类型
export const WHEEL_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
] as const;

export type WheelColor = typeof WHEEL_COLORS[number]; 