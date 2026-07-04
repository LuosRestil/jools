import Vec2 from "./Vec2.js";

const RESOLUTION = {w: 1920, h: 1080};
let debug: string | null = null;
let mousePos = new Vec2(0, 0);

export default {
  RESOLUTION,
  debug,
  mousePos
}