import GameObject from "./GameObject.js";
import Rect from "./Rect.js";
import Vec2 from "./Vec2.js";

export default class Grid<T extends GameObject> {
  cells: (T | null)[][];
  dim: Vec2;
  #cellSize: Vec2;
  rect: Rect;

  constructor(dim: Vec2, cellSize: Vec2, pos?: Vec2) {
    this.#cellSize = cellSize;
    this.dim = dim;
    this.rect = new Rect(
      pos?.x ?? 0,
      pos?.y ?? 0,
      cellSize.x * dim.x,
      cellSize.y * dim.y,
    );
    this.cells = Array.from({ length: dim.y }, () => Array(dim.x).fill(null));
  }

  update(dt: number) {
    for (let row of this.cells) {
      for (let cell of row) {
        cell && cell.update(dt);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // this.drawGrid(ctx);

    for (let row of this.cells) {
      for (let cell of row) {
        cell && cell.draw(ctx);
      }
    }
  }

  getCellSize(): Vec2 {
    return this.#cellSize;
  }

  setCellSize(cellSize: Vec2): void {
    this.#cellSize = cellSize;
    this.rect.w = cellSize.x * this.dim.x;
    this.rect.h = cellSize.y * this.dim.y;
  }

  drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = "white";
    for (let i = 0; i < this.cells.length + 1; i++) {
      ctx.beginPath();

      ctx.moveTo(i * this.#cellSize.x + this.rect.x, this.rect.y);
      ctx.lineTo(i * this.#cellSize.x + this.rect.x, this.rect.y + this.rect.w);
      ctx.stroke();

      ctx.moveTo(this.rect.x, i * this.#cellSize.y + this.rect.y);
      ctx.lineTo(this.rect.x + this.rect.w, i * this.#cellSize.y + this.rect.y);
      ctx.stroke();
    }
  }

  // makesMatch(row: number, col: number) {
  //   let sprite = this.cells[row][col];
  //   let vertCount = 1;
  //   let horizCount = 1;
  //   // left
  //   let currentCol = col - 1;
  //   while (
  //     currentCol > 0 &&
  //     // !sprite.fall &&
  //     this.cells[row][currentCol].name == sprite.name
  //   ) {
  //     vertCount += 1;
  //     currentCol -= 1;
  //   }
  //   // right
  //   currentCol = col + 1;
  //   while (
  //     currentCol <= this.dim.x &&
  //     // !sprite.fall &&
  //     this.cells[row][currentCol].name == sprite.name
  //   ) {
  //     vertCount += 1;
  //     currentCol += 1;
  //   }
  //   // up
  //   let currentRow = row - 1;
  //   while (
  //     currentRow > 0 &&
  //     // !sprite.fall &&
  //     this.cells[currentRow][col].name == sprite.name
  //   ) {
  //     horizCount += 1;
  //     currentRow -= 1;
  //   }
  //   // down
  //   currentRow = row + 1;
  //   while (
  //     currentRow <= this.dim.y &&
  //     // !sprite.fall &&
  //     this.cells[currentRow][col].name == sprite.name
  //   ) {
  //     horizCount += 1;
  //     currentRow += 1;
  //   }
  //   return Math.max(vertCount, horizCount) >= 3;
  // }
}
