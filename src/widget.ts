import type { MenuHandle } from './modules/menu.js';
import type { TipsHandle } from './modules/tips.js';
import type { MenusOptions, ModelOptions, TipsOptions, Widget, WidgetOptions } from './types.js';
import { init } from 'l2d';
import { getDefaultItems } from './defaults.js';
import { createMenu } from './modules/menu.js';
import { createStatusBar } from './modules/status-bar.js';
import { createTips } from './modules/tips.js';

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

function resolveTipsOptions(opts: TipsOptions | undefined) {
  return {
    welcomeMessages: opts?.welcomeMessage ?? ['欢迎来访！', '好久不见，欢迎回来！', '你来啦～'],
    messages: opts?.messages ?? ['记得多休息哦～', '有什么可以帮你的吗？', '今天也要开心哦！'],
    duration: opts?.duration ?? 3000,
    interval: opts?.interval ?? 5000,
  };
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
  const { welcomeMessages, messages: tipsMessages, duration: tipsDuration, interval: tipsInterval } = resolveTipsOptions(options.tips);

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

  const statusBar = createStatusBar(position, transitionDuration, height, primaryColor);
  document.body.appendChild(statusBar.el);

  let l2dInstance = init(canvas);

  // 声明提前，让下方辅助函数可以安全引用
  let menu: MenuHandle;
  let tips: TipsHandle;
  let cancelHover: () => void;
  let welcomeTimer: ReturnType<typeof setTimeout> | undefined;
  let tipsTimer: ReturnType<typeof setInterval> | undefined;
  let msgIndex = 0;

  function showTip(msg: string) {
    tips.show(msg);
    setTimeout(() => {
      tips.hide();
    }, tipsDuration);
  }

  function stopTipsLoop() {
    clearTimeout(welcomeTimer);
    clearInterval(tipsTimer);
  }

  function startTipsLoop() {
    stopTipsLoop();
    tipsTimer = setInterval(() => {
      showTip(tipsMessages[msgIndex % tipsMessages.length]!);
      msgIndex++;
    }, tipsInterval);
  }

  function launchTips() {
    welcomeTimer = setTimeout(() => {
      showTip(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]!);
      startTipsLoop();
    }, transitionDuration);
  }

  function loadModel(index: number) {
    const m = models[index]!;
    return l2dInstance.load({ path: m.path, scale: m.scale, position: m.offset, volume: m.volume, logLevel: m.logLevel });
  }

  function startLoading() {
    statusBar.showLoading();
    l2dInstance.on('loaded', () => {
      statusBar.hide();
      applyStyle(container, useSlide, true);
      launchTips();
    });
  }

  startLoading();
  void loadModel(0);

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

    sleep() {
      stopTipsLoop();
      tips.hide();
      applyStyle(container, useSlide, false);
      canvas.style.pointerEvents = 'none';
      menu.hide();
      statusBar.showRest(() => {
        canvas.style.pointerEvents = 'auto';
        statusBar.hide();
        applyStyle(container, useSlide, true);
        launchTips();
      });
    },

    async switchModel(index: number) {
      stopTipsLoop();
      tips.hide();
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
      stopTipsLoop();
      cancelHover();
      tips.destroy();
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

  tips = createTips(primaryColor, options.tips?.offset);
  container.appendChild(tips.el);

  return widget;
}
