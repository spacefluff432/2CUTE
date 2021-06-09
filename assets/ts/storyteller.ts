//
//    #########   #########   #########   #########
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   #########   #######
//    ##          ##     ##   ##  ###     ##
//    ##          ##     ##   ##   ###    ##
//    #########   #########   ##    ###   #########
//
///// needs more optimizating //////////////////////////////////////////////////////////////////////

type XBounds = { h: number; w: number; x: number; y: number };
type XDialogueState = { active: boolean; speaker: string; text: string };
type XEntityAttributes = { backdrop: boolean; collide: boolean; interact: boolean; trigger: boolean; see: boolean };
type XItemStyle = { content: XOptional<CSSStyleDeclaration>; item: XOptional<CSSStyleDeclaration> };
type XKeyed<X> = { [k: string]: X };
type XListener = ((...data: any[]) => any) | { priority: number; script: (...data: any[]) => any };
type XOptional<X> = { [k in keyof X]?: X[k] };
type XOverworldKeys = { u: XKey; l: XKey; d: XKey; r: XKey; z: XKey; x: XKey; c: XKey };
type XOverworldSprites = { u: XSprite; l: XSprite; d: XSprite; r: XSprite };
type XOverworldState = { detect: boolean; interact: boolean; move: boolean };
type XPosition = { x: number; y: number };
type XRendererState = { scale: number };
type XSpeakerState = { sprite: string; voice: string };
type XSpriteAttributes = { persist: boolean; hold: boolean };
type XSpriteState = { active: boolean; index: number; step: number };

const XCore = (() => {
   const storage: Set<Promise<void>> = new Set();
   return {
      storage,
      add (promise: Promise<void>) {
         XCore.storage.add(promise);
      },
      ready (script: () => void) {
         Promise.all(XCore.storage).then(script);
      }
   };
})();

class XEntity {
   attributes: XEntityAttributes;
   bounds: XBounds;
   depth: number;
   metadata: XKeyed<any>;
   position: XPosition;
   sprite: XSprite | void;
   constructor (
      {
         attributes: { backdrop = false, collide = false, interact = false, trigger = false, see = false } = {
            backdrop: false,
            collide: false,
            interact: false,
            trigger: false,
            see: false
         },
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         depth = 0,
         metadata = {},
         position: { x: x2 = 0, y: y2 = 0 } = {},
         sprite
      }: {
         attributes?: XOptional<XEntityAttributes>;
         bounds?: XOptional<XBounds>;
         depth?: number;
         metadata?: XKeyed<any>;
         position?: XOptional<XPosition>;
         sprite?: XSprite;
      } = {}
   ) {
      this.attributes = { backdrop, collide, interact, trigger, see };
      this.bounds = { h, w, x: x1, y: y1 };
      this.depth = depth;
      this.metadata = metadata;
      this.position = { x: x2, y: y2 };
      this.sprite = sprite;
   }
}

class XHost {
   events: Map<string, Set<XListener>> = new Map();
   on (name: string, listener: XListener) {
      this.events.has(name) || this.events.set(name, new Set());
      this.events.get(name)!.add(listener);
   }
   off (name: string, listener: XListener) {
      this.events.has(name) && this.events.get(name)!.delete(listener);
   }
   fire (name: string, ...data: any[]) {
      if (this.events.has(name)) {
         return [ ...this.events.get(name)! ]
            .sort((listener1, listener2) => {
               return (
                  (typeof listener1 === 'function' ? 0 : listener1.priority) -
                  (typeof listener2 === 'function' ? 0 : listener2.priority)
               );
            })
            .map(listener => {
               return (typeof listener === 'function' ? listener : listener.script)(...data);
            });
      } else {
         return [];
      }
   }
}

class XRenderer {
   canvas: HTMLCanvasElement;
   //@ts-expect-error
   context: CanvasRenderingContext2D;
   size: XPosition;
   state = { scale: 1 };
   constructor (
      {
         canvas = document.createElement('canvas'),
         size: { x = 1000, y = 1000 } = {}
      }: {
         canvas?: HTMLCanvasElement;
         size?: XOptional<XPosition>;
      } = {}
   ) {
      this.canvas = canvas;
      this.size = { x, y };
      this.refresh();
   }
   refresh () {
      this.context = this.canvas.getContext('2d')!;
      this.context.imageSmoothingEnabled = false;
   }
   render (position: XPosition, ...entities: XEntity[]) {
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
      for (const entity of entities.sort((entity1, entity2) => entity1.depth - entity2.depth)) {
         if (entity.sprite) {
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
   }
   rescale (height: number = this.canvas.height, width: number = this.canvas.width) {
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
   }
   update (height?: number, width?: number) {
      this.rescale(height, width);
      this.refresh();
   }
}

class XSound {
   audio: HTMLAudioElement;
   constructor (
      {
         source = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
      }: { source?: string } = {}
   ) {
      this.audio = XSound.audio(source);
   }
   static cache: Map<string, HTMLAudioElement> = new Map();
   static audio (source: string) {
      const audio = XSound.cache.get(source) || new Audio(source);
      if (!XSound.cache.has(source)) {
         XSound.cache.set(source, audio);
         XCore.add(
            new Promise((resolve, reject) => {
               audio.addEventListener('load', () => {
                  resolve();
               });
               audio.addEventListener('error', () => {
                  reject();
               });
            })
         );
      }
      return audio;
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
      {
         attributes: { persist = false, hold = false } = {
            persist: false,
            hold: false
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
         attributes?: XOptional<XSpriteAttributes>;
         default?: number;
         rotation?: number;
         scale?: number;
         state?: XOptional<XSpriteState>;
         steps?: number;
         textures?: Iterable<XTexture>;
      } = {}
   ) {
      this.attributes = { persist, hold };
      this.default = $default;
      this.rotation = rotation;
      this.scale = scale;
      this.state = { active, index, step };
      this.steps = steps;
      this.textures = [ ...textures ];
   }
   compute () {
      if (this.state.active || this.attributes.persist) {
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
         this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
         this.state.active = false;
      }
   }
   enable () {
      if (!this.state.active) {
         this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
         this.state.active = true;
      }
   }
}

class XSet<X> implements Set<X> {
   state: Set<Set<X>>;
   get collection () {
      return new Set([ ...this.state ].map(set => [ ...set ]).flat());
   }
   get size () {
      return this.collection.size;
   }
   constructor (...state: Set<X>[]) {
      this.state = new Set(state);
   }
   add (value: X): this {
      throw new ReferenceError('This XSet has no defined adder!');
   }
   clear () {
      for (const set of this.state) set.clear();
   }
   delete (value: X): boolean {
      throw new ReferenceError('This XSet has no defined deleter!');
   }
   forEach (callbackfn: Parameters<Set<X>['forEach']>[0], thisArg?: Parameters<Set<X>['forEach']>[1]): void {
      return this.collection.forEach(callbackfn, thisArg);
   }
   has (value: X) {
      return this.collection.has(value);
   }
   entries () {
      return this.collection.entries();
   }
   keys () {
      return this.collection.keys();
   }
   values () {
      return this.collection.values();
   }
   [Symbol.iterator] () {
      return this.collection[Symbol.iterator]();
   }
   [Symbol.toStringTag]: string;
}

class XRoom extends XSet<XEntity> {
   backdrops: Set<XEntity> = new Set();
   bounds: XBounds;
   collides: Set<XEntity> = new Set();
   interacts: Set<XEntity> = new Set();
   player: XEntity;
   triggers: Set<XEntity> = new Set();
   sees: Set<XEntity> = new Set();
   state = new Set([ this.backdrops, this.collides, this.interacts, this.triggers, this.sees ]);
   constructor (
      {
         bounds: { h = 0, w = 0, x = 0, y = 0 } = {},
         entities = [],
         player = new XEntity()
      }: {
         bounds?: XOptional<XBounds>;
         entities?: Iterable<XEntity>;
         player?: XEntity;
      } = {}
   ) {
      super();
      this.bounds = { h, w, x, y };
      this.player = player;
      for (const entity of entities) this.add(entity);
   }
   add (entity: XEntity) {
      entity.attributes.backdrop && this.backdrops.add(entity);
      entity.attributes.collide && this.collides.add(entity);
      entity.attributes.interact && this.interacts.add(entity);
      entity.attributes.trigger && this.triggers.add(entity);
      entity.attributes.backdrop || (entity.attributes.see && this.sees.add(entity));
      return this;
   }
   delete (entity: XEntity) {
      let state = true;
      entity.attributes.backdrop && (this.backdrops.delete(entity) || (state = false));
      entity.attributes.collide && (this.collides.delete(entity) || (state = false));
      entity.attributes.interact && (this.interacts.delete(entity) || (state = false));
      entity.attributes.trigger && (this.triggers.delete(entity) || (state = false));
      entity.attributes.backdrop || (entity.attributes.see && (this.sees.delete(entity) || (state = false)));
      return state;
   }
}

class XTexture {
   bounds: XBounds;
   image: HTMLImageElement;
   constructor (
      {
         bounds: { h = Infinity, w = Infinity, x = 0, y = 0 } = {},
         source = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
      }: { bounds?: XOptional<XBounds>; source?: string } = {}
   ) {
      this.bounds = { h, w, x, y };
      this.image = XTexture.image(source);
   }
   static cache: Map<string, HTMLImageElement> = new Map();
   static image (source: string) {
      const image = XTexture.cache.get(source) || Object.assign(new Image(), { src: source });
      if (!XTexture.cache.has(source)) {
         XTexture.cache.set(source, image);
         XCore.add(
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

//
//    ##     ##   #########   #########   ##          ########
//    ##     ##   ##     ##   ##     ##   ##          ##    ###
//    ##     ##   ##     ##   ##     ##   ##          ##     ##
//    ##     ##   ##     ##   #########   ##          ##     ##
//    ##  #  ##   ##     ##   ##  ###     ##          ##     ##
//    ## ### ##   ##     ##   ##   ###    ##          ##    ###
//    #########   #########   ##    ###   #########   ########
//
///// imagine using unitale ////////////////////////////////////////////////////////////////////////

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
   get detect () {
      return this.state.detect;
   }
   set detect (value) {
      this.state.detect = value;
   }
   get interact () {
      return this.state.interact;
   }
   set interact (value) {
      this.state.interact = value;
   }
   get move () {
      return this.state.move;
   }
   set move (value) {
      this.state.move = value;
      if (this.state.move) {
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
      {
         background = new XRenderer(),
         foreground = new XRenderer(),
         keys: {
            u: u1 = new XKey(),
            l: l1 = new XKey(),
            d: d1 = new XKey(),
            r: r1 = new XKey(),
            z = new XKey(),
            x = new XKey(),
            c = new XKey()
         } = {},
         room = new XRoom(),
         speed = 1,
         sprites: { u: u2 = new XSprite(), l: l2 = new XSprite(), d: d2 = new XSprite(), r: r2 = new XSprite() } = {},
         state: { detect = true, interact = true, move = true } = {}
      }: {
         background?: XRenderer;
         foreground?: XRenderer;
         keys?: XOptional<XOverworldKeys>;
         room?: XRoom;
         speed?: number;
         sprites?: XOptional<XOverworldSprites>;
         state?: XOptional<XOverworldState>;
      } = {}
   ) {
      super();
      this.background = background;
      this.foreground = foreground;
      this.keys = { u: u1, l: l1, d: d1, r: r1, z, x, c };
      this.room = room;
      this.speed = speed;
      this.sprites = { u: u2, l: l2, d: d2, r: r2 };
      this.state = { detect, interact, move };
      this.keys.u.on('up', () => this.state.move && this.sprites.u.disable());
      this.keys.l.on('up', () => this.state.move && this.sprites.l.disable());
      this.keys.d.on('up', () => this.state.move && this.sprites.d.disable());
      this.keys.r.on('up', () => this.state.move && this.sprites.r.disable());
      this.keys.u.on('down', () => this.state.move && this.sprites.u.enable());
      this.keys.l.on('down', () => this.state.move && this.sprites.l.enable());
      this.keys.d.on('down', () => this.state.move && this.sprites.d.enable());
      this.keys.r.on('down', () => this.state.move && this.sprites.r.enable());
      this.keys.z.on('down', () => {
         if (this.interact) {
            for (const entity of XWorld.intersection(XWorld.bounds(this.room.player), ...this.room.interacts)) {
               this.fire('interact', entity);
            }
         }
      });
      this.refresh();
   }
   refresh () {
      this.background.refresh();
      this.foreground.refresh();
      XCore.ready(() => {
         this.background.render(XWorld.center(this.room.player), this.room.player, ...this.room.backdrops);
      });
   }
   render () {
      const queue: Set<XEntity> = new Set();
      const origin = Object.assign({}, this.room.player.position);
      if (this.move) {
         const keys = { u: this.keys.u.active, l: this.keys.l.active, d: this.keys.d.active, r: this.keys.r.active };
         if (keys.l || keys.r) {
            this.room.player.position.x -= keys.l ? this.speed : -this.speed;
            const collisions = XWorld.intersection(XWorld.bounds(this.room.player), ...this.room.collides);
            if (collisions.size > 0) {
               this.room.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.room.player.position.x -= keys.l ? 1 : -1;
                  collision = XWorld.intersection(XWorld.bounds(this.room.player), ...collisions).size > 0;
               }
               collision && (this.room.player.position.x += keys.l ? 1 : -1);
               for (const entity of collisions) queue.add(entity);
            }
         }
         if (keys.u || keys.d) {
            const origin = Object.assign({}, this.room.player.position);
            this.room.player.position.y += keys.u ? this.speed : -this.speed;
            const collisions = XWorld.intersection(XWorld.bounds(this.room.player), ...this.room.collides);
            if (collisions.size > 0) {
               this.room.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.room.player.position.y += keys.u ? 1 : -1;
                  collision = XWorld.intersection(XWorld.bounds(this.room.player), ...collisions).size > 0;
               }
               collision && (this.room.player.position.y -= keys.u ? 1 : -1);
               // this line enables the frisk dance
               collision && index === 1 && keys.u && keys.d && this.room.player.position.y--;
               for (const entity of collisions) queue.add(entity);
            }
         }
         if (this.room.player.position.x < origin.x) {
            this.room.player.sprite = this.sprites.l;
            this.sprites.l.enable();
         } else if (this.room.player.position.x > origin.x) {
            this.room.player.sprite = this.sprites.r;
            this.sprites.r.enable();
         } else {
            this.sprites.l.disable();
            this.sprites.r.disable();
         }
         if (this.room.player.position.y > origin.y) {
            this.room.player.sprite = this.sprites.u;
            this.sprites.u.enable();
         } else if (this.room.player.position.y < origin.y) {
            this.room.player.sprite = this.sprites.d;
            this.sprites.d.enable();
         } else {
            this.sprites.u.disable();
            this.sprites.d.disable();
         }
         if (this.room.player.position.x !== origin.x || this.room.player.position.y !== origin.y) {
            this.background.render(XWorld.center(this.room.player), this.room.player, ...this.room.backdrops);
         }
      }
      this.foreground.render(XWorld.center(this.room.player), this.room.player, ...this.room.sees);
      if (this.move) {
         for (const entity of queue) this.fire('collide', entity);
      }
      if (this.detect) {
         for (const entity of XWorld.intersection(XWorld.bounds(this.room.player), ...this.room.triggers)) {
            this.fire('trigger', entity);
         }
      }
   }
   rescale (height?: number, width?: number) {
      this.background.rescale(height, width);
      this.foreground.rescale(height, width);
   }
   update (height?: number, width?: number) {
      this.rescale(height, width);
      this.refresh();
   }
}

const XWorld = (() => {
   return {
      bounds (entity: XEntity) {
         return {
            x: entity.position.x + entity.bounds.x + Math.min(entity.bounds.w, 0),
            y: entity.position.y + entity.bounds.y + Math.min(entity.bounds.h, 0),
            w: Math.abs(entity.bounds.w),
            h: Math.abs(entity.bounds.h)
         };
      },
      center (entity: XEntity) {
         if (entity.sprite) {
            const image = entity.sprite.textures[entity.sprite.state.index].image;
            return {
               x: entity.position.x + image.width / 2,
               y: entity.position.y + image.height / 2
            };
         } else {
            return entity.position;
         }
      },
      intersection ({ x = 0, y = 0, h = 0, w = 0 }: XBounds, ...entities: XEntity[]) {
         const list: Set<XEntity> = new Set();
         for (const entity of entities) {
            const bounds = XWorld.bounds(entity);
            if (x < bounds.x + bounds.w && x + w > bounds.x && y < bounds.y + bounds.h && y + h > bounds.y) {
               list.add(entity);
            }
         }
         return list;
      }
   };
})();

//
//    #########   #########   ##     ##   ##     ##
//    ## ### ##   ##          ###    ##   ##     ##
//    ##  #  ##   ##          ####   ##   ##     ##
//    ##     ##   #######     ## ### ##   ##     ##
//    ##     ##   ##          ##   ####   ##     ##
//    ##     ##   ##          ##    ###   ##     ##
//    ##     ##   #########   ##     ##   #########
//
////// where it all began //////////////////////////////////////////////////////////////////////////

class XDialogue extends XHost {
   advance: XKey;
   menu: XMenu;
   interval: number;
   reader: XReader;
   skip: XKey;
   speakers: XKeyed<XSpeaker>;
   state: XDialogueState;
   get speaker () {
      return this.speakers[this.state.speaker];
   }
   constructor (
      {
         advance = new XKey(),
         menu = new XMenu(),
         interval = 0,
         reader = new XReader(),
         speakers = {},
         skip = new XKey(),
         state: { active = false, speaker = 'default', text = '' } = {}
      }: {
         advance?: XKey;
         menu?: XMenu;
         interval?: number;
         reader?: XReader;
         speakers?: XKeyed<XSpeaker>;
         skip?: XKey;
         state?: XOptional<XDialogueState>;
      } = {}
   ) {
      super();
      this.advance = advance;
      this.menu = menu;
      this.interval = interval;
      this.reader = reader;
      this.speakers = speakers;
      this.skip = skip;
      this.state = { active, speaker, text };
      this.reader.on('idle', () => {
         const speaker = this.speaker;
         speaker && speaker.sprite.disable();
      });
      this.reader.on('read', () => {
         const speaker = this.speaker;
         speaker && speaker.sprite.enable();
         this.state.text = '';
         if (!this.state.active) {
            this.state.active = true;
            this.menu.style.opacity = '1';
            this.fire('enable');
         }
         let skip = false;
         let interval = this.interval;
         return {
            char: async (char: string) => {
               await Promise.race([
                  new Promise(resolve => {
                     setTimeout(() => resolve(0), interval);
                     interval === this.interval || (interval = this.interval);
                  }),
                  new Promise(resolve => {
                     if (skip) {
                        resolve(0);
                     } else {
                        const listener = () => {
                           skip = true;
                           resolve(0);
                           this.skip.off('down', listener);
                        };
                        this.skip.on('down', listener);
                     }
                  })
               ]);
               this.state.text += char;
            },
            code: async (code: string) => {
               switch (code[0]) {
                  case '^':
                     interval = Number(code[1]) * (this.interval * 2);
                     break;
                  case '!':
                     switch (code.slice(1)) {
                        case 'advance':
                           this.reader.advance();
                           break;
                     }
                     break;
               }
            }
         };
      });
      this.reader.on('empty', () => {
         this.state.text = '';
         if (this.state.active) {
            this.state.active = false;
            this.menu.style.opacity = '0';
            this.fire('disable');
         }
      });
      this.reader.on('style', ([ key, value ]: [string, string]) => {
         switch (key) {
            case 'speaker':
               this.state.speaker = value;
               break;
            case 'voice':
               this.speaker.state.voice = value;
               break;
            case 'sprite':
               this.speaker.state.sprite = value;
               break;
         }
      });
      this.advance.on('down', () => this.state.active && this.reader.advance());
   }
   computeImage () {
      const speaker = this.speaker;
      if (speaker) {
         const texture = speaker.sprite.compute();
         if (texture) return texture.image;
      }
   }
   computeText () {
      return this.state.text;
   }
}

class XItem {
   content: () => HTMLElement | void;
   element: HTMLElement;
   style: XItemStyle;
   constructor (
      {
         content: content1 = () => {},
         element = document.createElement('x'),
         style: { content: content2 = {}, item = {} } = {}
      }: {
         content?: () => HTMLElement | void;
         element?: HTMLElement;
         style?: XOptional<XItemStyle>;
      } = {}
   ) {
      this.content = content1;
      this.element = element;
      this.style = { content: content2, item };
   }
   tick () {
      Object.assign(this.element.style, this.style.item);
      const current = this.element.firstElementChild;
      const next = this.content();
      if (next) {
         Object.assign(next.style, this.style.content);
         current && (current === next || current.remove());
         this.element.firstElementChild || this.element.appendChild(next);
      } else {
         current && current.remove();
      }
   }
}

class XMenu {
   element: HTMLElement;
   items: XKeyed<XItem>;
   style: XOptional<CSSStyleDeclaration>;
   constructor (
      {
         element = document.createElement('x'),
         items = {},
         style = {}
      }: {
         element?: HTMLElement;
         items?: XKeyed<XItem>;
         style?: XOptional<CSSStyleDeclaration>;
      } = {}
   ) {
      this.element = element;
      this.items = items;
      this.style = style;
   }
   tick () {
      Object.assign(this.element.style, this.style);
      const elements: Set<ChildNode> = new Set();
      this.element.childNodes.forEach(x => elements.add(x));
      const next: Set<ChildNode> = new Set();
      for (const key in this.items) {
         const item = this.items[key];
         item.tick();
         next.add(item.element);
      }
      for (const node of elements) next.has(node) || (elements.has(node) && this.element.removeChild(node));
      for (const node of next) elements.has(node) || this.element.appendChild(node);
   }
}

class XReader extends XHost {
   lines: string[] = [];
   state = { mode: 'empty', text: '', skip: false };
   add (...text: string[]) {
      const lines = text.join('\n').split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
         this.lines.push(...lines);
         if (this.state.mode === 'empty') {
            this.state.mode = 'idle';
            this.read();
         }
      }
   }
   advance () {
      this.lines.splice(0, 1);
      this.read();
   }
   parse (text: string) {
      if (text.startsWith('[') && text.endsWith(']')) {
         const style: Map<string, string> = new Map();
         for (const property of text.slice(1, -1).split('|')) {
            if (property.includes(':')) {
               const [ key, value ] = property.split(':').slice(0, 2);
               style.set(key, value);
            } else {
               style.set(property, 'true');
            }
         }
         return style;
      } else {
         return text;
      }
   }
   async read () {
      if (this.state.mode === 'idle') {
         if (this.lines.length > 0) {
            const line = this.parse(this.lines[0]);
            if (typeof line === 'string') {
               this.state.mode = 'read';
               for (const { code: code1, char: char1 } of this.fire('read')) {
                  let index = 0;
                  while (index < line.length) {
                     const char2 = line[index++];
                     if (char2 === '{') {
                        const code2 = line.slice(index, line.indexOf('}', index));
                        index = index + code2.length + 1;
                        await code1(code2);
                     } else {
                        await char1(char2);
                     }
                  }
               }
               this.state.mode = 'idle';
               this.fire('idle');
            } else {
               for (const entry of line) this.fire('style', entry);
               this.advance();
            }
         } else {
            this.state.mode = 'empty';
            this.fire('empty');
         }
      }
   }
}

class XSpeaker {
   sprites: XKeyed<XSprite>;
   state: XSpeakerState;
   voices: XKeyed<XSound>;
   get sprite () {
      return this.sprites[this.state.sprite];
   }
   constructor (
      {
         sprites = {},
         state: { sprite = 'default', voice = 'default' } = {},
         voices = {}
      }: { sprites?: XKeyed<XSprite>; state?: XOptional<XSpeakerState>; voices?: XKeyed<XSound> } = {}
   ) {
      this.sprites = sprites;
      this.state = { sprite, voice };
      this.voices = voices;
   }
}
