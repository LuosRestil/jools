import Vec2 from "./Vec2.js";

const RESOLUTION = {w: 1080, h: 1920};
let debug: string | null = null;
let mousePos = new Vec2(0, 0);

export default {
  RESOLUTION,
  debug: debug as string | null,
  mousePos
}