import type CSS from 'csstype';
import type { Live2DModel } from 'pixi-live2d-display';
import type { HitAreaFrames } from 'pixi-live2d-display/extra';
import type { Application } from 'pixi.js';

import { CommonStyleType, Item } from './common.js';
import type { ModelOptions } from './model.js';
import type { MenusOptions, Options } from './options.js';
import { StatusBarOptions } from './statusBar.js';
import { TipsOptions } from './tips.js';
import type { DeepRequired } from './utils.js';
import type { DEFAULT_OPTIONS } from '../config/config.js';

export * from './options.js';
export * from './utils.js';
export type HitAreaFramesType = typeof HitAreaFrames;
export type ImportType = 'complete' | 'cubism2' | 'cubism5';

export type PixiLive2dDisplayModule = typeof import('pixi-live2d-display') & {
  HitAreaFrames: HitAreaFramesType;
};

export type PixiModule = typeof import('pixi.js');

// export type MotionPreloadStrategy = PIXI_LIVE2D_DISPLAY_MODULE['MotionPreloadStrategy'];

export type ApplicationType = typeof Application;

export type CSSProperties = CSS.Properties;

export type DefaultOptions = Omit<
  DeepRequired<Options>,
  'parentElement' | 'stageStyle' | 'models' | 'tips' | 'statusBar' | 'menus' | 'initialStatus'
> & {
  parentElement: HTMLElement;
  tips: DefaultTipsOptions;
  statusBar: DefaultStatusBarOptions;
  menus: DefaultMenusOptions;
  stageStyle?: CommonStyleType;
  models: ModelOptions[];
  initialStatus?: 'sleep' | 'active';
};

export type DefaultTipsOptions = Omit<DeepRequired<TipsOptions>, 'style' | 'mobileStyle'> & {
  style?: CommonStyleType;
  mobileStyle?: CommonStyleType;
};

export type DefaultStatusBarOptions = Omit<DeepRequired<StatusBarOptions>, 'style' | 'mobileStyle'> & {
  style?: CommonStyleType;
  mobileStyle?: CommonStyleType;
};

export type DefaultMenusOptions = Omit<DeepRequired<MenusOptions>, 'style' | 'itemStyle' | 'mobileStyle' | 'mobileItemStyle' | 'items'> & {
  items: Item[];
  style?: CommonStyleType;
  itemStyle?: CommonStyleType;
  mobileStyle?: CommonStyleType;
  mobileItemStyle?: CommonStyleType;
};

export type Live2DModelType = typeof Live2DModel;

export type HitAreaFramesModule = typeof HitAreaFrames;

export type LibraryUrls = {
  /**
   * 自定义 Cubism2 SDK 地址
   * @default oh-my-live2d提供的默认地址
   */
  cubism2?: string;

  /**
   * 自定义 Cubism5 SDK 地址
   * @default oh-my-live2d提供的默认地址
   */
  cubism5?: string;

  complete?: string;
};

export interface ElementConfig {
  id: string;
  className?: string;
  dataName?: string;
  tagName: string;
  children?: ElementConfig[];
  innerHtml?: string;
  innerText?: string;
}

export type WelcomeTipesType = typeof DEFAULT_OPTIONS.tips.welcomeTips;
