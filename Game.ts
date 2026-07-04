import Grid from "./Grid.js";
import Gem from "./Gem.js";
import spriteUtils from "./sprites.js";
import globals from "./globals.js";
import Vec2 from "./Vec2.js";
import utils from "./utils.js";
import Rect from "./Rect.js";

export default class Game {
  pointers: Map<number, Gem>;
  grid: Grid<Gem>;

  swipeDistancePct = 0.2;
  lastSwap: Gem[] = [];

  constructor() {
    this.pointers = new Map();
    this.grid = new Grid(new Vec2(8, 8), new Vec2(32, 32));
  }

  async load() {
    const sprRes = await fetch("./assets/spritesheet.json");
    const sprText = await sprRes.text();
    const spriteMap: {
      [key: string]: { frames: { frame: Rect } };
    } = JSON.parse(sprText);
    const spriteRects: Rect[] = spriteUtils.loadSpriteData(spriteMap.frames);

    const spritesheet = new Image();
    spritesheet.src = "./assets/spritesheet.png";
    await spritesheet.decode();

    this.grid.setCellSize(new Vec2(spriteRects[0].w, spriteRects[0].h));
    const gridX = globals.RESOLUTION.w / 2 - this.grid.rect.w / 2;
    const gridY = globals.RESOLUTION.h / 2 - this.grid.rect.h / 2;
    this.grid.rect.x = gridX;
    this.grid.rect.y = gridY;

    for (let row = 0; row < this.grid.cells.length; row++) {
      for (let col = 0; col < this.grid.cells[0].length; col++) {
        let rnd = utils.randInt(0, spriteRects.length);
        let quad = spriteRects[rnd];
        this.grid.cells[row][col] = new Gem(
          this.grid,
          spritesheet,
          quad,
          rnd,
          row,
          col,
        );
      }
    }

    this.lastSwap.push(this.grid.cells[0][0]!);
    this.lastSwap.push(this.grid.cells[0][0]!);
  }

  onPointerDown(pointerId: number, pos: Vec2) {
    let gridRC = this.worldToGrid(pos);
    if (!this.isOnGrid(gridRC.row, gridRC.col)) return;
    let gem = this.grid.cells[gridRC.row][gridRC.col]!;
    if (!gem.anchored) return;
    gem.select();
    this.pointers.set(pointerId, gem);
  }

  onPointerUp(pointerId: number, pos: Vec2) {
    const releasedGem = this.pointers.get(pointerId);
    if (!releasedGem) return;
    this.pointers.delete(pointerId);

    this.swap(releasedGem);
  }

  update(dt: number) {
    this.grid.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.grid.draw(ctx);
  }

  swap(gem: Gem): SwapStatus {
    let offset = Vec2.sub(globals.mousePos, gem.touchpoint);
    let swapGem = this.getGemForSwap(gem, offset);
    if (swapGem === null || !swapGem.anchored) {
      gem.deselect();
      return SwapStatus.NO_SWAP;
    }

    let tmpRow = gem.getRow();
    let tmpCol = gem.getCol();
    gem.setRow(swapGem.getRow());
    gem.setCol(swapGem.getCol());
    swapGem.setRow(tmpRow);
    swapGem.setCol(tmpCol);
    this.grid.cells[gem.getRow()][gem.getCol()] = gem;
    this.grid.cells[swapGem.getRow()][swapGem.getCol()] = swapGem;

    gem.deselect();
    swapGem.snapToOrigin();
    this.lastSwap[0] = gem;
    this.lastSwap[1] = swapGem;

    if (
      this.makesMatch(gem.getRow(), gem.getCol()) ||
      this.makesMatch(swapGem.getRow(), swapGem.getCol())
    ) {
      return SwapStatus.MATCH;
    } else {
      return SwapStatus.NO_MATCH;
    }
  }

  getGemForSwap(gem: Gem, dragOffset: Vec2): Gem | null {
    // didn't move enough to count
    if (dragOffset.mag() < this.grid.getCellSize().x * this.swipeDistancePct) {
      return null;
    }

    let absOffsetX = Math.abs(dragOffset.x);
    let absOffsetY = Math.abs(dragOffset.y);
    if (
      Math.min(absOffsetX, absOffsetY) >
      Math.max(absOffsetX, absOffsetY) * 0.5
    ) {
      // too diagonal
      return null;
    }

    let row = gem.getRow();
    let col = gem.getCol();
    if (absOffsetX > absOffsetY) {
      col += dragOffset.x > 0 ? 1 : -1;
    } else {
      row += dragOffset.y > 0 ? 1 : -1;
    }
    if (!this.isOnGrid(row, col)) return null;
    return this.grid.cells[row][col];
  }

  makesMatch(row: number, col: number): boolean {
    return false;
  }

  worldToGrid(worldPos: Vec2): {
    row: number;
    col: number;
  } {
    let gridX = worldPos.x - this.grid.rect.x;
    let col = Math.floor(gridX / this.grid.getCellSize().x);
    let gridY = worldPos.y - this.grid.rect.y;
    let row = Math.floor(gridY / this.grid.getCellSize().y);
    return { row, col };
  }

  isOnGrid(row: number, col: number): boolean {
    return (
      row >= 0 && row < this.grid.dim.y && col >= 0 && col < this.grid.dim.x
    );
  }
}

enum SwapStatus {
  NO_SWAP,
  MATCH,
  NO_MATCH,
}
