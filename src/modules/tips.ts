function ensureTipsStyle() {
  if (document.getElementById('l2dw-tips-style'))
    return;
  const style = document.createElement('style');
  style.id = 'l2dw-tips-style';
  style.textContent = `
    @keyframes l2dw-tips-in {
      from { opacity: 0; transform: translateY(8px) scale(0.9) }
      to   { opacity: 1; transform: translateY(0)   scale(1)   }
    }
    @keyframes l2dw-tips-float {
      0%, 100% { transform: translateY(0) }
      50%      { transform: translateY(-5px) }
    }
  `;
  document.head.appendChild(style);
}

export interface TipsHandle {
  el: HTMLElement
  show: (text: string) => void
  hide: () => void
  destroy: () => void
}

export function createTips(primaryColor: string): TipsHandle {
  ensureTipsStyle();

  let inTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  // 外层：只负责定位，不参与动画
  const outer = document.createElement('div');
  Object.assign(outer.style, {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    zIndex: '2',
  });

  // 内层：负责外观 + 动画，初始不可见
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    position: 'relative',
    background: primaryColor,
    borderRadius: '8px',
    padding: '8px 14px',
    color: 'rgba(255,255,255,0.95)',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '200px',
    textAlign: 'center',
    wordBreak: 'break-word',
    opacity: '0',
    whiteSpace: 'nowrap',
  });

  // 向下三角箭头
  const arrow = document.createElement('div');
  Object.assign(arrow.style, {
    position: 'absolute',
    bottom: '-7px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: `7px solid ${primaryColor}`,
  });

  inner.appendChild(arrow);
  outer.appendChild(inner);

  const text = document.createElement('span');
  inner.prepend(text);

  function resetInner() {
    clearTimeout(inTimer);
    clearTimeout(hideTimer);
    inner.style.transition = 'none';
    inner.style.animation = 'none';
    inner.style.opacity = '0';
    inner.style.transform = '';
  }

  return {
    el: outer,

    show(msg: string) {
      resetInner();
      text.textContent = msg;

      // 强制 reflow，让 animation: none 生效后再重新播放
      void inner.offsetHeight;

      inner.style.animation = 'l2dw-tips-in 0.35s ease-out forwards';

      // 入场动画结束后切换为柔和浮动
      // 切换前显式固化 opacity: 1，避免清除 forwards fill 导致瞬间消失
      inTimer = setTimeout(() => {
        inner.style.opacity = '1';
        inner.style.animation = 'l2dw-tips-float 2.5s ease-in-out infinite';
      }, 350);
    },

    hide() {
      clearTimeout(inTimer);
      clearTimeout(hideTimer);
      inner.style.animation = 'none';
      // 清除动画 fill 后显式固化可见状态，再 reflow，才能触发淡出 transition
      inner.style.opacity = '1';
      void inner.offsetHeight;
      inner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      inner.style.opacity = '0';
      inner.style.transform = 'translateY(6px)';

      hideTimer = setTimeout(() => {
        inner.style.transition = 'none';
        inner.style.transform = '';
      }, 260);
    },

    destroy() {
      clearTimeout(inTimer);
      clearTimeout(hideTimer);
      outer.remove();
    },
  };
}
