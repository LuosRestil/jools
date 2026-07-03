export interface GameObject {
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}