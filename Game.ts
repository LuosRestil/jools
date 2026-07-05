import Grid from "./Grid.js";
import Gem from "./Gem.js";
import spriteUtils from "./sprites.js";
import globals from "./globals.js";
import Vec2 from "./Vec2.js";
import utils from "./utils.js";
import Rect from "./Rect.js";
import Background from "./Background.js";

export default class Game {
  background = new Background();
  pointers: Map<number, Gem>;
  grid: Grid<Gem>;
  rows = 8;
  cols = 8;

  swipeDistancePct = 0.2;
  lastSwap: Gem[] = [];

  bumpStrength = 200;

  spriteRects: Rect[] = [];

  constructor() {
    this.pointers = new Map();
    this.grid = new Grid(new Vec2(this.cols, this.rows), new Vec2(32, 32));
  }

  async load() {
    const sprRes = await fetch("./assets/spritesheet.json");
    const sprText = await sprRes.text();
    const spriteMap: {
      [key: string]: { frames: { frame: Rect } };
    } = JSON.parse(sprText);
    const spriteRects: Rect[] = spriteUtils.loadSpriteData(spriteMap.frames);
    this.spriteRects = spriteRects;

    const spritesheet = new Image();
    spritesheet.src = "./assets/spritesheet.png";
    await spritesheet.decode();

    this.grid.setCellSize(new Vec2(spriteRects[0].w * 1.3, spriteRects[0].h * 1.3));
    const gridX = globals.RESOLUTION.w / 2 - this.grid.rect.w / 2;
    const gridY = globals.RESOLUTION.h / 2 - this.grid.rect.h / 2;
    this.grid.rect.x = gridX;
    this.grid.rect.y = gridY;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let rnd = utils.randInt(0, spriteRects.length);
        let quad = spriteRects[rnd];
        this.grid.cells[row][col] = new Gem(
          this.grid,
          spritesheet,
          quad,
          rnd,
          row,
          col,
          this.grid.getCellSize().copy()
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
    this.background.update(dt);
    this.grid.update(dt);
    let didMatch = this.makeMatches();
    if (!didMatch && !this.gemsAreMoving()) {
      // score stuff
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.background.draw(ctx);
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

  makeMatches(): boolean {
    let cells = this.grid.cells;
    // horizontal
    for (let row = 0; row < this.rows; row++) {
      let lastType = -1;
      let matchCount = 0;
      for (let col = 0; col < this.cols; col++) {
        let curr = cells[row][col];
        if (curr != null && curr.gemType === lastType && curr.anchored) {
          matchCount++;
          lastType = curr.gemType;
        } else {
          if (matchCount >= 3) {
            for (let i = col - 1; i > col - 1 - matchCount; i--) {
              cells[row][i]!.markedForDestroy = true;
            }
          }
          if (curr === null || !curr.anchored) {
            lastType = -1;
          } else {
            lastType = curr.gemType;
          }
          matchCount = 1;
        }
      }
      // catch streaks at end of rows
      if (matchCount >= 3) {
        for (let i = this.cols - 1; i > this.cols - 1 - matchCount; i--) {
          cells[row][i]!.markedForDestroy = true;
        }
      }
    }

    // vertical
    for (let col = 0; col < this.cols; col++) {
      let lastType = -1;
      let matchCount = 0;
      for (let row = 0; row < this.rows; row++) {
        let curr = cells[row][col];
        if (curr !== null && curr.gemType === lastType && curr.anchored) {
          matchCount++;
          lastType = curr.gemType;
        } else {
          if (matchCount >= 3) {
            for (let i = row - 1; i > row - 1 - matchCount; i--) {
              cells[i][col]!.markedForDestroy = true;
            }
          }
          if (curr === null || !curr.anchored) {
            lastType = -1;
          } else {
            lastType = curr.gemType;
          }
          matchCount = 1;
        }
      }
      // catch streaks at end of rows
      if (matchCount >= 3) {
        for (let i = this.rows - 1; i > this.rows - 1 - matchCount; i--) {
          cells[i][col]!.markedForDestroy = true;
        }
      }
    }

    // TODO scoring

    let toReuse: Gem[] = [];
    for (let col = 0; col < this.cols; col++) {
      let offset = 0;
      for (let row = this.rows - 1; row > -1; row--) {
        let gem = cells[row][col];
        if (gem === null) {
          break;
        }
        if (gem.markedForDestroy) {
          offset += 1;
          toReuse.push(gem);
          cells[row][col] = null;
        } else if (offset > 0) {
          cells[row][col] = null;
          cells[row + offset][col] = gem;
          gem.setRow(row + offset);
          gem.drop(-this.bumpStrength);
        }
      }
      for (let row = this.rows - 1; row > -1; row--) {
        if (cells[row][col] === null) {
          let gem = toReuse.pop() as Gem;
          let rnd = utils.randInt(0, this.spriteRects.length);
          let quad = this.spriteRects[rnd];
          gem.gemType = rnd;
          gem.quad = quad;
          gem.setRow(row);
          gem.setCol(col);
          gem.pos = gem.origin;
          gem.pos.y -= offset * this.grid.getCellSize().y;
          gem.drop();
          cells[row][col] = gem;
        }
      }
    }

    return false;
  }

  gemsAreMoving(): boolean {
    return false;
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
