'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: error.message 
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary捕获到错误:', error)
    console.error('🔍 错误详情:', errorInfo)
    
    this.setState({
      error,
      errorInfo: error.message + '\n' + errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="h-full w-full bg-gradient-to-b from-red-900 to-black flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-medium mb-4">
              系统遇到错误
            </h2>
            <div className="text-red-300 text-sm mb-6 bg-red-900 bg-opacity-50 rounded-lg p-4 text-left font-mono">
              <div className="mb-2">错误信息:</div>
              <div className="text-red-200 whitespace-pre-wrap">
                {this.state.error?.message || '未知错误'}
              </div>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                window.location.reload()
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary