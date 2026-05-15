# l2d-widget

轻量级 Live2D 网页挂件，一行代码即可在任何页面上展示 Live2D 模型。

[English](./README.md)

## 特性

- `createWidget()` 一行代码创建挂件
- 支持 Cubism 2 和 Cubism 6 模型
- 多模型切换，平滑过渡动画
- 鼠标悬浮激活菜单，使用 [Iconify](https://iconify.design/) 图标
- 提示气泡，支持打字动画与嘴型同步
- 状态栏（加载中 / 休眠状态）
- 滑入或淡入的入场/退场动画
- 零 UI 框架依赖 — 纯 DOM + CSS 动画
- 同时输出 ES Module 和 IIFE 格式（支持 CDN 引入）

## 安装

```bash
npm install l2d-widget
```

或通过 CDN 引入：

```html
<script src="https://unpkg.com/l2d-widget/dist/index.min.js"></script>
```

## 快速开始

```ts
import { createWidget } from 'l2d-widget';

const widget = createWidget({
  model: {
    path: 'https://model.hacxy.cn/cat-black/model.json',
  },
});
```

这会在页面左下角渲染一个 Live2D 模型，使用默认配置。

## 配置项

### `WidgetOptions`

| 选项                 | 类型                              | 默认值                   | 说明                           |
| -------------------- | --------------------------------- | ------------------------ | ------------------------------ |
| `model`              | `ModelOptions \| ModelOptions[]`  | _必填_                   | 模型配置，传数组可切换多个模型 |
| `position`           | `'bottom-left' \| 'bottom-right'` | `'bottom-left'`          | 挂件在屏幕上的位置             |
| `size`               | `number \| { width, height }`     | `300`                    | Canvas 尺寸（px）              |
| `primaryColor`       | `string`                          | `'rgba(96,165,250,0.9)'` | 主题色，用于菜单、状态栏、气泡 |
| `transitionDuration` | `number`                          | `1500`                   | 入场/退场动画时长（ms）        |
| `transitionType`     | `'slide' \| 'fade'`               | `'slide'`                | 动画类型                       |
| `menus`              | `MenusOptions`                    | —                        | 菜单配置                       |

### `ModelOptions`

| 选项       | 类型                                     | 默认值   | 说明                                            |
| ---------- | ---------------------------------------- | -------- | ----------------------------------------------- |
| `path`     | `string`                                 | _必填_   | 模型文件路径（`.model.json` 或 `.model3.json`） |
| `scale`    | `number`                                 | `1`      | 缩放比例                                        |
| `offset`   | `[x, y]`                                 | —        | 位置偏移，范围通常 -2 ~ 2                       |
| `volume`   | `number`                                 | `0`      | 动作声音音量（0~1）                             |
| `logLevel` | `'error' \| 'warn' \| 'info' \| 'trace'` | `'warn'` | 日志级别                                        |
| `tips`     | `TipsOptions`                            | —        | 模型专属的提示配置                              |

### `MenusOptions`

| 选项         | 类型                | 默认值    | 说明               |
| ------------ | ------------------- | --------- | ------------------ |
| `items`      | `MenuItem[]`        | —         | 完全替换默认菜单项 |
| `extraItems` | `MenuItem[]`        | —         | 追加到默认菜单末尾 |
| `align`      | `'left' \| 'right'` | `'right'` | 菜单对齐方式       |

### `TipsOptions`

| 选项              | 类型         | 默认值   | 说明                                    |
| ----------------- | ------------ | -------- | --------------------------------------- |
| `welcomeMessage`  | `string[]`   | 内置消息 | 模型首次入场后随机显示的欢迎语          |
| `messages`        | `string[]`   | 内置消息 | 循环提示内容                            |
| `duration`        | `number`     | `3000`   | 每条提示的展示时长（ms）                |
| `interval`        | `number`     | `5000`   | 提示循环间隔（ms）                      |
| `offset`          | `{ x?, y? }` | —        | 位置偏移量（px）                        |
| `typing`          | `object`     | —        | 开启打字动画与嘴型同步                  |
| `typing.param`    | `string`     | —        | 嘴型参数名（如 `'PARAM_MOUTH_OPEN_Y'`） |
| `typing.speed`    | `number`     | `100`    | 打字速度（ms/字）                       |
| `typing.minValue` | `number`     | `0.5`    | 嘴型开合最小值（0~1）                   |
| `typing.maxValue` | `number`     | `1`      | 嘴型开合最大值（0~1）                   |

## 示例

### 位置与动画

```ts
createWidget({
  model: { path: '/models/my-model/model.json' },
  position: 'bottom-right',
  transitionType: 'fade',
});
```

### 多模型切换

```ts
createWidget({
  model: [
    { path: '/models/cat-black/model.json' },
    { path: '/models/cat-white/model.json' },
  ],
});
```

传入多个模型时，菜单中会自动出现切换按钮。

### 自定义菜单项

```ts
createWidget({
  model: { path: '/models/cat-black/model.json' },
  menus: {
    extraItems: [
      {
        icon: 'mdi:emoticon-happy-outline',
        label: '播放动作',
        onClick(widget) {
          const motions = widget.l2d.getMotions();
          const groups = Object.keys(motions);
          if (groups.length > 0) {
            widget.l2d.playMotion(groups[0]!);
          }
        },
      },
    ],
  },
});
```

### 打字动画与嘴型同步

```ts
createWidget({
  model: {
    path: '/models/cat-black/model.json',
    tips: {
      typing: {
        param: 'PARAM_MOUTH_OPEN_Y',
        speed: 200,
      },
      welcomeMessage: ['你好！', '很高兴见到你！'],
      messages: ['休息一下吧～', '记得多喝水！'],
      duration: 4000,
      interval: 6000,
    },
  },
});
```

## Widget 实例

`createWidget()` 返回一个 `Widget` 对象：

| 属性 / 方法          | 说明                                       |
| -------------------- | ------------------------------------------ |
| `l2d`                | 底层 `l2d` 实例，供高级用途                |
| `switchModel(index)` | 切换到指定索引的模型（异步）               |
| `sleep()`            | 隐藏模型，显示"正在休息"状态栏；点击可唤醒 |
| `destroy()`          | 销毁挂件，释放 WebGL 资源并移除 DOM        |

## 项目结构

```
src/
├── index.ts           # 公共 API 导出
├── types.ts           # TypeScript 类型定义
├── widget.ts          # 核心 createWidget() 逻辑
├── defaults.ts        # 默认菜单项
└── modules/
    ├── menu.ts        # 悬浮菜单（Iconify 图标）
    ├── tips.ts        # 提示气泡（打字动画）
    └── status-bar.ts  # 加载/休眠状态栏
```

## 开发

```bash
pnpm install
pnpm dev          # 监听构建（含 sourcemap）
pnpm demo         # 启动 demo 服务器（localhost:3000）
pnpm build        # 生产构建
pnpm lint         # 代码检查
```

## 许可证

[MIT](LICENSE)

---

> English documentation: [README.md](./README.md)
