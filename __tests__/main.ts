import type { Widget } from 'l2d-widget';

interface DemoModule {
  name?: string
  description?: string
  run: (parentElement: HTMLElement) => Widget
}

const modules = import.meta.glob<DemoModule>('./demos/*.ts', { import: 'default' });

let currentWidget: Widget | null = null;

const mainEl = document.querySelector('main')!;

function nameFromPath(path: string): string {
  return path.replace('./demos/', '').replace('.ts', '');
}

async function runDemo(path: string, load: () => Promise<DemoModule>, btn: HTMLButtonElement) {
  currentWidget?.destroy();
  currentWidget = null;

  document.querySelectorAll<HTMLButtonElement>('.demo-btn').forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');

  const mod = await load();

  const nameEl = document.getElementById('demo-name')!;
  const descEl = document.getElementById('demo-desc')!;
  nameEl.textContent = mod.name ?? nameFromPath(path);
  descEl.textContent = mod.description ?? '';

  currentWidget = mod.run(mainEl);
}

const list = document.getElementById('demo-list')!;
const entries = Object.entries(modules);

if (entries.length === 0) {
  list.innerHTML = '<span class="empty">demos/ 下暂无测试用例</span>';
}
else {
  for (const [path, load] of entries) {
    const btn = document.createElement('button');
    btn.className = 'demo-btn';
    btn.textContent = nameFromPath(path);
    btn.addEventListener('click', () => {
      void runDemo(path, load, btn);
    });
    list.appendChild(btn);
  }

  // 自动运行第一个
  const [firstPath, firstLoad] = entries[0]!;
  void runDemo(firstPath, firstLoad, list.querySelector('.demo-btn')!);
}
