import { Application } from './application.js';
import { GlobalStyle } from './globalStyle.js';
import { Menus } from './menus.js';
import { Models } from './models.js';
import { Stage } from './stage.js';
import { StatusBar } from './status-bar.js';
import { Store } from './store.js';
import { Tips } from './tips.js';
import { WindowSizeType } from '../constants/index.js';
import type { DefaultOptions, PixiLive2dDisplayModule, PixiModule } from '../types/index.js';
import { checkVersion, getWindowSizeType, onChangeWindowSize, printProjectInfo } from '../utils/index.js';

export class OhMyLive2D {
  private store: Store;
  private globalStyle: GlobalStyle;
  private stage: Stage;
  private statusBar: StatusBar;
  private tips: Tips;
  private menus: Menus;
  private models: Models;
  private application?: Application;
  private currentModelIndex: number = 0;

  constructor(
    private options: DefaultOptions,
    private PIXI: PixiModule,
    private PixiLive2dDisplay: PixiLive2dDisplayModule
  ) {
    this.globalStyle = new GlobalStyle(options);
    this.stage = new Stage(options); // 实例化舞台
    this.statusBar = new StatusBar(options);
    this.tips = new Tips(options); // 提示框
    this.menus = new Menus(options, this); // 菜单
    this.models = new Models(options, this.PixiLive2dDisplay);
    this.application = new Application(this.PIXI);
    this.store = new Store();
    this.modelIndex = this.store.getModelCurrentIndex(this.options.models);
  }

  /**
   * 移动端是否隐藏
   */
  private get mobileHidden(): boolean {
    return !this.options.mobileDisplay && getWindowSizeType() === WindowSizeType.mobile;
  }

  private set modelIndex(index: number) {
    this.currentModelIndex = index;
    this.stage.modelIndex = index;
    this.models.modelIndex = index;
    this.store.updateModelInfo(this.options.models, index);
  }

  private get modelIndex(): number {
    return this.currentModelIndex;
  }

  /**
   * 创建
   */
  private create(): void {
    this.globalStyle.create();
    this.stage.create();
    this.statusBar.create();
    this.menus.create();
    this.tips.create();
  }

  /**
   * 挂载
   */
  private mount(): void {
    this.globalStyle.mount();
    this.stage.mount();
    this.statusBar.mount();
    this.menus.mount(this.stage.element!);
    this.tips.mount(this.stage.element!);
  }

  /**
   * 卸载
   */
  unMount(): void {
    this.globalStyle.unMount();
    this.stage.unMount();
    this.statusBar.unMount();
    this.tips.unMount();
  }

  /**
   * 加载模型
   */
  private async loadModel(isLoading = true): Promise<void> {
    if (!this.options.models || !this.options.models.length) {
      return;
    }

    if (this.mobileHidden) {
      this.statusBar.rest();

      return;
    }
    if (isLoading) {
      this.statusBar.showLoading();
    }
    await this.models.create().catch(() => {
      this.statusBar.loadingError(() => {
        void this.reloadModel();
      });
    });

    this.application?.mount(this.stage.canvasElement!, this.stage.element!, this.models.model);
    this.models.settingModel();
    this.stage.reloadStyle(this.models.modelSize);

    this.application?.resize();

    this.statusBar.hideLoading();

    // 注册模型事件
    this.registerModelEvent();

    await this.stage.slideIn();
  }

  /**
   * 重新加载
   */
  async reloadModel(): Promise<void> {
    this.tips.clear();
    await this.stage.slideOut();
    await this.loadModel();
    void this.tips.idlePlayer?.start();
  }
  /**
   * 加载下个模型
   */
  async loadNextModel(): Promise<void> {
    this.modelIndex++;
    if (this.modelIndex > this.options.models.length - 1) {
      this.modelIndex = 0;
    }
    this.statusBar.showLoading();
    this.tips.clear();
    await this.stage.slideOut();
    await this.loadModel(false);
    void this.tips.idlePlayer?.start();
  }

  /**
   * 初始化样式
   */
  private initializeStyle(): void {
    this.globalStyle.initializeStyle();
    this.statusBar.initializeStyle();
    this.tips.initializeStyle();
    this.stage.initializeStyle();
    this.menus.initializeStyle();
  }

  // 初始化
  async initialize(): Promise<void> {
    // 检查版本
    void checkVersion();

    // 打印信息
    if (this.options.sayHello) {
      printProjectInfo();
    }

    //  创建
    this.create();

    //  初始化样式
    this.initializeStyle();

    //  挂载
    this.mount();

    // 注册dom事件
    this.registerEvent();

    // 加载模型
    await this.loadModel();
  }

  /**
   * 切换状态. 休息/活动
   */
  switchStatus(): void {
    void this.stage.slideOut();
    this.tips.clear();

    this.statusBar.rest(true, () => {
      void this.stage.slideIn();
      void this.tips.idlePlayer?.start();
    });
  }

  /**
   * 注册dom事件
   */
  private registerEvent(): void {
    onChangeWindowSize(() => {
      void this.reloadModel();
    });

    // 出场入场动画执行结束之后的事件回调
    this.stage.onChangeSlideEnd((status) => {
      if (status) {
        this.tips.welcome();
      }
    });

    window.document.oncopy = (): void => {
      this.tips.copy();
    };
  }

  /**
   * 注册模型事件
   */
  private registerModelEvent(): void {
    this.models.onHit();
  }

  /**
   * 主动提示消息
   * @param message 提示信息
   * @param duration 持续时间  默认值: 3000
   * @param priority  优先级 默认值: 3
   */
  tipsMessage(message: string, duration?: number, priority?: number): void {
    this.tips.notification(message, duration, priority);
  }
}
