import { Grid } from "./Grid.js";
import { Sprite } from "./Sprite.js";
import { loadSprites } from "./sprites.js";
import { ScreenManager } from "./ScreenManager.js";

let debug: string | null = null;

const screenManager = new ScreenManager(1920, 1080);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = screenManager.width * screenManager.dpr;
canvas.height = screenManager.height * screenManager.dpr;
ctx.scale(screenManager.dpr, screenManager.dpr);
screenManager.resize(canvas);

window.addEventListener("resize", () => {
  screenManager.resize(canvas);
});

let touchCount = 0;

// prevents context menu from activating on long press
document.oncontextmenu = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
};

let pointers = new Map();

document.addEventListener("pointerdown", (evt: PointerEvent) => {
  evt.preventDefault();

  const loc = screenToWorld({ x: evt.clientX, y: evt.clientY });
  if (!isOnGrid(worldToGrid(loc))) return;
  pointers.set(evt.pointerId, loc);
});
document.addEventListener("pointerup", (evt: PointerEvent) => {
  const pointerStart = pointers.get(evt.pointerId);
  pointers.delete(evt.pointerId);
  const dragEnd = screenToWorld({ x: evt.clientX, y: evt.clientY });
  const startRC = worldToGrid(pointerStart);
  const endRC = worldToGrid(dragEnd);
  const startGem = grid.sprites[startRC.row][startRC.col];
  const endGem = grid.sprites[endRC.row][endRC.col];

  if (startGem === endGem) {
    return;
  }

  let angleBetween = Math.atan2(
    dragEnd.y - pointerStart.y,
    dragEnd.x - pointerStart.x,
  );
  angleBetween = radToDeg(angleBetween);
  let swapOffset: { x: number; y: number };
  if (angleBetween <= -45 && angleBetween >= -135) {
    // up
    swapOffset = { x: 0, y: -1 };
  } else if (angleBetween >= 45 && angleBetween <= 135) {
    // down
    swapOffset = { x: 0, y: 1 };
  } else if (angleBetween >= -45 && angleBetween <= 45) {
    // right
    swapOffset = { x: 1, y: 0 };
  } else {
    // left
    swapOffset = { x: -1, y: 0 };
  }
  let swapGem =
    grid.sprites[startRC.row + swapOffset.y][startRC.col + swapOffset.x];
  grid.sprites[startRC.row][startRC.col] = swapGem;
  grid.sprites[startRC.row + swapOffset.y][startRC.col + swapOffset.x] =
    startGem;
});

const sprRes = await fetch("./assets/spritesheet.json");
const sprText = await sprRes.text();
const spriteMap: {
  [key: string]: { frames: { frame: Omit<Sprite, "name"> } };
} = JSON.parse(sprText);
const sprites = loadSprites(spriteMap.frames);

const spritesheet = new Image();
spritesheet.src = "./assets/spritesheet.png";
spritesheet.addEventListener("load", () => loop(0));

const cellSize = { x: sprites[0].w * 1.1, y: sprites[0].h * 1.1 };
const grid = new Grid({ x: 8, y: 8 }, cellSize, sprites, spritesheet);
const gridX = screenManager.width / 2 - grid.size.w / 2;
const gridY = screenManager.height / 2 - grid.size.h / 2;
grid.pos = { x: gridX, y: gridY };

let lastFrameMs = 0;

function loop(ms: number) {
  requestAnimationFrame(loop);

  const dtms = ms - lastFrameMs;
  lastFrameMs = ms;
  const dts = dtms / 1000;

  update(dts);
  draw();
}

function update(dts: number) {}

function draw() {
  ctx.clearRect(0, 0, screenManager.width, screenManager.height);

  ctx.fillStyle = "rgb(30,30,30)";
  ctx.fillRect(0, 0, screenManager.width, screenManager.height);

  grid.draw(ctx);

  if (debug !== null) {
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.font = "bold 32px monospace";
    ctx.fillText(debug, 10, 10);
  }
}

function screenToWorld(pos: { x: number; y: number }): {
  x: number;
  y: number;
} {
  return {
    x: (pos.x - screenManager.marginX) / screenManager.scale,
    y: (pos.y - screenManager.marginY) / screenManager.scale,
  };
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
  return (rad * 180) / Math.PI;
}

export {};
