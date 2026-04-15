import type { L2D } from 'l2d';

export interface ModelOptions {
  /** 模型文件路径（.model.json 或 .model3.json） */
  path: string
  /** 缩放比例，默认 1 */
  scale?: number
  /** 位置偏移 [x, y]，x 正值右移，y 正值上移，范围通常 -2 ~ 2 */
  offset?: [x: number, y: number]
  /** 动作声音音量 0~1，默认 0（静音） */
  volume?: number
  /** 日志级别，默认 'warn' */
  logLevel?: 'error' | 'warn' | 'info' | 'trace'
}

export interface WidgetOptions {
  /** 模型配置 */
  model: ModelOptions
  /** 展示位置，默认 'bottom-left' */
  position?: 'bottom-left' | 'bottom-right'
  /** canvas 尺寸（px），默认 300。传对象可分别指定宽高 */
  size?: number | { width: number, height: number }
  /** 挂载的父元素，默认 document.body */
  parentElement?: HTMLElement
  /** 滑入/滑出动画时长（ms），默认 1500 */
  transitionDuration?: number
  /** 入场/退场动画类型。不传时自动决定：body 用 slide，自定义父元素用 fade */
  transitionType?: 'slide' | 'fade'
}

export interface Widget {
  /** 底层 l2d 实例，供高级用途 */
  readonly l2d: L2D
  /** 销毁 widget，滑出动画完成后释放 WebGL 资源并移除 DOM */
  destroy: () => Promise<void>
}
