import Sprite from "./Sprite.js";

function loadSprites(spriteMap: {
  [key: string]: { frame: Omit<Sprite, "name"> };
}): Sprite[] {
  return Object.entries(spriteMap).map((elem) => {
    let { x, y, w, h } = elem[1].frame;
    return { x, y, w, h, name: elem[0] };
  });
}

export default {
  loadSprites
}
