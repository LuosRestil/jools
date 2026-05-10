import { Sprite } from "./Sprite.js";

export class Grid {
  spriteOptions: Sprite[];
  sprites: Sprite[][];

  constructor(spriteOptions: Sprite[]) {
    this.spriteOptions = spriteOptions;
    this.sprites = [];
    for (let i = 0; i < 8; i++) {
      let row = [];
      for (let j = 0; j < 8; j++) {
        row.push(spriteOptions[Math.ceil(Math.random() * spriteOptions.length) - 1]);
      }
      this.sprites.push(row);
    }
  }
}
