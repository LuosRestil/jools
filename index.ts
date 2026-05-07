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
if (spriteMap === null) {
  throw Error("oh god, oh fuck");
}

let loading = true;

const sprites = new Image();
sprites.src = "./public/spritesheet_double.png";
sprites.addEventListener("load", () => {
  loading = false;
});

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

  const gdg = spriteMap["element_green_diamond_glossy"];
  ctx.drawImage(
    sprites,
    gdg.x,
    gdg.y,
    gdg.width,
    gdg.height,
    WIDTH / 2 - gdg.width / 2,
    HEIGHT / 2 - gdg.height / 2,
    gdg.width,
    gdg.height,
  );
  const gd = spriteMap["element_green_diamond"];
  const ypos = HEIGHT / 2 - gd.height / 2 + gd.height;
  console.log(ypos);
  ctx.drawImage(
    sprites,
    gd.x,
    gd.y,
    gd.width,
    gd.height,
    WIDTH / 2 - gd.width / 2,
    ypos,
    gd.width,
    gd.height,
  );
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
