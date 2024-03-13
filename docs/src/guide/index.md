# 快速入门

`OhMyLive2D` 是一个应用于 `Web` 环境的 `Live2D` 模型看板组件。

`OhMyLive2D` 的初衷是为了解决官方 Cubism SDK 在使用时还需要额外通过 `script` 标签外部引入以及使用和学习成本较高的缺点。而现在它在被 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) 驱动的同时又提供了多种导入方式和按需导入的模式，以及更加方便自定义配置的 API。现在你完全可以在 **vite** 或者 **webpack** 中更便捷的使用它，并且无需再导入其他任何依赖或官方 SDK。

> [!TIP]  
> **本项目目前正处于积极维护状态, 欢迎志同道合的伙伴加入 😄**

## Live2D 是什么?

Live2D 是一个向插图灌注生命力并能够进行 2D 立体表现的技术, 具体效果请参考本站左下角.

更多内容请前往：[Live2D 官方网站](https://www.live2d.com/)

## Cubism 是什么?

Cubism 是 Live2D SDK 的名称，截至目前它一共存在四个版本：Cubism 2、Cubism 3、Cubism 4。Cubism 5

Cubism 2 是只能驱动 Live2D Model 版本为 2 的 SDK，它无法驱动 Live2D Model 3 和 Live2D Model 4。

Cubism 5 向后兼容了 Live2D Model 3 并支持 Live2D Model 4 ，但它无法驱动 Live2D Model 2。

> [!TIP]
> 本项目已集成 Cubism 2.1 与 Cubism 5.0.0 ，完整覆盖了从 model2 到 model4 的所有版本。

## 快速开始

> [!WARNING]
> 本项目从 `0.4.0` 版本开始将不再采用自动加载组件的模式, 现在你可以通过 `loadOml2d` 方法加载组件至 body 中, 或者通过`parentElement`选项为其指定一个父元素.

### 安装

::: code-group

```bash [npm]
npm install oh-my-live2d
```

```bash [pnpm]
pnpm add oh-my-live2d
```

```bash [yarn]
yarn add oh-my-live2d
```

:::

### 更新

如需更新 `oh-my-live2d` 你只需要在安装命令后缀加上`@latest`即可更新至当前最新发行版, 当然 `vuepress` 等插件也同理

::: code-group

```bash [npm]
npm install oh-my-live2d@latest
```

```bash [pnpm]
pnpm add oh-my-live2d@latest
```

```bash [yarn]
yarn add oh-my-live2d@latest
```

:::

### CDN 方式导入

通过 CDN 方式导入时，所有成员变量都可以在 `OML2D` 命名空间下被使用。

通过调用`OML2D.loadOml2d()`方法加载 Live2D 模型, 该方法接收一个 `options` 配置选项对象，示例如下:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OhMyLive2D</title>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/oh-my-live2d/dist/index.min.js"></script>
    <script>
      OML2D.loadOml2d({
        models: [
          {
            path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json'
          }
        ]
      });
    </script>
  </body>
</html>
```

有关配置选项的详细内容请查看: [配置选项](../options/Options)

---

### ESM 导入

OhMyLive2D 在使用 ES6Module 方式导入时暴露了一个`loadOml2d`方法, 该方法接收一个配置选项`options`.

```ts
import { loadOml2d } from 'oh-my-live2d';
loadOml2d({
  models: [
    {
      path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json'
    }
  ]
});
```

有关配置选项的详细内容请查看: [配置选项](../options/Options.md)

### 其他支持

- [在 VitePress 中使用](./vitepress.md)

- [在 VuePress2 中使用](./vuepress.md)

- [在 Hexo 中使用](./hexo.md)

## 贡献者们

感谢以下所有给 oh-my-live2d 贡献过代码的 [开发者们](https://github.com/oh-my-live2d/oh-my-live2d/graphs/contributors)。

<a href="https://github.com/oh-my-live2d/oh-my-live2d/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=oh-my-live2d/oh-my-live2d" />
</a>

## 讨论

- 微信群

  <image style="display: inline-block;width:200px;padding-right:6px" src='https://loclink-1259720482.cos.ap-beijing.myqcloud.com/image/202403111753229.png'/>

- QQ群:

  <image style="display: inline-block;width:200px;padding-right:6px" src='https://loclink-1259720482.cos.ap-beijing.myqcloud.com/image/202403111755979.png'/>

## 免责声明

本仓库所有模型文件均来源于网络, 仅供参考和学习, 严禁用于任何商业盈利项目, 所有以盈利为目的而使用本仓库的模型资源的行为均与仓库创建者无关, 仓库中每个模型的所有权均属于这个模型的作者或创作团队, 若侵权请联系: hacxy.97@outlook.com 及时删除
