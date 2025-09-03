export { AIStyleModifier } from './StyleModifier'
export type { StyleModificationRequest, StyleModificationResult } from './StyleModifier'

// 创建全局的AIStyleModifier实例
let _styleModifier: AIStyleModifier | null = null

export const getStyleModifier = (): AIStyleModifier => {
  if (typeof window === 'undefined') {
    // 服务端返回一个mock对象
    return {} as AIStyleModifier
  }
  
  if (!_styleModifier) {
    _styleModifier = new AIStyleModifier()
  }
  return _styleModifier
}