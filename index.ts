import { Sprite } from "./Sprite.js";
import { loadSprites } from "./sprites.js";
import { WithName } from "./WithName.js";

const WIDTH = 1920;
const HEIGHT = 1080;
const DPR = window.devicePixelRatio || 1;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = WIDTH * DPR;
canvas.height = HEIGHT * DPR;
ctx.scale(DPR, DPR);
window.addEventListener("resize", () => {
  resize();
});
resize();

const sprRes = await fetch("./public/sprites.json");
const spriteMap = JSON.parse(await sprRes.text());

let loading = true;

const spritesheet = new Image();
spritesheet.src = "./public/spritesheet_double.png";
spritesheet.addEventListener("load", () => {
  loading = false;
});

const sprites = loadSprites(spriteMap)
  .filter(sprite => !sprite.name.includes("glossy"));

const tempCanvas = document.createElement('canvas');
tempCanvas.width = spritesheet.width;
tempCanvas.height = spritesheet.height;
const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
tempCtx.drawImage(spritesheet, 0, 0);
let sprite = sprites[0];
const data = tempCtx.getImageData(sprite.x, sprite.y, sprite.width, sprite.height).data;

// Check edge pixels for non-zero alpha
for (let x = 0; x < sprite.width; x++) {
  const idx = x * 4; // top row
  if (data[idx + 3] > 0 && data[idx + 3] < 255) {
    console.log(`Semi-transparent pixel at (${x}, 0): alpha=${data[idx + 3]}, rgb=${data[idx]},${data[idx + 1]},${data[idx + 2]}`);
  }
}

const grid: WithName<Sprite>[][] = [];
for (let i = 0; i < 8; i++) {
  let row = [];
  for (let j = 0; j < 8; j++) {
    row.push(sprites[Math.ceil(Math.random() * sprites.length) - 1]);
  }
  grid.push(row);
}

let lastFrameMs = 0;

function loop(ms: number) {
  requestAnimationFrame(loop);

  const dtms = ms - lastFrameMs;
  lastFrameMs = ms;
  const dts = dtms / 1000;

  if (loading) return;

  update(dts);
  draw(ctx);
}
loop(0);

function update(dts: number) {}

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgb(30,30,30)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      let sprite = grid[i][j];
      const x = Math.round(j * sprite.width);
      const y = Math.round(i * sprite.height);
      ctx.drawImage(
        spritesheet,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,
        x,
        y,
        sprite.width,
        sprite.height,
      );
    }
  }
}

function resize() {
  const scale = Math.min(
    window.innerWidth / WIDTH,
    window.innerHeight / HEIGHT,
  );
  canvas.style.width = `${WIDTH * scale}px`;
  canvas.style.height = `${HEIGHT * scale}px`;
}

export {};
