import type { Widget, WidgetOptions } from './types.js';
import { init } from 'l2d';

export function createWidget(options: WidgetOptions): Widget {
  const { model, position = 'bottom-left', size = 300, parentElement = document.body } = options;
  const width = typeof size === 'number' ? size : size.width;
  const height = typeof size === 'number' ? size : size.height;

  // 自动检测定位方式
  const isBody = parentElement === document.body;
  if (!isBody && getComputedStyle(parentElement).position === 'static') {
    parentElement.style.position = 'relative';
  }

  // 创建容器
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: isBody ? 'fixed' : 'absolute',
    bottom: '0',
    [position === 'bottom-right' ? 'right' : 'left']: '0',
    zIndex: '9999',
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
  });

  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  Object.assign(canvas.style, { width: '100%', height: '100%' });
  container.appendChild(canvas);

  parentElement.appendChild(container);

  // 初始化 l2d 并加载模型
  const l2dInstance = init(canvas);
  l2dInstance.load({
    path: model.path,
    scale: model.scale,
    position: model.offset,
    volume: model.volume,
    logLevel: model.logLevel,
  });

  return {
    l2d: l2dInstance,
    destroy() {
      l2dInstance.destroy();
      parentElement.removeChild(container);
    },
  };
}
