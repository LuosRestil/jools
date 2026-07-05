import Easings from "./lib/Easings.js";
import GameObject from "./lib/GameObject.js";
import globals from "./lib/globals.js";
import Grid from "./lib/Grid.js";
import Rect from "./lib/Rect.js";
import Tween from "./lib/Tween.js";
import Vec2 from "./lib/Vec2.js";

export default class Gem implements GameObject {
  grid: Grid<Gem>;

  gemType: number;
  origin: Vec2 = new Vec2(0, 0);
  pos: Vec2;
  img: HTMLImageElement;
  quad: Rect;
  rotation = 0;
  size: Vec2;

  rotFreq = 8;
  rotMag = 10;
  dragging = false;
  anchored = true;
  falling = false;
  markedForDestroy = false;
  elapsed = 0;
  offsetFromMouse = new Vec2(0, 0);
  touchpoint = new Vec2(0, 0);
  velY = 0;
  accY = 2500;
  snapTime = 0.2;

  #row: number = 0;
  #col: number = 0;

  tweens: Tween<any>[] = [];

  constructor(
    grid: Grid<Gem>,
    img: HTMLImageElement,
    quad: Rect,
    spriteType: number,
    row: number,
    col: number,
    size: Vec2
  ) {
    this.grid = grid;
    this.img = img;
    this.quad = quad;
    this.gemType = spriteType;
    this.size = size;
    this.setRow(row);
    this.setCol(col);
    this.pos = this.origin.copy();
  }

  update(dt: number) {
    let filterTweens = false;
    for (let tween of this.tweens) {
      tween.update(dt);
      if (tween.complete) filterTweens = true;
    }
    if (filterTweens) {
      this.tweens = this.tweens.filter((tween) => !tween.complete);
    }

    if (this.dragging) {
      this.rotation = Math.sin(this.elapsed * this.rotFreq) / this.rotMag;
      this.elapsed += dt;
      let offset = Vec2.sub(globals.mousePos, this.touchpoint).scale(0.5);
      let maxMag = this.grid.getCellSize().x * 0.8;
      if (offset.mag() > maxMag) {
        offset.setMag(maxMag);
      }
      this.pos = Vec2.add(this.origin, offset);
    } else {
      this.rotation = 0;
      this.elapsed = 0;
    }

    if (this.falling) {
      this.pos.y += this.velY * dt;
      this.velY += this.accY * dt;
      if (this.pos.y >= this.origin.y) {
        this.pos.y = this.origin.y;
        this.falling = false;
        this.anchored = true;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.img,
      this.quad.x,
      this.quad.y,
      this.quad.w,
      this.quad.h,
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y,
    );
    ctx.restore();
  }

  getRow(): number {
    return this.#row;
  }

  setRow(row: number): void {
    this.#row = row;
    let cellY = row * this.grid.getCellSize().y + this.grid.rect.y;
    let cellMarginY = this.grid.getCellSize().y - this.size.y;
    this.origin.y = cellY + cellMarginY * 0.5;
  }

  getCol(): number {
    return this.#col;
  }

  setCol(col: number): void {
    this.#col = col;
    let cellX = col * this.grid.getCellSize().x + this.grid.rect.x;
    let cellMarginX = this.grid.getCellSize().x - this.size.x;
    this.origin.x = cellX + cellMarginX * 0.5;
  }

  select(): void {
    this.dragging = true;
    this.touchpoint = globals.mousePos.copy();
  }

  deselect(): void {
    this.dragging = false;
    this.snapToOrigin();
  }

  drop(startVel: number = 0): void {
    this.anchored = false;
    this.falling = true;
    this.velY = startVel;
  }

  snapToOrigin(): void {
    this.anchored = false;
    this.tweens.push(
      new Tween(
        this.pos,
        "x",
        this.origin.x,
        this.snapTime,
        () => (this.anchored = true),
      ).withEasing(Easings.outQuart),
    );
    this.tweens.push(
      new Tween(this.pos, "y", this.origin.y, this.snapTime).withEasing(
        Easings.outQuart,
      ),
    );
  }
}
