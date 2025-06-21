'use client';

import { useEffect } from 'react';
import type { SpinResult } from '@/types';

interface SpinResultModalProps {
  result: SpinResult;
  onClose: () => void;
}

export default function SpinResultModal({ result, onClose }: SpinResultModalProps) {
  // 监听ESC键关闭弹窗
  useEffect(() => {
    function handleEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // 阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-bounce">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 弹窗头部 */}
          <div className="text-center pt-8 pb-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              今天就吃这个吧！
            </h2>
          </div>

          {/* 结果展示 */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-6 h-6 rounded-full mr-3"
                  style={{ backgroundColor: result.selectedItem.color }}
                />
                <h3 className="text-2xl font-bold text-white">
                  {result.selectedItem.name}
                </h3>
              </div>
              
              <div className="text-white text-opacity-90 text-sm">
                转盘转动了 {(result.rotation / 360).toFixed(1)} 圈
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                知道了
              </button>
              <button
                onClick={() => {
                  // 重新开始转盘
                  onClose();
                  // 这里可以添加重新转盘的逻辑
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                再转一次
              </button>
            </div>

            {/* 趣味提示 */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                {getRandomTip()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 获取随机趣味提示
 */
function getRandomTip(): string {
  const tips = [
    '🍽️ 美食之旅即将开始！',
    '👨‍🍳 记得搭配蔬菜更健康哦~',
    '🥗 今天的选择看起来不错！',
    '🍜 转盘已经替你做出了最佳选择！',
    '🎯 命运的味蕾指南针指向了这里！',
    '✨ 每一次转动都是新的惊喜！',
    '🌟 相信转盘的选择，开启美味之旅！',
    '🎈 今天的餐桌将因此而丰富！',
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
} 