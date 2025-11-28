import { init } from 'l2d';

export function createL2DWidget() {
  const container = document.createElement('div');
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  document.body.appendChild(container);

  const l2d = init(canvas);
  l2d.create({
    path: 'https://model.hacxy.cn/cat-black/model.json',
    position: [0, 10],
    scale: 0.1,
  });
}
