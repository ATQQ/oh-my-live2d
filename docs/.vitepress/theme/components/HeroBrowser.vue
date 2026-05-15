<script lang="ts" setup>
import { useData } from 'vitepress';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const BASE = 'https://model.hacxy.cn';
const DISPLAY_DURATION = 5000;

const { isDark } = useData();
const visible = ref(false);
const iframeSrc = ref('');
const iframeEl = ref<HTMLIFrameElement | null>(null);
let stopped = false;
let models: string[] = [];
let current = '';
let onLoaded: (() => void) | null = null;

watch(isDark, dark => {
  iframeEl.value?.contentWindow?.postMessage({ type: 'theme-change', dark }, '*');
});

function parseLinks(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)]
    .map(m => m[1]!)
    .filter(h => !h.startsWith('?') && h !== '../');
}

async function fetchModels(): Promise<string[]> {
  const rootHtml = await fetch(`${BASE}/`).then(r => r.text());
  const dirs = parseLinks(rootHtml).filter(l => l.endsWith('/'));
  const results = await Promise.allSettled(
    dirs.map(async dir => {
      const name = dir.replace(/\/$/, '');
      const dirHtml = await fetch(`${BASE}/${name}/`).then(r => r.text());
      const files = parseLinks(dirHtml);
      const jsonFile = files.find(f =>
        f.endsWith('.model3.json')
        || f.endsWith('.model.json')
        || f === 'index.json'
        || f === 'model.json',
      );
      return jsonFile ? `${BASE}/${name}/${jsonFile}` : null;
    }),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((v): v is string => v !== null);
}

function pickRandom(): string {
  if (models.length <= 1)
    return models[0] ?? `${BASE}/cat-black/model.json`;
  let pick: string;
  do {
    pick = models[Math.floor(Math.random() * models.length)]!;
  } while (pick === current && models.length > 1);
  return pick;
}

function handleMessage(e: MessageEvent) {
  if (e.data?.type === 'l2d-widget-loaded') {
    onLoaded?.();
    onLoaded = null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function waitLoaded(): Promise<void> {
  return new Promise(resolve => {
    onLoaded = resolve;
    setTimeout(() => {
      if (onLoaded === resolve) {
        onLoaded = null;
        resolve();
      }
    }, 15000);
  });
}

async function switchModel(path: string) {
  current = path;
  const loaded = waitLoaded();
  iframeEl.value?.contentWindow?.postMessage({ type: 'switch-model', path }, '*');
  await loaded;
}

async function loop() {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!stopped && models.length > 1) {
    await sleep(DISPLAY_DURATION);
    if (stopped)
      break;
    await switchModel(pickRandom());
  }
}

onMounted(async () => {
  window.addEventListener('message', handleMessage);
  requestAnimationFrame(() => {
    visible.value = true;
  });

  current = `${BASE}/cat-black/model.json`;
  const loaded = waitLoaded();
  iframeSrc.value = `/demos/hero.html?model=${encodeURIComponent(current)}&dark=${isDark.value ? '1' : '0'}`;
  await loaded;

  try {
    models = await fetchModels();
  }
  catch {
    models = [current];
  }

  loop();
});

onBeforeUnmount(() => {
  stopped = true;
  onLoaded = null;
  window.removeEventListener('message', handleMessage);
});
</script>

<template>
  <div class="hero-browser" :class="{ visible }">
    <div class="browser-chrome">
      <div class="browser-dots">
        <span class="dot" style="background: #ff5f57" />
        <span class="dot" style="background: #febc2e" />
        <span class="dot" style="background: #28c840" />
      </div>
      <div class="browser-bar">
        <span class="bar-text">localhost:3000</span>
      </div>
    </div>
    <div class="browser-viewport">
      <ClientOnly>
        <iframe v-if="iframeSrc" ref="iframeEl" :src="iframeSrc" />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.hero-browser {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--vp-c-bg);
  opacity: 0;
  transform: translateY(24px) scale(0.96);
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.hero-browser.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dark .hero-browser {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.browser-chrome {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dark .browser-chrome {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.browser-dots {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.browser-bar {
  flex: 1;
  background: var(--vp-c-bg);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browser-viewport {
  height: 340px;
  position: relative;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.browser-viewport iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 639px) {
  .hero-browser {
    max-width: 100%;
  }
  .browser-viewport {
    height: 360px;
  }
}

@media (min-width: 640px) and (max-width: 959px) {
  .hero-browser {
    max-width: 420px;
    margin: 0 auto;
  }
  .browser-viewport {
    height: 280px;
  }
}
</style>

<style>
.VPHero .image {
  order: 2 !important;
  margin: 24px 0 0 !important;
}

.VPHero .image-container {
  width: 100% !important;
  max-width: 600px !important;
  height: auto !important;
}

@media (min-width: 960px) {
  .VPHero .image {
    order: 2 !important;
    margin: 0 !important;
  }
  .VPHero .image-container {
    transform: none !important;
  }
}
</style>
