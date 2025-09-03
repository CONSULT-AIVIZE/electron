// AI样式修改器：根据用户意图生成和应用CSS样式
export interface StyleModificationRequest {
  intent: string        // 用户的修改意图，如"让按钮更大"、"改成深色主题"
  scope: 'page' | 'element' | 'global'  // 修改范围
  target?: string       // 目标元素选择器（当scope为element时）
  context?: {
    currentStyles?: string  // 当前页面的样式信息
    pageType?: string      // 页面类型
    colorScheme?: 'light' | 'dark'
  }
}

export interface StyleModificationResult {
  success: boolean
  css: string          // 生成的CSS样式
  description: string  // 修改描述
  error?: string
}

export class AIStyleModifier {
  private styleCache: Map<string, string> = new Map()
  private appliedStyles: Set<string> = new Set()

  async modifyStyle(request: StyleModificationRequest): Promise<StyleModificationResult> {
    try {
      // 分析用户意图
      const analysis = this.analyzeIntent(request.intent)
      
      // 生成CSS样式
      const css = this.generateCSS(analysis, request)
      
      // 返回结果
      return {
        success: true,
        css,
        description: `已根据"${request.intent}"生成样式修改`
      }
    } catch (error) {
      return {
        success: false,
        css: '',
        description: '',
        error: `样式生成失败: ${error}`
      }
    }
  }

  private analyzeIntent(intent: string): StyleIntent {
    const normalizedIntent = intent.toLowerCase()
    
    // 颜色相关
    if (this.matchesPattern(normalizedIntent, ['颜色', '色彩', 'color'])) {
      return this.analyzeColorIntent(normalizedIntent)
    }
    
    // 大小相关
    if (this.matchesPattern(normalizedIntent, ['大', '小', 'size', '尺寸'])) {
      return this.analyzeSizeIntent(normalizedIntent)
    }
    
    // 布局相关
    if (this.matchesPattern(normalizedIntent, ['布局', 'layout', '排列', '对齐'])) {
      return this.analyzeLayoutIntent(normalizedIntent)
    }
    
    // 主题相关
    if (this.matchesPattern(normalizedIntent, ['主题', 'theme', '深色', '浅色', '暗色'])) {
      return this.analyzeThemeIntent(normalizedIntent)
    }
    
    // 动画相关
    if (this.matchesPattern(normalizedIntent, ['动画', 'animation', '过渡', 'transition'])) {
      return this.analyzeAnimationIntent(normalizedIntent)
    }
    
    // 默认处理
    return {
      type: 'general',
      properties: ['all'],
      values: {},
      description: intent
    }
  }

  private analyzeColorIntent(intent: string): StyleIntent {
    const colorMap: Record<string, string> = {
      '红色': '#ef4444', '红': '#ef4444',
      '蓝色': '#3b82f6', '蓝': '#3b82f6',
      '绿色': '#10b981', '绿': '#10b981',
      '黄色': '#f59e0b', '黄': '#f59e0b',
      '紫色': '#8b5cf6', '紫': '#8b5cf6',
      '橙色': '#f97316', '橙': '#f97316',
      '粉色': '#ec4899', '粉': '#ec4899',
      '灰色': '#6b7280', '灰': '#6b7280',
      '黑色': '#000000', '黑': '#000000',
      '白色': '#ffffff', '白': '#ffffff'
    }

    let targetColor = '#3b82f6' // 默认蓝色
    
    for (const [key, value] of Object.entries(colorMap)) {
      if (intent.includes(key)) {
        targetColor = value
        break
      }
    }

    return {
      type: 'color',
      properties: ['background-color', 'border-color', 'color'],
      values: {
        'background-color': targetColor,
        'border-color': targetColor,
        'color': intent.includes('文字') || intent.includes('字体') ? targetColor : undefined
      },
      description: `修改颜色为${targetColor}`
    }
  }

  private analyzeSizeIntent(intent: string): StyleIntent {
    let sizeMultiplier = 1.2 // 默认放大20%
    
    if (this.matchesPattern(intent, ['大', 'large', 'bigger'])) {
      sizeMultiplier = 1.5
    } else if (this.matchesPattern(intent, ['小', 'small', 'smaller'])) {
      sizeMultiplier = 0.8
    } else if (this.matchesPattern(intent, ['很大', 'very large'])) {
      sizeMultiplier = 2.0
    } else if (this.matchesPattern(intent, ['很小', 'very small'])) {
      sizeMultiplier = 0.6
    }

    return {
      type: 'size',
      properties: ['font-size', 'width', 'height', 'padding'],
      values: {
        'font-size': `${sizeMultiplier}em`,
        'padding': `${sizeMultiplier}rem`,
        'transform': `scale(${sizeMultiplier})`
      },
      description: `调整大小为${sizeMultiplier}倍`
    }
  }

  private analyzeLayoutIntent(intent: string): StyleIntent {
    if (this.matchesPattern(intent, ['居中', 'center'])) {
      return {
        type: 'layout',
        properties: ['display', 'justify-content', 'align-items', 'text-align'],
        values: {
          'display': 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'text-align': 'center'
        },
        description: '设置为居中布局'
      }
    }
    
    if (this.matchesPattern(intent, ['左对齐', 'left align'])) {
      return {
        type: 'layout',
        properties: ['text-align', 'justify-content'],
        values: {
          'text-align': 'left',
          'justify-content': 'flex-start'
        },
        description: '设置为左对齐'
      }
    }

    return {
      type: 'layout',
      properties: ['display'],
      values: {
        'display': 'flex'
      },
      description: '调整布局'
    }
  }

  private analyzeThemeIntent(intent: string): StyleIntent {
    if (this.matchesPattern(intent, ['深色', '暗色', 'dark'])) {
      return {
        type: 'theme',
        properties: ['background-color', 'color', 'border-color'],
        values: {
          'background-color': '#1f2937',
          'color': '#f9fafb',
          'border-color': '#374151'
        },
        description: '切换到深色主题'
      }
    }
    
    if (this.matchesPattern(intent, ['浅色', '明亮', 'light'])) {
      return {
        type: 'theme',
        properties: ['background-color', 'color', 'border-color'],
        values: {
          'background-color': '#ffffff',
          'color': '#111827',
          'border-color': '#d1d5db'
        },
        description: '切换到浅色主题'
      }
    }

    return {
      type: 'theme',
      properties: ['background-color'],
      values: {
        'background-color': '#f3f4f6'
      },
      description: '调整主题'
    }
  }

  private analyzeAnimationIntent(intent: string): StyleIntent {
    if (this.matchesPattern(intent, ['渐入', 'fade in'])) {
      return {
        type: 'animation',
        properties: ['animation', 'opacity'],
        values: {
          'animation': 'fadeIn 0.5s ease-in-out',
          'opacity': '1'
        },
        description: '添加渐入动画'
      }
    }

    return {
      type: 'animation',
      properties: ['transition'],
      values: {
        'transition': 'all 0.3s ease'
      },
      description: '添加过渡动画'
    }
  }

  private generateCSS(analysis: StyleIntent, request: StyleModificationRequest): string {
    const selector = this.generateSelector(request)
    const properties = this.generateProperties(analysis)
    
    let css = `${selector} {\n`
    for (const [property, value] of Object.entries(properties)) {
      if (value) {
        css += `  ${property}: ${value};\n`
      }
    }
    css += `}\n`

    // 添加动画关键帧（如果需要）
    if (analysis.type === 'animation') {
      css += this.generateAnimationKeyframes(analysis)
    }

    return css
  }

  private generateSelector(request: StyleModificationRequest): string {
    switch (request.scope) {
      case 'element':
        return request.target || '*'
      case 'page':
        return 'body, .page-content, main'
      case 'global':
        return '*'
      default:
        return 'body'
    }
  }

  private generateProperties(analysis: StyleIntent): Record<string, string> {
    const properties: Record<string, string> = {}
    
    for (const property of analysis.properties) {
      if (analysis.values[property]) {
        properties[property] = analysis.values[property]
      }
    }

    // 添加通用的过渡效果
    if (!properties.transition && analysis.type !== 'animation') {
      properties.transition = 'all 0.3s ease'
    }

    return properties
  }

  private generateAnimationKeyframes(analysis: StyleIntent): string {
    if (analysis.values.animation?.includes('fadeIn')) {
      return `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`
    }
    return ''
  }

  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern))
  }

  async applyStyleToPage(css: string, pageId: string): Promise<boolean> {
    try {
      // 创建样式元素ID
      const styleId = `ai-style-${pageId}-${Date.now()}`
      
      // 缓存样式
      this.styleCache.set(styleId, css)
      this.appliedStyles.add(styleId)
      
      return true
    } catch (error) {
      console.error('应用样式失败:', error)
      return false
    }
  }

  getAppliedStyles(): string[] {
    return Array.from(this.appliedStyles)
  }

  clearStyles(): void {
    this.styleCache.clear()
    this.appliedStyles.clear()
  }

  removeStyle(styleId: string): boolean {
    if (this.appliedStyles.has(styleId)) {
      this.styleCache.delete(styleId)
      this.appliedStyles.delete(styleId)
      return true
    }
    return false
  }
}

interface StyleIntent {
  type: 'color' | 'size' | 'layout' | 'theme' | 'animation' | 'general'
  properties: string[]
  values: Record<string, string>
  description: string
}