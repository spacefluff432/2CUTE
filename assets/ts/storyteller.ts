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
type XItemStyle = { [k in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[k] | (() => CSSStyleDeclaration[k]) };
type XKeyed<X> = { [k: string]: X };
type XListener = ((...data: any[]) => any) | { priority: number; script: (...data: any[]) => any };
type XOptional<X> = { [k in keyof X]?: X[k] };
type XOverworldKeys = { u: XKey; l: XKey; d: XKey; r: XKey; z: XKey; x: XKey; c: XKey };
type XOverworldSprites = { u: XSprite; l: XSprite; d: XSprite; r: XSprite };
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
   size: XPosition;
   state = { scale: 1 };
   constructor (
      {
         attributes: { animate = false } = {},
         canvas = document.createElement('canvas'),
         size: { x = 1000, y = 1000 } = {}
      }: {
         attributes?: XOptional<XRendererAttributes>;
         canvas?: HTMLCanvasElement;
         size?: XOptional<XPosition>;
      } = {}
   ) {
      this.attributes = { animate };
      this.canvas = canvas;
      this.size = { x, y };
      this.refresh();
   }
   align (position: XPosition) {
      return {
         x: (position.x * -1 + this.size.x / 2) * this.state.scale,
         y: (position.y + this.size.y / 2) * this.state.scale
      };
   }
   draw (position: XPosition, ...entities: XEntity[]) {
      const origin = this.align(position);
      this.context.setTransform(this.state.scale, 0, 0, this.state.scale, origin.x, origin.y);
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
   refresh () {
      this.context = this.canvas.getContext('2d')!;
      this.context.imageSmoothingEnabled = false;
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
         X.add(
            new Promise((resolve, reject) => {
               audio.addEventListener('canplay', () => {
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
   keys: XOverworldKeys;
   player: XEntity;
   layers: Map<string, XRenderer>;
   rooms: XKeyed<XRoom>;
   speed: number;
   sprites: XOverworldSprites;
   state = { active: false, room: 'default' };
   get room (): XRoom | void {
      return this.rooms[this.state.room];
   }
   constructor (
      {
         layers = {},
         keys: {
            u: u1 = new XKey(),
            l: l1 = new XKey(),
            d: d1 = new XKey(),
            r: r1 = new XKey(),
            z = new XKey(),
            x = new XKey(),
            c = new XKey()
         } = {},
         player = new XEntity(),
         rooms = {},
         speed = 1,
         sprites: { u: u2 = new XSprite(), l: l2 = new XSprite(), d: d2 = new XSprite(), r: r2 = new XSprite() } = {}
      }: {
         layers?: XKeyed<XRenderer>;
         keys?: XOptional<XOverworldKeys>;
         player?: XEntity;
         rooms?: XKeyed<XRoom>;
         speed?: number;
         sprites?: XOptional<XOverworldSprites>;
      } = {}
   ) {
      super();
      this.keys = { u: u1, l: l1, d: d1, r: r1, z, x, c };
      this.player = player;
      this.layers = new Map(Object.entries(layers));
      this.rooms = rooms;
      this.speed = speed;
      this.sprites = { u: u2, l: l2, d: d2, r: r2 };
      this.keys.u.on('up', () => this.state.active && this.sprites.u.disable());
      this.keys.l.on('up', () => this.state.active && this.sprites.l.disable());
      this.keys.d.on('up', () => this.state.active && this.sprites.d.disable());
      this.keys.r.on('up', () => this.state.active && this.sprites.r.disable());
      this.keys.u.on('down', () => this.state.active && this.sprites.u.enable());
      this.keys.l.on('down', () => this.state.active && this.sprites.l.enable());
      this.keys.d.on('down', () => this.state.active && this.sprites.d.enable());
      this.keys.r.on('down', () => this.state.active && this.sprites.r.enable());
      this.keys.z.on('down', () => {
         const room = this.room;
         if (room && this.state.active) {
            for (const entity of X.intersection(X.bounds(this.player), ...room.interactables)) {
               this.fire('interact', entity);
            }
         }
      });
      this.refresh();
   }
   disable () {
      if (this.state.active) {
         this.state.active = false;
         this.sprites.u.disable();
         this.sprites.l.disable();
         this.sprites.d.disable();
         this.sprites.r.disable();
      }
   }
   enable () {
      if (!this.state.active) {
         this.state.active = true;
         this.keys.u.active && this.sprites.u.enable();
         this.keys.l.active && this.sprites.l.enable();
         this.keys.d.active && this.sprites.d.enable();
         this.keys.r.active && this.sprites.r.enable();
      }
   }
   refresh () {
      for (const renderer of this.layers.values()) renderer.refresh();
      X.ready(() => this.render());
   }
   render (animate = false) {
      const room = this.room;
      if (room) {
         const center = X.center(this.player);
         for (const [ key, renderer ] of this.layers) {
            if (renderer.attributes.animate === animate) {
               renderer.erase();
               if (room.layers.has(key)) {
                  const entities = [ ...room.layers.get(key)! ];
                  key === this.player.renderer && entities.push(this.player);
                  renderer.draw(center, ...entities);
               }
            }
         }
      }
   }
   rescale (height?: number, width?: number) {
      for (const renderer of this.layers.values()) renderer.rescale(height, width);
   }
   tick () {
      const room = this.room;
      if (room && this.state.active) {
         const queue: Set<XEntity> = new Set();
         const origin = Object.assign({}, this.player.position);
         if (this.keys.l.active || this.keys.r.active) {
            this.player.position.x -= this.keys.l.active ? this.speed : -this.speed;
            const collisions = X.intersection(X.bounds(this.player), ...room.collidables);
            if (collisions.size > 0) {
               this.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.player.position.x -= this.keys.l.active ? 1 : -1;
                  collision = X.intersection(X.bounds(this.player), ...collisions).size > 0;
               }
               collision && (this.player.position.x += this.keys.l.active ? 1 : -1);
               for (const entity of collisions) queue.add(entity);
            }
         }
         if (this.keys.u.active || this.keys.d.active) {
            const origin = Object.assign({}, this.player.position);
            this.player.position.y += this.keys.u.active ? this.speed : -this.speed;
            const collisions = X.intersection(X.bounds(this.player), ...room.collidables);
            if (collisions.size > 0) {
               this.player.position = Object.assign({}, origin);
               let index = 0;
               let collision = false;
               while (!collision && ++index < this.speed) {
                  this.player.position.y += this.keys.u.active ? 1 : -1;
                  collision = X.intersection(X.bounds(this.player), ...collisions).size > 0;
               }
               collision && (this.player.position.y -= this.keys.u.active ? 1 : -1);
               for (const entity of collisions) queue.add(entity);
               // TEH FRISK DANCE
               collision && index === 1 && this.keys.u.active && this.keys.d.active && this.player.position.y--;
            }
         }
         if (this.player.position.x < origin.x) {
            this.player.sprite = this.sprites.l;
            this.sprites.l.enable();
         } else if (this.player.position.x > origin.x) {
            this.player.sprite = this.sprites.r;
            this.sprites.r.enable();
         } else {
            this.sprites.l.disable();
            this.sprites.r.disable();
            if (this.keys.l.active) {
               this.player.sprite = this.sprites.l;
            } else if (this.keys.r.active) {
               this.player.sprite = this.sprites.r;
            }
            if (this.keys.u.active) {
               this.player.sprite = this.sprites.u;
            } else if (this.keys.d.active) {
               this.player.sprite = this.sprites.d;
            }
         }
         if (this.player.position.y > origin.y) {
            this.player.sprite = this.sprites.u;
            this.sprites.u.enable();
         } else if (this.player.position.y < origin.y) {
            this.player.sprite = this.sprites.d;
            this.sprites.d.enable();
         } else {
            this.sprites.u.disable();
            this.sprites.d.disable();
         }
         for (const entity of queue) this.fire('collide', entity);
         for (const entity of X.intersection(X.bounds(this.player), ...room.triggerables)) this.fire('trigger', entity);
         if (this.player.position.x !== origin.x || this.player.position.y !== origin.y) this.render();
      }
      this.render(true);
   }
   update (height?: number, width?: number) {
      this.rescale(height, width);
      this.refresh();
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

class XItem {
   children: XItem[] | void;
   element: HTMLElement | void | (() => HTMLElement | void);
   priority: number;
   style: XItemStyle;
   constructor (
      {
         children,
         element = document.createElement('x-item'),
         priority = 0,
         style = {}
      }: {
         children?: Iterable<XItem>;
         element?: HTMLElement | void | (() => HTMLElement | void);
         priority?: number;
         style?: XItemStyle;
      } = {}
   ) {
      this.children = children && [ ...children ];
      this.element = element;
      this.priority = priority;
      this.style = style;
   }
   compute () {
      const element = typeof this.element === 'function' ? this.element() : this.element;
      if (element) {
         for (const key in this.style) {
            const property = this.style[key];
            element.style[key] = (typeof property === 'function' ? property() : property) || '';
         }
         if (this.children) {
            //@ts-expect-error
            const current: Set<HTMLElement> = new Set(element.children);
            const next: HTMLElement[] = [];
            for (const child of this.children.sort((child1, child2) => child1.priority - child2.priority)) {
               const element = child.compute();
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
         return element;
      }
   }
}

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
      helper: {
         wallEntity (bounds: XBounds) {
            return new XEntity({
               attributes: { collide: true },
               bounds: { h: bounds.h, w: bounds.w, x: 0, y: 0 },
               position: { x: bounds.x, y: bounds.y }
            });
         },
         staticSprite (source: string) {
            return new XSprite({
               attributes: { persist: true },
               textures: [ new XTexture({ source }) ]
            });
         }
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
         Promise.all(X.storage).then(script);
      }
   };
})();

class XEnvironment {
   entities: XKeyed<XEntity> = {};
   rooms: XKeyed<XRoom> = {};
   sounds: XKeyed<XSound> = {};
   sprites: XKeyed<XSprite> = {};
   textures: XKeyed<XTexture> = {};
}

// Out!Code - 2̸̾̂9̶͌͝5̷̌̓7̴̍͊
