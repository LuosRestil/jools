import Rect from "./Rect.js";

function loadSpriteRects(spriteMap: {[key: string]: {frame: Rect}}): Rect[] {
  return Object.entries(spriteMap).map(entry => entry[1].frame);
}

export default {
  loadSpriteData: loadSpriteRects
}
