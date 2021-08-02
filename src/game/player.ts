import * as assets from './assets.js';

export const player = new XWalker({
   anchor: { x: 0, y: 1 },
   size: { x: 20, y: 3 }
});

export function swapSprites (key: keyof typeof assets.player) {
   player.sprites = assets.player[key];
   player.face('down');
}
