import GameObject from "./GameObject.js";
import Rect from "./Rect.js";
import Vec2 from "./Vec2.js";

export default class Sprite implements GameObject {
  spriteType: number;
  origin: Vec2;
  pos: Vec2;
  img: HTMLImageElement;
  quad: Rect;

  constructor(
    img: HTMLImageElement,
    quad: Rect,
    spriteType: number,
    origin: Vec2,
    pos: Vec2,
  ) {
    this.img = img;
    this.quad = quad;
    this.spriteType = spriteType;
    this.origin = origin;
    this.pos = pos;
  }

  update(dt: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.img,
      this.quad.x,
      this.quad.y,
      this.quad.w,
      this.quad.h,
      this.pos.x,
      this.pos.y,
      this.quad.w,
      this.quad.h,
    );
  }
}
