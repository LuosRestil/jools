import GameObject from "./GameObject.js";
import Rect from "./Rect.js";
import Vec2 from "./Vec2.js";

export default class Grid {
  cells: (GameObject | null)[][];
  dim: Vec2;
  cellSize: Vec2;
  rect: Rect;

  constructor(
    dim: Vec2,
    cellSize: Vec2,
    pos?: Vec2,
  ) {
    this.cellSize = cellSize;
    this.dim = dim;
    this.rect = new Rect(pos?.x ?? 0, pos?.y ?? 0, cellSize.x * dim.x, cellSize.y * dim.y);
    this.cells = Array.from({length: dim.y}, () => Array(dim.x).fill(null));
  }

  update(dt: number) {
    for (let row of this.cells) {
      for (let cell of row) {
        cell && cell.update(dt);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let row of this.cells) {
      for (let cell of row) {
        cell && cell.draw(ctx);
      }
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
