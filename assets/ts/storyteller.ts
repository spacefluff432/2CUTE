//
//
//    #########   #########   #########   #########
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   #########   #######
//    ##          ##     ##   ##  ###     ##
//    ##          ##     ##   ##   ###    ##
//    #########   #########   ##    ###   #########
//
////////////////////////////////////////////////////////////////////////////////////////////////////

type XBounds = { h: number; w: number; x: number; y: number };
type XEntityAttributes = { collidable: boolean; interactable: boolean; triggerable: boolean; visible: boolean };
type XEntityMetadata = { [$: string]: any };
type XPosition = { x: number; y: number };
type XRendererState = { scale: number };
type XRoomAttributes = { overworld: boolean };
type XSpriteAttributes = { persistent: boolean; single: boolean; sticky: boolean };
type XSpriteState = { active: boolean; index: number; step: number };

class XEntity {
   attributes: XEntityAttributes;
   bounds: XBounds;
   metadata: XEntityMetadata;
   position: XPosition;
   priority: number;
   sprite?: XSprite;
   constructor (
      attributes: XEntityAttributes,
      bounds: XBounds,
      metadata: XEntityMetadata,
      position: XPosition,
      priority: number,
      sprite?: XSprite
   ) {
      this.attributes = attributes;
      this.bounds = bounds;
      this.metadata = metadata;
      this.position = position;
      this.priority = priority;
      sprite && (this.sprite = sprite);
   }
   clone () {
      return new XEntity(
         Object.assign({}, this.attributes),
         Object.assign({}, this.bounds),
         Object.assign({}, this.metadata),
         Object.assign({}, this.position),
         this.priority,
         this.sprite && this.sprite.clone()
      );
   }
   static of (
      {
         attributes: { collidable = false, interactable = false, triggerable = false, visible = false } = {
            collidable: false,
            interactable: false,
            triggerable: false,
            visible: false
         },
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         metadata = {},
         position: { x: x2 = 0, y: y2 = 0 } = {},
         priority = 0,
         sprite
      }: {
         attributes?: { collidable?: boolean; interactable?: boolean; triggerable?: boolean; visible?: boolean };
         bounds?: { h?: number; w?: number; x?: number; y?: number };
         metadata?: XEntityMetadata;
         position?: { x?: number; y?: number };
         priority?: number;
         sprite?: XSprite;
      } = {}
   ) {
      return new XEntity(
         { collidable, interactable, triggerable, visible },
         { h, w, x: x1, y: y1 },
         metadata,
         { x: x2, y: y2 },
         priority,
         sprite
      );
   }
}

class XHost {
   events: Map<string, Set<XListener<this>>> = new Map();
   on (name: string, listener: XListener<this>) {
      this.events.has(name) || this.events.set(name, new Set());
      this.events.get(name)!.add(listener);
   }
   off (name: string, listener: XListener<this>) {
      this.events.has(name) && this.events.get(name)!.delete(listener);
   }
   fire (name: string, ...data: any[]) {
      if (this.events.has(name)) {
         return [ ...this.events.get(name)! ]
            .sort((a, b) => {
               return a.priority - b.priority;
            })
            .map(listener => {
               return listener.script.call(this, ...data);
            });
      } else {
         return [];
      }
   }
}

class XListener<X> {
   script: (this: X, ...data: any[]) => any;
   priority: number;
   constructor (script: (this: X, ...data: any[]) => any, priority: number = 0) {
      this.script = script;
      this.priority = priority;
   }
}

class XRenderer {
   canvas: HTMLCanvasElement;
   context: CanvasRenderingContext2D;
   size: XPosition;
   state = { scale: 1 };
   constructor (canvas: HTMLCanvasElement, size: XPosition) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d')!;
      this.size = size;
   }
   render (entities: XEntity[], position: XPosition, debug?: boolean) {
      this.context.resetTransform();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.setTransform(
         this.state.scale,
         0,
         0,
         this.state.scale,
         (position.x * -1 + this.size.x / 2) * this.state.scale,
         (position.y + this.size.y / 2) * this.state.scale
      );
      for (const entity of entities.sort((a, b) => a.priority - b.priority)) {
         if (entity.attributes.visible && entity.sprite) {
            const texture = entity.sprite.compute();
            if (texture) {
               const width = isFinite(texture.bounds.w) ? texture.bounds.w : texture.image.width;
               const height = isFinite(texture.bounds.h) ? texture.bounds.h : texture.image.height;
               this.context.drawImage(
                  texture.image,
                  texture.bounds.x,
                  texture.bounds.y,
                  width,
                  height,
                  entity.position.x,
                  entity.position.y * -1 - height,
                  width,
                  height
               );
            }
         }
      }
      if (debug) {
         const collidables = [ ...entities.filter(entity => entity.attributes.collidable) ];
         for (const entity of collidables) {
            this.context.strokeStyle = '#ffffff30';
            const bounds = X.bounds(entity);
            for (const other of collidables) {
               if (other !== entity && X.intersection(bounds, other).size > 0) {
                  this.context.strokeStyle = '#ff0000ff';
                  break;
               }
            }
            this.context.strokeRect(bounds.x, bounds.y * -1 - bounds.h, bounds.w, bounds.h);
            this.context.closePath();
         }
         const triggerables = [ ...entities.filter(entity => entity.attributes.triggerable) ];
         for (const entity of triggerables) {
            this.context.strokeStyle = '#ffffff30';
            const bounds = X.bounds(entity);
            for (const other of triggerables) {
               if (other !== entity && X.intersection(bounds, other).size > 0) {
                  this.context.strokeStyle = '#00ff00ff';
                  break;
               }
            }
            this.context.strokeRect(bounds.x, bounds.y * -1 - bounds.h, bounds.w, bounds.h);
            this.context.closePath();
         }
         const interactables = [ ...entities.filter(entity => entity.attributes.interactable) ];
         for (const entity of interactables) {
            this.context.strokeStyle = '#ffffff30';
            const bounds = X.bounds(entity);
            for (const other of interactables) {
               if (other !== entity && X.intersection(bounds, other).size > 0) {
                  this.context.strokeStyle = '#0000ffff';
                  break;
               }
            }
            this.context.strokeRect(bounds.x, bounds.y * -1 - bounds.h, bounds.w, bounds.h);
            this.context.closePath();
         }
      }
   }
   rescale (height: number, width: number) {
      const ratio = this.size.x / this.size.y;
      if (width / height > ratio) {
         this.canvas.width = height * ratio;
         this.canvas.height = height;
         this.state.scale = height / this.size.y;
      } else {
         this.canvas.width = width;
         this.canvas.height = width / ratio;
         this.state.scale = width / this.size.x;
      }
      const context = this.canvas.getContext('2d');
      if (context) {
         this.context = context;
         this.context.imageSmoothingEnabled = false;
      }
   }
   static of (
      {
         canvas = document.createElement('canvas'),
         size: { x = 1000, y = 1000 } = {}
      }: {
         canvas?: HTMLCanvasElement;
         size?: { x?: number; y?: number };
      } = {}
   ) {
      return new XRenderer(canvas, { x, y });
   }
}

class XRoom {
   background: Set<XEntity>;
   bounds: XBounds;
   foreground: Set<XEntity>;
   player: XEntity;
   constructor (background: XEntity[], bounds: XBounds, foreground: XEntity[], player: XEntity) {
      this.background = new Set(background);
      this.bounds = bounds;
      this.foreground = new Set(foreground);
      this.player = player;
   }
   clone () {
      return new XRoom(
         [ ...this.background ].map(entity => entity.clone()),
         Object.assign({}, this.bounds),
         [ ...this.foreground ].map(entity => entity.clone()),
         this.player.clone()
      );
   }
   static of (
      {
         background = [],
         bounds: { h = 0, w = 0, x = 0, y = 0 } = {},
         foreground = [],
         player = XEntity.of()
      }: {
         background?: XEntity[];
         bounds?: { h?: number; w?: number; x?: number; y?: number };
         foreground?: XEntity[];
         player?: XEntity;
      } = {}
   ) {
      return new XRoom(background, { h, w, x, y }, foreground, player);
   }
}

class XSprite {
   attributes: XSpriteAttributes;
   default: number;
   rotation: number;
   scale: number;
   state: XSpriteState;
   steps: number;
   textures: XTexture[];
   constructor (
      attributes: XSpriteAttributes,
      $default: number,
      rotation: number,
      scale: number,
      state: XSpriteState,
      steps: number,
      textures: XTexture[]
   ) {
      this.attributes = attributes;
      this.default = $default;
      this.rotation = rotation;
      this.scale = scale;
      this.state = state;
      this.steps = steps;
      this.textures = textures;
   }
   compute () {
      if (this.state.active || this.attributes.persistent) {
         const texture = this.textures[this.state.index];
         if (this.state.active && ++this.state.step >= this.steps) {
            this.state.step = 0;
            if (++this.state.index >= this.textures.length) {
               this.state.index = 0;
            }
         }
         return texture;
      }
   }
   disable () {
      if (this.state.active) {
         this.attributes.sticky || ((this.state.step = 0), (this.state.index = this.default));
         this.state.active = false;
      }
   }
   enable () {
      if (!this.state.active) {
         this.attributes.sticky || ((this.state.step = 0), (this.state.index = this.default));
         this.state.active = true;
      }
   }
   clone () {
      return new XSprite(
         Object.assign({}, this.attributes),
         this.default,
         this.rotation,
         this.scale,
         Object.assign({}, this.state),
         this.steps,
         this.textures.map(texture => texture.clone())
      );
   }
   static of (
      {
         attributes: { persistent = false, single = false, sticky = false } = {
            persistent: false,
            single: false,
            sticky: false
         },
         default: $default = 0,
         rotation = 0,
         scale = 1,
         state: { active = false, index = 0, step = 0 } = {
            active: false,
            index: 0,
            step: 0
         },
         steps = 1,
         textures = []
      }: {
         attributes?: { persistent?: boolean; single?: boolean; sticky?: boolean };
         default?: number;
         rotation?: number;
         scale?: number;
         state?: { active?: boolean; index?: number; step?: number };
         steps?: number;
         textures?: XTexture[];
      } = {}
   ) {
      return new XSprite(
         { persistent, single, sticky },
         $default,
         rotation,
         scale,
         { active, index, step },
         steps,
         textures
      );
   }
}

class XTexture {
   bounds: XBounds;
   image: HTMLImageElement;
   constructor (bounds: XBounds, source: string) {
      this.bounds = bounds;
      this.image = XTexture.image(source);
   }
   clone () {
      return new XTexture(Object.assign({}, this.bounds), this.image.src);
   }
   static cache: Map<string, HTMLImageElement> = new Map();
   static image (source: string) {
      const image = XTexture.cache.get(source) || Object.assign(new Image(), { src: source });
      if (!XTexture.cache.has(source)) {
         XTexture.cache.set(source, image);
         X.assets.add(
            new Promise((resolve, reject) => {
               image.addEventListener('load', () => {
                  resolve();
               });
               image.addEventListener('error', () => {
                  reject();
               });
            })
         );
      }
      return image;
   }
   static of (
      {
         bounds = { h: Infinity, w: Infinity, x: 0, y: 0 },
         source = 'data:image/gif;base64,R0lGODlhAAAAAAAAACwAAAAAAAAAADs='
      }: { bounds?: XBounds; source?: string } = {}
   ) {
      return new XTexture(bounds, source);
   }
}

//
//
//    ##     ##   #########   #########   ##          ########
//    ##     ##   ##     ##   ##     ##   ##          ##    ###
//    ##     ##   ##     ##   ##     ##   ##          ##     ##
//    ##     ##   ##     ##   #########   ##          ##     ##
//    ##  #  ##   ##     ##   ##  ###     ##          ##     ##
//    ## ### ##   ##     ##   ##   ###    ##          ##    ###
//    #########   #########   ##    ###   #########   ########
//
////////////////////////////////////////////////////////////////////////////////////////////////////

type XOverworldKeys = { u: XKey; l: XKey; d: XKey; r: XKey; z: XKey; x: XKey; c: XKey };
type XOverworldSprites = { u: XSprite; l: XSprite; d: XSprite; r: XSprite };
type XOverworldState = { detection: boolean; movement: boolean };

class XKey extends XHost {
   keys: Set<string>;
   states: Set<string> = new Set();
   get active () {
      return this.states.size > 0;
   }
   constructor (...keys: string[]) {
      super();
      this.keys = new Set(keys);
      addEventListener('keydown', event => {
         if (this.keys.has(event.key) && !this.states.has(event.key)) {
            this.states.add(event.key);
            this.fire('down');
         }
      });
      addEventListener('keyup', event => {
         if (this.keys.has(event.key) && this.states.has(event.key)) {
            this.states.delete(event.key);
            this.fire('up');
         }
      });
      addEventListener('keypress', event => {
         this.keys.has(event.key) && this.fire('press');
      });
   }
}

class XOverworld extends XHost {
   background: XRenderer;
   foreground: XRenderer;
   keys: XOverworldKeys;
   room: XRoom;
   speed: number;
   sprites: XOverworldSprites;
   state: XOverworldState;
   get detection () {
      return this.state.detection;
   }
   set detection (value) {
      this.state.detection = value;
   }
   get movement () {
      return this.state.movement;
   }
   set movement (value) {
      this.state.movement = value;
      if (this.state.movement) {
         this.keys.u.active && this.sprites.u.enable();
         this.keys.l.active && this.sprites.l.enable();
         this.keys.d.active && this.sprites.d.enable();
         this.keys.r.active && this.sprites.r.enable();
      } else {
         this.sprites.u.disable();
         this.sprites.l.disable();
         this.sprites.d.disable();
         this.sprites.r.disable();
      }
   }
   constructor (
      background: XRenderer,
      foreground: XRenderer,
      keys: XOverworldKeys,
      room: XRoom,
      speed: number,
      sprites: XOverworldSprites,
      state: XOverworldState
   ) {
      super();
      this.background = background;
      this.foreground = foreground;
      this.keys = keys;
      this.room = room;
      this.speed = speed;
      this.sprites = sprites;
      this.state = state;
      this.keys.u.on('down', { priority: 0, script: () => this.state.movement && this.sprites.u.enable() });
      this.keys.l.on('down', { priority: 0, script: () => this.state.movement && this.sprites.l.enable() });
      this.keys.d.on('down', { priority: 0, script: () => this.state.movement && this.sprites.d.enable() });
      this.keys.r.on('down', { priority: 0, script: () => this.state.movement && this.sprites.r.enable() });
      this.keys.u.on('up', { priority: 0, script: () => this.state.movement && this.sprites.u.disable() });
      this.keys.l.on('up', { priority: 0, script: () => this.state.movement && this.sprites.l.disable() });
      this.keys.d.on('up', { priority: 0, script: () => this.state.movement && this.sprites.d.disable() });
      this.keys.r.on('up', { priority: 0, script: () => this.state.movement && this.sprites.r.disable() });
   }
   static of (
      {
         background = XRenderer.of(),
         foreground = XRenderer.of(),
         keys: {
            u: u1 = new XKey(),
            l: l1 = new XKey(),
            d: d1 = new XKey(),
            r: r1 = new XKey(),
            z = new XKey(),
            x = new XKey(),
            c = new XKey()
         } = {},
         room = XRoom.of(),
         speed = 1,
         sprites: { u: u2 = XSprite.of(), l: l2 = XSprite.of(), d: d2 = XSprite.of(), r: r2 = XSprite.of() } = {},
         state: { detection = true, movement = true } = {}
      }: {
         background?: XRenderer;
         foreground?: XRenderer;
         keys?: { u?: XKey; l?: XKey; d?: XKey; r?: XKey; z?: XKey; x?: XKey; c?: XKey };
         room?: XRoom;
         speed?: number;
         sprites?: { u?: XSprite; l?: XSprite; d?: XSprite; r?: XSprite };
         state?: { detection?: boolean; movement?: boolean };
      } = {}
   ) {
      return new XOverworld(
         background,
         foreground,
         { u: u1, l: l1, d: d1, r: r1, z, x, c },
         room,
         speed,
         { u: u2, l: l2, d: d2, r: r2 },
         { detection, movement }
      );
   }
   render (debug?: boolean) {
      const collisions: Set<XEntity> = new Set();
      const triggers: Set<XEntity> = new Set();
      const interactions: Set<XEntity> = new Set();
      if (this.movement) {
         const origin = Object.assign({}, this.room.player.position);
         if (this.keys.l.active) {
            this.room.player.position.x -= this.speed;
            this.room.player.sprite = this.sprites.l;
         } else if (this.keys.r.active) {
            this.room.player.position.x += this.speed;
            this.room.player.sprite = this.sprites.r;
         }
         if (this.keys.u.active) {
            this.room.player.position.y += this.speed;
            this.room.player.sprite = this.sprites.u;
         } else if (this.keys.d.active) {
            this.room.player.position.y -= this.speed;
            this.room.player.sprite = this.sprites.d;
         }
         if (
            this.keys.r.active ||
            this.keys.l.active ||
            this.keys.u.active ||
            this.keys.d.active ||
            this.keys.x.active
         ) {
            const intersections = X.intersection(X.bounds(this.room.player), ...this.room.foreground);
            if (intersections.size > 0) {
               for (const intersection of intersections) {
                  if (intersection.attributes.collidable) {
                     collisions.add(intersection);
                  }
                  if (intersection.attributes.triggerable) {
                     triggers.add(intersection);
                  }
                  if (this.keys.x.active && intersection.attributes.interactable) {
                     interactions.add(intersection);
                  }
               }
               this.room.player.position = origin;
               if (this.keys.r.active || this.keys.l.active) {
                  let index = 0;
                  const increment = this.keys.r.active ? 1 : -1;
                  while (index++ < this.speed) {
                     this.room.player.position.x += increment;
                     if (X.intersection(X.bounds(this.room.player), ...collisions).size > 0) {
                        this.room.player.position.x -= increment;
                        break;
                     }
                  }
               }
               if (this.keys.u.active || this.keys.d.active) {
                  let index = 0;
                  const increment = this.keys.u.active ? 1 : -1;
                  while (index++ < this.speed) {
                     this.room.player.position.y += increment;
                     if (X.intersection(X.bounds(this.room.player), ...collisions).size > 0) {
                        this.room.player.position.y -= increment;
                        /* THE FRISK DANCE CODE!! */
                        if (this.keys.u.active && this.keys.d.active) {
                           this.room.player.sprite = this.sprites.d;
                           this.room.player.position.y -= this.speed;
                        }
                        break;
                     }
                  }
               }
            }
         }
      }
      // TODO: only render background on context refresh
      this.background.render(
         [ this.room.player, ...this.room.background ],
         {
            x: this.room.player.position.x,
            y: this.room.player.position.y
         },
         debug
      );
      this.foreground.render(
         [ this.room.player, ...this.room.foreground ],
         {
            x: this.room.player.position.x,
            y: this.room.player.position.y
         },
         debug
      );
      if (this.detection) {
         for (const collision of collisions) this.fire('collide', collision);
         for (const trigger of triggers) this.fire('trigger', trigger);
         for (const interaction of interactions) this.fire('interact', interaction);
      }
   }
   rescale (height: number, width: number) {
      this.background.rescale(height, width);
      this.foreground.rescale(height, width);
   }
}

const X = (() => {
   const assets: Set<Promise<void>> = new Set();
   return {
      assets,
      bounds (entity: XEntity) {
         return {
            x: entity.position.x + entity.bounds.x + Math.min(entity.bounds.w, 0),
            y: entity.position.y + entity.bounds.y + Math.min(entity.bounds.h, 0),
            w: Math.abs(entity.bounds.w),
            h: Math.abs(entity.bounds.h)
         };
      },
      intersection ({ x = 0, y = 0, h = 0, w = 0 }: XBounds, ...entities: XEntity[]) {
         const list: Set<XEntity> = new Set();
         for (const entity of entities) {
            const bounds = X.bounds(entity);
            if (x < bounds.x + bounds.w && x + w > bounds.x && y < bounds.y + bounds.h && y + h > bounds.y) {
               list.add(entity);
            }
         }
         return list;
      }
   };
})();
