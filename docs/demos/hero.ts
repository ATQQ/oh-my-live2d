import type { Widget } from 'l2d-widget';
import { createWidget } from 'l2d-widget';

const params = new URLSearchParams(location.search);
const initPath = params.get('model');
if (!initPath)
  throw new Error('missing model param');

let widget: Widget | null = null;

function create(path: string) {
  widget = createWidget({
    model: { path, tips: false },
    primaryColor: 'rgba(255, 130, 160, 0.9)',
  });
  widget.l2d.on('loaded', () => {
    window.parent.postMessage({ type: 'l2d-widget-loaded' }, '*');
  });
}

create(initPath);

window.addEventListener('message', e => {
  if (e.data?.type === 'switch-model' && e.data.path) {
    if (widget) {
      widget.destroy();
      widget = null;
    }
    create(e.data.path);
  }
  if (e.data?.type === 'theme-change') {
    document.documentElement.classList.toggle('dark', e.data.dark);
  }
});
