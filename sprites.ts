import { Sprite } from "./Sprite.js";
import { WithName } from "./WithName.js";

export function loadSprites(spriteMap: { [key: string]: Sprite }): WithName<Sprite>[] {
  return Object.entries(spriteMap)
    .map((elem) => {
      let { x, y, width, height } = elem[1];
      return { x, y, width, height, name: elem[0] };
    })
    .filter((sprite) => sprite.name.includes("polygon"));
}
