'use client';

import { useState } from 'react';
import type { RecipeManagerProps } from '@/types';
import { validateRecipeName } from '@/lib/recipeService';

export default function RecipeManager({
  userItems,
  popularRecipes,
  onAddCustomRecipe,
  onAddPopularRecipe,
  onRemoveRecipe
}: RecipeManagerProps) {
  const [customRecipeName, setCustomRecipeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'popular' | 'custom'>('current');

  /**
   * 处理添加自定义菜谱
   */
  async function handleAddCustomRecipe(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateRecipeName(customRecipeName)) {
      alert('请输入有效的菜谱名称（1-50个字符）');
      return;
    }

    // 检查是否已存在
    const exists = userItems.some(item => 
      item.recipe_name.toLowerCase() === customRecipeName.toLowerCase()
    );
    
    if (exists) {
      alert('该菜谱已存在于转盘中');
      return;
    }

    if (userItems.length >= 12) {
      alert('转盘最多只能添加12个菜谱');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCustomRecipe(customRecipeName);
      setCustomRecipeName('');
    } catch (error) {
      console.error('添加自定义菜谱失败:', error);
      alert('添加失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * 处理添加流行菜谱
   */
  async function handleAddPopularRecipe(recipe: any) {
    // 检查是否已存在
    const exists = userItems.some(item => 
      item.recipe_name.toLowerCase() === recipe.name.toLowerCase()
    );
    
    if (exists) {
      alert('该菜谱已存在于转盘中');
      return;
    }

    if (userItems.length >= 12) {
      alert('转盘最多只能添加12个菜谱');
      return;
    }

    try {
      await onAddPopularRecipe(recipe);
    } catch (error) {
      console.error('添加流行菜谱失败:', error);
      alert('添加失败，请重试');
    }
  }

  /**
   * 处理删除菜谱
   */
  async function handleRemoveRecipe(itemId: number) {
    if (confirm('确定要删除这个菜谱吗？')) {
      try {
        await onRemoveRecipe(itemId);
      } catch (error) {
        console.error('删除菜谱失败:', error);
        alert('删除失败，请重试');
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 标签导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 pt-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            当前转盘 ({userItems.length}/12)
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'popular'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            流行菜谱
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'custom'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            自定义添加
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* 当前转盘标签页 */}
        {activeTab === 'current' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              当前转盘菜谱
            </h3>
            {userItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <p className="text-gray-500">还没有添加任何菜谱</p>
                <p className="text-gray-400 text-sm mt-2">
                  点击&ldquo;流行菜谱&rdquo;或&ldquo;自定义添加&rdquo;来添加菜谱
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userItems.map((item) => (
                  <div
                    key={item.id}
                    className="recipe-card flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.recipe_name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.source_type === 'popular' ? '流行' : '自定义'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveRecipe(item.id)}
                      className="btn-danger"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 流行菜谱标签页 */}
        {activeTab === 'popular' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              流行菜谱推荐
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {popularRecipes.map((recipe) => {
                const isAdded = userItems.some(item => 
                  item.recipe_name.toLowerCase() === recipe.name.toLowerCase()
                );
                
                return (
                  <div key={recipe.id} className="recipe-card flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {recipe.name}
                    </span>
                    <button
                      onClick={() => handleAddPopularRecipe(recipe)}
                      disabled={isAdded || userItems.length >= 12}
                      className={`
                        font-medium py-1 px-3 rounded text-sm transition-colors duration-200
                        ${isAdded 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : userItems.length >= 12
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        }
                      `}
                    >
                      {isAdded ? '已添加' : userItems.length >= 12 ? '已满' : '添加'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 自定义添加标签页 */}
        {activeTab === 'custom' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              添加自定义菜谱
            </h3>
            <form onSubmit={handleAddCustomRecipe} className="space-y-4">
              <div>
                <label htmlFor="customRecipe" className="block text-sm font-medium text-gray-700 mb-2">
                  菜谱名称
                </label>
                <input
                  type="text"
                  id="customRecipe"
                  value={customRecipeName}
                  onChange={(e) => setCustomRecipeName(e.target.value)}
                  placeholder="输入你想吃的菜名..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={50}
                  disabled={isSubmitting || userItems.length >= 12}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {customRecipeName.length}/50字符 | 转盘还可添加 {Math.max(0, 12 - userItems.length)} 个菜谱
                </p>
              </div>
              <button
                type="submit"
                disabled={
                  !customRecipeName.trim() || 
                  isSubmitting || 
                  userItems.length >= 12 ||
                  !validateRecipeName(customRecipeName)
                }
                className={`
                  btn-primary w-full
                  ${(!customRecipeName.trim() || 
                     isSubmitting || 
                     userItems.length >= 12 ||
                     !validateRecipeName(customRecipeName))
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                  }
                `}
              >
                {isSubmitting ? '添加中...' : '添加到转盘'}
              </button>
            </form>
            
            {userItems.length >= 12 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  ⚠️ 转盘已满（12个菜谱），请先删除一些菜谱再添加新的。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 