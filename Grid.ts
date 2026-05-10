import { Sprite } from "./Sprite.js";

export class Grid {
  spriteOptions: Sprite[];
  sprites: Sprite[][];
  spritesheet: HTMLImageElement;
  pos: { x: number; y: number };
  size: { w: number; h: number};
  dim: {x: number, y: number};
  cellSize: { x: number; y: number };
  selected?: { row: number; col: number };

  constructor(
    pos: { x: number, y: number },
    dim: {x: number, y: number},
    cellSize: { x: number; y: number },
    spriteOptions: Sprite[],
    spritesheet: HTMLImageElement,
  ) {
    this.pos = pos;
    this.cellSize = cellSize;
    this.dim = dim;
    this.size = {w: cellSize.x * dim.x, h: cellSize.y * dim.y};
    this.spriteOptions = spriteOptions;
    this.sprites = [];
    for (let i = 0; i < dim.y; i++) {
      let row = [];
      for (let j = 0; j < dim.x; j++) {
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
        const x = j * this.cellSize.x + this.pos.x;
        const y = i * this.cellSize.y + this.pos.y;
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
        if (this.selected?.row === i && this.selected?.col === j) {
          ctx.strokeStyle = "cyan";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(x, y, this.cellSize.x, this.cellSize.y, 10);
          ctx.stroke();
        }
      }
    }
  }
}
