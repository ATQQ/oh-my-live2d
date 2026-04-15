import type { MenuHandle } from './modules/menu.js';
import type { MenusOptions, ModelOptions, Widget, WidgetOptions } from './types.js';
import { init } from 'l2d';
import { getDefaultItems } from './defaults.js';
import { createMenu } from './modules/menu.js';

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
    parentElement = document.body,
    transitionDuration = 1500,
    transitionType,
    menus: menusOptions,
  } = options;

  const models = Array.isArray(options.model) ? options.model : [options.model];
  const { width, height } = resolveSize(size);

  const isBody = parentElement === document.body;
  if (!isBody && getComputedStyle(parentElement).position === 'static') {
    parentElement.style.position = 'relative';
  }

  const useSlide = transitionType ? transitionType === 'slide' : isBody;

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: isBody ? 'fixed' : 'absolute',
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
  parentElement.appendChild(container);

  let l2dInstance = init(canvas);

  function wireLoadedAnimation() {
    l2dInstance.on('loaded', () => {
      applyStyle(container, useSlide, true);
    });
  }

  function loadModel(index: number) {
    const m = models[index]!;
    return l2dInstance.load({ path: m.path, scale: m.scale, position: m.offset, volume: m.volume, logLevel: m.logLevel });
  }

  wireLoadedAnimation();
  void loadModel(0);

  // menu 先声明，widget 对象在 destroy 中引用它，createMenu 在 widget 之后赋值
  let menu: MenuHandle;
  let cancelHover: () => void;

  const widget: Widget = {
    get l2d() { return l2dInstance; },

    async switchModel(index: number) {
      applyStyle(container, useSlide, false);
      const waitDestroy = new Promise<void>(r => {
        l2dInstance.on('destroy', r);
      });
      l2dInstance.destroy();
      await waitDestroy;
      l2dInstance = init(canvas);
      wireLoadedAnimation();
      await loadModel(index);
    },

    async destroy() {
      cancelHover();
      menu.destroy();
      applyStyle(container, useSlide, false);
      await new Promise<void>(resolve => {
        container.addEventListener('transitionend', () => {
          resolve();
        }, { once: true });
      });
      l2dInstance.destroy();
      parentElement.removeChild(container);
    },
  };

  menu = createMenu(resolveMenuItems(models, menusOptions), widget, {
    align: menusOptions?.align,
  });
  container.appendChild(menu.el);
  cancelHover = setupMenuHover(canvas, menu);

  return widget;
}
