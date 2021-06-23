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

// TYPES

type XBounds = { h: number; w: number; x: number; y: number };
type XContent = XCollection | XPattern | XSprite | XText;
type XEntityAttributes = { collide: boolean; interact: boolean; trigger: boolean };

type XContentStyle = {
   alpha: number;
   // why is typescript sussy about this
   // compositeOperation: CanvasRenderingContext2D['globalAlpha'];
   compositeOperation:
      | 'source-over'
      | 'source-in'
      | 'source-out'
      | 'source-atop'
      | 'destination-over'
      | 'destination-in'
      | 'destination-out'
      | 'destination-atop'
      | 'lighter'
      | 'copy'
      | 'xor'
      | 'multiply'
      | 'screen'
      | 'overlay'
      | 'darken'
      | 'lighten'
      | 'color-dodge'
      | 'color-burn'
      | 'hard-light'
      | 'soft-light'
      | 'difference'
      | 'exclusion'
      | 'hue'
      | 'saturation'
      | 'color'
      | 'luminosity';
   fillStyle: string | CanvasGradient | CanvasPattern;
   font: string;
   lineCap: CanvasLineCap;
   lineDashOffset: number;
   lineJoin: CanvasLineJoin;
   lineWidth: number;
   miterLimit: number;
   shadowBlur: number;
   shadowColor: string;
   shadowOffsetX: number;
   shadowOffsetY: number;
   strokeStyle: string | CanvasGradient | CanvasPattern;
   textAlign: CanvasTextAlign;
   textBaseline: CanvasTextBaseline;
};

type XItemStyle = {
   [k in keyof CSSStyleDeclaration]: CSSStyleDeclaration[k] | ((element?: HTMLElement) => CSSStyleDeclaration[k])
};

type XKeyed<X> = { [k: string]: X };
type XListener = ((...data: any[]) => any) | { priority: number; script: (...data: any[]) => any };
type XModulator = (entity: XEntity, lifetime: number) => void;
type XNavigatorGrid = (any)[][];
type XOptional<X> = { [k in keyof X]?: X[k] };
type XPatternType = 'rectangle';
type XPlayer = XSound | XVoice;
type XPosition = { x: number; y: number };
type XRendererAttributes = { animated: boolean; smooth: boolean; static: boolean };
type XSerializable = { [k: string]: XSerializable } | XSerializable[] | string | number | null | void;
type XSpriteAttributes = { persist: boolean; hold: boolean };

// CONSTANTS

const XAssets = (() => {
   const storage: Set<Promise<void>> = new Set();
   return {
      add (promise: Promise<void>) {
         storage.add(promise);
      },
      ready (script: () => void) {
         Promise.all(storage).then(script).catch(reason => {
            console.error('XAssets Load Error!');
            console.error(reason);
            script();
         });
      }
   };
})();

const XMath = (() => {
   const value: {
      <X>(object: X[]): X;
      <X>(object: X): X[keyof X];
   } = (object: any) => {
      if (object instanceof Array) {
         return object[XMath.rand.range(0, object.length - 1)];
      } else {
         return XMath.rand.value(Object.values(object));
      }
   };
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
         const bounds = XMath.bounds(entity);
         return {
            x: entity.position.x + bounds.w / 2,
            y: entity.position.y + bounds.h / 2
         };
      },
      clamp (base: number, min = -Infinity, max = Infinity) {
         return Math.min(Math.max(base, min), max);
      },
      direction ({ x = 0, y = 0 }: XPosition, ...entities: XEntity[]) {
         return entities.map(({ position }) => 180 / Math.PI * Math.atan2(position.y - y, position.x - x));
      },
      distance ({ x = 0, y = 0 }: XPosition, ...entities: XEntity[]) {
         return entities.map(({ position }) => Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)));
      },
      endpoint ({ x = 0, y = 0 }: XPosition, direction: number, distance: number) {
         const radians = (direction % 360) * Math.PI / 180;
         return {
            x: x + distance * Math.sin(Math.PI - radians),
            y: y + distance * Math.cos(Math.PI - radians)
         };
      },
      intersection ({ x = 0, y = 0, h = 0, w = 0 }: XBounds, ...entities: XEntity[]) {
         const list: Set<XEntity> = new Set();
         for (const entity of entities) {
            const bounds = XMath.bounds(entity);
            if (x < bounds.x + bounds.w && x + w > bounds.x && y < bounds.y + bounds.h && y + h > bounds.y) {
               list.add(entity);
            }
         }
         return list;
      },
      rand: {
         value,
         range (min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
         },
         threshold (max: number) {
            return Math.random() < max;
         }
      }
   };
})();

const XTools = (() => {
   return {
      pause (time: number): Promise<void> {
         return new Promise(resolve => setTimeout(() => resolve(), time));
      }
   };
})();

// PRIMARY CLASSES

class XAtlas {
   menu: string | null;
   navigators: XKeyed<XNavigator>;
   state: { navigator: string | null } = { navigator: null };
   get navigator (): XNavigator | null {
      return this.state.navigator === null ? null : this.navigators[this.state.navigator];
   }
   constructor (
      {
         menu = null,
         navigators = {}
      }: {
         menu?: string | null | void;
         navigators?: XKeyed<XNavigator> | void;
      } = {}
   ) {
      this.menu = menu;
      this.navigators = navigators;
   }
   attach (overworld: XOverworld, ...navigators: string[]) {
      for (const navigator of navigators) {
         if (navigator in this.navigators) {
            this.navigators[navigator].attach(overworld);
         }
      }
   }
   clear (overworld: XOverworld) {
      this.detach(overworld, ...Object.keys(this.navigators));
   }
   detach (overworld: XOverworld, ...navigators: string[]) {
      for (const navigator of navigators) {
         if (navigator in this.navigators) {
            this.navigators[navigator].detach(overworld);
         }
      }
   }
   move ({ x = 0, y = 0 }: XOptional<XPosition> = {}) {
      const nav = this.navigator;
      if (nav) {
         const origin = nav.selection;
         const row = typeof nav.grid === 'function' ? nav.grid(nav, this) : nav.grid;
         const horizontal = typeof nav.horizontal === 'function' ? nav.horizontal(nav, this) : nav.horizontal;
         nav.position.x = XMath.clamp(nav.position.x, 0, row.length - 1);
         nav.position.x += horizontal ? y : x;
         if (row.length - 1 < nav.position.x) {
            nav.position.x = 0;
         } else if (nav.position.x < 0) {
            nav.position.x = row.length - 1;
         }
         const column = row[nav.position.x] || [];
         nav.position.y = XMath.clamp(nav.position.y, 0, column.length - 1);
         nav.position.y += horizontal ? x : y;
         if (column.length - 1 < nav.position.y) {
            nav.position.y = 0;
         } else if (nav.position.y < 0) {
            nav.position.y = column.length - 1;
         }
         origin === nav.selection || nav.move(nav, this);
      }
   }
   navigate (action: 'menu' | 'next' | 'prev') {
      const navigator = this.navigator;
      switch (action) {
         case 'menu':
            navigator || this.switch(this.menu);
            break;
         case 'next':
         case 'prev':
            if (navigator) {
               const provider = navigator[action];
               this.switch(typeof provider === 'function' ? provider(navigator, this) : provider);
            } else {
               this.switch(null);
            }
            break;
      }
   }
   switch (destination: string | null | void) {
      const navigator = this.navigator;
      if (typeof destination === 'string' && destination in this.navigators) {
         navigator && navigator.to(navigator, this, destination, this.navigators[destination]);
         this.navigators[destination].from(this.navigators[destination], this, this.state.navigator, navigator);
         this.state.navigator = destination;
      } else if (destination === null) {
         navigator && navigator.to(navigator, this, null, null);
         this.state.navigator = null;
      }
   }
   tick () {
      const navigator = this.navigator;
      if (navigator) {
         navigator.tick(navigator, this);
      }
   }
}

class XAudio {
   context = new AudioContext();
   gain: GainNode;
   node: AudioBufferSourceNode;
   state = { active: false };
   get rate () {
      return this.node.playbackRate;
   }
   constructor () {
      this.gain = this.context.createGain();
      this.gain.connect(this.context.destination);
      this.node = this.context.createBufferSource();
      this.node.connect(this.gain);
   }
   start () {
      this.stop();
      this.node.start();
      this.state.active = true;
   }
   stop () {
      if (this.state.active) {
         const rate = this.rate;
         this.node.stop();
         this.node.disconnect();
         this.node = Object.assign(this.context.createBufferSource(), { buffer: this.node.buffer });
         this.node.playbackRate.value = rate.value;
         this.node.connect(this.gain);
         this.state.active = false;
      }
   }
}

class XCollection {
   contents: Set<XContent>;
   style: XOptional<XContentStyle>;
   constructor (
      {
         contents = [],
         style = {}
      }: {
         contents?: Iterable<XContent> | void;
         style?: XOptional<XContentStyle> | void;
      } = {}
   ) {
      this.contents = new Set(contents);
      this.style = style;
   }
   draw (context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle) {
      for (const content of this.contents) {
         content.draw(context, position, entity, Object.assign({}, style, this.style));
      }
   }
}

class XEntity {
   bounds: XBounds;
   content: XContent | void;
   depth: number;
   direction: number;
   metadata: XKeyed<any>;
   parallax: XPosition;
   position: XPosition;
   renderer: string;
   rotation: number;
   scale: XPosition;
   speed: number;
   state = { lifetime: 0 };
   style: XContentStyle;
   tick: (self: XEntity, overworld: XOverworld) => void;
   constructor (
      {
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         content,
         depth = 0,
         direction = 0,
         metadata = {},
         parallax: { x: x2 = 0, y: y2 = 0 } = {},
         position: { x: x3 = 0, y: y3 = 0 } = {},
         renderer = '',
         rotation = 0,
         scale: { x: x4 = 1, y: y4 = 1 } = {},
         speed = 0,
         style: {
            alpha = 1,
            compositeOperation = 'source-over',
            fillStyle = '#000000ff',
            font = '10px monospace',
            lineCap = 'butt',
            lineDashOffset = 0,
            lineJoin = 'miter',
            lineWidth = 1,
            miterLimit = 10,
            shadowBlur = 0,
            shadowColor = '#00000000',
            shadowOffsetX = 0,
            shadowOffsetY = 0,
            strokeStyle = '#ffffffff',
            textAlign = 'start',
            textBaseline = 'alphabetic'
         } = {},
         tick = () => {}
      }: {
         bounds?: XOptional<XBounds> | void;
         content?: XContent | void;
         depth?: number | void;
         direction?: number | void;
         metadata?: XKeyed<any> | void;
         parallax?: XOptional<XPosition> | void;
         position?: XOptional<XPosition> | void;
         renderer?: string | void;
         rotation?: number | void;
         scale?: XOptional<XPosition> | void;
         speed?: number | void;
         style?: XOptional<XContentStyle> | void;
         tick?: ((self: XEntity, overworld: XOverworld) => void) | void;
      } = {}
   ) {
      this.bounds = { h, w, x: x1, y: y1 };
      this.content = content;
      this.depth = depth;
      this.direction = direction;
      this.metadata = metadata;
      this.parallax = { x: x2, y: y2 };
      this.position = { x: x3, y: y3 };
      this.renderer = renderer;
      this.rotation = rotation;
      this.scale = { x: x4, y: y4 };
      this.speed = speed;
      this.style = {
         alpha,
         compositeOperation,
         fillStyle,
         font,
         lineCap,
         lineDashOffset,
         lineJoin,
         lineWidth,
         miterLimit,
         shadowBlur,
         shadowColor,
         shadowOffsetX,
         shadowOffsetY,
         strokeStyle,
         textAlign,
         textBaseline
      };
      this.tick = tick;
   }
}

class XHost {
   events: Map<string, Set<XListener>> = new Map();
   on (name: string, listener: XListener) {
      this.events.has(name) || this.events.set(name, new Set());
      this.events.get(name)!.add(listener);
      return this;
   }
   once (name: string, listener: XListener) {
      const singleton = (...data: any[]) => {
         this.off(name, singleton);
         return (typeof listener === 'function' ? listener : listener.script)(...data);
      };
      return this.on(name, singleton);
   }
   off (name: string, listener: XListener) {
      this.events.has(name) && this.events.get(name)!.delete(listener);
      return this;
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
   when (name: string): Promise<void> {
      return new Promise(resolve => this.once(name, () => resolve()));
   }
}

class XItem {
   children: XItem[] | void;
   element: Element | string | void | (() => Element | string | void);
   priority: number;
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
         style = {}
      }: {
         children?: Iterable<XItem> | void;
         element?: Element | string | (() => Element | string | void) | void;
         priority?: number | void;
         style?: XOptional<XItemStyle> | void;
      } = {}
   ) {
      this.children = children && [ ...children ].sort((child1, child2) => child1.priority - child2.priority);
      this.element = element;
      this.priority = priority;
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
                     .map(term => (term.endsWith('px)') ? `${+term.slice(0, -3) * scale}px)` : term))
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

class XNavigator {
   entities: Set<XEntity>;
   from: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void);
   grid: XNavigatorGrid | ((self: XNavigator, atlas?: XAtlas) => XNavigatorGrid);
   horizontal: boolean | ((self: XNavigator, atlas?: XAtlas) => boolean);
   items: Set<XItem>;
   next: string | null | void | ((self: XNavigator, atlas: XAtlas) => string | null | void);
   move: ((self: XNavigator, atlas: XAtlas) => void);
   position: XPosition;
   prev: string | null | void | ((self: XNavigator, atlas: XAtlas) => string | null | void);
   tick: (self: XNavigator, atlas: XAtlas) => void;
   to: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void);
   get selection () {
      return ((typeof this.grid === 'function' ? this.grid(this) : this.grid)[this.position.x] || [])[this.position.y];
   }
   constructor (
      {
         entities = [],
         items = [],
         from = () => {},
         grid = [],
         horizontal = false,
         next = () => {},
         move = () => {},
         position: { x = 0, y = 0 } = {},
         prev = () => {},
         tick = () => {},
         to = () => {}
      }: {
         entities?: Iterable<XEntity>;
         from?: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void) | void;
         grid?: XNavigatorGrid | ((self: XNavigator, atlas?: XAtlas) => XNavigatorGrid) | void;
         horizontal?: boolean | ((self: XNavigator, atlas?: XAtlas) => boolean) | void;
         items?: Iterable<XItem>;
         next?: string | null | ((self: XNavigator, atlas: XAtlas) => string | null | void) | void;
         move?: ((self: XNavigator, atlas: XAtlas) => void);
         position?: XOptional<XPosition> | void;
         prev?: string | null | ((self: XNavigator, atlas: XAtlas) => string | null | void) | void;
         tick?: ((self: XNavigator, atlas: XAtlas) => void) | void;
         to?: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void) | void;
      } = {}
   ) {
      this.entities = new Set(entities);
      this.from = from;
      this.grid = grid;
      this.items = new Set(items);
      this.move = move;
      this.next = next;
      this.horizontal = horizontal;
      this.position = { x, y };
      this.prev = prev;
      this.tick = tick;
      this.to = to;
   }
   attach (overworld: XOverworld) {
      const children = overworld.wrapper.children!;
      for (const entity of this.entities) overworld.entities.add(entity);
      for (const item of this.items) {
         if (!overworld.items.has(item)) {
            const container = new XItem({
               children: [ item ],
               style: {
                  gridArea: 'center',
                  height: () => `${overworld.size.y}px`,
                  margin: 'auto',
                  position: 'relative',
                  width: () => `${overworld.size.x}px`
               }
            });
            overworld.items.set(item, container);
            children.push(container);
         }
      }
   }
   detach (overworld: XOverworld) {
      const children = overworld.wrapper.children!;
      for (const entity of this.entities) overworld.entities.delete(entity);
      for (const item of this.items) {
         if (overworld.items.has(item)) {
            const container = overworld.items.get(item)!;
            overworld.items.delete(item);
            children.splice(children.indexOf(container), 1);
         }
      }
   }
}

class XPattern {
   bounds: XBounds;
   parallax: XPosition;
   position: XPosition;
   rotation: number;
   scale: XPosition;
   style: XOptional<XContentStyle>;
   type: XPatternType;
   constructor (
      {
         bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {},
         parallax: { x: x2 = 0, y: y2 = 0 } = {},
         position: { x: x3 = 0, y: y3 = 0 } = {},
         rotation = 0,
         scale: { x: x4 = 1, y: y4 = 1 } = {},
         style = {},
         type = 'rectangle'
      }: {
         bounds?: XOptional<XBounds> | void;
         parallax?: XOptional<XPosition> | void;
         position?: XOptional<XPosition> | void;
         rotation?: number | void;
         scale?: XOptional<XPosition> | void;
         style?: XOptional<XContentStyle> | void;
         type?: XPatternType | void;
      } = {}
   ) {
      this.bounds = { h, w, x: x1, y: y1 };
      this.parallax = { x: x2, y: y2 };
      this.position = { x: x3, y: y3 };
      this.rotation = rotation;
      this.scale = { x: x4, y: y4 };
      this.style = style;
      this.type = type;
   }
   draw (context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle) {
      const source = this.bounds;
      const height = source.h * entity.scale.y * this.scale.y;
      const destination = {
         h: height,
         w: source.w * entity.scale.x * this.scale.x,
         x: entity.position.x + this.position.x + source.x + position.x * (entity.parallax.x + this.parallax.x),
         y:
            (entity.position.y + this.position.y + source.y) * -1 -
            height +
            position.y * (entity.parallax.y + this.parallax.y) // cartesian alignment
      };
      const center = {
         x: destination.x + destination.w / 2,
         y: destination.y + destination.h / 2
      };
      context.save();
      {
         context.translate(center.x, center.y);
         context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
         context.translate(center.x * -1, center.y * -1);
         context.globalAlpha = style.alpha;
         context.globalCompositeOperation = style.compositeOperation;
         Object.assign(context, this.style);
      }
      switch (this.type) {
         // TODO: add support for more pattern types!
         case 'rectangle':
            context.fillRect(destination.x, destination.y, destination.w, destination.h);
            context.strokeRect(destination.x, destination.y, destination.w, destination.h);
            break;
      }
      context.restore();
   }
}

class XRenderer {
   attributes: XRendererAttributes;
   canvas: HTMLCanvasElement;
   //@ts-expect-error
   context: CanvasRenderingContext2D;
   constructor (
      {
         attributes: { animated = false, smooth = false, static: $static = false } = {},
         canvas = document.createElement('canvas')
      }: {
         attributes?: XOptional<XRendererAttributes> | void;
         canvas?: HTMLCanvasElement | void;
      } = {}
   ) {
      this.attributes = { animated, smooth, static: $static };
      this.canvas = canvas;
      this.reload();
   }
   draw (size: XPosition, position: XPosition, scale: number, ...entities: XEntity[]) {
      const context = this.context;
      context.setTransform(
         scale,
         0,
         0,
         scale,
         this.attributes.static ? 0 : (position.x * -1 + size.x / 2) * scale,
         this.attributes.static ? size.y * scale : (position.y + size.y / 2) * scale // cartesian alignment
      );
      for (const entity of entities.sort((entity1, entity2) => entity1.depth - entity2.depth)) {
         const content = entity.content;
         if (content) {
            content.draw(context, position, entity, Object.assign({}, entity.style, content.style));
         }
      }
   }
   erase () {
      this.context.resetTransform();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
   reload () {
      this.context = this.canvas.getContext('2d')!;
      this.context.imageSmoothingEnabled = this.attributes.smooth;
   }
}

class XRoom {
   bounds: XBounds;
   entities: Set<XEntity> = new Set();
   layers: Map<string, Set<XEntity>> = new Map();
   constructor (
      {
         bounds: { h = 0, w = 0, x = 0, y = 0 } = {},
         entities = []
      }: {
         bounds?: XOptional<XBounds> | void;
         entities?: Iterable<XEntity> | void;
      } = {}
   ) {
      this.bounds = { h, w, x, y };
      for (const entity of entities) this.add(entity);
   }
   add (...entities: XEntity[]) {
      for (const entity of entities) {
         this.entities.add(entity);
         this.layers.has(entity.renderer) || this.layers.set(entity.renderer, new Set());
         this.layers.get(entity.renderer)!.add(entity);
      }
   }
   remove (...entities: XEntity[]) {
      for (const entity of entities) {
         this.layers.has(entity.renderer) && this.layers.get(entity.renderer)!.delete(entity);
         this.entities.delete(entity);
      }
   }
}

class XSheet {
   grid: XPosition;
   texture: XTexture;
   constructor (
      {
         grid: { x = 0, y = 0 } = {},
         texture = new XTexture()
      }: {
         grid?: XOptional<XPosition> | void;
         texture?: XTexture | void;
      } = {}
   ) {
      this.grid = { x, y };
      this.texture = texture;
   }
   tile (x: number, y: number) {
      return new XTexture({
         bounds: { h: this.grid.y, w: this.grid.x, x: x * this.grid.x, y: y * this.grid.y },
         source: this.texture.image.src
      });
   }
}

class XSound {
   audio: XAudio;
   get rate () {
      return this.audio.rate.value;
   }
   set rate (value) {
      this.audio.rate.setValueAtTime(value, this.audio.context.currentTime);
   }
   get volume () {
      return this.audio.gain.gain.value;
   }
   set volume (value) {
      this.audio.gain.gain.setValueAtTime(value, this.audio.context.currentTime);
   }
   constructor (
      {
         rate = 1,
         source = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
         volume = 1
      }: {
         rate?: number | void;
         source?: string | void;
         volume?: number | void;
      } = {}
   ) {
      this.audio = XSound.audio(source);
      this.rate = rate;
      this.volume = volume;
   }
   play () {
      this.audio.start();
   }
   static cache: Map<string, XAudio> = new Map();
   static audio (source: string) {
      const audio = XSound.cache.get(source) || new XAudio();
      if (!XSound.cache.has(source)) {
         XSound.cache.set(source, audio);
         XAssets.add(
            new Promise(resolve => {
               const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
               request.addEventListener('load', () => {
                  audio.context.decodeAudioData(request.response, buffer => {
                     audio.node.buffer = buffer;
                     resolve();
                  });
               });
               request.open('GET', source);
               request.send();
            })
         );
      }
      return audio;
   }
}

class XSprite {
   attributes: XSpriteAttributes;
   default: number;
   interval: number;
   parallax: XPosition;
   position: XPosition;
   rotation: number;
   scale: XPosition;
   state = { active: false, index: 0, step: 0 };
   style: XOptional<XContentStyle>;
   textures: XTexture[];
   constructor (
      {
         attributes: { persist = true, hold = false } = {},
         default: $default = 0,
         interval = 1,
         parallax: { x: x1 = 0, y: y1 = 0 } = {},
         position: { x: x2 = 0, y: y2 = 0 } = {},
         rotation = 0,
         scale: { x: x3 = 1, y: y3 = 1 } = {},
         style = {},
         textures = []
      }: {
         attributes?: XOptional<XSpriteAttributes> | void;
         default?: number | void;
         interval?: number | void;
         parallax?: XOptional<XPosition> | void;
         position?: XOptional<XPosition> | void;
         rotation?: number | void;
         scale?: XOptional<XPosition> | void;
         style?: XOptional<XContentStyle> | void;
         textures?: Iterable<XTexture> | void;
      } = {}
   ) {
      this.attributes = { persist, hold };
      this.interval = interval;
      this.default = $default;
      this.parallax = { x: x1, y: y1 };
      this.position = { x: x2, y: y2 };
      this.rotation = rotation;
      this.scale = { x: x3, y: y3 };
      this.style = style;
      this.textures = [ ...textures ];
      this.state.index = this.default;
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
   draw (context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle) {
      const texture = this.compute();
      if (texture) {
         const source = {
            h:
               texture.bounds.h === Infinity
                  ? texture.image.height - texture.bounds.y
                  : texture.bounds.h === -Infinity ? -texture.bounds.y : texture.bounds.h,
            w:
               texture.bounds.w === Infinity
                  ? texture.image.width - texture.bounds.x
                  : texture.bounds.w === -Infinity ? -texture.bounds.x : texture.bounds.w
         };
         const height = source.h * entity.scale.y * this.scale.y;
         const destination = {
            h: height,
            w: source.w * entity.scale.x * this.scale.x,
            x: entity.position.x + this.position.x + position.x * (entity.parallax.x + this.parallax.x),
            y: (entity.position.y + this.position.y) * -1 - height + position.y * (entity.parallax.y + this.parallax.y) // cartesian alignment
         };
         const center = {
            x: destination.x + destination.w / 2,
            y: destination.y + destination.h / 2
         };
         context.save();
         {
            context.translate(center.x, center.y);
            context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
            context.translate(center.x * -1, center.y * -1);
            context.globalAlpha = style.alpha;
            context.globalCompositeOperation = style.compositeOperation;
            Object.assign(context, this.style);
         }
         context.drawImage(
            texture.image,
            texture.bounds.x,
            texture.bounds.y,
            source.w,
            source.h,
            destination.x,
            destination.y,
            destination.w,
            destination.h
         );
         context.restore();
      }
   }
   enable () {
      if (!this.state.active) {
         this.state.active = true;
         this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
      }
   }
}

class XText {
   position: XPosition;
   rotation: number;
   spacing: number;
   style: XOptional<XContentStyle>;
   text: string;
   constructor (
      {
         position: { x = 0, y = 0 } = {},
         rotation = 0,
         spacing = 0,
         style = {},
         text = ''
      }: {
         position?: XOptional<XPosition> | void;
         rotation?: number | void;
         spacing?: number | void;
         style?: XOptional<XContentStyle> | void;
         text?: string | void;
      } = {}
   ) {
      this.position = { x, y };
      this.rotation = rotation;
      this.spacing = spacing;
      this.style = style;
      this.text = text;
   }
   draw (context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle) {
      const text = this.text;
      if (text.length > 0) {
         const destination = {
            x: entity.position.x + this.position.x,
            y: (entity.position.y + this.position.y) * -1 // cartesian alignment
         };
         context.save();
         {
            context.translate(destination.x, destination.y);
            context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
            context.translate(destination.x * -1, destination.y * -1);
            context.globalAlpha = style.alpha;
            context.globalCompositeOperation = style.compositeOperation;
            Object.assign(context, this.style);
         }
         let left = 0;
         for (const character of text.split('')) {
            context.fillText(character, destination.x + left, destination.y);
            context.strokeText(character, destination.x + left, destination.y);
            left += this.spacing + context.measureText(character).width;
         }
         context.restore();
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
      }: {
         bounds?: XOptional<XBounds> | void;
         source?: string | void;
      } = {}
   ) {
      this.bounds = { h, w, x, y };
      this.image = XTexture.image(source);
   }
   static cache: Map<string, HTMLImageElement> = new Map();
   static image (source: string) {
      const image = XTexture.cache.get(source) || Object.assign(new Image(), { src: source });
      if (!XTexture.cache.has(source)) {
         XTexture.cache.set(source, image);
         XAssets.add(
            new Promise(resolve => {
               image.addEventListener('load', () => {
                  resolve();
               });
            })
         );
      }
      return image;
   }
}

class XVoice {
   sounds: XSound[];
   constructor (
      {
         sounds = []
      }: {
         sounds?: Iterable<XSound> | void;
      } = {}
   ) {
      this.sounds = [ ...sounds ];
   }
   play () {
      XMath.rand.value(this.sounds).play();
   }
}

// SECONDARY CLASSES

class XKey extends XHost {
   keys: Set<string>;
   states: Set<string> = new Set();
   get active () {
      return this.states.size > 0;
   }
   constructor (
      {
         keys = []
      }: {
         keys?: Iterable<string> | void;
      } = {}
   ) {
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
   entities: Set<XEntity>;
   items: Map<XItem, XItem> = new Map();
   layers: XKeyed<XRenderer>;
   player: XEntity | null = null;
   room: XRoom | null = null;
   size: XPosition;
   state: {
      bounds: XBounds;
      scale: number;
   } = {
      bounds: { w: 0, h: 0, x: 0, y: 0 },
      scale: 1
   };
   wrapper: XItem;
   constructor (
      {
         entities = [],
         layers = {},
         size: { x = 0, y = 0 } = {},
         wrapper
      }: {
         entities?: Iterable<XEntity> | void;
         layers?: XKeyed<XRenderer> | void;
         size?: XOptional<XPosition> | void;
         wrapper?: Element | void;
      } = {}
   ) {
      super();
      this.entities = new Set(entities);
      this.layers = layers;
      this.size = { x, y };
      this.wrapper = new XItem({
         element: wrapper instanceof HTMLElement ? wrapper : void 0,
         style: {
            backgroundColor: '#000000ff',
            display: 'grid',
            gridTemplateAreas: "'top top top' 'left center right' 'bottom bottom bottom'",
            height: '100%',
            left: '0',
            position: 'absolute',
            top: '0',
            width: '100%'
         },
         children: Object.values(this.layers).map(layer => {
            return new XItem({ element: layer.canvas, style: { gridArea: 'center', margin: 'auto' } });
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
   render (animated = false) {
      const room = this.room;
      if (room) {
         const center = this.player ? XMath.center(this.player) : { x: this.size.x / 2, y: this.size.y / 2 };
         for (const [ key, renderer ] of Object.entries(this.layers)) {
            if (renderer.attributes.animated === animated) {
               renderer.erase();
               const zero = { x: room.bounds.x + this.size.x / 2, y: room.bounds.y + this.size.y / 2 };
               renderer.draw(
                  this.size,
                  {
                     x: Math.min(Math.max(center.x, zero.x), zero.x + room.bounds.w),
                     y: Math.min(Math.max(center.y, zero.y), zero.y + room.bounds.h)
                  },
                  this.state.scale,
                  ...(room.layers.get(key) || []),
                  ...([ this.player, ...this.entities ].filter(
                     entity => entity && key === entity.renderer
                  ) as XEntity[])
               );
            }
         }
      }
   }
   tick (modulator: XModulator) {
      const room = this.room;
      if (room) {
         for (const entity of [ this.player, ...room.entities, ...this.entities ]) {
            if (entity) {
               entity.tick(entity, this);
               modulator(entity, entity.state.lifetime++);
               entity.position = XMath.endpoint(entity.position, entity.direction, entity.speed);
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
         char?: ((char: string) => Promise<void>) | void;
         code?: ((code: string) => Promise<void>) | void;
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

// TERTIARY CLASSES

class XDialogue extends XReader {
   interval: number;
   sprites: XKeyed<XSprite>;
   state = { sprite: '', text: String.prototype.split(''), skip: false, voice: '' };
   voices: XKeyed<XPlayer>;
   get voice (): XPlayer | void {
      return this.voices[this.state.voice || ''];
   }
   get sprite (): XSprite | void {
      return this.sprites[this.state.sprite || ''];
   }
   constructor (
      {
         interval = 0,
         sprites = {},
         voices = {}
      }: {
         interval?: number | void;
         sprites?: XKeyed<XSprite> | void;
         voices?: XKeyed<XPlayer> | void;
      } = {}
   ) {
      super({
         char: async char => {
            await this.skipper(this.interval, () => {
               char === ' ' || (this.voice && this.voice.play());
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
                  isFinite(number) && (await this.skipper(number * this.interval));
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
      this.voices = voices;
      this.on('style', ([ key, value ]: [string, string]) => {
         switch (key) {
            case 'sound':
               this.state.voice = value;
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
   skip () {
      this.fire('skip');
   }
   async skipper (interval: number, callback = () => {}) {
      if (this.state.skip) {
         return true;
      } else {
         return await Promise.race([
            XTools.pause(interval).then(() => this.state.skip || callback()),
            this.when('skip').then(() => {
               this.state.skip = true;
            })
         ]);
      }
   }
}
