import * as assets from './assets.js';
import { player } from './player.js';

type GameRooms = Exclude<Exclude<Parameters<typeof X.game>[0], void>['rooms'], void>;

function roomFactory (
   id: string,
   name: string,
   background: HTMLImageElement | ImageBitmap,
   { h = 0, w = 0, x = 0, y = 0 }: Partial<XKeyed<number, 'h' | 'w' | 'x' | 'y'>>,
   doors: XKeyed<{
      bounds: Partial<XKeyed<number, 'h' | 'w' | 'x' | 'y'>>;
      destination: string;
      direction: XCardinal;
      distance: number;
   }>,
   spawn: Partial<X2>,
   walls: Partial<XKeyed<number, 'h' | 'w' | 'x' | 'y'>>[],
   extra: Exclude<GameRooms[''], void>['layers']
) {
   const z = Math.max(background.height - 240, 0);
   spawns[id] = { x: spawn.x || 0, y: spawn.y || 0 };
   const room: Required<GameRooms['']> = {
      region: [ { x: x + 160, y: y + 120 }, { x: x + w + 160, y: y + h + 120 } ],
      layers: {
         background: [
            new XSprite({ textures: [ background ] }),
            ...walls.map(({ h = 0, w = 0, x = 0, y = 0 }) => {
               return new XHitbox({
                  metadata: { barrier: true },
                  position: { x, y: 240 - (y - z) },
                  size: { x: w, y: -h }
               });
            })
         ],
         foreground: [
            player,
            ...Object.entries(
               doors
            ).map(([ key, { bounds: { h = 0, w = 0, x = 0, y = 0 }, destination, direction, distance } ]) => {
               const destie = destinations[id] || (destinations[id] = {});
               destie[key] = {
                  direction,
                  position: {
                     x: { down: x + w / 2, left: x - distance, right: x + w + distance, up: x + w / 2 }[direction],
                     y:
                        240 -
                        ({ down: y - distance, left: y + h / 2, right: y + h / 2, up: y + h + distance }[direction] - z)
                  }
               };
               return new XHitbox({
                  metadata: { action: 'door', destination, key },
                  position: { x, y: 240 - (y - z) },
                  size: { x: w, y: -h }
               }).wrapOn('tick', self => {
                  return () => detector.fire('tick', self);
               });
            })
         ]
      }
   };
   for (const garbo in extra) (room.layers[garbo] || (room.layers[garbo] = [])).push(...(extra[garbo] || []));
   roomNames[id] = name;
   return room;
}

function savePoint (position: X2) {
   return new XHitbox({
      anchor: { x: 0, y: 0 },
      priority: -1,
      position,
      metadata: { action: 'save', interact: true },
      size: { x: 30, y: 30 },
      objects: [
         new XHitbox({
            size: { x: 20, y: 20 },
            anchor: { x: 0, y: 0 },
            metadata: { barrier: true }
         }),
         new XSprite({
            anchor: { x: 0, y: 0 },
            textures: assets.sprites.save,
            steps: 6
         }).enable()
      ]
   }).wrapOn('tick', host => {
      return () => detector.fire('tick', host);
   });
}

export const destinations = {} as XKeyed<XKeyed<{ direction: XCardinal; position: X2 }>>;
export const detector = new XHost<{ tick: [XHitbox] }>();
export const spawns = {} as XKeyed<X2>;
export const roomNames = {} as XKeyed<string>;

export const rooms: GameRooms = {
   castleRoad: roomFactory(
      'castleRoad',
      'New Home - Castle End',
      assets.backgrounds.castleRoad,
      { x: -2000, w: 2060 },
      {
         x: {
            bounds: { h: 10, w: 60, x: 120 },
            direction: 'up',
            distance: 10,
            destination: 'lastCorridor'
         }
      },
      { x: 160, y: 140 },
      [
         { y: 0, h: 40, w: 120 },
         { x: 180, y: 0, h: 40, w: 120 },
         { x: 300, y: 40, h: 40, w: 20 },
         { y: 80, h: 20, w: 300 }
      ],
      {
         background: [
            new XHitbox({
               size: { x: 20, y: -60 },
               position: { x: -800, y: 220 }
            }).wrapOn('tick', hitbox => {
               return () => {
                  // teleport to room start
               };
            })
         ]
      }
   ),
   lastCorridor: roomFactory(
      'lastCorridor',
      'Last Corridor',
      assets.backgrounds.lastCorridor,
      { w: 1000 },
      {
         x: {
            bounds: { h: 20, w: 40, x: 140, y: 121 },
            destination: 'castleRoad',
            direction: 'down',
            distance: 8
         },
         y: {
            bounds: { h: 20, w: 40, x: 1220, y: 121 },
            destination: 'castleHook',
            direction: 'down',
            distance: 8
         }
      },
      { x: 160, y: 130 },
      [
         { h: 20, w: 1200, x: 100, y: 20 },
         { h: 20, w: 40, x: 100, y: 120 },
         { h: 20, w: 1040, x: 180, y: 120 },
         { h: 20, w: 40, x: 1260, y: 120 },
         { h: 80, w: 20, x: 80, y: 40 },
         { h: 80, w: 20, x: 1300, y: 40 },
         { h: 20, w: 60, x: 240, y: 100 },
         { h: 20, w: 60, x: 360, y: 100 },
         { h: 20, w: 60, x: 480, y: 100 },
         { h: 20, w: 60, x: 600, y: 100 },
         { h: 20, w: 60, x: 720, y: 100 },
         { h: 20, w: 60, x: 840, y: 100 },
         { h: 20, w: 60, x: 960, y: 100 },
         { h: 20, w: 60, x: 1080, y: 100 }
      ],
      {
         foreground: [ savePoint({ x: 120, y: 120 }) ],
         overlay: [ 340, 230, 230, 230, 230, 230, 110, 120, 230, 230 ].map((x, index, array) => {
            let position = 0;
            for (const margin of array.slice(0, index + 1)) position += margin;
            return new XSprite({
               parallax: { x: -1 },
               position: { x: position },
               textures: [ assets.sprites.pillar ]
            });
         })
      }
   ),
   castleHook: roomFactory(
      'castleHook',
      'The Capitol - Main Hall',
      assets.backgrounds.castleHook,
      { x: 10, h: 300, w: 500 },
      {
         x: {
            bounds: { h: 20, w: 60, x: 360, y: 421 },
            destination: 'throneRoom',
            direction: 'down',
            distance: 8
         },
         y: {
            bounds: { h: 10, w: 60, x: 140 },
            destination: 'lastCorridor',
            direction: 'up',
            distance: 8
         },
         z: {
            bounds: { h: 10, w: 60, x: 640, y: 0 },
            destination: 'coffinStairs',
            direction: 'up',
            distance: 8
         }
      },
      { x: 390, y: 130 },
      [
         { h: 420, w: 20, x: 120, y: 0 },
         { h: 360, w: 20, x: 200, y: 0 },
         { h: 420, w: 20, x: 700, y: 0 },
         { h: 360, w: 20, x: 620, y: 0 },
         { h: 20, w: 400, x: 220, y: 340 },
         { h: 20, w: 220, x: 140, y: 420 },
         { h: 20, w: 280, x: 420, y: 420 }
      ],
      {
         foreground: [ savePoint({ x: 440, y: 120 }) ]
      }
   ),
   coffinStairs: roomFactory(
      'coffinStairs',
      'The Capitol - Annex',
      assets.backgrounds.coffinStairs,
      { x: -10, h: 300 },
      {
         x: {
            bounds: { h: 10, w: 60, x: 120 },
            destination: 'coffinRoom',
            direction: 'up',
            distance: 8
         },
         z: {
            bounds: { h: 10, w: 60, x: 120, y: 530 },
            destination: 'castleHook',
            direction: 'down',
            distance: 8
         }
      },
      { x: 160, y: 130 },
      [ { h: 540, w: 20, x: 100, y: 0 }, { h: 540, w: 20, x: 180, y: 0 } ]
   ),
   coffinRoom: roomFactory(
      'coffinRoom',
      'The Capitol - Storage',
      assets.backgrounds.coffinRoom,
      {},
      {
         x: {
            bounds: { h: 10, w: 40, x: 60, y: 101 },
            destination: 'coffinStairs',
            direction: 'down',
            distance: 8
         }
      },
      { x: 160, y: 130 },
      [
         { h: 60, w: 20, x: 0, y: 40 },
         { h: 20, w: 40, x: 20, y: 100 },
         { h: 20, w: 40, x: 100, y: 100 },
         { h: 60, w: 20, x: 140, y: 40 },
         { h: 20, w: 120, x: 20, y: 20 }
      ]
   )
};
