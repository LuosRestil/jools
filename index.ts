import { Grid } from "./Grid.js";
import { Sprite } from "./Sprite.js";
import { loadSprites } from "./sprites.js";

const WIDTH = 1920;
const HEIGHT = 1080;
const DPR = window.devicePixelRatio || 1;
let scale: number = 1;
let marginX: number = 0;
let marginY: number = 0;

let mouse: { x: number; y: number } = { x: 0, y: 0 };
document.addEventListener("mousemove", (evt: MouseEvent) => {
  mouse = screenToWorld({ x: evt.clientX, y: evt.clientY });
});
document.addEventListener("mousedown", (evt: MouseEvent) => {
  // TODO, select a given gem
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = WIDTH * DPR;
canvas.height = HEIGHT * DPR;
ctx.scale(DPR, DPR);
window.addEventListener("resize", () => {
  resize();
});
resize();

const sprRes = await fetch("./assets/spritesheet.json");
const sprText = await sprRes.text();
const spriteMap: {
  [key: string]: { frames: { frame: Omit<Sprite, "name"> } };
} = JSON.parse(sprText);
const sprites = loadSprites(spriteMap.frames);

let loading = true;

const spritesheet = new Image();
spritesheet.src = "./assets/spritesheet.png";
spritesheet.addEventListener("load", () => {
  loading = false;
});

const cellSize = Math.max(sprites[0].w, sprites[0].h);
const grid = new Grid({ x: 50, y: 50 }, cellSize, sprites, spritesheet);

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

  grid.draw(ctx);

  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
  ctx.fill();
}

function resize() {
  scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  let canvasWidth = WIDTH * scale;
  let canvasHeight = HEIGHT * scale;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  marginX = (window.innerWidth - canvasWidth) / 2;
  marginY = (window.innerHeight - canvasHeight) / 2;
}

function screenToWorld(pos: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return { x: (pos.x - marginX) / scale, y: (pos.y - marginY) / scale };
}

export {};
