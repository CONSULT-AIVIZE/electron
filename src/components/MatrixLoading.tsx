'use client'

import React, { useEffect, useState } from 'react'

interface CodeGenerationLoadingProps {
  message?: string
  onComplete?: () => void
  duration?: number
  minDuration?: number
}

const CodeGenerationLoading: React.FC<CodeGenerationLoadingProps> = ({ 
  message = "AI正在生成页面...", 
  onComplete, 
  duration = 3000,
  minDuration = 2000
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentCode, setCurrentCode] = useState('')
  
  const codeSteps = [
    'import React from "react"',
    'import { useState, useEffect } from "react"',
    'const Component = () => {',
    '  const [loading, setLoading] = useState(true)',
    '  const [data, setData] = useState(null)',
    '',
    '  useEffect(() => {',
    '    fetchData().then(response => {',
    '      setData(response)',
    '      setLoading(false)',
    '    })',
    '  }, [])',
    '',
    '  if (loading) return <Loading />',
    '',
    '  return (',
    '    <div className="container">',
    '      <h1>Welcome to Triangle OS</h1>',
    '      <div className="content">',
    '        {data && <DataView data={data} />}',
    '      </div>',
    '    </div>',
    '  )',
    '}',
    '',
    'export default Component'
  ]

  useEffect(() => {
    let lineIndex = 0
    const typeInterval = setInterval(() => {
      if (lineIndex < codeSteps.length) {
        setCurrentCode(prev => prev + codeSteps[lineIndex] + '\n')
        setCurrentStep(lineIndex)
        lineIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, 80)

    const effectiveDuration = Math.max(duration, minDuration)
    const completeTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, effectiveDuration)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(completeTimeout)
    }
  }, [duration, minDuration, onComplete])

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 flex flex-col items-center justify-center">
      {/* 背景动态效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full px-8">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-light text-white tracking-wide">TRIANGLE OS</h1>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400">AI 正在生成界面代码...</p>
        </div>

        {/* 代码编辑器模拟 */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl">
          {/* 编辑器标题栏 */}
          <div className="flex items-center px-4 py-3 bg-gray-800/60 border-b border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-400 text-sm font-mono">component.tsx</span>
            </div>
          </div>

          {/* 代码区域 */}
          <div className="p-6 font-mono text-sm leading-relaxed min-h-[400px] max-h-[500px] overflow-hidden">
            <pre className="text-gray-300 whitespace-pre-wrap">
              {currentCode.split('\n').map((line, index) => (
                <div key={index} className={`${index === currentStep ? 'bg-blue-500/20 animate-pulse' : ''} min-h-[1.5em]`}>
                  <span className="text-gray-600 mr-4 select-none">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className={getLineColor(line)}>{line || ' '}</span>
                  {index === currentStep && (
                    <span className="animate-pulse text-emerald-400">|</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center justify-center mt-8 gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-sm">正在生成组件...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <span className="text-gray-400 text-sm">类型检查中...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <span className="text-gray-400 text-sm">编译优化...</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, (currentStep / codeSteps.length) * 100)}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>代码生成</span>
            <span>{Math.min(100, Math.round((currentStep / codeSteps.length) * 100))}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 根据代码内容返回对应的颜色类
function getLineColor(line: string): string {
  if (line.trim().startsWith('import')) return 'text-pink-400'
  if (line.trim().startsWith('const') || line.trim().startsWith('let') || line.trim().startsWith('var')) return 'text-blue-400'
  if (line.includes('useState') || line.includes('useEffect')) return 'text-purple-400'
  if (line.includes('return')) return 'text-yellow-400'
  if (line.includes('className') || line.includes('<') || line.includes('>')) return 'text-green-400'
  if (line.trim().startsWith('//')) return 'text-gray-500'
  return 'text-gray-300'
}

export default CodeGenerationLoading