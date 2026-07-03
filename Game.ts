import Grid from "./Grid.js";
import Sprite from "./Sprite.js";
import spriteUtils from "./sprites.js";
import globals from "./globals.js";
import Vec2 from "./Vec2.js";

export default class Game {
  pointers: Map<number, Vec2>;
  cellSize: Vec2 = { x: 0, y: 0 };
  grid: Grid;

  constructor() {
    this.pointers = new Map();
    this.grid = new Grid({ x: 8, y: 8 }, this.cellSize);
  }

  async load(onLoadComplete: Function) {
    const sprRes = await fetch("./assets/spritesheet.json");
    const sprText = await sprRes.text();
    const spriteMap: {
      [key: string]: { frames: { frame: Omit<Sprite, "name"> } };
    } = JSON.parse(sprText);
    const sprites = spriteUtils.loadSprites(spriteMap.frames);

    const spritesheet = new Image();
    spritesheet.src = "./assets/spritesheet.png";
    spritesheet.addEventListener("load", () => onLoadComplete());

    this.cellSize = { x: sprites[0].w, y: sprites[0].h };
    const gridX = globals.RESOLUTION.w / 2 - this.grid.rect.w / 2;
    const gridY = globals.RESOLUTION.h / 2 - this.grid.rect.h / 2;
    this.grid.rect.x = gridX;
    this.grid.rect.y = gridY;

    // TODO populate grid with gems
  }

  onPointerDown(pointerId: number, pos: Vec2) {
    if (!this.isOnGrid(this.worldToGrid(pos))) return;
    this.pointers.set(pointerId, pos);
  }

  onPointerUp(pointerId: number, pos: Vec2) {
    const pointerStart = this.pointers.get(pointerId)!;
    this.pointers.delete(pointerId);
    const dragEnd = pos;
    const startRC = this.worldToGrid(pointerStart);
    const endRC = this.worldToGrid(dragEnd);
    const startGem = this.grid.cells[startRC.row][startRC.col];
    const endGem = this.grid.cells[endRC.row][endRC.col];

    if (startGem === endGem) {
      return;
    }

    let angleBetween = Math.atan2(
      dragEnd.y - pointerStart.y,
      dragEnd.x - pointerStart.x,
    );
    angleBetween = this.radToDeg(angleBetween);
    let swapOffset: { x: number; y: number };
    if (angleBetween <= -45 && angleBetween >= -135) {
      // up
      swapOffset = { x: 0, y: -1 };
    } else if (angleBetween >= 45 && angleBetween <= 135) {
      // down
      swapOffset = { x: 0, y: 1 };
    } else if (angleBetween >= -45 && angleBetween <= 45) {
      // right
      swapOffset = { x: 1, y: 0 };
    } else {
      // left
      swapOffset = { x: -1, y: 0 };
    }
    let swapGem =
      this.grid.cells[startRC.row + swapOffset.y][startRC.col + swapOffset.x];
    this.grid.cells[startRC.row][startRC.col] = swapGem;
    this.grid.cells[startRC.row + swapOffset.y][startRC.col + swapOffset.x] =
      startGem;
  }

  update(dt: number) {
    this.grid.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.grid.draw(ctx);
        // for (let i = 0; i < this.cells.length; i++) {
    //   for (let j = 0; j < this.cells.length; j++) {
    //     let sprite = this.cells[i][j];
    //     const cellX = j * this.cellSize.x + this.pos.x;
    //     const cellY = i * this.cellSize.y + this.pos.y;
    //     const cellMarginX = this.cellSize.x - sprite.w;
    //     const cellMarginY = this.cellSize.y - sprite.h;
    //     ctx.drawImage(
    //       this.spritesheet,
    //       sprite.x,
    //       sprite.y,
    //       sprite.w,
    //       sprite.h,
    //       cellX + cellMarginX * 0.5,
    //       cellY + cellMarginY * 0.5,
    //       sprite.w,
    //       sprite.h,
    //     );
    //   }
    // }
  }

  worldToGrid(worldPos: Vec2): {
    row: number;
    col: number;
  } {
    let gridX = worldPos.x - this.grid.rect.x;
    let col = Math.floor(gridX / this.grid.cellSize.x);
    let gridY = worldPos.y - this.grid.rect.y;
    let row = Math.floor(gridY / this.grid.cellSize.y);
    return { row, col };
  }

  isOnGrid(pos: { row: number; col: number }): boolean {
    return (
      pos.row >= 0 &&
      pos.row < this.grid.dim.y &&
      pos.col >= 0 &&
      pos.col < this.grid.dim.x
    );
  }

  radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
  }
}
