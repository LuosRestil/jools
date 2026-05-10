import { Sprite } from "./Sprite.js";

export class Grid {
  spriteOptions: Sprite[];
  sprites: Sprite[][];
  spritesheet: HTMLImageElement;
  pos: { x: number; y: number };

  constructor(
    pos: { x: number; y: number },
    cellSize: number,
    spriteOptions: Sprite[],
    spritesheet: HTMLImageElement
  ) {
    this.pos = pos;
    this.spriteOptions = spriteOptions;
    this.sprites = [];
    for (let i = 0; i < 8; i++) {
      let row = [];
      for (let j = 0; j < 8; j++) {
        row.push(
          spriteOptions[Math.ceil(Math.random() * spriteOptions.length) - 1],
        );
      }
      this.sprites.push(row);
    }
    this.spritesheet = spritesheet;
  }

  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.sprites.length; i++) {
      for (let j = 0; j < this.sprites.length; j++) {
        let sprite = this.sprites[i][j];
        const x = j * sprite.w;
        const y = i * sprite.h;
        ctx.drawImage(
          this.spritesheet,
          sprite.x,
          sprite.y,
          sprite.w,
          sprite.h,
          x,
          y,
          sprite.w,
          sprite.h,
        );
      }
    }
  }
}
