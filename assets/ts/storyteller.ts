type XBounds = { h: number; w: number; x: number; y: number };
type XEntityAttributes = { collidable: boolean; interactable: boolean; triggerable: boolean; visible: boolean };
type XEntityMetadata = { [$: string]: any };
type XLinkKeys = { u: XKey; l: XKey; d: XKey; r: XKey; x: XKey };
type XLinkSprites = { u: XSprite; l: XSprite; d: XSprite; r: XSprite };
type XLinkState = { locked: boolean };
type XPosition = { x: number; y: number };
type XRendererState = { scale: number };
type XRoomAttributes = { overworld: boolean };
type XSpriteAttributes = { persistent: boolean; single: boolean; sticky: boolean };
type XSpriteState = { active: boolean; index: number; step: number };

class XTexture {
   bounds: XBounds;
   image: HTMLImageElement;
   constructor (bounds: XBounds, source: string) {
      this.bounds = bounds;
      this.image = XTexture.image(source);
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
}

class XSprite {
   attributes: XSpriteAttributes;
   default: number;
   state: XSpriteState;
   steps: number;
   textures: XTexture[];
   constructor (
      attributes: XSpriteAttributes,
      $default: number,
      state: XSpriteState,
      steps: number,
      textures: XTexture[]
   ) {
      this.attributes = attributes;
      this.default = $default;
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
}

class XEntity {
   attributes: XEntityAttributes;
   bounds: XBounds;
   metadata: XEntityMetadata;
   position: XPosition;
   priority: number;
   sprite: XSprite | void;
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
      this.sprite = sprite;
   }
}

class XRoom {
   attributes: XRoomAttributes;
   background: Set<XEntity>;
   bounds: XBounds;
   foreground: Set<XEntity>;
   player: XEntity;
   constructor (
      attributes: XRoomAttributes,
      background: XEntity[],
      bounds: XBounds,
      foreground: XEntity[],
      player: XEntity
   ) {
      this.attributes = attributes;
      this.background = new Set(background);
      this.bounds = bounds;
      this.foreground = new Set(foreground);
      this.player = player;
   }
}

class XRenderer {
   canvas: HTMLCanvasElement;
   context?: CanvasRenderingContext2D;
   state = { scale: 0 };
   constructor (canvas: HTMLCanvasElement) {
      this.canvas = canvas;
   }
   render (entities: XEntity[], position: XPosition, debug?: boolean) {
      if (this.context) {
         this.context.resetTransform();
         this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
         this.context.setTransform(
            this.state.scale,
            0,
            0,
            this.state.scale,
            (position.x * -1 + 160) * this.state.scale,
            (position.y + 120) * this.state.scale
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
            const collisions = [ ...entities.filter(entity => entity.attributes.collidable) ];
            for (const entity of collisions) {
               this.context.strokeStyle = '#ffffff30';
               const bounds = X.bounds(entity);
               for (const other of collisions) {
                  if (other !== entity && X.intersection(bounds, other).size > 0) {
                     this.context.strokeStyle = '#ff0000ff';
                     break;
                  }
               }
               this.context.strokeRect(bounds.x, bounds.y * -1 - bounds.h, bounds.w, bounds.h);
               this.context.closePath();
            }
            const triggers = [ ...entities.filter(entity => entity.attributes.triggerable) ];
            for (const entity of triggers) {
               this.context.strokeStyle = '#ffffff30';
               const bounds = X.bounds(entity);
               for (const other of triggers) {
                  if (other !== entity && X.intersection(bounds, other).size > 0) {
                     this.context.strokeStyle = '#00ff00ff';
                     break;
                  }
               }
               this.context.strokeRect(bounds.x, bounds.y * -1 - bounds.h, bounds.w, bounds.h);
               this.context.closePath();
            }
         }
      }
   }
   resize (height: number = innerHeight, width: number = innerWidth) {
      if (width / height > 4 / 3) {
         this.canvas.width = height * (4 / 3);
         this.canvas.height = height;
         this.state.scale = height / 240;
      } else {
         this.canvas.width = width;
         this.canvas.height = width / (4 / 3);
         this.state.scale = width / 320;
      }
      const context = this.canvas.getContext('2d');
      if (context) {
         this.context = context;
         this.context.imageSmoothingEnabled = false;
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
            this.fire('down');
            this.states.add(event.key);
         }
      });
      addEventListener('keyup', event => {
         if (this.keys.has(event.key) && this.states.has(event.key)) {
            this.fire('up');
            this.states.delete(event.key);
         }
      });
      addEventListener('keypress', event => {
         this.keys.has(event.key) && this.fire('press');
      });
   }
}

class XLink extends XHost {
   background: XRenderer;
   foreground: XRenderer;
   keys: XLinkKeys;
   room?: XRoom;
   sprites: XLinkSprites;
   state: XLinkState;
   stride: number;
   constructor (
      background: XRenderer,
      foreground: XRenderer,
      keys: XLinkKeys,
      sprites: XLinkSprites,
      state: XLinkState,
      stride: number
   ) {
      super();
      this.background = background;
      this.foreground = foreground;
      this.keys = keys;
      this.sprites = sprites;
      this.state = state;
      this.stride = stride;
      this.keys.u.on('down', { priority: 0, script: () => this.state.locked || this.sprites.u.enable() });
      this.keys.l.on('down', { priority: 0, script: () => this.state.locked || this.sprites.l.enable() });
      this.keys.d.on('down', { priority: 0, script: () => this.state.locked || this.sprites.d.enable() });
      this.keys.r.on('down', { priority: 0, script: () => this.state.locked || this.sprites.r.enable() });
      this.keys.u.on('up', { priority: 0, script: () => this.state.locked || this.sprites.u.disable() });
      this.keys.l.on('up', { priority: 0, script: () => this.state.locked || this.sprites.l.disable() });
      this.keys.d.on('up', { priority: 0, script: () => this.state.locked || this.sprites.d.disable() });
      this.keys.r.on('up', { priority: 0, script: () => this.state.locked || this.sprites.r.disable() });
   }
   get locked () {
      return this.state.locked;
   }
   set locked (value) {
      this.state.locked = value;
      if (this.state.locked) {
         this.sprites.u.disable();
         this.sprites.l.disable();
         this.sprites.d.disable();
         this.sprites.r.disable();
      } else {
         this.keys.u.active && this.sprites.u.enable();
         this.keys.l.active && this.sprites.l.enable();
         this.keys.d.active && this.sprites.d.enable();
         this.keys.r.active && this.sprites.r.enable();
      }
   }
   render (debug?: boolean) {
      if (this.room) {
         const collisions: Set<XEntity> = new Set();
         const triggers: Set<XEntity> = new Set();
         const interactions: Set<XEntity> = new Set();
         if (!this.state.locked) {
            const origin = Object.assign({}, this.room.player.position);
            if (this.keys.l.active) {
               this.room.player.position.x -= 3;
               this.room.player.sprite = this.sprites.l;
            } else if (this.keys.r.active) {
               this.room.player.position.x += 3;
               this.room.player.sprite = this.sprites.r;
            }
            if (this.keys.u.active) {
               this.room.player.position.y += 3;
               this.room.player.sprite = this.sprites.u;
            } else if (this.keys.d.active) {
               this.room.player.position.y -= 3;
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
                     while (index++ < 3) {
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
                     while (index++ < 3) {
                        this.room.player.position.y += increment;
                        if (X.intersection(X.bounds(this.room.player), ...collisions).size > 0) {
                           this.room.player.position.y -= increment;
                           /* THE FRISK DANCE CODE!! */
                           if (this.keys.u.active && this.keys.d.active) {
                              this.room.player.sprite = this.sprites.d;
                              this.room.player.position.y -= this.stride;
                           }
                           break;
                        }
                     }
                  }
               }
            }
         }
         // TODO: only render when update needed
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
         for (const collision of collisions) this.fire('collide', collision);
         for (const trigger of triggers) this.fire('trigger', trigger);
         for (const interaction of interactions) this.fire('interact', interaction);
      }
   }
   resize (height?: number, width?: number) {
      this.background.resize(height, width);
      this.foreground.resize(height, width);
   }
}

const X: {
   assets: Set<Promise<void>>;
   bounds(entity: XEntity): XBounds;
   intersection(bounds: XBounds, ...entities: XEntity[]): Set<XEntity>;
} = {
   assets: new Set(),
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
