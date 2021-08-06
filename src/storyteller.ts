//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
//   ########   ########   ########   ########                                                          //
//   ##         ##    ##   ##    ##   ##                                                                //
//   ##         ##    ##   ##    ##   ##                                                                //
//   ##         ##    ##   ########   ######                                                            //
//   ##         ##    ##   ## ###     ##                                                                //
//   ##         ##    ##   ##  ###    ##                                                                //
//   ########   ########   ##   ###   ########                                                          //
//                                                                                                      //
//// needs more optimizating /////////////////////////////////////////////////////////////////////////////

type X2 = { x: number; y: number };
type XAtlasProperties = XProperties<XAtlas, 'menu'> & { navigators?: XKeyed<XNavigator> | void };
type XBasic = { [k: string]: XBasic } | XBasic[] | string | number | boolean | null | undefined | void;
type XCardinal = 'down' | 'left' | 'right' | 'up';
type XColor = [number, number, number, number];
type XDefined<A> = Exclude<A, null | undefined | void>;
type XDialoguerProperties = XProperties<XDialoguer, 'interval'>;
type XHitboxProperties = XObjectProperties & XProperties<XHitbox, 'size'>;
type XInputProperties = { target?: HTMLElement; codes?: (string | number)[] };
type XKeyed<A = any, B extends string = any> = { [x in B]: A };
type XListener<A extends any[] = any> = ((...data: A) => any) | { listener: ((...data: A) => any); priority: number };
type XNavigatorKey = string | null | undefined | void;
type XPathProperties = XObjectProperties & XProperties<XPath, 'size'> & { tracer?: XTracer | void };
type XPlayerProperties = XProperties<XPlayer, 'buffer' | 'rate' | 'volume'> & { router?: XRouter };
type XProperties<A extends XKeyed, B extends keyof A> = XPrimitive<{ [x in B]: A[x] }>;
type XProvider<X, Y extends any[] = []> = X | ((...args: Y) => X);
type XRegion = [X2, X2];
type XRectangleProperties = XObjectProperties & XProperties<XRectangle, 'size'>;
type XRendererLayerMode = 'ambient' | 'primary' | 'static';
type XRoomProperties = XObjectProperties & XProperties<XRoom, 'layers' | 'region'>;
type XRouter = (context: AudioContext, source: GainNode) => void;
type XSpriteProperties = XObjectProperties & XProperties<XSprite, 'step' | 'steps' | 'textures'>;
type XTextProperties = XObjectProperties & XProperties<XText, 'content' | 'spacing'>;
type XTracer = (context: CanvasRenderingContext2D, x: number, y: number) => void;
type XTransform = [XVector, XNumber, XVector];

type XWalkerProperties = {
   [x in Exclude<keyof XDefined<XHitboxProperties>, 'objects'>]?: XDefined<XHitboxProperties>[x]
} &
   XProperties<XWalker, 'sprites'>;

type XNavigatorProperties = XProperties<XNavigator, 'objects' | 'position'> &
   { [x in 'flip' | 'grid' | 'next' | 'prev']?: XNavigator[x] | void };

type XObjectProperties = XProperties<
   XObject,
   | 'alpha'
   | 'anchor'
   | 'blend'
   | 'fill'
   | 'line'
   | 'metadata'
   | 'objects'
   | 'parallax'
   | 'position'
   | 'priority'
   | 'rotation'
   | 'scale'
   | 'shadow'
   | 'skew'
   | 'stroke'
   | 'text'
>;

type XRendererProperties = XProperties<
   XRenderer,
   'alpha' | 'camera' | 'container' | 'debug' | 'framerate' | 'region' | 'size'
> & {
   layers?: XKeyed<XRendererLayerMode> | void;
};

class XHost<A extends XKeyed<any[]> = {}> {
   events: { [B in keyof A]?: XListener<A[B]>[] } = {};
   fire<B extends keyof A> (name: B, ...data: A[B]) {
      const list = this.events[name];
      if (list) {
         return list.map(handler => (typeof handler === 'function' ? handler : handler.listener)(...data));
      } else {
         return [];
      }
   }
   off<B extends keyof A> (name: B, handler: XListener<A[B]>) {
      const list = this.events[name];
      if (list) {
         const index = list.indexOf(handler);
         if (index > -1) {
            list.splice(index, 1);
         }
      }
      return this;
   }
   on<B extends keyof A> (name: B): Promise<A[B]>;
   on<B extends keyof A> (name: B, priority: number): Promise<A[B]>;
   on<B extends keyof A> (name: B, listener: XListener<A[B]>): this;
   on<B extends keyof A> (name: B, a2: number | XListener<A[B]> = 0) {
      if (typeof a2 === 'number') {
         return new Promise(resolve => {
            const singleton = {
               listener: (...data: A[B]) => {
                  this.off(name, singleton);
                  resolve(data);
               },
               priority: a2 || 0
            };
            this.on(name, singleton);
         });
      } else {
         const list = this.events[name] || (this.events[name] = []);
         list!.push(a2);
         list!
            .sort(
               (handler1, handler2) =>
                  (typeof handler1 === 'function' ? 0 : handler1.priority) -
                  (typeof handler2 === 'function' ? 0 : handler2.priority)
            )
            .forEach((value, index) => {
               list![index] = value;
            });
         return this;
      }
   }
   wrapOn<B extends keyof A> (name: B, provider: (host: this) => XListener<A[B]>) {
      return this.on(name, provider(this));
   }
   wrapOff<B extends keyof A> (name: B, provider: (host: this) => XListener<A[B]>) {
      return this.off(name, provider(this));
   }
}

class XNumber {
   value: number;
   constructor ();
   constructor (value: number);
   constructor (value = 0) {
      this.value = value;
   }
   add (value: number | XNumber = 0): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value + value);
      } else {
         return this.add(value.value);
      }
   }
   ceil () {
      return new XNumber(Math.ceil(this.value));
   }
   clamp (min: number, max: number) {
      return new XNumber(Math.min(Math.max(this.value, min), max));
   }
   clone () {
      return new XNumber(this.value);
   }
   divide (value: number | XNumber = 1): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value / value);
      } else {
         return this.divide(value.value);
      }
   }
   floor () {
      return new XNumber(Math.floor(this.value));
   }
   modulate (duration: number, ...points: number[]) {
      return new Promise<void>(resolve => {
         let index = 0;
         const value = this.value;
         clearInterval(XNumber.modulators.get(this));
         XNumber.modulators.set(this, setInterval(() => {
            if (index < duration) {
               this.value = XNumber.bezier(index / duration, value, ...points);
               index += 20;
            } else {
               this.value = XNumber.bezier(1, value, ...points);
               clearInterval(XNumber.modulators.get(this));
               resolve();
            }
         }, 20) as any);
      });
   }
   multiply (value: number | XNumber = 1): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value * value);
      } else {
         return this.multiply(value.value);
      }
   }
   round () {
      return Math.round(this.value);
   }
   subtract (value: number | XNumber = 0): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value - value);
      } else {
         return this.subtract(value.value);
      }
   }
   static bezier (value: number, ...points: number[]): number {
      return points.length > 1
         ? XNumber.bezier(
              value,
              ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value)
           )
         : points[0] || 0;
   }
   static modulators = new Map<XNumber | XVector | AudioParam, number>();
}

class XObject extends XHost<{ tick: [] }> {
   alpha: XNumber;
   anchor: XVector;
   blend:
      | 'color'
      | 'color-burn'
      | 'color-dodge'
      | 'copy'
      | 'darken'
      | 'destination-atop'
      | 'destination-in'
      | 'destination-out'
      | 'destination-over'
      | 'difference'
      | 'exclusion'
      | 'hard-light'
      | 'hue'
      | 'lighten'
      | 'lighter'
      | 'luminosity'
      | 'multiply'
      | 'overlay'
      | 'saturation'
      | 'screen'
      | 'soft-light'
      | 'source-atop'
      | 'source-in'
      | 'source-out'
      | 'source-over'
      | 'xor'
      | void;
   // TODO: add support for gradients & patterns
   fill: string | void;
   line: {
      cap: CanvasLineCap | void;
      dash: XNumber | void;
      join: CanvasLineJoin | void;
      miter: XNumber | void;
      width: XNumber | void;
   };
   metadata: XKeyed<XBasic>;
   objects: XObject[];
   parallax: XVector;
   position: XVector;
   priority: XNumber;
   rotation: XNumber;
   scale: XVector;
   shadow: {
      blur: XNumber | void;
      color: string | void;
      offset: {
         x: XNumber | void;
         y: XNumber | void;
      };
   };
   skew: XVector;
   // TODO: add support for gradients & patterns
   stroke: string | void;
   text: {
      align?: CanvasTextAlign | void;
      baseline?: CanvasTextBaseline | void;
      direction?: CanvasDirection | void;
      font?: string | void;
   };
   constructor (
      {
         alpha = 1,
         anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {},
         blend,
         fill = 'black',
         line: { cap = void 0, dash = void 0, join = void 0, miter = void 0, width = void 0 } = {},
         metadata = {},
         objects = [],
         parallax: { x: parallax_x = 0, y: parallax_y = 0 } = {},
         position: { x: position_x = 0, y: position_y = 0 } = {},
         priority = 0,
         rotation = 0,
         scale: { x: scale_x = 1, y: scale_y = 1 } = {},
         shadow: {
            blur = void 0,
            color = void 0,
            offset: { x: shadow$offset_x = 0, y: shadow$offset_y = 0 } = {}
         } = {},
         skew: { x: skew_x = 0, y: skew_y = 0 } = {},
         stroke = 'white',
         text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {}
      }: XObjectProperties = {}
   ) {
      super();
      this.alpha = new XNumber(alpha);
      this.anchor = new XVector(anchor_x, anchor_y);
      this.blend = blend;
      this.fill = fill;
      this.line = {
         cap,
         dash: dash === void 0 ? void 0 : new XNumber(dash),
         join,
         miter: miter === void 0 ? void 0 : new XNumber(miter),
         width: width === void 0 ? void 0 : new XNumber(width)
      };
      this.metadata = metadata;
      this.objects = objects.map(object => (object instanceof XObject ? object : new XObject(object)));
      this.parallax = new XVector(parallax_x, parallax_y);
      this.position = new XVector(position_x, position_y);
      this.priority = new XNumber(priority);
      this.rotation = new XNumber(rotation);
      this.scale = new XVector(scale_x, scale_y);
      this.shadow = {
         blur: blur === void 0 ? void 0 : new XNumber(blur),
         color,
         offset: {
            x: shadow$offset_x === void 0 ? void 0 : new XNumber(shadow$offset_x),
            y: shadow$offset_y === void 0 ? void 0 : new XNumber(shadow$offset_y)
         }
      };
      this.skew = new XVector(skew_x, skew_y);
      this.stroke = stroke;
      this.text = { align, baseline, direction, font };
   }
   calculate (filter: (object: XHitbox) => boolean, list: XHitbox[], camera: X2, transform: XTransform) {
      const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
      const rotation = transform[1].add(this.rotation);
      const scale = transform[2]; // .multiply(this.scale);
      if (this instanceof XHitbox && filter(this)) {
         list.push(this);
         const size = this.size;
         const half = size.divide(2);
         const base = position.subtract(half.add(half.multiply(this.anchor)));
         const state = this.state;
         const dimensions = `${base.x}:${base.y}:${position.x}:${position.y}:${rotation.value}:${size.x}:${size.y}`;
         if (dimensions !== state.dimensions) {
            const offset = rotation.value + 180;
            const corner2 = base.endpoint(0, size.x);
            const corner3 = corner2.endpoint(90, size.y);
            const corner4 = corner3.endpoint(180, size.x);
            state.vertices[0] = position
               .endpoint(position.direction(base) + offset, position.distance(base))
               .round(1e3);
            state.vertices[1] = position
               .endpoint(position.direction(corner2) + offset, position.distance(corner2))
               .round(1e3);
            state.vertices[2] = position
               .endpoint(position.direction(corner3) + offset, position.distance(corner3))
               .round(1e3);
            state.vertices[3] = position
               .endpoint(position.direction(corner4) + offset, position.distance(corner4))
               .round(1e3);
            state.dimensions = dimensions;
         }
      }
      for (const object of this.objects) object.calculate(filter, list, camera, [ position, rotation, scale ]);
   }
   compute (context: CanvasRenderingContext2D): XVector;
   compute () {
      return new XVector();
   }
   draw (context: CanvasRenderingContext2D, base: XVector): void;
   draw () {}
   render (camera: X2, context: CanvasRenderingContext2D, transform: XTransform, debug: boolean) {
      this.fire('tick');

      const state = {
         direction: context.direction,
         font: context.font,
         fillStyle: context.fillStyle,
         globalAlpha: context.globalAlpha,
         globalCompositeOperation: context.globalCompositeOperation,
         lineCap: context.lineCap,
         lineDashOffset: context.lineDashOffset,
         lineJoin: context.lineJoin,
         lineWidth: context.lineWidth,
         miterLimit: context.miterLimit,
         shadowBlur: context.shadowBlur,
         shadowColor: context.shadowColor,
         shadowOffsetX: context.shadowOffsetX,
         shadowOffsetY: context.shadowOffsetY,
         strokeStyle: context.strokeStyle,
         textAlign: context.textAlign,
         textBaseline: context.textBaseline
      };

      this.alpha && (context.globalAlpha *= this.alpha.clamp(0, 1).value);
      this.blend && (context.globalCompositeOperation = this.blend);
      this.fill && (context.fillStyle = this.fill);
      this.line.cap && (context.lineCap = this.line.cap);
      this.line.dash && (context.lineDashOffset = this.line.dash.value);
      this.line.join && (context.lineJoin = this.line.join);
      this.line.miter && (context.miterLimit = this.line.miter.value);
      this.line.width && (context.lineWidth = this.line.width.value);
      this.shadow.blur && (context.shadowBlur = this.shadow.blur.value);
      this.shadow.color && (context.shadowColor = this.shadow.color);
      this.shadow.offset.x && (context.shadowOffsetX = this.shadow.offset.x.value);
      this.shadow.offset.y && (context.shadowOffsetY = this.shadow.offset.y.value);
      this.stroke && (context.strokeStyle = this.stroke);
      this.text.align && (context.textAlign = this.text.align);
      this.text.baseline && (context.textBaseline = this.text.baseline);
      this.text.direction && (context.direction = this.text.direction);
      this.text.font && (context.font = this.text.font);

      const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
      const rotation = transform[1].add(this.rotation);
      const scale = transform[2].multiply(this.scale);

      const size = this.compute(context);
      const half = size.divide(2);
      const base = position.subtract(half.add(half.multiply(this.anchor)));
      const rads = Math.PI / 180 * this.rotation.value;

      context.translate(position.x, position.y);
      context.rotate(rads);
      context.scale(scale.x, scale.y);
      context.translate(-position.x, -position.y);

      this.draw(context, base);

      if (debug) {
         if (this instanceof XHitbox) {
            context.strokeStyle = `hsla(${(Date.now() % 1000) * 0.36}, 100%, 50%, 0.5)`;
            try {
               const vertices = this.vertices();
               for (const [ b1, b2 ] of [
                  [ vertices[0], vertices[1] ],
                  [ vertices[1], vertices[2] ],
                  [ vertices[2], vertices[3] ],
                  [ vertices[3], vertices[0] ]
               ]) {
                  context.beginPath();
                  context.moveTo(b1.x, b1.y);
                  context.lineTo(b2.x, b2.y);
                  context.stroke();
                  context.closePath();
               }
            } catch (error) {
               //
            }
         } else {
            context.strokeStyle = `rgba(255, 255, 255, 0.25)`;
            context.strokeRect(base.x, base.y, size.x, size.y);
         }
      }

      if (this.objects.length > 0) {
         for (const object of this.objects) object.render(camera, context, [ position, rotation, scale ], debug);
      }

      context.translate(position.x, position.y);
      context.rotate(-rads);
      context.scale(1 / scale.x, 1 / scale.y);
      context.translate(-position.x, -position.y);

      Object.assign(context, state);
   }
   serialize (): Exclude<XObjectProperties, void> {
      return {
         alpha: this.alpha.value,
         anchor: this.anchor,
         blend: this.blend,
         fill: this.fill,
         line: this.line && {
            cap: this.line.cap,
            dash: this.line.dash === void 0 ? void 0 : this.line.dash.value,
            join: this.line.join,
            miter: this.line.miter === void 0 ? void 0 : this.line.miter.value,
            width: this.line.width === void 0 ? void 0 : this.line.width.value
         },
         metadata: this.metadata,
         objects: this.objects.map(object => object.serialize()),
         parallax: this.parallax.serialize(),
         position: this.position.serialize(),
         priority: this.priority.value,
         rotation: this.rotation.value,
         scale: this.scale.serialize(),
         shadow: this.shadow && {
            blur: this.shadow.blur === void 0 ? void 0 : this.shadow.blur.value,
            color: this.shadow.color,
            offset: this.shadow.offset && {
               x: this.shadow.offset.x === void 0 ? void 0 : this.shadow.offset.x.value,
               y: this.shadow.offset.y === void 0 ? void 0 : this.shadow.offset.y.value
            }
         },
         skew: this.skew.serialize(),
         stroke: this.stroke,
         text: this.text && {
            align: this.text.align,
            baseline: this.text.baseline,
            direction: this.text.direction,
            font: this.text.font
         }
      };
   }
}

class XVector {
   x: number;
   y: number;
   state = { modulator: void 0 as any };
   constructor ();
   constructor (x: number, y: number);
   constructor (a1: number | X2);
   constructor (a1: number | X2 = 0, y = a1 as number) {
      if (typeof a1 === 'number') {
         this.x = a1;
         this.y = y;
      } else {
         (this.x = a1.x || 0), (this.y = a1.y || 0);
      }
   }
   add (x: number, y: number): XVector;
   add (a1: number | X2): XVector;
   add (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x + a1, this.y + y);
      } else {
         return this.add(a1.x, a1.y);
      }
   }
   clamp (min: X2, max: X2) {
      return new XVector(new XNumber(this.x).clamp(min.x, max.x).value, new XNumber(this.y).clamp(min.y, max.y).value);
   }
   clone () {
      return new XVector(this);
   }
   direction (vector: X2) {
      return 180 / Math.PI * Math.atan2(this.y - vector.y, this.x - vector.x);
   }
   distance (vector: X2) {
      return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2));
   }
   divide (x: number, y: number): XVector;
   divide (a1: number | X2): XVector;
   divide (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x / a1, this.y / y);
      } else {
         return this.divide(a1.x, a1.y);
      }
   }
   endpoint (direction: number, distance: number) {
      const radians = ((direction + 90) % 360) * Math.PI / 180;
      return new XVector(
         this.x + distance * Math.sin(Math.PI - radians),
         this.y + distance * Math.cos(Math.PI - radians)
      );
   }
   modulate (duration: number, ...points: X2[]) {
      return new Promise<void>(resolve => {
         let index = 0;
         const x = this.x;
         const y = this.y;
         clearInterval(XNumber.modulators.get(this));
         XNumber.modulators.set(this, setInterval(() => {
            if (index < duration) {
               this.x = XNumber.bezier(index / duration, x, ...points.map(point => point.x));
               this.y = XNumber.bezier(index / duration, y, ...points.map(point => point.y));
               index += 20;
            } else {
               this.x = XNumber.bezier(1, x, ...points.map(point => point.x));
               this.y = XNumber.bezier(1, y, ...points.map(point => point.y));
               clearInterval(XNumber.modulators.get(this));
               resolve();
            }
         }, 20) as any);
      });
   }
   multiply (x: number, y: number): XVector;
   multiply (a1: number | X2): XVector;
   multiply (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x * a1, this.y * y);
      } else {
         return this.multiply(a1.x, a1.y);
      }
   }
   round (base?: number): XVector {
      return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
   }
   serialize () {
      return { x: this.x, y: this.y };
   }
   subtract (x: number, y: number): XVector;
   subtract (a1: number | X2): XVector;
   subtract (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x - a1, this.y - y);
      } else {
         return this.subtract(a1.x, a1.y);
      }
   }
}

class XAtlas {
   menu: XNavigatorKey;
   navigators: XKeyed<XNavigator>;
   state = { navigator: null as string | null };
   constructor ({ menu, navigators = {} }: XAtlasProperties = {}) {
      this.menu = menu;
      this.navigators = navigators;
   }
   attach (renderer: XRenderer, layer: string, ...navigators: string[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].attach(renderer, layer);
      }
   }
   detach (renderer: XRenderer, layer: string, ...navigators: string[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].detach(renderer, layer);
      }
   }
   navigator () {
      return this.state.navigator ? this.navigators[this.state.navigator] : void 0;
   }
   seek ({ x = 0, y = 0 }: XPrimitive<X2> = {}) {
      const navigator = this.navigator();
      if (navigator) {
         const origin = navigator.selection();
         const row = typeof navigator.grid === 'function' ? navigator.grid(navigator, this) : navigator.grid;
         const flip = typeof navigator.flip === 'function' ? navigator.flip(navigator, this) : navigator.flip;
         navigator.position.x = new XNumber(navigator.position.x).clamp(0, row.length - 1).value;
         navigator.position.x += flip ? y : x;
         if (row.length - 1 < navigator.position.x) {
            navigator.position.x = 0;
         } else if (navigator.position.x < 0) {
            navigator.position.x = row.length - 1;
         }
         const column = row[navigator.position.x] || [];
         navigator.position.y = new XNumber(navigator.position.y).clamp(0, column.length - 1).value;
         navigator.position.y += flip ? x : y;
         if (column.length - 1 < navigator.position.y) {
            navigator.position.y = 0;
         } else if (navigator.position.y < 0) {
            navigator.position.y = column.length - 1;
         }
         origin === navigator.selection() || navigator.fire('move', this);
      }
   }
   navigate (action: 'menu' | 'next' | 'prev') {
      switch (action) {
         case 'menu':
            this.navigator() || this.switch(this.menu);
            break;
         case 'next':
         case 'prev':
            const navigator = this.navigator();
            if (navigator) {
               const provider = navigator[action];
               this.switch(typeof provider === 'function' ? provider(navigator, this) : provider);
            } else {
               this.switch(null);
            }
      }
   }
   switch (name: XNavigatorKey) {
      if (name !== void 0) {
         let next: XNavigator | null = null;
         if (typeof name === 'string') {
            if (name in this.navigators) {
               next = this.navigators[name];
            } else {
               return;
            }
         }
         const navigator = this.navigator();
         navigator && navigator.fire('to', this, name, navigator);
         next && next.fire('from', this, this.state.navigator, navigator);
         this.state.navigator = name;
      }
   }
}

class XDialoguer extends XHost<
   XKeyed<[string], 'char' | 'code' | 'header' | 'text'> & XKeyed<[], 'empty' | 'idle' | 'read' | 'skip'>
> {
   interval: XNumber;
   state = { mode: 'empty' as 'empty' | 'idle' | 'read' | 'skip', skip: true, text: [] as string[] };
   constructor ({ interval = 1 }: XDialoguerProperties = {}) {
      super();
      this.interval = new XNumber(interval);
   }
   read (force?: boolean) {
      if (force) {
         switch (this.state.mode) {
            case 'read':
               this.skip();
            case 'skip':
               this.on('idle').then(() => X.pause()).then(() => this.read());
         }
      } else if (this.state.mode === 'idle') {
         this.fire('read');
         this.state.mode = 'read';
      }
   }
   skip (force?: boolean) {
      (this.state.skip || force) && this.state.mode === 'read' && (this.fire('skip'), (this.state.mode = 'skip'));
   }
   async text (...lines: string[]) {
      if (this.state.mode === 'empty') {
         this.fire('read');
         this.state.mode = 'read';
         for (const line of lines.map(line => line.trim()).filter(line => line.length > 0)) {
            let index = 0;
            let advance = false;
            while (advance === false && index < line.length) {
               const char = line[index++];
               // SUS: ts thinks 'this.state.mode' can only be 'read' or 'idle'
               const skip = (this.state.mode as string) === 'skip';
               if (char === '{') {
                  const code = line.slice(index, line.indexOf('}', index));
                  const data = code.slice(1);
                  index += code.length + 1;
                  this.fire('code', code);
                  switch (code[0]) {
                     // ! - auto-skip to the end of the text
                     case '!':
                        skip || this.skip(code[1] === '!');
                        break;
                     // @ - XText control code
                     case '@':
                        this.state.text.push(`\xa7${data}\xa7`);
                        break;
                     // # - fires a 'header' event as the dialoguer
                     case '#':
                        this.fire('header', data);
                        break;
                     // $ - pushes a chunk of data immediately
                     case '$':
                        this.state.text.push(data);
                        break;
                     // % - auto-advance to the next line
                     case '%':
                        advance = true;
                        break;
                     // ^ - delay the text by (input value) * (current interval)
                     case '^':
                        skip || (await Promise.race([ this.on('skip'), X.pause(Number(data) * this.interval.value) ]));
                        break;
                     // & - add a character from a hex code
                     case '&':
                        this.state.text.push(String.fromCharCode(parseInt(data, 16)));
                        break;
                     // * - prevent skipping
                     case '*':
                        this.state.skip = false;
                        break;
                  }
               } else {
                  this.fire('char', char);
                  skip || (await Promise.race([ this.on('skip'), X.pause(this.interval.value) ]));
                  this.state.text.push(char);
                  this.fire('text', this.state.text.join(''));
               }
            }
            this.fire('idle');
            this.state.mode = 'idle';
            advance || (await this.on('read'));
            this.state.text = [];
         }
         this.fire('empty');
         this.state.mode = 'empty';
      } else {
         switch (this.state.mode) {
            case 'read':
               this.skip();
            case 'skip':
               await this.on('idle');
               await X.pause();
            case 'idle':
               this.read();
               await X.pause();
               await this.text(...lines);
         }
      }
   }
}

class XHitbox extends XObject {
   size: XVector;
   state = { dimensions: void 0, vertices: [] } as
      | { dimensions: void; vertices: [] }
      | { dimensions: string; vertices: [X2, X2, X2, X2] };
   constructor (properties: XHitboxProperties = {}) {
      super(properties);
      (({ size: { x: size_x = 0, y: size_y = 0 } = {} }: XHitboxProperties = {}) => {
         this.size = new XVector(size_x, size_y);
      })(properties);
   }
   center () {
      const vertices = this.vertices();
      return new XVector(vertices[0]).subtract(vertices[2]).divide(2).add(vertices[2]);
   }
   compute () {
      return this.size;
   }
   // OBB collison algorithm - by harrix432 & bokke1010
   detect (renderer: XRenderer, ...hitboxes: XHitbox[]) {
      renderer.calculate(hitbox => hitbox === this);
      const hits: XHitbox[] = [];
      const [ min1, max1 ] = this.region();
      for (const hitbox of hitboxes) {
         if (hitbox.state.dimensions === void 0) {
            continue;
         } else {
            // zero exclusion - if both hitboxes have a volume of zero, treat them as single lines
            if ((this.size.x === 0 || this.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
               const [ min2, max2 ] = hitbox.region();
               if (XHitbox.intersection(min1, max1, min2, max2)) {
                  hits.push(hitbox);
               }
            } else {
               // aabb minmax exclusion - if the aabb formed by the min and max of both boxes collide, continue
               const [ min2, max2 ] = hitbox.region();
               if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
                  // alignment check - if the two boxes are axis-aligned at this stage, they are colliding
                  const vertices1 = this.vertices().map(vertex => new XVector(vertex).round(1000));
                  const vertices2 = hitbox.vertices().map(vertex => new XVector(vertex).round(1000));
                  if (
                     (vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                     (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)
                  ) {
                     hits.push(hitbox);
                  } else {
                     for (const a1 of vertices1) {
                        // point raycast - if a line drawn from box1 intersects with box2 once, there is collision
                        let hit = 0;
                        const a2 = new XVector(a1).add(new XVector(max2).subtract(min2).multiply(2)).serialize();
                        for (const [ b1, b2 ] of [
                           [ vertices2[0], vertices2[1] ],
                           [ vertices2[1], vertices2[2] ],
                           [ vertices2[2], vertices2[3] ],
                           [ vertices2[3], vertices2[0] ]
                        ]) {
                           if (XHitbox.intersection(a1, a2, b1, b2)) {
                              if (hit++ === 1) {
                                 break;
                              }
                           }
                        }
                        if (hit === 1) {
                           hits.push(hitbox);
                           break;
                        }
                     }
                  }
               }
            }
         }
      }
      return hits;
   }
   height () {
      const bounds = this.region();
      return bounds[1].y - bounds[0].y;
   }
   radius () {
      const vertices = this.vertices();
      return new XVector(vertices[0]).distance(vertices[2]) / 2;
   }
   region () {
      const vertices = this.vertices();
      const { x: x1, y: y1 } = vertices[0];
      const { x: x2, y: y2 } = vertices[1];
      const { x: x3, y: y3 } = vertices[2];
      const { x: x4, y: y4 } = vertices[3];
      return [
         new XVector(Math.min(x1, x2, x3, x4), Math.min(y1, y2, y3, y4)),
         new XVector(Math.max(x1, x2, x3, x4), Math.max(y1, y2, y3, y4))
      ] as XRegion;
   }
   serialize (): Exclude<XHitboxProperties, void> {
      return Object.assign(super.serialize(), { size: this.size.serialize() });
   }
   vertices () {
      if (this.state.dimensions === void 0) {
         throw 'This object\'s vertices have not yet been calculated!';
      } else {
         return this.state.vertices as [X2, X2, X2, X2];
      }
   }
   width () {
      const bounds = this.region();
      return bounds[1].x - bounds[0].x;
   }
   static intersection (a1: X2, a2: X2, b1: X2, b2: X2) {
      return (
         XHitbox.rotation(a1, b1, b2) !== XHitbox.rotation(a2, b1, b2) &&
         XHitbox.rotation(a1, a2, b1) !== XHitbox.rotation(a1, a2, b2)
      );
   }
   static rotation (a1: X2, a2: X2, a3: X2) {
      return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
   }
}

class XInput extends XHost<XKeyed<[string | number], 'down' | 'up'>> {
   state = { codes: new Set<string | number>() };
   constructor ({ target = window as any, codes = [] }: XInputProperties = {}) {
      super();
      target.addEventListener('keyup', ({ key }) => {
         if (codes.includes(key) && this.state.codes.has(key)) {
            this.state.codes.delete(key);
            this.fire('up', key);
         }
      });
      target.addEventListener('keydown', ({ key }) => {
         if (codes.includes(key) && !this.state.codes.has(key)) {
            this.state.codes.add(key);
            this.fire('down', key);
         }
      });
      target.addEventListener('mouseup', ({ button }) => {
         if (codes.includes(button) && !this.state.codes.has(button)) {
            this.state.codes.add(button);
            this.fire('up', button);
         }
      });
      target.addEventListener('mousedown', ({ button }) => {
         if (codes.includes(button) && !this.state.codes.has(button)) {
            this.state.codes.add(button);
            this.fire('down', button);
         }
      });
   }
   active () {
      return this.state.codes.size > 0;
   }
}

class XNavigator extends XHost<
   XKeyed<[XAtlas, XNavigatorKey, XNavigator | void], 'from' | 'to'> & XKeyed<[XAtlas], 'move' | 'tick'>
> {
   flip: XProvider<boolean, [XNavigator, XAtlas]>;
   grid: XProvider<XBasic[][], [XNavigator, XAtlas | void]>;
   next: XProvider<XNavigatorKey, [XNavigator, XAtlas]>;
   objects: XObject[];
   position: X2;
   prev: XProvider<XNavigatorKey, [XNavigator, XAtlas]>;
   constructor (
      {
         flip = false,
         grid = [],
         next = '',
         objects = [],
         position: { x = 0, y = 0 } = {},
         prev = ''
      }: XNavigatorProperties = {}
   ) {
      super();
      this.flip = flip;
      this.grid = grid;
      this.next = next;
      this.objects = objects.map(object => (object instanceof XObject ? object : new XObject(object)));
      this.position = { x, y };
      this.prev = prev;
   }
   attach (renderer: XRenderer, layer: string) {
      renderer.attach(layer, ...this.objects);
   }
   detach (renderer: XRenderer, layer: string) {
      renderer.detach(layer, ...this.objects);
   }
   selection () {
      return ((typeof this.grid === 'function' ? this.grid(this) : this.grid)[this.position.x] || [])[this.position.y];
   }
}

class XPath extends XObject {
   size: XVector;
   tracer: XTracer;
   constructor (properties: XPathProperties = {}) {
      super(properties);
      (({ size: { x: size_x = 0, y: size_y = 0 } = {}, tracer = () => {} }: XPathProperties = {}) => {
         this.tracer = tracer;
         this.size = new XVector(size_x, size_y);
      })(properties);
   }
   compute () {
      return this.size;
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      context.beginPath();
      this.tracer(context, base.x, base.y);
      context.fill();
      context.stroke();
      context.closePath();
   }
   serialize (): Exclude<XPathProperties, void> {
      return Object.assign(super.serialize(), { size: this.size.serialize(), tracer: this.tracer });
   }
}

class XPlayer extends XHost<XKeyed<[], 'start' | 'stop'>> {
   buffer: AudioBuffer;
   rate: AudioParam;
   router: XRouter;
   volume: AudioParam;
   protected state = (() => {
      const context = new AudioContext();
      return {
         context,
         gain: context.createGain(),
         rate: context.createGain().gain,
         sources: [] as AudioBufferSourceNode[]
      };
   })();
   constructor (
      {
         buffer,
         rate = 1,
         router = (context, source) => source.connect(context.destination),
         volume = 1
      }: XPlayerProperties = {}
   ) {
      super();
      this.buffer = buffer || this.state.context.createBuffer(1, 1, 8000);
      this.rate = this.state.rate;
      this.router = router;
      this.volume = this.state.gain.gain;
      this.state.rate.value = rate;
      this.state.gain.gain.value = volume;
      this.router(this.state.context, this.state.gain);
   }
   source (): AudioBufferSourceNode | void {
      return this.state.sources[this.state.sources.length - 1];
   }
   start (stop?: boolean) {
      stop && this.stop();
      const source = Object.assign(this.state.context.createBufferSource(), { buffer: this.buffer });
      source.connect(this.state.gain);
      source.playbackRate.value = this.rate.value;
      this.rate = source.playbackRate;
      source.start();
      this.state.sources.push(source);
      this.fire('start');
      return source;
   }
   stop () {
      for (const source of this.state.sources.splice(0, this.state.sources.length)) {
         source.stop();
         source.disconnect(this.state.gain);
      }
      this.fire('stop');
   }
   time () {
      return this.state.context.currentTime;
   }
}

class XRectangle extends XObject {
   size: XVector;
   constructor (properties: XRectangleProperties = {}) {
      super(properties);
      (({ size: { x: size_x = 0, y: size_y = 0 } = {} }: XRectangleProperties = {}) => {
         this.size = new XVector(size_x, size_y);
      })(properties);
   }
   compute () {
      return this.size;
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      context.fillRect(base.x, base.y, this.size.x, this.size.y);
      context.strokeRect(base.x, base.y, this.size.x, this.size.y);
   }
   serialize (): Exclude<XRectangleProperties, void> {
      return Object.assign(super.serialize(), { size: this.size.serialize() });
   }
}

class XRenderer extends XHost<{ tick: [] }> {
   alpha: XNumber;
   camera: XVector;
   container: HTMLElement;
   debug: boolean;
   framerate: XNumber;
   layers: XKeyed<{
      canvas: HTMLCanvasElement;
      context: CanvasRenderingContext2D;
      mode: XRendererLayerMode;
      objects: XObject[];
   }>;
   region: XRegion;
   size: XVector;
   state = { camera: { x: NaN, y: NaN }, height: 0, scale: 1, width: 0 };
   static canvas = document.createElement('canvas');
   static transform: XTransform = [ new XVector(), new XNumber(), new XVector(1) ];
   constructor (
      {
         alpha = 1,
         camera: { x: camera_x = -1, y: camera_y = -1 } = {},
         container = document.body,
         debug = false,
         framerate = 30,
         layers = {},
         region: [
            { x: min_x = -Infinity, y: min_y = -Infinity } = {},
            { x: max_x = Infinity, y: max_y = Infinity } = {}
         ] = [],
         size: { x: size_x = 320, y: size_y = 240 } = {}
      }: XRendererProperties = {}
   ) {
      super();
      Object.assign(container.style, {
         display: 'grid',
         gridTemplateAreas: "'top top top' 'left center right' 'bottom bottom bottom'",
         gridTemplateColumns: '1fr max-content 1fr',
         gridTemplateRows: '1fr max-content 1fr'
      });
      this.alpha = new XNumber(alpha);
      this.camera = new XVector(camera_x, camera_y);
      this.container = container;
      this.debug = debug;
      this.framerate = new XNumber(framerate);
      this.layers = Object.fromEntries(
         Object.entries(layers).map(([ key, value ]) => {
            const canvas = document.createElement('canvas');
            Object.assign(canvas.style, {
               gridArea: 'center',
               imageRendering: 'pixelated',
               webkitFontSmoothing: 'none'
            });
            this.container.appendChild(canvas);
            return [
               key,
               {
                  canvas,
                  context: XRenderer.context(canvas),
                  mode: value,
                  objects: []
               }
            ];
         })
      );
      this.region = [ { x: min_x, y: min_y }, { x: max_x, y: max_y } ];
      this.size = new XVector(size_x, size_y);
      const loop = () => {
         setTimeout(loop, 1e3 / this.framerate.value);
         this.fire('tick');
         let ambient = false;
         let { width, height } = this.container.getBoundingClientRect();
         this.container.style.opacity = this.alpha.clamp(0, 1).value.toString();
         const camera = this.camera.clamp(...this.region).serialize();
         if (camera.x !== this.state.camera.x || camera.y !== this.state.camera.y) {
            ambient = true;
            Object.assign(this.state.camera, camera);
         }
         if (width !== this.state.width || height !== this.state.height) {
            ambient = true;
            this.state.width = width;
            this.state.height = height;
            const ratio = this.size.x / this.size.y;
            if (this.state.width / this.state.height > ratio) {
               width = height * ratio;
               this.state.scale = height / this.size.y;
            } else {
               height = width / ratio;
               this.state.scale = width / this.size.x;
            }
            for (const key in this.layers) {
               const layer = this.layers[key];
               layer.context = XRenderer.context(layer.canvas, width, height);
            }
         }
         for (const key in this.layers) {
            const { context, mode, objects } = this.layers[key];
            if (ambient || mode !== 'ambient') {
               const scale = this.state.scale;
               const center = this.size.divide(2);
               context.resetTransform();
               context.clearRect(0, 0, context.canvas.width, context.canvas.height);
               context.setTransform(
                  scale,
                  0,
                  0,
                  scale,
                  scale * (center.x + -(mode === 'static' ? center.x : camera.x)),
                  scale * (center.y + -(mode === 'static' ? center.y : camera.y))
               );
               for (const object of objects) object.render(camera, context, XRenderer.transform, this.debug);
            }
         }
      };
      loop();
   }
   attach (key: string, ...objects: XObject[]) {
      if (key in this.layers) {
         const layer = this.layers[key];
         for (const object of objects) layer.objects.includes(object) || layer.objects.push(object);
         layer.objects = layer.objects.sort((object1, object2) => {
            return object1.priority.value - object2.priority.value;
         });
      }
   }
   calculate (filter: (hitbox: XHitbox) => boolean) {
      const list: XHitbox[] = [];
      for (const key in this.layers) {
         for (const object of this.layers[key].objects) {
            object.calculate(filter, list, this.camera.clamp(...this.region), XRenderer.transform);
         }
      }
      return list;
   }
   detach (key: string, ...objects: XObject[]) {
      if (key in this.layers) {
         const layer = this.layers[key];
         for (const object of objects) {
            const index = layer.objects.indexOf(object);
            if (index > -1) {
               layer.objects.splice(index, 1);
            }
         }
         layer.objects = layer.objects.sort((object1, object2) => {
            return object1.priority.value - object2.priority.value;
         });
      }
   }
   static context (canvas: HTMLCanvasElement, width = 1, height = 1) {
      return Object.assign(Object.assign(canvas, { width, height }).getContext('2d'), { imageSmoothingEnabled: false });
   }
}

class XSprite extends XObject {
   step: number;
   steps: number;
   textures: (HTMLImageElement | ImageBitmap)[];
   state = { index: 0, active: false, step: 0 };
   constructor (properties: XSpriteProperties = {}) {
      super(properties);
      (({ step = 0, steps = 1, textures = [] }: XSpriteProperties = {}) => {
         this.step = step;
         this.steps = steps;
         this.textures = textures;
      })(properties);
   }
   compute () {
      const texture = this.textures[this.state.index];
      if (texture) {
         return new XVector(texture.width, texture.height);
      } else {
         return new XVector(0, 0);
      }
   }
   disable () {
      this.state.active = false;
      return this;
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      const texture = this.textures[this.state.index];
      texture && context.drawImage(texture, base.x, base.y);
      if (this.steps <= ++this.state.step) {
         this.state.step = 0;
         if (this.state.active && this.textures.length <= ++this.state.index) {
            this.state.index = 0;
         }
      }
   }
   enable () {
      this.state.active = true;
      return this;
   }
   reset () {
      Object.assign(this.state, { active: false, index: 0, step: this.step });
      return this;
   }
   serialize (): Exclude<XSpriteProperties, void> {
      return Object.assign(super.serialize(), {
         step: this.step,
         steps: this.steps,
         textures: this.textures.map(texture => {
            return texture instanceof HTMLImageElement ? texture.cloneNode() as HTMLImageElement : texture;
         })
      });
   }
}

class XText extends XObject {
   content: string;
   spacing: XVector;
   constructor (properties: XTextProperties = {}) {
      super(properties);
      (({ content = '', spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {} }: XTextProperties = {}) => {
         this.content = content;
         this.spacing = new XVector(spacing_x, spacing_y);
      })(properties);
   }
   compute (context: CanvasRenderingContext2D) {
      const lines = this.content.split('\n').map(section => {
         let total = 0;
         for (const char of section.split('')) {
            const width = context.measureText(char).width;
            total += width + this.spacing.x;
         }
         return total;
      });
      const ascent = context.measureText(this.content).actualBoundingBoxAscent;
      return new XVector(Math.max(...lines), ascent + (ascent + this.spacing.y) * (lines.length - 1));
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      let index = 0;
      const lines = this.content.split('\n');
      const state = {
         fillStyle: context.fillStyle,
         globalAlpha: context.globalAlpha,
         globalCompositeOperation: context.globalCompositeOperation,
         lineCap: context.lineCap,
         lineDashOffset: context.lineDashOffset,
         lineJoin: context.lineJoin,
         lineWidth: context.lineWidth,
         miterLimit: context.miterLimit,
         shadowBlur: context.shadowBlur,
         shadowColor: context.shadowColor,
         shadowOffsetX: context.shadowOffsetX,
         shadowOffsetY: context.shadowOffsetY,
         strokeStyle: context.strokeStyle
      };
      const offset = { x: 0, y: 0 };
      const random = { x: 0, y: 0 };
      const ascent = context.measureText(this.content).actualBoundingBoxAscent;
      const height = ascent + (ascent + this.spacing.y) * (lines.length - 1);
      while (index < this.content.length) {
         const char = this.content[index++];
         if (char === '\n') {
            offset.x = 0;
            offset.y += ascent + this.spacing.y;
         } else if (char === '\xa7') {
            const code = this.content.slice(index, this.content.indexOf('\xa7', index));
            const [ key, value ] = code.split(':');
            index += code.length + 1;
            switch (key) {
               case 'alpha':
                  context.globalAlpha = state.globalAlpha * new XNumber(+value).clamp(0, 1).value;
                  break;
               case 'blend':
                  context.globalCompositeOperation = value;
                  break;
               case 'fill':
                  context.fillStyle = value;
                  break;
               case 'line.cap':
                  context.lineCap = value as CanvasLineCap;
                  break;
               case 'line.dash':
                  const lineDash = +value;
                  isNaN(lineDash) || (context.lineDashOffset = lineDash);
                  break;
               case 'line.join':
                  context.lineJoin = value as CanvasLineJoin;
                  break;
               case 'line.miter':
                  const lineMiter = +value;
                  isNaN(lineMiter) || (context.miterLimit = lineMiter);
                  break;
               case 'line.width':
                  const lineWidth = +value;
                  isNaN(lineWidth) || (context.lineWidth = lineWidth);
                  break;
               case 'shadow.blur':
                  const shadowBlur = +value;
                  isNaN(shadowBlur) || (context.shadowBlur = shadowBlur);
                  break;
               case 'shadow.color':
                  context.shadowColor = value;
                  break;
               case 'shadow.offset.x':
                  const shadowOffsetX = +value;
                  isNaN(shadowOffsetX) || (context.shadowOffsetX = shadowOffsetX);
                  break;
               case 'shadow.offset.y':
                  const shadowOffsetY = +value;
                  isNaN(shadowOffsetY) || (context.shadowOffsetY = shadowOffsetY);
                  break;
               case 'offset':
                  const [ offsetX, offsetY ] = value.split(',').map(value => +value);
                  offset.x += offsetX || 0;
                  offset.y += offsetY || 0;
                  break;
               case 'random':
                  const [ randomX, randomY ] = value.split(',').map(value => +value);
                  random.x = randomX || 0;
                  random.y = randomY || 0;
                  break;
               case 'stroke':
                  context.strokeStyle = value;
                  break;
            }
         } else {
            const x = base.x + offset.x + random.x * (Math.random() - 0.5);
            const y = base.y + offset.y + random.y * (Math.random() - 0.5) + height;
            context.fillText(char, x, y);
            context.strokeText(char, x, y);
            const width = context.measureText(char).width;
            offset.x += width + this.spacing.x;
         }
      }
      Object.assign(context, state);
   }
   serialize (): Exclude<XTextProperties, void> {
      return Object.assign(super.serialize(), { content: this.content });
   }
}

class XWalker extends XHitbox {
   objects: [] | [XSprite] = [];
   sprites: XKeyed<XSprite, XCardinal>;
   static axes = [ 'x', 'y' ] as ['x', 'y'];
   constructor (properties: XWalkerProperties = {}) {
      super(properties);
      (({ sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {} }: XWalkerProperties = {}) => {
         this.sprites = {
            down: down instanceof XSprite ? down : new XSprite(down),
            left: left instanceof XSprite ? left : new XSprite(left),
            right: right instanceof XSprite ? right : new XSprite(right),
            up: up instanceof XSprite ? up : new XSprite(up)
         };
      })(properties);
   }
   face (cardinal: XCardinal) {
      const sprite = this.sprites[cardinal];
      if (sprite) {
         this.objects[0] = sprite;
      } else {
         this.objects.shift();
      }
   }
   serialize (): Exclude<XWalkerProperties, void> {
      return Object.assign(super.serialize(), {
         sprites: {
            down: this.sprites.down.serialize(),
            left: this.sprites.left.serialize(),
            right: this.sprites.right.serialize(),
            up: this.sprites.up.serialize()
         }
      });
   }
   walk (offset: X2, renderer: XRenderer, filter: boolean | ((hitbox: XHitbox) => boolean) = false) {
      const source = this.position.serialize();
      const hitboxes = filter ? renderer.calculate(typeof filter === 'function' ? filter : () => true) : [];
      for (const axis of XWalker.axes) {
         const distance = offset[axis];
         if (distance !== 0) {
            this.position[axis] += distance;
            const hits = this.detect(renderer, ...hitboxes);
            if (hits.length > 0) {
               const single = distance / Math.abs(distance);
               while (this.position[axis] !== source[axis] && this.detect(renderer, ...hits).length > 0) {
                  this.position[axis] -= single;
               }
            }
         }
      }
      if (this.position.x === source.x && this.position.y === source.y) {
         if (offset.y > 0) {
            this.face('down');
         } else if (offset.y < 0) {
            this.face('up');
         } else if (offset.x < 0) {
            this.face('left');
         } else if (offset.x > 0) {
            this.face('right');
         }
         this.objects.length === 0 || this.objects[0].disable().reset();
         return false;
      } else {
         if (this.position.y > source.y) {
            this.face('down');
         } else if (this.position.y < source.y) {
            this.face('up');
         } else if (this.position.x < source.x) {
            this.face('left');
         } else if (this.position.x > source.x) {
            this.face('right');
         }
         this.objects.length === 0 || this.objects[0].enable();
         return true;
      }
   }
}

class XRoom {
   layers: XKeyed<XObject[]>;
   region: XRegion;
   constructor (
      {
         layers = {},
         region: [
            { x: min_x = -Infinity, y: min_y = -Infinity } = {},
            { x: max_x = Infinity, y: max_y = Infinity } = {}
         ] = []
      }: XRoomProperties = {}
   ) {
      this.layers = Object.fromEntries(
         Object.entries(layers).map(([ key, objects = [] ]) => {
            return [
               key,
               objects.map(properties => (properties instanceof XObject ? properties : new XObject(properties)))
            ];
         })
      );
      this.region = [ { x: min_x, y: min_y }, { x: max_x, y: max_y } ];
   }
}

const X = {
   async bitmap (source: string, transformer: (color: XColor, position: XVector, size: XVector) => XColor) {
      const image = await X.image(source);
      if (image.width === 0 || image.height === 0) {
         return await createImageBitmap(new ImageData(1, 1));
      } else {
         const context = XRenderer.context(document.createElement('canvas'), image.width, image.height);
         context.drawImage(image, 0, 0);
         const max = image.width * 4;
         const size = new XVector(image.width, image.height);
         const data = context.getImageData(0, 0, image.width, image.height).data.slice();
         const index = new XVector(-1, -1);
         while (++index.x < image.width) {
            const offset = index.x * 4;
            while (++index.y < image.height) {
               let step = index.y * max + offset;
               const color = transformer([ data[step++], data[step++], data[step++], data[step++] ], index, size);
               data[--step] = color[3];
               data[--step] = color[2];
               data[--step] = color[1];
               data[--step] = color[0];
            }
            index.y = -1;
         }
         index.x = -1;
         return await createImageBitmap(new ImageData(data, image.width));
      }
   },
   async buffer (source: string) {
      if (source in X.cache.buffers) {
         return X.cache.buffers[source];
      } else {
         return await new Promise<AudioBuffer>(resolve => {
            const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
            request.addEventListener('load', () => {
               new AudioContext().decodeAudioData(request.response, buffer => {
                  X.cache.buffers[source] = buffer;
                  resolve(buffer);
               });
            });
            request.open('GET', source, true);
            request.send();
         });
      }
   },
   cache: {
      buffers: {} as XKeyed<AudioBuffer>,
      dimensions: {} as XKeyed<[X2, X2, X2, X2]>,
      images: {} as XKeyed<HTMLImageElement>
   },
   game<A extends string, B extends string> (
      properties:
         | ({
              [x in 'alpha' | 'container' | 'debug' | 'framerate' | 'size']?: Exclude<XRendererProperties, void>[x]
           } & {
              layers?: XKeyed<XRendererLayerMode, A> | void;
              player?: XWalker | XWalkerProperties;
              rooms?: Partial<
                 XKeyed<
                    {
                       layers?: Partial<XKeyed<(XObject | XObjectProperties)[], A>> | void;
                       region?: XRegion | void;
                    },
                    B
                 >
              > | void;
           })
         | void
   ) {
      return new class extends XHost<{ teleport: [string | void] }> {
         player: XWalker;
         renderer: XRenderer;
         rooms: XKeyed<XRoom, B>;
         state = { room: void 0 as B | void };
         constructor (
            { alpha, container, debug, framerate, layers, player, rooms = {}, size }: typeof properties = {}
         ) {
            super();
            this.player = player instanceof XWalker ? player : new XWalker(player);
            this.renderer = new XRenderer({ alpha, container, debug, framerate, layers, size });
            this.rooms = Object.fromEntries(
               Object.entries(rooms).map(([ key, properties = {} ]) => [
                  key,
                  properties instanceof XRoom ? properties : new XRoom(properties as XRoomProperties)
               ])
            ) as XKeyed<XRoom, B>;
            this.renderer.on('tick', {
               priority: Infinity,
               listener: () => {
                  Object.assign(this.renderer.camera, this.player.position.serialize());
               }
            });
         }
         async room (value: B | void, fade = 0, unfade = fade) {
            if (typeof this.state.room === 'string' && this.state.room in this.rooms) {
               const room = this.rooms[this.state.room];
               await this.renderer.alpha.modulate(fade, 0);
               for (const key in room.layers) {
                  this.renderer.detach(key, ...room.layers[key]);
               }
            }
            if (typeof value === 'string' && value in this.rooms) {
               const room = this.rooms[value];
               this.renderer.alpha.modulate(unfade, 1);
               for (const key in room.layers) {
                  this.renderer.attach(key, ...this.rooms[value].layers[key]);
               }
               Object.assign(this.renderer.region[0], room.region[0]);
               Object.assign(this.renderer.region[1], room.region[1]);
            }
            this.state.room = value;
            this.fire('teleport', value);
         }
      }(properties);
   },
   async image (source: string) {
      if (source in X.cache.images) {
         return X.cache.images[source];
      } else {
         return await new Promise<HTMLImageElement>(resolve => {
            const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
            request.addEventListener('load', () => {
               const image = document.createElement('img');
               image.addEventListener('load', () => {
                  X.cache.images[source] = image;
                  resolve(image);
               });
               image.src = URL.createObjectURL(new Blob([ new Uint8Array(request.response) ], { type: 'image/jpeg' }));
            });
            request.open('GET', source, true);
            request.send();
         });
      }
   },
   parse (text: string) {
      return JSON.parse(text, (key, value) => {
         if (typeof value === 'string') {
            switch (value[0]) {
               case '!':
                  return value.slice(1);
               case '@':
                  try {
                     return eval(`(${value.slice(1)})`);
                  } catch (error) {
                     try {
                        return eval(`({${value.slice(1)}})`)[key];
                     } catch (error) {
                        return void 0;
                     }
                  }
            }
         } else {
            return value;
         }
      });
   },
   pause (duration = 0) {
      return new Promise<void>(resolve => setTimeout(() => resolve(), duration));
   },
   stringify (value: any) {
      return JSON.stringify(value, (key, value) => {
         if (typeof value === 'string') {
            return `!${value}`;
         } else if (typeof value === 'function') {
            return `@${value}`;
         } else {
            return value;
         }
      });
   }
};
