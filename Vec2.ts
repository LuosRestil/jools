export default class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  add(other: Vec2): Vec2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  static add(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  sub(other: Vec2): Vec2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  static sub(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  scale(scale: number): Vec2 {
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  static scale(v: Vec2, scale: number): Vec2 {
    return new Vec2(v.x * scale, v.y * scale);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setMag(mag: number): void {
    this.normalize().scale(mag);
  }

  normalize(): Vec2 {
    this.scale(1 / this.mag());
    return this;
  }

  normalized(): Vec2 {
    let cpy = this.copy();
    cpy.normalize();
    return cpy;
  }

  toString(): string {
    return `Vec2(${this.x}, ${this.y})`;
  }
}