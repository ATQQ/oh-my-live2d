import type { Widget, WidgetOptions } from './types.js';
import { init } from 'l2d';

export function createWidget(options: WidgetOptions): Widget {
  const { model, position = 'bottom-left', size = 300, parentElement = document.body, transitionDuration = 1500, transitionType } = options;
  const width = typeof size === 'number' ? size : size.width;
  const height = typeof size === 'number' ? size : size.height;

  // 自动检测定位方式
  const isBody = parentElement === document.body;
  if (!isBody && getComputedStyle(parentElement).position === 'static') {
    parentElement.style.position = 'relative';
  }

  // 入场/退场动画类型：用户指定优先，否则 body 用 slide，自定义父元素用 fade
  const useSlide = transitionType ? transitionType === 'slide' : isBody;
  const enterStyle = useSlide
    ? { transform: 'translateY(130%)', transition: `transform ${transitionDuration}ms cubic-bezier(0.19, 1, 0.22, 1)`, willChange: 'transform' }
    : { opacity: '0', transition: `opacity ${transitionDuration}ms ease-in-out`, willChange: 'opacity' };

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
    ...enterStyle,
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

  // 加载完成后触发入场动画
  l2dInstance.on('loaded', () => {
    if (useSlide) {
      container.style.transform = 'translateY(0)';
    }
    else {
      container.style.opacity = '1';
    }
  });

  l2dInstance.load({
    path: model.path,
    scale: model.scale,
    position: model.offset,
    volume: model.volume,
    logLevel: model.logLevel,
  });

  return {
    l2d: l2dInstance,
    async destroy() {
      // 触发退场动画，等结束后再清理
      if (useSlide) {
        container.style.transform = 'translateY(130%)';
      }
      else {
        container.style.opacity = '0';
      }
      await new Promise<void>(resolve => {
        container.addEventListener('transitionend', () => {
          resolve();
        }, { once: true });
      });
      l2dInstance.destroy();
      parentElement.removeChild(container);
    },
  };
}
