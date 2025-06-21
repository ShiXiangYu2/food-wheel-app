'use client';

import { useState, useEffect } from 'react';
import { 
  getCurrentUserId, 
  initializeUser 
} from '@/lib/userUtils';
import { 
  getPopularRecipes,
  getUserWheelItems,
  addCustomRecipeToWheel,
  addPopularRecipeToWheel,
  removeRecipeFromWheel,
  convertToWheelSegments
} from '@/lib/recipeService';
import type { 
  PopularRecipe, 
  UserWheelItem, 
  WheelSegment, 
  SpinResult 
} from '@/types';
import WheelComponent from '@/components/WheelComponent';
import RecipeManager from '@/components/RecipeManager';
import SpinResultModal from '@/components/SpinResultModal';

export default function HomePage() {
  // 状态管理
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userWheelItems, setUserWheelItems] = useState<UserWheelItem[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<PopularRecipe[]>([]);
  const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // 初始化用户和数据
  useEffect(() => {
    initializeData();
  }, []);

  // 当用户转盘项目变化时，更新转盘片段
  useEffect(() => {
    const segments = convertToWheelSegments(userWheelItems);
    setWheelSegments(segments);
  }, [userWheelItems]);

  /**
   * 初始化数据
   */
  async function initializeData() {
    try {
      setIsLoading(true);
      
      // 获取或生成用户ID
      const currentUserId = getCurrentUserId();
      setUserId(currentUserId);
      
      // 初始化用户到数据库
      await initializeUser(currentUserId);
      
      // 并行加载数据
      const [popularRecipesData, userWheelItemsData] = await Promise.all([
        getPopularRecipes(),
        getUserWheelItems(currentUserId)
      ]);
      
      setPopularRecipes(popularRecipesData);
      setUserWheelItems(userWheelItemsData);
      
    } catch (error) {
      console.error('初始化数据时出错:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * 添加自定义菜谱
   */
  async function handleAddCustomRecipe(name: string) {
    const success = await addCustomRecipeToWheel(userId, name);
    if (success) {
      // 重新加载用户转盘项目
      const updatedItems = await getUserWheelItems(userId);
      setUserWheelItems(updatedItems);
    }
  }

  /**
   * 添加流行菜谱
   */
  async function handleAddPopularRecipe(recipe: PopularRecipe) {
    const success = await addPopularRecipeToWheel(userId, recipe);
    if (success) {
      // 重新加载用户转盘项目
      const updatedItems = await getUserWheelItems(userId);
      setUserWheelItems(updatedItems);
    }
  }

  /**
   * 移除菜谱
   */
  async function handleRemoveRecipe(itemId: number) {
    const success = await removeRecipeFromWheel(itemId);
    if (success) {
      // 重新加载用户转盘项目
      const updatedItems = await getUserWheelItems(userId);
      setUserWheelItems(updatedItems);
    }
  }

  /**
   * 处理转盘旋转完成
   */
  function handleSpinComplete(result: SpinResult) {
    setSpinResult(result);
    setShowResultModal(true);
    setIsSpinning(false);
  }

  /**
   * 开始转盘旋转
   */
  function handleStartSpin() {
    if (wheelSegments.length === 0) {
      alert('请先添加一些菜谱到转盘中！');
      return;
    }
    setIsSpinning(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 转盘区域 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-md">
            <WheelComponent
              segments={wheelSegments}
              isSpinning={isSpinning}
              onSpinComplete={handleSpinComplete}
            />
          </div>
          
          <button
            onClick={handleStartSpin}
            disabled={isSpinning || wheelSegments.length === 0}
            className={`
              px-8 py-3 rounded-full font-semibold text-lg transition-all duration-200
              ${isSpinning || wheelSegments.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {isSpinning ? '转盘旋转中...' : '🎲 开始转盘'}
          </button>
          
          {wheelSegments.length === 0 && (
            <p className="text-gray-500 text-center">
              请在右侧添加菜谱到转盘中，然后开始旋转！
            </p>
          )}
        </div>

        {/* 菜谱管理区域 */}
        <div className="lg:pl-8">
          <RecipeManager
            userItems={userWheelItems}
            popularRecipes={popularRecipes}
            onAddCustomRecipe={handleAddCustomRecipe}
            onAddPopularRecipe={handleAddPopularRecipe}
            onRemoveRecipe={handleRemoveRecipe}
          />
        </div>
      </div>

      {/* 结果弹窗 */}
      {showResultModal && spinResult && (
        <SpinResultModal
          result={spinResult}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
} 