import globals from "./globals.js";

export default class Background {
  squareSize = 300;
  scrollSpeed = 70;
  offset = 0;

  update(dt: number) {
    this.offset += dt * this.scrollSpeed
    if (this.offset >= this.squareSize * 2) {
      this.offset -= this.squareSize * 2;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(globals.RESOLUTION.w / 2, globals.RESOLUTION.h / 2);
    ctx.rotate(-Math.PI / 4);
    for (let i = -globals.RESOLUTION.h, p = 0; i < globals.RESOLUTION.h; i += this.squareSize, p++) {
      for (let j = -globals.RESOLUTION.w * 2, q = 0; j < globals.RESOLUTION.w; j += this.squareSize, q++) {
        let color = (p + q) % 2 === 0 ? 'rgb(10, 20, 20)' : 'rgb(30, 30, 40)';
        ctx.fillStyle = color;
        ctx.fillRect(j + this.offset, i, this.squareSize, this.squareSize);
      }
    }
    ctx.restore();
  }
}