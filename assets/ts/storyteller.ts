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
type XEntityAttributes = { collide: boolean; interact: boolean; trigger: boolean };

type XItemStyle = {
   [k in keyof CSSStyleDeclaration]: CSSStyleDeclaration[k] | ((element?: HTMLElement) => CSSStyleDeclaration[k])
};

type XKeyed<X> = { [k: string]: X };
type XListener = ((...data: any[]) => any) | { priority: number; script: (...data: any[]) => any };
type XNavigatorType = 'horizontal' | 'none' | 'vertical';
type XOptional<X> = { [k in keyof X]?: X[k] };

type XOverworldBinds = {
   up: string;
   left: string;
   down: string;
   right: string;
   interact: string;
   special: string;
   menu: string;
};

type XOverworldSprites = { up: XSprite; left: XSprite; down: XSprite; right: XSprite };
type XOverworldWrapper = { layer: string; item: XItem };
type XPosition = { x: number; y: number };
type XRendererAttributes = { animate: boolean };
type XSpriteAttributes = { persist: boolean; hold: boolean };

class XEntity {
   attributes: XEntityAttributes;
   bounds: XBounds;
   depth: number;
   renderer: string;
   metadata: XKeyed<any>;
   position: XPosition;
   sprite: XSprite | void;
   constructor (
      {
         attributes: { collide = false, interact = false, trigger = false } = {
            collide: false,
            interact: false,
            trigger: false
         },
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         depth = 0,
         layer = 'default',
         metadata = {},
         position: { x: x2 = 0, y: y2 = 0 } = {},
         sprite
      }: {
         attributes?: XOptional<XEntityAttributes>;
         bounds?: XOptional<XBounds>;
         depth?: number;
         layer?: string;
         metadata?: XKeyed<any>;
         position?: XOptional<XPosition>;
         sprite?: XSprite;
      } = {}
   ) {
      this.attributes = { collide, interact, trigger };
      this.bounds = { h, w, x: x1, y: y1 };
      this.depth = depth;
      this.renderer = layer;
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
   attributes: XRendererAttributes;
   canvas: HTMLCanvasElement;
   //@ts-expect-error
   context: CanvasRenderingContext2D;
   constructor (
      {
         attributes: { animate = false } = {},
         canvas = document.createElement('canvas')
      }: {
         attributes?: XOptional<XRendererAttributes>;
         canvas?: HTMLCanvasElement;
      } = {}
   ) {
      this.attributes = { animate };
      this.canvas = canvas;
      this.reload();
   }
   draw (size: XPosition, position: XPosition, scale: number, ...entities: XEntity[]) {
      this.context.setTransform(
         scale,
         0,
         0,
         scale,
         (position.x * -1 + size.x / 2) * scale,
         (position.y + size.y / 2) * scale
      );
      for (const entity of entities.sort((entity1, entity2) => entity1.depth - entity2.depth)) {
         if (entity.sprite) {
            const texture = entity.sprite.compute();
            if (texture) {
               const width = isFinite(texture.bounds.w) ? texture.bounds.w : texture.image.width;
               const height = isFinite(texture.bounds.h) ? texture.bounds.h : texture.image.height;
               // TODO: HANDLE SPRITE ROTATION AND SCALE
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
   erase () {
      this.context.resetTransform();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
   reload () {
      this.context = this.canvas.getContext('2d')!;
      this.context.imageSmoothingEnabled = false;
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
         X.add(
            new Promise((resolve, reject) => {
               audio.addEventListener('canplay', () => {
                  resolve();
               });
               audio.addEventListener('error', reason => {
                  console.error('ASSET LOAD FAILED!', audio.src, reason);
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
   state = { active: false, index: 0, step: 0 };
   interval: number;
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
         interval = 1,
         textures = []
      }: {
         attributes?: XOptional<XSpriteAttributes>;
         default?: number;
         rotation?: number;
         scale?: number;
         interval?: number;
         textures?: Iterable<XTexture>;
      } = {}
   ) {
      this.attributes = { persist, hold };
      this.default = $default;
      this.rotation = rotation;
      this.scale = scale;
      this.interval = interval;
      this.textures = [ ...textures ];
   }
   compute () {
      if (this.state.active || this.attributes.persist) {
         const texture = this.textures[this.state.index];
         if (this.state.active && ++this.state.step >= this.interval) {
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
         this.state.active = false;
         this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
      }
   }
   enable () {
      if (!this.state.active) {
         this.state.active = true;
         this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
      }
   }
}

class XRoom {
   bounds: XBounds;
   collidables: Set<XEntity> = new Set();
   entities: Set<XEntity> = new Set();
   interactables: Set<XEntity> = new Set();
   layers: Map<string, Set<XEntity>> = new Map();
   triggerables: Set<XEntity> = new Set();
   constructor (
      {
         bounds: { h = 0, w = 0, x = 0, y = 0 } = {},
         entities = []
      }: {
         bounds?: XOptional<XBounds>;
         entities?: Iterable<XEntity>;
      } = {}
   ) {
      this.bounds = { h, w, x, y };
      for (const entity of entities) this.add(entity);
   }
   add (...entities: XEntity[]) {
      for (const entity of entities) {
         this.entities.add(entity);
         entity.attributes.collide && this.collidables.add(entity);
         entity.attributes.interact && this.interactables.add(entity);
         entity.attributes.trigger && this.triggerables.add(entity);
         this.layers.has(entity.renderer) || this.layers.set(entity.renderer, new Set());
         this.layers.get(entity.renderer)!.add(entity);
      }
   }
   remove (...entities: XEntity[]) {
      for (const entity of entities) {
         this.entities.delete(entity);
         entity.attributes.collide && this.collidables.delete(entity);
         entity.attributes.interact && this.interactables.delete(entity);
         entity.attributes.trigger && this.triggerables.delete(entity);
         this.layers.has(entity.renderer) && this.layers.get(entity.renderer)!.delete(entity);
      }
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
         X.add(
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

class XItem {
   children: XItem[] | void;
   element: Element | string | void | (() => Element | string | void);
   priority: number;
   renderer: XRenderer | void;
   state: { element: HTMLElement | void; fragment: string; node: Element | void } = {
      element: void 0,
      fragment: '',
      node: void 0
   };
   style: XOptional<XItemStyle>;
   constructor (
      {
         children,
         element = document.createElement('div'),
         priority = 0,
         renderer,
         style = {}
      }: {
         children?: Iterable<XItem>;
         element?: Element | string | void | (() => Element | string | void);
         priority?: number;
         renderer?: XRenderer;
         style?: XOptional<XItemStyle>;
      } = {}
   ) {
      this.children = children && [ ...children ].sort((child1, child2) => child1.priority - child2.priority);
      this.element = element;
      this.priority = priority;
      this.renderer = renderer;
      this.style = style;
   }
   compute (scale = 1) {
      let element = typeof this.element === 'function' ? this.element() : this.element;
      if (typeof element === 'string') {
         if (element === this.state.fragment) {
            element = this.state.node;
         } else {
            this.state.fragment = element;
            element = document.createRange().createContextualFragment(element).children[0];
            this.state.node = element;
         }
      }
      if (element instanceof HTMLElement) {
         for (const key in this.style) {
            let property = this.style[key];
            if (property !== void 0) {
               typeof property === 'function' && (property = property(element));
               if (scale !== 1) {
                  property = property
                     .split(' ')
                     .map(term => (term.endsWith('px') ? `${+term.slice(0, -2) * scale}px` : term))
                     .join(' ');
               }
               element.style[key] = property;
            }
         }
         if (this.children) {
            //@ts-expect-error
            const current: Set<Element> = new Set(element.children);
            const next: Element[] = [];
            for (const child of this.children) {
               const element = child.compute(scale);
               element && next.push(element);
            }
            for (const child of current) next.includes(child) || (current.has(child) && child.remove());
            for (const child of next) {
               if (!current.has(child)) {
                  const siblings = next.slice(next.indexOf(child) + 1).filter(child => current.has(child));
                  if (siblings.length > 0) {
                     element.insertBefore(child, siblings[0]);
                  } else {
                     element.appendChild(child);
                  }
               }
            }
         }
         element === this.state.element || (this.state.element = element);
         return element;
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

class XNavigator {
   from: ((overworld: XOverworld, navigator: string | null) => void);
   item: XItem;
   next:
      | string
      | null
      | void
      | (string | null | void)[]
      | ((overworld: XOverworld) => string | null | void | (string | null | void)[]);
   prev: string | null | void | ((overworld: XOverworld) => string | null | void);
   size: number | ((overworld: XOverworld) => number);
   to: ((overworld: XOverworld, navigator: string | null) => void);
   type: string | ((overworld: XOverworld) => string);
   constructor (
      {
         from = () => {},
         item = new XItem(),
         next,
         prev,
         size = 0,
         to = () => {},
         type = 'none'
      }: {
         from?: ((overworld: XOverworld, navigator: string | null) => void);
         item?: XItem;
         next?:
            | string
            | null
            | void
            | (string | null | void)[]
            | ((overworld: XOverworld) => string | null | void | (string | null | void)[]);
         prev?: string | null | void | ((overworld: XOverworld) => string | null | void);
         size?: number | ((overworld: XOverworld) => number);
         to?: ((overworld: XOverworld, navigator: string | null) => void);
         type?: XNavigatorType | ((overworld: XOverworld) => XNavigatorType);
      } = {}
   ) {
      this.from = from;
      this.item = item;
      this.next = next;
      this.prev = prev;
      this.size = size;
      this.to = to;
      this.type = type;
   }
}

class XOverworld extends XHost {
   binds: XOverworldBinds;
   dialogue: XDialogue;
   keys: XKeyed<XKey>;
   layers: XKeyed<XRenderer>;
   main: string;
   navigators: XKeyed<XNavigator>;
   player: XEntity;
   rooms: XKeyed<XRoom>;
   size: XPosition;
   speed: number;
   sprites: XOverworldSprites;
   state: {
      bounds: XBounds;
      index: number;
      movement: boolean;
      navigator: string | null;
      scale: number;
      room: string;
   } = {
      bounds: { w: 0, h: 0, x: 0, y: 0 },
      index: 0,
      movement: false,
      navigator: null,
      scale: 1,
      room: 'default'
   };
   wrapper: XItem;
   get up (): XKey | void {
      return this.keys[this.binds.up];
   }
   get left (): XKey | void {
      return this.keys[this.binds.left];
   }
   get down (): XKey | void {
      return this.keys[this.binds.down];
   }
   get right (): XKey | void {
      return this.keys[this.binds.right];
   }
   get interact (): XKey | void {
      return this.keys[this.binds.interact];
   }
   get menu (): XKey | void {
      return this.keys[this.binds.menu];
   }
   get navigator (): XNavigator | void {
      return this.state.navigator === null ? void 0 : this.navigators[this.state.navigator];
   }
   get room (): XRoom | void {
      return this.rooms[this.state.room];
   }
   get special (): XKey | void {
      return this.keys[this.binds.special];
   }
   constructor (
      {
         binds: {
            up: up1 = '',
            left: left1 = '',
            down: down1 = '',
            right: right1 = '',
            interact = '',
            menu = '',
            special = ''
         } = {},
         dialogue = new XDialogue(),
         keys = {},
         layers = {},
         main = 'default',
         navigators = {},
         player = new XEntity(),
         rooms = {},
         size: { x = 0, y = 0 } = {},
         speed = 1,
         sprites: {
            up: up2 = new XSprite(),
            left: left2 = new XSprite(),
            down: down2 = new XSprite(),
            right: right2 = new XSprite()
         } = {},
         wrapper
      }: {
         binds?: XOptional<XOverworldBinds>;
         dialogue?: XDialogue;
         keys?: XKeyed<XKey>;
         layers?: XKeyed<XRenderer>;
         navigators?: XKeyed<XNavigator>;
         main?: string;
         player?: XEntity;
         rooms?: XKeyed<XRoom>;
         size?: XOptional<XPosition>;
         speed?: number;
         sprites?: XOptional<XOverworldSprites>;
         wrapper?: Element;
      } = {}
   ) {
      super();
      this.binds = { up: up1, left: left1, down: down1, right: right1, interact, menu, special };
      this.dialogue = dialogue;
      this.keys = keys;
      this.layers = layers;
      this.main = main;
      this.navigators = navigators;
      this.player = player;
      this.rooms = rooms;
      this.size = { x, y };
      this.speed = speed;
      this.sprites = { up: up2, left: left2, down: down2, right: right2 };
      this.wrapper = new XItem({
         element: wrapper instanceof HTMLElement ? wrapper : void 0,
         style: {
            backgroundColor: '#000000ff',
            display: 'grid',
            gridTemplateAreas: "'a a a' 'b c d' 'e e e'",
            height: '100%',
            margin: '0',
            position: 'relative',
            width: '100%'
         },
         children: [
            ...Object.values(this.layers).map(
               layer =>
                  new XItem({
                     element: layer.canvas,
                     style: {
                        gridArea: 'c',
                        margin: 'auto'
                     }
                  })
            ),
            ...Object.values(this.navigators).map(
               ({ item }) =>
                  new XItem({
                     children: [ item ],
                     style: {
                        gridArea: 'c',
                        height: () => `${this.size.y}px`,
                        margin: 'auto',
                        position: 'relative',
                        width: () => `${this.size.x}px`
                     }
                  })
            )
         ]
      });
      if (this.up) {
         this.up.on('down', () => {
            const navigator = this.navigator;
            if (navigator && navigator.type === 'vertical') {
               if (this.state.index > 0) {
                  this.state.index--;
               } else {
                  const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                  this.state.index = size - 1;
               }
            }
         });
      }
      if (this.left) {
         this.left.on('down', () => {
            const navigator = this.navigator;
            if (navigator && navigator.type === 'horizontal') {
               if (this.state.index > 0) {
                  this.state.index--;
               } else {
                  const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                  this.state.index = size - 1;
               }
            }
         });
      }
      if (this.down) {
         this.down.on('down', () => {
            const navigator = this.navigator;
            if (navigator && navigator.type === 'vertical') {
               const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
               if (this.state.index < size - 1) {
                  this.state.index++;
               } else {
                  this.state.index = 0;
               }
            }
         });
      }
      if (this.right) {
         this.right.on('down', () => {
            const navigator = this.navigator;
            if (navigator && navigator.type === 'horizontal') {
               const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
               if (this.state.index < size - 1) {
                  this.state.index++;
               } else {
                  this.state.index = 0;
               }
            }
         });
      }
      if (this.interact) {
         this.interact.on('down', () => {
            const navigator = this.navigator;
            if (navigator) {
               let option = typeof navigator.next === 'function' ? navigator.next(this) : navigator.next;
               option instanceof Array && (option = option[this.state.index]);
               if (option === null) {
                  navigator.to(this, null);
                  this.state.navigator = null;
                  this.state.movement = true;
               } else if (typeof option === 'string' && option in this.navigators) {
                  navigator.to(this, option);
                  this.state.index = 0;
                  this.navigators[option].from(this, this.state.navigator);
                  this.state.navigator = option;
               }
            } else {
               const room = this.room;
               if (room && this.state.movement) {
                  for (const entity of X.intersection(X.bounds(this.player), ...room.interactables)) {
                     this.fire('interact', entity);
                  }
               }
            }
         });
      }
      if (this.special) {
         this.special.on('down', () => {
            const navigator = this.navigator;
            if (navigator) {
               const option = typeof navigator.prev === 'function' ? navigator.prev(this) : navigator.prev;
               if (option === null) {
                  navigator.to(this, null);
                  this.state.navigator = null;
                  this.state.movement = true;
               } else if (typeof option === 'string' && option in this.navigators) {
                  navigator.to(this, option);
                  this.state.index = 0;
                  this.navigators[option].from(this, this.state.navigator!);
                  this.state.navigator = option;
               }
            }
         });
      }
      if (this.menu) {
         this.menu.on('down', () => {
            if (this.state.navigator === null) {
               const navigator = this.navigators[this.main];
               if (navigator) {
                  navigator.from(this, null);
                  this.state.navigator = this.main;
                  this.state.movement = false;
               }
            }
         });
      }
   }
   disable () {
      if (this.state.movement) {
         this.state.movement = false;
         this.sprites.up.disable();
         this.sprites.left.disable();
         this.sprites.down.disable();
         this.sprites.right.disable();
      }
   }
   enable () {
      if (!this.state.movement) {
         this.state.movement = true;
         this.up && this.up.active && this.sprites.up.enable();
         this.left && this.left.active && this.sprites.left.enable();
         this.down && this.down.active && this.sprites.down.enable();
         this.right && this.right.active && this.sprites.right.enable();
      }
   }
   refresh () {
      const element = this.wrapper.compute(this.state.scale);
      if (element) {
         let { width, height } = element.getBoundingClientRect();
         if (width !== this.state.bounds.w || height !== this.state.bounds.h) {
            this.state.bounds.w = width;
            this.state.bounds.h = height;
            const ratio = this.size.x / this.size.y;
            if (this.state.bounds.w / this.state.bounds.h > ratio) {
               width = height * ratio;
               this.state.scale = height / this.size.y;
            } else {
               height = width / ratio;
               this.state.scale = width / this.size.x;
            }
            for (const renderer of Object.values(this.layers)) {
               renderer.canvas.width = width;
               renderer.canvas.height = height;
               renderer.reload();
            }
            this.render();
         }
      }
   }
   render (animate = false) {
      const room = this.room;
      if (room) {
         const center = X.center(this.player);
         for (const [ key, renderer ] of Object.entries(this.layers)) {
            if (renderer.attributes.animate === animate) {
               renderer.erase();
               if (room.layers.has(key)) {
                  const entities = [ ...room.layers.get(key)! ];
                  key === this.player.renderer && entities.push(this.player);
                  // TODO: DON'T MONKEY-PATCH!
                  renderer.draw(this.size, center, this.state.scale, ...entities);
               }
            }
         }
      }
   }
   teleport (room: string) {
      this.state.room = room;
      X.ready(() => this.render());
   }
   tick () {
      this.refresh();
      const room = this.room;
      if (room && this.state.movement) {
         const queue: Set<XEntity> = new Set();
         const origin = Object.assign({}, this.player.position);
         const up = this.up && this.up.active;
         const left = this.left && this.left.active;
         const down = this.down && this.down.active;
         const right = this.right && this.right.active;
         if (left || right) {
            this.player.position.x -= left ? this.speed : -this.speed;
            const collisions = X.intersection(X.bounds(this.player), ...room.collidables);
            if (collisions.size > 0) {
               this.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.player.position.x -= left ? 1 : -1;
                  collision = X.intersection(X.bounds(this.player), ...collisions).size > 0;
               }
               collision && (this.player.position.x += left ? 1 : -1);
               for (const entity of collisions) queue.add(entity);
            }
         }
         if (up || down) {
            const origin = Object.assign({}, this.player.position);
            this.player.position.y += up ? this.speed : -this.speed;
            const collisions = X.intersection(X.bounds(this.player), ...room.collidables);
            if (collisions.size > 0) {
               this.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.player.position.y += up ? 1 : -1;
                  collision = X.intersection(X.bounds(this.player), ...collisions).size > 0;
               }
               collision && (this.player.position.y -= up ? 1 : -1);
               for (const entity of collisions) queue.add(entity);
               // TEH FRISK DANCE
               if (collision && index === 1 && up && down) {
                  this.player.position.y -= 2;
               }
            }
         }
         if (this.player.position.x < origin.x) {
            this.player.sprite = this.sprites.left;
            this.sprites.left.enable();
         } else if (this.player.position.x > origin.x) {
            this.player.sprite = this.sprites.right;
            this.sprites.right.enable();
         } else {
            this.sprites.left.disable();
            this.sprites.right.disable();
            if (left) {
               this.player.sprite = this.sprites.left;
            } else if (right) {
               this.player.sprite = this.sprites.right;
            }
            if (up) {
               this.player.sprite = this.sprites.up;
            } else if (down) {
               this.player.sprite = this.sprites.down;
            }
         }
         if (this.player.position.y > origin.y) {
            this.player.sprite = this.sprites.up;
            this.sprites.up.enable();
         } else if (this.player.position.y < origin.y) {
            this.player.sprite = this.sprites.down;
            this.sprites.down.enable();
         } else {
            this.sprites.up.disable();
            this.sprites.down.disable();
         }
         for (const entity of queue) this.fire('collide', entity);
         for (const entity of X.intersection(X.bounds(this.player), ...room.triggerables)) this.fire('trigger', entity);
         if (this.player.position.x !== origin.x || this.player.position.y !== origin.y) this.render();
      } else {
         this.sprites.up.disable();
         this.sprites.left.disable();
         this.sprites.down.disable();
         this.sprites.right.disable();
      }
      this.render(true);
   }
}

//
//    #########   #########   ##     ##   ##     ##
//    ## ### ##   ##          ###    ##   ##     ##
//    ##  #  ##   ##          ####   ##   ##     ##
//    ##     ##   #######     ## ### ##   ##     ##
//    ##     ##   ##          ##   ####   ##     ##
//    ##     ##   ##          ##    ###   ##     ##
//    ##     ##   #########   ##     ##   #########
//
///// where it all began ///////////////////////////////////////////////////////////////////////////

class XReader extends XHost {
   lines: string[] = [];
   mode = 'none';
   char: (char: string) => Promise<void>;
   code: (code: string) => Promise<void>;
   constructor (
      {
         char = async (char: string) => {},
         code = async (code: string) => {}
      }: {
         char?: (char: string) => Promise<void>;
         code?: (code: string) => Promise<void>;
      } = {}
   ) {
      super();
      this.char = char;
      this.code = code;
   }
   add (...text: string[]) {
      const lines = text.join('\n').split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
         this.lines.push(...lines);
         if (this.mode === 'none') {
            this.mode = 'idle';
            this.fire('start');
            this.read();
         }
      }
   }
   advance () {
      if (this.mode === 'idle') {
         this.lines.splice(0, 1);
         this.read();
      }
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
      if (this.mode === 'idle') {
         if (this.lines.length > 0) {
            const line = this.parse(this.lines[0]);
            if (typeof line === 'string') {
               this.mode = 'read';
               this.fire('read');
               let index = 0;
               while (index < line.length) {
                  const char = line[index++];
                  if (char === '{') {
                     const code = line.slice(index, line.indexOf('}', index));
                     index = index + code.length + 1;
                     await this.code(code);
                  } else {
                     await this.char(char);
                  }
               }
               this.mode = 'idle';
               this.fire('idle');
            } else {
               for (const entry of line) this.fire('style', entry);
               this.advance();
            }
         } else {
            this.mode = 'none';
            this.fire('stop');
         }
      }
   }
}

class XDialogue extends XReader {
   interval: number;
   sprites: XKeyed<XSprite>;
   state = { sprite: '', text: String.prototype.split(''), skip: false, sound: '' };
   sounds: XKeyed<XSound>;
   get sound (): XSound | void {
      return this.sounds[this.state.sound || 'default'];
   }
   get sprite (): XSprite | void {
      return this.sprites[this.state.sprite || 'default'];
   }
   constructor (
      {
         interval = 0,
         sprites = {},
         sounds = {}
      }: {
         interval?: number;
         sprites?: XKeyed<XSprite>;
         sounds?: XKeyed<XSound>;
      } = {}
   ) {
      super({
         char: async char => {
            await this.skip(this.interval, () => {
               //@ts-expect-error
               char === ' ' || (this.sound && this.sound.audio.cloneNode().play());
            });
            this.state.text.push(char);
            this.fire('text', this.compute());
         },
         code: async code => {
            switch (code[0]) {
               case '!':
                  this.fire('skip');
                  setTimeout(() => this.advance());
                  break;
               case '^':
                  const number = +code.slice(1);
                  isFinite(number) && (await this.skip(number * this.interval));
                  break;
               case '&':
                  switch (code.slice(1)) {
                     case 'u':
                     case 'x':
                        this.state.text.push(String.fromCharCode(parseInt(code.slice(2), 16)));
                        break;
                  }
                  break;
               case '|':
                  this.state.text.push('<br>');
                  break;
               case '<':
               case '>':
                  this.state.text.push(`{${code}}`);
            }
         }
      });
      this.interval = interval;
      this.sprites = sprites;
      this.sounds = sounds;
      this.on('style', ([ key, value ]: [string, string]) => {
         switch (key) {
            case 'sound':
               this.state.sound = value;
               break;
            case 'sprite':
               let active = this.sprite ? this.sprite.state.active : false;
               this.state.sprite = value;
               this.sprite && this.sprite[active ? 'enable' : 'disable']();
               break;
            case 'interval':
               const number = +value;
               isFinite(number) && (this.interval = number);
               break;
         }
      });
      this.on('read', () => {
         this.sprite && this.sprite.enable();
         this.state.skip = false;
         this.state.text = [];
         this.fire('text', this.compute());
      });
      this.on('idle', () => {
         this.sprite && this.sprite.disable();
      });
   }
   compute () {
      let text = '';
      const tails: string[] = [];
      for (const section of this.state.text) {
         if (section.startsWith('{') && section.endsWith('}')) {
            switch (section[1]) {
               case '<':
                  let attributes = '';
                  const [ tag, properties ] = section.slice(2, -1).split('?');
                  new URLSearchParams(properties).forEach((value, key) => (attributes += ` ${key}="${value}"`));
                  text += `<${tag}${attributes}>`;
                  tails.push(`</${tag}>`);
                  break;
               case '>':
                  tails.length > 0 && (text += tails.pop());
                  break;
            }
         } else {
            text += section;
         }
      }
      while (tails.length > 0) text += tails.pop();
      return text;
   }
   skip (interval: number, callback = () => {}) {
      return Promise.race([
         X.pause(interval).then(() => this.state.skip || callback()),
         new Promise(resolve => {
            if (this.state.skip) {
               resolve(0);
            } else {
               X.once(this, 'skip', () => {
                  this.state.skip = true;
                  resolve(0);
               });
            }
         })
      ]);
   }
}

//
//    #########   #########   #########   #########
//    ## ### ##      ###      ##          ##
//    ##  #  ##      ###      ##          ##
//    ##     ##      ###      #########   ##
//    ##     ##      ###             ##   ##
//    ##     ##      ###             ##   ##
//    ##     ##   #########   #########   #########
//
///// nerdiest shit on the block ///////////////////////////////////////////////////////////////////

const X = (() => {
   const storage: Set<Promise<void>> = new Set();
   return {
      storage,
      add (promise: Promise<void>) {
         X.storage.add(promise);
      },
      bounds (entity: XEntity) {
         return {
            x: entity.position.x + entity.bounds.x + Math.min(entity.bounds.w, 0),
            y: entity.position.y + entity.bounds.y + Math.min(entity.bounds.h, 0),
            w: Math.abs(entity.bounds.w),
            h: Math.abs(entity.bounds.h)
         };
      },
      center (entity: XEntity) {
         const bounds = X.bounds(entity);
         return {
            x: entity.position.x + bounds.w / 2,
            y: entity.position.y + bounds.h / 2
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
      },
      once (host: XHost, name: string, listener: XListener) {
         const script = (...data: any[]) => {
            host.off(name, script);
            return (typeof listener === 'function' ? listener : listener.script)(...data);
         };
         host.on(name, script);
      },
      pause (time: number): Promise<void> {
         return new Promise(resolve => setTimeout(() => resolve(), time));
      },
      ready (script: () => void) {
         Promise.all(X.storage).then(script).catch(() => {
            script();
         });
      }
   };
})();

// Out!Code - 2̸̾̂9̶͌͝5̷̌̓7̴̍͊
