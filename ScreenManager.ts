import Vec2 from "./Vec2.js";

export default class ScreenManager {
  width: number;
  height: number;
  dpr: number;
  scale: number;
  marginX: number;
  marginY: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.dpr = window.devicePixelRatio || 1;
    this.scale = 1;
    this.marginX = 0;
    this.marginY = 0;
  }

  resize(canvas: HTMLCanvasElement) {
    this.scale = Math.min(
      window.innerWidth / this.width,
      window.innerHeight / this.height,
    );
    let canvasWidth = this.width * this.scale;
    let canvasHeight = this.height * this.scale;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    this.marginX = (window.innerWidth - canvasWidth) / 2;
    this.marginY = (window.innerHeight - canvasHeight) / 2;
  }

  screenToWorld(pos: Vec2): Vec2 {
    pos.x = (pos.x - this.marginX) / this.scale;
    pos.y = (pos.y - this.marginY) / this.scale;
    return pos;
  }
}
