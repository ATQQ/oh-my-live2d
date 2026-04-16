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

export interface MenuItem {
  /**
   * Iconify 图标名称，如 "mdi:shuffle-variant"
   * @see https://icon-sets.iconify.design/
   */
  icon?: string
  /** 无障碍标题，图标加载失败时作为按钮文本回退 */
  label: string
  onClick: (widget: Widget) => void
}

export interface MenusOptions {
  /** 完全替换默认菜单项（提供时 extraItems 被忽略） */
  items?: MenuItem[]
  /** 追加到默认菜单末尾 */
  extraItems?: MenuItem[]
  /** 菜单对齐方式，默认 'right' */
  align?: 'left' | 'right'
}

export interface TipsOptions {
  /** 欢迎语，模型首次入场后显示，默认 '欢迎来访！' */
  welcomeMessage?: string
  /** 循环提示内容 */
  messages?: string[]
  /** 每条 tips 展示时长（ms），默认 3000 */
  duration?: number
  /** tips 循环间隔（ms），默认 5000 */
  interval?: number
}

export interface WidgetOptions {
  /** 模型配置，传数组时支持多模型切换 */
  model: ModelOptions | ModelOptions[]
  /** 展示位置，默认 'bottom-left' */
  position?: 'bottom-left' | 'bottom-right'
  /** canvas 尺寸（px），默认 300。传对象可分别指定宽高 */
  size?: number | { width: number, height: number }
  /** 主题色，用于菜单、状态条等 UI 元素的背景色，默认浅蓝色 'rgba(96,165,250,0.9)' */
  primaryColor?: string
  /** 滑入/滑出动画时长（ms），默认 1500 */
  transitionDuration?: number
  /** 入场/退场动画类型，默认 'slide' */
  transitionType?: 'slide' | 'fade'
  /** 菜单配置 */
  menus?: MenusOptions
  /** tips 配置 */
  tips?: TipsOptions
}

export interface Widget {
  /** 底层 l2d 实例，供高级用途（model 切换后自动更新） */
  readonly l2d: L2D
  /** 切换到指定索引的模型（model 为数组时有效） */
  switchModel: (index: number) => Promise<void>
  /** 隐藏模型，显示休息状态条；点击状态条可恢复 */
  sleep: () => void
  /** 销毁 widget，退场动画完成后释放 WebGL 资源并移除 DOM */
  destroy: () => Promise<void>
}
