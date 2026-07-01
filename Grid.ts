import { Sprite } from "./Sprite.js";

export class Grid {
  spriteOptions: Sprite[];
  sprites: Sprite[][];
  spritesheet: HTMLImageElement;
  pos: { x: number; y: number };
  size: { w: number; h: number };
  dim: { x: number; y: number };
  cellSize: { x: number; y: number };

  constructor(
    dim: { x: number; y: number },
    cellSize: { x: number; y: number },
    spriteOptions: Sprite[],
    spritesheet: HTMLImageElement,
    pos?: { x: number; y: number },
  ) {
    this.pos = pos || { x: 0, y: 0 };
    this.cellSize = cellSize;
    this.dim = dim;
    this.size = { w: cellSize.x * dim.x, h: cellSize.y * dim.y };
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
        const cellX = j * this.cellSize.x + this.pos.x;
        const cellY = i * this.cellSize.y + this.pos.y;
        const cellMarginX = this.cellSize.x - sprite.w;
        const cellMarginY = this.cellSize.y - sprite.h;
        ctx.drawImage(
          this.spritesheet,
          sprite.x,
          sprite.y,
          sprite.w,
          sprite.h,
          cellX + cellMarginX * 0.5,
          cellY + cellMarginY * 0.5,
          sprite.w,
          sprite.h,
        );
      }
    }
  }

  makesMatch(row: number, col: number) {
    let sprite = this.sprites[row][col];
    let vertCount = 1;
    let horizCount = 1;
    // left
    let currentCol = col - 1;
    while (
      currentCol > 0 &&
      // !sprite.fall &&
      this.sprites[row][currentCol].name == sprite.name
    ) {
      vertCount += 1;
      currentCol -= 1;
    }
    // right
    currentCol = col + 1;
    while (
      currentCol <= this.dim.x &&
      // !sprite.fall &&
      this.sprites[row][currentCol].name == sprite.name
    ) {
      vertCount += 1;
      currentCol += 1;
    }
    // up
    let currentRow = row - 1;
    while (
      currentRow > 0 &&
      // !sprite.fall &&
      this.sprites[currentRow][col].name == sprite.name
    ) {
      horizCount += 1;
      currentRow -= 1;
    }
    // down
    currentRow = row + 1;
    while (
      currentRow <= this.dim.y &&
      // !sprite.fall &&
      this.sprites[currentRow][col].name == sprite.name
    ) {
      horizCount += 1;
      currentRow += 1;
    }
    return Math.max(vertCount, horizCount) >= 3;
  }
}
