import type { MenuHandle } from './modules/menu.js';
import type { MenusOptions, ModelOptions, Widget, WidgetOptions } from './types.js';
import { init } from 'l2d';
import { getDefaultItems } from './defaults.js';
import { createMenu } from './modules/menu.js';
import { createStatusBar } from './modules/status-bar.js';

function resolveSize(size: number | { width: number, height: number }) {
  return typeof size === 'number' ? { width: size, height: size } : size;
}

function buildAnimationStyle(useSlide: boolean, duration: number) {
  return useSlide
    ? { transform: 'translateY(130%)', transition: `transform ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`, willChange: 'transform' }
    : { opacity: '0', transition: `opacity ${duration}ms ease-in-out`, willChange: 'opacity' };
}

function applyStyle(container: HTMLDivElement, useSlide: boolean, visible: boolean) {
  if (useSlide) {
    container.style.transform = visible ? 'translateY(0)' : 'translateY(130%)';
  }
  else {
    container.style.opacity = visible ? '1' : '0';
  }
}

function resolveMenuItems(models: ModelOptions[], opts: MenusOptions | undefined) {
  if (opts?.items)
    return opts.items;
  return [...getDefaultItems(models), ...(opts?.extraItems ?? [])];
}

function setupMenuHover(canvas: HTMLCanvasElement, menu: MenuHandle): () => void {
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const show = () => {
    clearTimeout(hideTimer);
    menu.show();
  };

  const hide = () => {
    hideTimer = setTimeout(() => {
      menu.hide();
    }, 150);
  };

  canvas.addEventListener('mouseenter', show);
  canvas.addEventListener('mouseleave', hide);
  menu.el.addEventListener('mouseenter', show);
  menu.el.addEventListener('mouseleave', hide);

  return () => {
    clearTimeout(hideTimer);
  };
}

export function createWidget(options: WidgetOptions): Widget {
  const {
    position = 'bottom-left',
    size = 300,
    transitionDuration = 1500,
    transitionType,
    primaryColor = 'rgba(96,165,250,0.9)',
    menus: menusOptions,
  } = options;

  const models = Array.isArray(options.model) ? options.model : [options.model];
  const { width, height } = resolveSize(size);
  const useSlide = transitionType !== 'fade';

  // 容器：始终 fixed，挂载到 document.body
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '0',
    [position === 'bottom-right' ? 'right' : 'left']: '0',
    zIndex: '9999',
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    ...buildAnimationStyle(useSlide, transitionDuration),
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  Object.assign(canvas.style, { width: '100%', height: '100%', pointerEvents: 'auto' });
  container.appendChild(canvas);
  document.body.appendChild(container);

  // 侧边状态条
  const statusBar = createStatusBar(position, transitionDuration, height, primaryColor);
  document.body.appendChild(statusBar.el);

  let l2dInstance = init(canvas);

  function loadModel(index: number) {
    const m = models[index]!;
    return l2dInstance.load({ path: m.path, scale: m.scale, position: m.offset, volume: m.volume, logLevel: m.logLevel });
  }

  // 显示状态条，加载完成后同时隐藏状态条 + 触发 widget 入场
  function startLoading() {
    statusBar.show();
    l2dInstance.on('loaded', () => {
      statusBar.hide();
      applyStyle(container, useSlide, true);
    });
  }

  startLoading();
  void loadModel(0);

  let menu: MenuHandle;
  let cancelHover: () => void;

  // slide 模式用 transitionend（transform 过渡稳定），fade 模式用 setTimeout
  // （含 WebGL canvas 的容器 opacity 过渡不触发 transitionend）
  function waitExit(): Promise<void> {
    return useSlide
      ? new Promise<void>(resolve => {
        container.addEventListener('transitionend', () => {
          resolve();
        }, { once: true });
      })
      : new Promise<void>(resolve => {
        setTimeout(resolve, transitionDuration);
      });
  }

  const widget: Widget = {
    get l2d() { return l2dInstance; },

    async switchModel(index: number) {
      applyStyle(container, useSlide, false);
      await waitExit();
      const waitDestroy = new Promise<void>(r => {
        l2dInstance.on('destroy', r);
      });
      l2dInstance.destroy();
      await waitDestroy;
      l2dInstance = init(canvas);
      startLoading();
      await loadModel(index);
    },

    async destroy() {
      cancelHover();
      menu.destroy();
      statusBar.destroy();
      applyStyle(container, useSlide, false);
      await waitExit();
      l2dInstance.destroy();
      document.body.removeChild(container);
    },
  };

  menu = createMenu(resolveMenuItems(models, menusOptions), widget, {
    align: menusOptions?.align,
    primaryColor,
  });
  container.appendChild(menu.el);
  cancelHover = setupMenuHover(canvas, menu);

  return widget;
}
