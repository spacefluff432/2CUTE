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
type XStrategy = { delay: number; duration: number; modulator: (bullet: XBullet, lifetime: number) => void };

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

class XEntity extends XHost {
   attributes: XEntityAttributes;
   bounds: XBounds;
   depth: number;
   metadata: XKeyed<any>;
   position: XPosition;
   renderer: string;
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
         metadata = {},
         position: { x: x2 = 0, y: y2 = 0 } = {},
         renderer = '',
         sprite
      }: {
         attributes?: XOptional<XEntityAttributes>;
         bounds?: XOptional<XBounds>;
         depth?: number;
         metadata?: XKeyed<any>;
         position?: XOptional<XPosition>;
         renderer?: string;
         sprite?: XSprite | void;
      } = {}
   ) {
      super();
      this.attributes = { collide, interact, trigger };
      this.bounds = { h, w, x: x1, y: y1 };
      this.depth = depth;
      this.metadata = metadata;
      this.position = { x: x2, y: y2 };
      this.renderer = renderer;
      this.sprite = sprite;
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
         const sprite = entity.sprite;
         if (sprite) {
            const texture = sprite.compute();
            if (texture) {
               const width = isFinite(texture.bounds.w) ? texture.bounds.w : texture.image.width;
               const height = isFinite(texture.bounds.h) ? texture.bounds.h : texture.image.height;
               // TODO: HANDLE SPRITE ROTATION
               this.context.drawImage(
                  texture.image,
                  texture.bounds.x,
                  texture.bounds.y,
                  width,
                  height,
                  entity.position.x,
                  entity.position.y * -1 - height * sprite.scale,
                  width * sprite.scale,
                  height * sprite.scale
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
   from: ((atlas: XAtlas, navigator: string | null) => void);
   item: XItem;
   next:
      | string
      | null
      | void
      | (string | null | void)[]
      | ((atlas: XAtlas) => string | null | void | (string | null | void)[]);
   prev: string | null | void | ((atlas: XAtlas) => string | null | void);
   size: number | ((atlas: XAtlas) => number);
   to: ((atlas: XAtlas, navigator: string | null) => void);
   type: string | ((atlas: XAtlas) => string);
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
         from?: ((atlas: XAtlas, navigator: string | null) => void);
         item?: XItem;
         next?:
            | string
            | null
            | void
            | (string | null | void)[]
            | ((atlas: XAtlas) => string | null | void | (string | null | void)[]);
         prev?: string | null | void | ((atlas: XAtlas) => string | null | void);
         size?: number | ((atlas: XAtlas) => number);
         to?: ((atlas: XAtlas, navigator: string | null) => void);
         type?: XNavigatorType | ((atlas: XAtlas) => XNavigatorType);
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

class XAtlas {
   elements: XKeyed<XItem>;
   menu: string;
   navigators: XKeyed<XNavigator>;
   size: XPosition;
   state: { index: number; navigator: string | null } = { index: 0, navigator: null };
   get navigator (): XNavigator | void {
      return this.state.navigator === null ? void 0 : this.navigators[this.state.navigator];
   }
   constructor (
      {
         menu = '',
         navigators = {},
         size: { x = 0, y = 0 } = {}
      }: {
         menu?: string;
         navigators?: XKeyed<XNavigator>;
         size?: XOptional<XPosition>;
      } = {}
   ) {
      this.elements = Object.fromEntries(
         Object.entries(navigators).map(([ key, { item } ]) => {
            return [
               key,
               new XItem({
                  element: `<div class="storyteller navigator" id="st-nv-${encodeURIComponent(key)}"></div>`,
                  children: [ item ],
                  style: {
                     gridArea: 'c',
                     height: () => `${this.size.y}px`,
                     margin: 'auto',
                     position: 'relative',
                     width: () => `${this.size.x}px`
                  }
               })
            ];
         })
      );
      this.menu = menu;
      this.navigators = navigators;
      this.size = { x, y };
   }
   attach (navigator: string, overworld: XOverworld) {
      if (navigator in this.elements) overworld.wrapper.children!.push(this.elements[navigator]);
   }
   detach (navigator: string, overworld: XOverworld) {
      if (navigator in this.elements) {
         const children = overworld.wrapper.children!;
         children.splice(children.indexOf(this.elements[navigator]), 1);
      }
   }
   navigate (action: 'menu' | 'move' | 'next' | 'prev', type = '', shift: -1 | 0 | 1 = 0) {
      const navigator = this.navigator;
      switch (action) {
         case 'menu':
            if (navigator) {
               navigator.to(this, null);
               this.state.index = -1;
               this.state.navigator = null;
            } else {
               const navigator = this.navigators[this.menu];
               if (navigator) {
                  this.state.index = 0;
                  navigator.from(this, this.state.navigator);
                  this.state.navigator = this.menu;
               }
            }
            break;
         case 'move':
            if (navigator && navigator.type === type) {
               if (shift > 0) {
                  const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                  if (size - 1 <= this.state.index) {
                     this.state.index = 0;
                  } else {
                     this.state.index++;
                  }
               } else if (shift < 0) {
                  if (this.state.index <= 0) {
                     const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                     this.state.index = size - 1;
                  } else {
                     this.state.index--;
                  }
               }
            }
            break;
         case 'next':
         case 'prev':
            let destination: string | null | void = null;
            if (navigator) {
               const provider = navigator[action];
               let result = typeof provider === 'function' ? provider(this) : provider;
               destination = result && typeof result === 'object' ? result[this.state.index] : result;
            }
            if (typeof destination === 'string' && destination in this.navigators) {
               navigator && navigator.to(this, destination);
               this.state.index = 0;
               this.navigators[destination].from(this, this.state.navigator);
               this.state.navigator = destination;
            } else if (destination === null) {
               navigator && navigator.to(this, destination);
               this.state.index = -1;
               this.state.navigator = null;
            }
            break;
      }
   }
}

class XOverworld extends XHost {
   layers: XKeyed<XRenderer>;
   player: XEntity;
   rooms: XKeyed<XRoom>;
   size: XPosition;
   state: {
      bounds: XBounds;
      scale: number;
      room: string;
   } = {
      bounds: { w: 0, h: 0, x: 0, y: 0 },
      scale: 1,
      room: ''
   };
   wrapper: XItem;
   get room (): XRoom | void {
      return this.rooms[this.state.room];
   }
   constructor (
      {
         layers = {},
         player = new XEntity(),
         rooms = {},
         size: { x = 0, y = 0 } = {},
         wrapper
      }: {
         layers?: XKeyed<XRenderer>;
         player?: XEntity;
         rooms?: XKeyed<XRoom>;
         size?: XOptional<XPosition>;
         wrapper?: Element;
      } = {}
   ) {
      super();
      this.layers = layers;
      this.player = player;
      this.rooms = rooms;
      this.size = { x, y };
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
         children: Object.entries(this.layers).map(([ key, layer ]) => {
            return new XItem({ element: layer.canvas, style: { gridArea: 'c', margin: 'auto' } });
         })
      });
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
               if (room.layers.has(key) || key === this.player.renderer) {
                  const entities = [ ...(room.layers.get(key) || []) ];
                  key === this.player.renderer && entities.push(this.player);
                  renderer.draw(this.size, center, this.state.scale, ...entities);
               }
            }
         }
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
      return this.sounds[this.state.sound || ''];
   }
   get sprite (): XSprite | void {
      return this.sprites[this.state.sprite || ''];
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
//    ########    #########   #########   #########   ##          #########
//    ##    ###   ##     ##      ###         ###      ##          ##
//    ##     ##   ##     ##      ###         ###      ##          ##
//    #########   #########      ###         ###      ##          #######
//    ##     ##   ##     ##      ###         ###      ##          ##
//    ##     ##   ##     ##      ###         ###      ##          ##
//    #########   ##     ##      ###         ###      #########   #########
//
///// where most engines begin and end /////////////////////////////////////////////////////////////

class XBullet extends XEntity {
   angle: number;
   hitbox: Set<XBounds>;
   speed: number;
   state: {
      lifetime: number;
      modulator: (bullet: XBullet, lifetime: number) => void;
      position: XPosition;
      session: Promise<void> | null;
   } = {
      lifetime: 0,
      modulator: () => {},
      position: { x: 0, y: 0 },
      session: null
   };
   constructor (
      {
         angle = 0,
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         depth = 0,
         hitbox = [],
         position: { x: x2 = 0, y: y2 = 0 } = {},
         renderer = '',
         speed = 0,
         sprite
      }: {
         angle?: number;
         bounds?: XOptional<XBounds>;
         depth?: number;
         hitbox?: Iterable<XOptional<XBounds>>;
         position?: XOptional<XPosition>;
         renderer?: string;
         speed?: number;
         sprite?: XSprite;
      } = {}
   ) {
      super({
         attributes: { trigger: true },
         bounds: { h, w, x: x1, y: y1 },
         depth,
         metadata: { key: 'bullet' },
         position: { x: x2, y: y2 },
         renderer,
         sprite
      });
      this.angle = angle;
      this.hitbox = new Set([ ...hitbox ].map(({ h = 0, w = 0, x = 0, y = 0 }) => ({ h, w, x, y })));
      this.speed = speed;
   }
   launch (lifetime: number, modulator: (bullet: XBullet, lifetime: number) => void) {
      if (this.state.session) {
         return this.state.session;
      } else {
         this.fire('start');
         this.state.lifetime = Math.max(0, this.state.lifetime + lifetime);
         this.state.modulator = modulator;
         return (this.state.session = new Promise(async resolve => {
            X.once(this, 'stop', () => {
               this.state.session = null;
               resolve();
            });
         }));
      }
   }
   tick () {
      if (this.state.lifetime > 0) {
         this.state.modulator(this, this.state.lifetime);
         const radians = (this.angle % 180) * Math.PI / 180;
         this.state.position.x += this.speed * Math.cos(radians);
         this.state.position.y += this.speed * Math.sin(radians);
         this.state.lifetime--;
         if (this.state.lifetime === 0) {
            this.fire('stop');
         }
      } else if (this.state.lifetime < 0) {
         this.state.lifetime = 0;
         this.fire('stop');
      }
   }
}

class XAttack extends XHost {
   patterns: Map<XBullet, XStrategy>;
   state: { session: Promise<void> | null } = { session: null };
   constructor (
      {
         patterns = []
      }: {
         patterns?: Iterable<{ bullet?: XBullet; strategy?: XOptional<XStrategy> }>;
      } = {}
   ) {
      super();
      this.patterns = new Map(
         [
            ...patterns
         ].map(({ bullet = new XBullet(), strategy: { delay = 0, duration = 0, modulator = () => {} } = {} }) => {
            return [ bullet, { delay, duration, modulator } ];
         })
      );
   }
   launch () {
      if (this.state.session) {
         return this.state.session;
      } else {
         return Promise.all(
            [ ...this.patterns.entries() ].map(async ([ bullet, { delay, duration, modulator } ]) => {
               await X.pause(delay);
               await bullet.launch(duration, modulator);
            })
         );
      }
   }
   tick () {
      for (const bullet of this.patterns.keys()) bullet.tick();
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
