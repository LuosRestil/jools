import ScreenManager from "./ScreenManager.js";
import Vec2 from "./Vec2.js";
import globals from "./globals.js";
import Game from "./Game.js";

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

let game = new Game();
await game.load();

document.addEventListener("pointerdown", (evt: PointerEvent) => {
  evt.preventDefault();
  const pos = screenManager.screenToWorld(new Vec2(evt.clientX, evt.clientY));
  game.onPointerDown(evt.pointerId, pos);
});
document.addEventListener("pointerup", (evt: PointerEvent) => {
  const pos = screenManager.screenToWorld(new Vec2(evt.clientX, evt.clientY));
  game.onPointerUp(evt.pointerId, pos);
});
let moveScreenToWorld = new Vec2(0, 0);
document.addEventListener("pointermove", (evt: PointerEvent) => {
  moveScreenToWorld.x = evt.clientX;
  moveScreenToWorld.y = evt.clientY;
  globals.mousePos = screenManager.screenToWorld(moveScreenToWorld);
});
// prevents context menu from activating on long press
document.oncontextmenu = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
};

let lastFrameMs = 0;

function loop(ms: number) {
  requestAnimationFrame(loop);

  const dtms = ms - lastFrameMs;
  lastFrameMs = ms;
  const dts = dtms / 1000;

  update(dts);
  draw();
}

function update(dts: number) {
  game.update(dts);
}

function draw() {
  ctx.clearRect(0, 0, globals.RESOLUTION.w, globals.RESOLUTION.h);

  ctx.fillStyle = "rgb(30,30,30)";
  ctx.fillRect(0, 0, globals.RESOLUTION.w, globals.RESOLUTION.h);

  game.draw(ctx);

  if (globals.debug !== null) {
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.font = "bold 32px monospace";
    ctx.fillText(globals.debug, 10, 10);
  }

  // ctx.fillStyle = "red";
  // ctx.beginPath();
  // ctx.arc(globals.mousePos.x, globals.mousePos.y, 15, 0, Math.PI * 2);
  // ctx.fill();
}

loop(0);
