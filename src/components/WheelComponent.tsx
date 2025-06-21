'use client';

import { useState, useEffect, useRef } from 'react';
import type { WheelProps, SpinResult } from '@/types';

export default function WheelComponent({ 
  segments, 
  isSpinning, 
  onSpinComplete 
}: WheelProps) {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  
  // 转盘尺寸常量
  const WHEEL_SIZE = 300;
  const WHEEL_RADIUS = WHEEL_SIZE / 2;
  const CENTER = WHEEL_RADIUS;

  useEffect(() => {
    if (isSpinning && segments.length > 0) {
      startSpin();
    }
  }, [isSpinning, segments]);

  /**
   * 开始转盘旋转
   */
  function startSpin() {
    if (segments.length === 0) return;

    // 生成随机旋转角度（3-6圈 + 随机角度）
    const randomRotation = Math.random() * 360;
    const fullSpins = 3 + Math.random() * 3; // 3-6圈
    const finalRotation = currentRotation + (fullSpins * 360) + randomRotation;
    
    // 计算最终选中的片段
    const normalizedAngle = (360 - (finalRotation % 360)) % 360;
    const selectedSegment = findSelectedSegment(normalizedAngle);
    
    if (!selectedSegment) return;

    // 设置动画
    setIsAnimating(true);
    setCurrentRotation(finalRotation);

    // 动画完成后触发回调
    setTimeout(() => {
      setIsAnimating(false);
      const result: SpinResult = {
        selectedItem: selectedSegment,
        rotation: finalRotation,
        duration: 3000
      };
      onSpinComplete(result);
    }, 3000);
  }

  /**
   * 根据角度找到选中的片段
   */
  function findSelectedSegment(angle: number) {
    for (const segment of segments) {
      if (angle >= segment.startAngle && angle < segment.endAngle) {
        return segment;
      }
    }
    // 如果没找到，返回第一个片段（边界情况）
    return segments[0];
  }

  /**
   * 创建SVG路径
   */
  function createSegmentPath(segment: any, index: number) {
    const { startAngle, endAngle } = segment;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = CENTER + (WHEEL_RADIUS - 20) * Math.cos(startRad);
    const y1 = CENTER + (WHEEL_RADIUS - 20) * Math.sin(startRad);
    const x2 = CENTER + (WHEEL_RADIUS - 20) * Math.cos(endRad);
    const y2 = CENTER + (WHEEL_RADIUS - 20) * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${CENTER} ${CENTER}`,
      `L ${x1} ${y1}`,
      `A ${WHEEL_RADIUS - 20} ${WHEEL_RADIUS - 20} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return pathData;
  }

  /**
   * 计算文本位置
   */
  function getTextPosition(segment: any) {
    const midAngle = (segment.startAngle + segment.endAngle) / 2;
    const textRadius = (WHEEL_RADIUS - 20) * 0.7;
    const midRad = (midAngle * Math.PI) / 180;
    
    const x = CENTER + textRadius * Math.cos(midRad);
    const y = CENTER + textRadius * Math.sin(midRad);
    
    return { x, y, angle: midAngle };
  }

  if (segments.length === 0) {
    return (
      <div className="wheel-container" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-full">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">转盘为空</p>
            <p className="text-sm">请添加菜谱</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wheel-container" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      {/* 转盘指针 */}
      <div className="wheel-pointer" />
      
      {/* SVG转盘 */}
      <svg
        ref={wheelRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="drop-shadow-lg"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: isAnimating ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
        }}
      >
        {/* 转盘片段 */}
        {segments.map((segment, index) => {
          const textPos = getTextPosition(segment);
          return (
            <g key={segment.id}>
              {/* 片段背景 */}
              <path
                d={createSegmentPath(segment, index)}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="2"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* 片段文本 */}
              <text
                x={textPos.x}
                y={textPos.y}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                style={{
                  filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))',
                }}
              >
                {segment.name.length > 8 ? `${segment.name.slice(0, 6)}...` : segment.name}
              </text>
            </g>
          );
        })}
        
        {/* 中心圆 */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="30"
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth="2"
          className="drop-shadow-md"
        />
        
        {/* 中心装饰 */}
        <text
          x={CENTER}
          y={CENTER}
          fill="#6b7280"
          fontSize="24"
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
        >
          🍽️
        </text>
      </svg>
      
      {/* 转盘状态提示 */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            转盘旋转中...
          </div>
        </div>
      )}
    </div>
  );
} 