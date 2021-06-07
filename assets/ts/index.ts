declare const canvas1: HTMLCanvasElement;
declare const canvas2: HTMLCanvasElement;

/* TEXTURES */

const playerU1Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharau_0.png'
);

const playerU2Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharau_1.png'
);

const playerU3Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharau_2.png'
);

const playerU4Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharau_3.png'
);

const playerL1Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharal_0.png'
);

const playerL2Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharal_1.png'
);

const playerD1Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharad_0.png'
);

const playerD2Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharad_1.png'
);

const playerD3Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharad_2.png'
);

const playerD4Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharad_3.png'
);

const playerR1Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharar_0.png'
);

const playerR2Texture = new XTexture(
   { h: Infinity, w: Infinity, x: 0, y: 0 },
   'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_maincharar_1.png'
);

/* SPRITES */

const playerSprite = new XSprite(
   { persistent: true, single: false, sticky: false },
   1,
   {
      active: false,
      index: 1,
      step: 0
   },
   10,
   [ playerD1Texture, playerD2Texture, playerD3Texture, playerD4Texture ]
);

/* ENTITIES */

const playerEntity = new XEntity(
   { visible: true, collidable: true, interactable: false, triggerable: false },
   { h: 5, w: 20, x: 0, y: 0 },
   {},
   { x: 150, y: 0 },
   0,
   playerSprite
);

/* ROOMS */

const throneRoomRoom = new XRoom(
   { overworld: true },
   [
      new XEntity(
         { visible: true, collidable: false, interactable: false, triggerable: false },
         { h: 0, w: 0, x: 0, y: 0 },
         {},
         { x: 0, y: 0 },
         0,
         new XSprite(
            { persistent: true, single: false, sticky: false },
            0,
            {
               active: false,
               index: 0,
               step: 0
            },
            1,
            [ new XTexture({ h: Infinity, w: Infinity, x: 0, y: 0 }, 'assets/game/backgrounds/throne-room.png') ]
         )
      )
   ],
   { h: 0, w: 0, x: 0, y: 0 },
   [
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 40, x: 0, y: 0 },
         {},
         { x: 140, y: -20 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 60, w: 20, x: 0, y: 0 },
         {},
         { x: 120, y: 0 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 60, w: 20, x: 0, y: 0 },
         {},
         { x: 180, y: 0 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 40, x: 0, y: 0 },
         {},
         { x: 100, y: 60 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 40, x: 0, y: 0 },
         {},
         { x: 60, y: 80 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 40, x: 0, y: 0 },
         {},
         { x: 180, y: 60 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 40, x: 0, y: 0 },
         {},
         { x: 220, y: 80 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 20, x: 0, y: 0 },
         {},
         { x: 40, y: 100 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 320, w: 20, x: 0, y: 0 },
         {},
         { x: 20, y: 120 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 320, w: 20, x: 0, y: 0 },
         {},
         { x: 280, y: 120 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 20, x: 0, y: 0 },
         {},
         { x: 260, y: 100 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 40, w: 20, x: 0, y: 0 },
         {},
         { x: 40, y: 440 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 40, w: 20, x: 0, y: 0 },
         {},
         { x: 260, y: 440 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 20, x: 0, y: 0 },
         {},
         { x: 60, y: 480 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 20, w: 120, x: 0, y: 0 },
         {},
         { x: 140, y: 480 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 45, w: 70, x: 0, y: 0 },
         {},
         { x: 210, y: 120 },
         0
      ),
      new XEntity(
         { visible: false, collidable: true, interactable: false, triggerable: false },
         { h: 65, w: 40, x: 0, y: 0 },
         {},
         { x: 140, y: 360 },
         0
      ),
      new XEntity(
         { visible: true, collidable: false, interactable: false, triggerable: false },
         { h: 0, w: 0, x: 0, y: 0 },
         {},
         { x: 0, y: 0 },
         10,
         new XSprite(
            { persistent: true, single: false, sticky: false },
            0,
            {
               active: false,
               index: 0,
               step: 0
            },
            1,
            [
               new XTexture({ h: Infinity, w: Infinity, x: 0, y: 0 }, 'assets/game/backgrounds/throne-room-overlay.png')
            ]
         )
      )
   ],
   playerEntity
);

/* LINK */

const link = new XLink(
   new XRenderer(canvas1),
   new XRenderer(canvas2),
   {
      u: new XKey('ArrowUp', 'w', 'W'),
      l: new XKey('ArrowLeft', 'a', 'A'),
      d: new XKey('ArrowDown', 's', 's'),
      r: new XKey('ArrowRight', 'd', 'D'),
      x: new XKey('Enter', 'z', 'Z')
   },
   {
      u: new XSprite(
         { persistent: true, single: false, sticky: false },
         1,
         {
            active: false,
            index: 1,
            step: 0
         },
         10,
         [ playerU1Texture, playerU2Texture, playerU3Texture, playerU4Texture ]
      ),
      l: new XSprite(
         { persistent: true, single: false, sticky: false },
         1,
         {
            active: false,
            index: 1,
            step: 0
         },
         10,
         [ playerL1Texture, playerL2Texture ]
      ),
      d: playerSprite,
      r: new XSprite(
         { persistent: true, single: false, sticky: false },
         1,
         {
            active: false,
            index: 1,
            step: 0
         },
         10,
         [ playerR1Texture, playerR2Texture ]
      )
   },
   3
);

link.room = throneRoomRoom;
link.resize();
addEventListener('resize', () => {
   link.resize();
});

/* RUNTIME */

Promise.all(X.assets).then(() => {
   setInterval(() => link.render(true), 1000 / 30);
});
