'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MatrixLoadingProps {
  message?: string
  onComplete?: () => void
  duration?: number // 持续时间，毫秒
  minDuration?: number // 最小显示时间，确保用户看到效果
}

const MatrixLoading: React.FC<MatrixLoadingProps> = ({ 
  message = "AI正在生成页面...", 
  onComplete, 
  duration = 3000,
  minDuration = 2000
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小 - 使用父容器大小而不是整个窗口
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      } else {
        // 回退到窗口大小
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Matrix代码雨字符
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+-=[]{}|;':\",./<>?`~"
    const charArray = chars.split('')

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    
    // 每列的当前位置和字符池
    const drops: number[] = []
    const charPool: string[][] = []
    
    // 初始化每列的字符池，减少随机性导致的抖动
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.floor(Math.random() * canvas.height / fontSize)
      charPool[x] = []
      // 为每列预生成字符序列
      for (let y = 0; y < Math.ceil(canvas.height / fontSize) + 20; y++) {
        charPool[x][y] = charArray[Math.floor(Math.random() * charArray.length)]
      }
    }

    // 绘制函数
    const draw = () => {
      // 半透明黑色背景，产生拖尾效果
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 设置固定的字体避免抖动
      ctx.font = `${fontSize}px 'Courier New', monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      // 绘制每列的字符
      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize
        const y = drops[i] * fontSize
        
        // 使用预生成的字符减少随机性
        const charIndex = Math.floor(drops[i]) % charPool[i].length
        const text = charPool[i][charIndex] || '0'
        
        // 顶部字符更亮
        if (drops[i] < 5) {
          ctx.fillStyle = '#ffffff'
        } else if (drops[i] < 10) {
          ctx.fillStyle = '#00ff88'
        } else {
          ctx.fillStyle = '#00cc55'
        }
        
        // 使用整数坐标避免字符抖动
        ctx.fillText(text, Math.floor(x), Math.floor(y))

        // 重置条件优化，避免太频繁的重置
        if (drops[i] * fontSize > canvas.height + fontSize * 10 && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20)
          // 重新生成这一列的字符
          for (let k = 0; k < charPool[i].length; k++) {
            if (Math.random() > 0.7) { // 只更新部分字符
              charPool[i][k] = charArray[Math.floor(Math.random() * charArray.length)]
            }
          }
        }
        
        drops[i] += 0.8 // 加快下降速度
      }
    }

    // 动画循环
    const animate = () => {
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // 确保在动画完成后调用onComplete
    const effectiveDuration = Math.max(duration, minDuration)
    console.log('🕒 MatrixLoading: 设置完成回调，时长:', effectiveDuration)
    
    const completeTimeout = setTimeout(() => {
      console.log('✅ MatrixLoading: 执行完成回调，调用onComplete')
      try {
        if (onComplete) {
          onComplete()
          console.log('✅ MatrixLoading: onComplete调用成功')
        } else {
          console.warn('⚠️ MatrixLoading: onComplete为空')
        }
      } catch (error) {
        console.error('❌ MatrixLoading: onComplete调用失败:', error)
      }
    }, effectiveDuration)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (completeTimeout) {
        clearTimeout(completeTimeout)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [duration, minDuration, onComplete])

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'black' }}
      />
      
      {/* 简洁的加载界面覆盖层 */}
      <div className="matrix-loading-container">
        {/* AI标题 */}
        <div className="matrix-title">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="matrix-title-text">TRIANGLE OS AI</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* 居中的进度条 */}
        <div className="matrix-progress-bar">
          <div className="matrix-progress-fill matrix-progress-animate" />
        </div>
        
        {/* 代码生成提示 */}
        <div className="matrix-code-status">
          <div className="matrix-status-line matrix-status-1">
            <span className="status-prompt">&gt;</span>
            <span className="status-text">Loading large language model...</span>
          </div>
          <div className="matrix-status-line matrix-status-2">
            <span className="status-prompt">&gt;</span>
            <span className="status-text">AI generating interface code...</span>
          </div>
          <div className="matrix-status-line matrix-status-3">
            <span className="status-prompt">&gt;</span>
            <span className="status-text">Code compilation complete...</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .matrix-loading-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        
        .matrix-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .matrix-title-text {
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 400;
          font-size: 18px;
          color: #22c55e;
          letter-spacing: 0.1em;
        }
        
        .matrix-code-status {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 300px;
          font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
        }
        
        .matrix-status-line {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          font-size: 12px;
        }
        
        .status-prompt {
          color: #16a34a;
          font-weight: bold;
        }
        
        .status-text {
          color: #22c55e;
          opacity: 0.8;
        }
        
        .matrix-status-1 {
          animation: fadeInType 0.8s ease-out 0.5s forwards;
        }
        
        .matrix-status-2 {
          animation: fadeInType 0.8s ease-out 1.2s forwards;
        }
        
        .matrix-status-3 {
          animation: fadeInType 0.8s ease-out 2.0s forwards;
        }
        
        .matrix-progress-bar {
          width: 400px;
          height: 2px;
          background-color: #1f2937;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
        }
        
        .matrix-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
          background-size: 200% 100%;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
        }
        
        .matrix-progress-animate {
          width: 0%;
          animation: progress-fill 3s ease-out forwards, progress-glow 2s ease-in-out infinite;
        }
        
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes progress-glow {
          0%, 100% { 
            background-position: 0% 50%;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
          }
          50% { 
            background-position: 100% 50%;
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
          }
        }
        
        @keyframes fadeInType {
          0% { 
            opacity: 0;
            transform: translateX(-10px);
          }
          100% { 
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

export default MatrixLoading