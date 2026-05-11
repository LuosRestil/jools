import { Grid } from "./Grid.js";
import { Sprite } from "./Sprite.js";
import { loadSprites } from "./sprites.js";

let debug: string | null = null;

const WIDTH = 1920;
const HEIGHT = 1080;
const DPR = window.devicePixelRatio || 1;
let scale: number = 1;
let marginX: number = 0;
let marginY: number = 0;

let dragStart: { x: number; y: number } | null = null;
document.addEventListener("mousedown", (evt: MouseEvent) => {
  const loc = screenToWorld({ x: evt.clientX, y: evt.clientY });
  if (!isOnGrid(worldToGrid(loc))) return;
  dragStart = loc;
});
document.addEventListener("mouseup", (evt: MouseEvent) => {
  if (dragStart === null) return;

  const dragEnd = screenToWorld({ x: evt.clientX, y: evt.clientY });
  const startRC = worldToGrid(dragStart!);
  const endRC = worldToGrid(dragEnd);
  const startGem = grid.sprites[startRC.row][startRC.col];
  const endGem = grid.sprites[endRC.row][endRC.col];

  if (startGem === endGem) {
    dragStart = null;
    return;
  }

  let angleBetween = Math.atan2(
    dragEnd.y - dragStart.y,
    dragEnd.x - dragStart.x,
  );
  angleBetween = radToDeg(angleBetween);
  let swapOffset: {x: number, y: number};
  if (angleBetween <= -45 && angleBetween >= -135) {
    // up
    swapOffset = {x: 0, y: -1};
  } else if (angleBetween >= 45 && angleBetween <= 135) {
    // down
    swapOffset = {x: 0, y: 1};
  } else if (angleBetween >= -45 && angleBetween <= 45) {
    // right
    swapOffset = {x: 1, y: 0};
  } else {
    // left
    swapOffset = {x: -1, y: 0};
  }
  let swapGem = grid.sprites[startRC.row + swapOffset.y][startRC.col + swapOffset.x];
  grid.sprites[startRC.row][startRC.col] = swapGem;
  grid.sprites[startRC.row + swapOffset.y][startRC.col + swapOffset.x] = startGem;

  dragStart = null;
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

const cellSize = { x: sprites[0].w * 1.1, y: sprites[0].h * 1.1 };
const grid = new Grid({ x: 8, y: 8 }, cellSize, sprites, spritesheet);
const gridX = WIDTH / 2 - grid.size.w / 2;
const gridY = HEIGHT / 2 - grid.size.h / 2;
grid.pos = { x: gridX, y: gridY };

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

  if (debug !== null) {
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.font = "bold 32px monospace";
    ctx.fillText(debug, 10, 10);
  }
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

function worldToGrid(pos: { x: number; y: number }): {
  row: number;
  col: number;
} {
  let gridX = pos.x - grid.pos.x;
  let col = Math.floor(gridX / grid.cellSize.x);
  let gridY = pos.y - grid.pos.y;
  let row = Math.floor(gridY / grid.cellSize.y);
  return { row, col };
}

function isOnGrid(pos: { row: number; col: number }): boolean {
  return (
    pos.row >= 0 &&
    pos.row < grid.sprites.length &&
    pos.col >= 0 &&
    pos.col < grid.sprites[0].length
  );
}

function radToDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

export {};
