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

interface AudioParam {
   /** Alter the internal value of this numeric over a specified duration. */
   modulate(duration: number, ...points: number[]): Promise<void>;
}

/** A two-dimensional position. */
type X2 = {
   /** The X value of the position. */
   x: number;
   /** The Y value of the position. */
   y: number;
};

/** The raw properties of an XAtlas object. */
type XAtlasProperties<A extends string = string> = {
   /** The navigators associated with this atlas. */
   navigators?: XKeyed<XNavigator<A>, A> | void;
} | void;

/** An audio asset. */
type XAudio = XAsset<AudioBuffer>;

/** A JSON-serializable object. */
type XBasic = { [k: string]: XBasic } | XBasic[] | string | number | boolean | null | undefined | void;

/** A cardinal direction. */
type XCardinal = 'down' | 'left' | 'right' | 'up';

/** An array of four values, specifying the RED, GREEN, BLUE, and ALPHA values of a color in that order. */
type XColor = [number, number, number, number];

/** An audio daemon, supplier of audio instances. */
type XDaemon = {
   /** The audio source to use. */
   audio: XAudio;
   /** The audio context to use for this daemon. */
   context: AudioContext;
   /** Controls the master volume of the audio being played. */
   gain: number;
   /** Whether or not to loop audio back to the start when it ends. */
   loop: boolean;
   /**
    * Initializes a new audio instance with the daemon's current values and starts it from the beginning. If an offset
    * value is specified, the audio will instead start at the given offset in seconds.
    */
   instance(offset?: number): XInstance;
   /** A list of all initialized instances. */
   instances: XInstance[];
   /**
    * Controls the speed and pitch of the audio being played. A value of `1` will result in no alterations to the
    * source audio, a value of `2` will half the speed and increase the pitch by an octive, etc.
    */
   rate: number;
   /** The audio router to use for this object. */
   router: XRouter;
};

/** A data asset. */
type XData<A extends XBasic = XBasic> = XAsset<A>;

/** Excludes nullish values from the given type. */
type XDefined<A> = Exclude<A, null | undefined | void>;

/** The raw properties of an XHitbox object. */
type XHitboxProperties = XObjectProperties & XProperties<XHitbox, 'size'>;

/** An image asset. */
type XImage = XAsset<HTMLImageElement | ImageBitmap>;

/** The raw properties of an XInput object. */
type XInputProperties = { target?: HTMLElement; codes?: (string | number)[] } | void;

/** An audio instance. */
type XInstance = {
   /** The context used by this instance. */
   context: AudioContext;
   /** The daemon which generated this instance. */
   daemon: XDaemon;
   /** The loop parameter of this instance. */
   loop: boolean;
   /** The gain parameter of this instance. */
   gain: AudioParam;
   /** The rate parameter of this instance. */
   rate: AudioParam;
   /** Stops the instance's audio and throws away the audio. */
   stop(): void;
};

/** An inventory of multiple assets, treated as a single asset. */
type XInventory<A extends XAsset[] = XAsset[]> = XAsset<A>;

/** Specifies an object whose values are of the given type. Can also specify the type of the object's keys. */
type XKeyed<A = any, B extends string = any> = { [x in B]: A };

/** An event handler. Can either be a listener (uses `0` as its priority) or a listener and a custom priority value. */
type XHandler<A extends any[] = any> = ((...data: A) => any) | { listener: (...data: A) => any; priority: number };

/** A valid XNavigator key. A string type refers to a navigator, a null type refers to no navigator, and a void type refers to the current navigator. */
type XNavigatorKey<A extends string = string> = A | null | undefined | void;

/** The raw properties of an XNavigator object. */
type XNavigatorProperties<A extends string = string> = XProperties<XNavigator<A>, 'objects' | 'position'> &
   (
      | {
           [x in 'flip' | 'grid' | 'next' | 'prev']?: XNavigator<A>[x] | void;
        }
      | void
   );

/** The raw properties of an XObject object. XObject object? Golly, that's not confusing at all! */
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
   | 'stroke'
   | 'text'
>;

/** The raw properties of an XPath object. */
type XPathProperties = XObjectProperties &
   XProperties<XPath, 'size'> &
   ({
      /** The path tracer to use for this object. */
      tracer?: XTracer | void;
   } | void);

/** Extracts a "primitive" clone of the given type. */
type XPrimitive<A> =
   // actual primitives
   A extends string | number | boolean | null | undefined
      ? A | void
      : A extends XAudio
      ? XAudio | void
      : A extends AudioParam | XNumber
      ? number | void
      : A extends HTMLElement
      ? HTMLElement
      : A extends XImage[]
      ? XImage[] | void
      : A extends XObject[]
      ? (XObject | XObjectProperties)[] | void
      : A extends XSprite
      ? XSprite | XSpriteProperties | void
      : A extends XVector
      ? { x?: number | void; y?: number | void } | void
      : A extends Map<infer B, infer C>
      ? XPrimitive<{ [x in B & string]?: C }> | void
      : A extends (infer B)[] | Set<infer B>
      ? XPrimitive<B>[] | void
      : A extends XKeyed
      ? Partial<{ [x in keyof A]?: XPrimitive<A[x]> }> | void
      : never;

/** Transforms a subset of class properties into a raw and flexible input format. */
type XProperties<A extends XKeyed, B extends keyof A> = XPrimitive<{ [x in B]: A[x] }>;

/** Expands a type to include both itself and a "provider function" which returns itself. Can also specify which arguments this "provider function" accepts. */
type XProvider<A, B extends any[] = []> = A | ((...args: B) => A);

/** A two-dimensional region, constrained by a minimum and maximum position. */
type XRegion = [X2, X2];

/** The raw properties of an XRectangle object. */
type XRectangleProperties = XObjectProperties & XProperties<XRectangle, 'size'>;

/** An XRenderer layer. */
type XRendererLayer = {
   /** The canvas associated with this layer. */
   canvas: HTMLCanvasElement;
   /**
    * The canvas context associated with this layer. Updates when the renderer's size changes or its container
    * element is resized.
    */
   context: CanvasRenderingContext2D;
   /** The rendering modifiers for this layer. */
   modifiers: XRendererLayerModifier[];
   /** All objects currently being rendered onto this layer. */
   objects: XObject[];
};

/** The type of an XRenderer's layer. */
type XRendererLayerModifier = 'ambient' | 'cumulative' | 'static' | 'vertical';

/** The raw properties of an XRenderer object. */
type XRendererProperties<A extends string = string> = XProperties<
   XRenderer<A>,
   'alpha' | 'camera' | 'container' | 'debug' | 'framerate' | 'region' | 'shake' | 'size'
> &
   ({
      /** Whether or not this renderer should be automatically started upon construction. */
      auto?: boolean | void;
      /** The layers associated with this renderer. */
      layers?: Partial<XKeyed<XRendererLayerModifier[], A>> | void;
   } | void);

/** A function ideally used to route audio from the given source node to the given context's destination. */
type XRouter = (context: AudioContext, input: GainNode) => void;

/** The raw properties of an XSprite object. */
type XSpriteProperties = XObjectProperties &
   XProperties<XSprite, 'crop' | 'frames' | 'step' | 'steps'> &
   ({
      /** Whether or not this sprite should be automatically enabled upon construction. */
      auto?: boolean | void;
   } | void);

/** The raw properties of an XText object. */
type XTextProperties = XObjectProperties & XProperties<XText, 'charset' | 'content' | 'spacing'>;

/** The raw properties of an XTile object. */
type XTileProperties = XSpriteProperties & XProperties<XTile, 'offset' | 'size'>;

/** A function ideally used to trace a path on a canvas. */
type XTracer = (context: CanvasRenderingContext2D, x: number, y: number) => void;

/** An array of three values, specifying the POSITION, ROTATION, and SCALE of a canvas transform in that order. */
type XTransform = [XVector, XNumber, XVector];

/** An event host. The type parameter `A` defines which events this host should fire and listen for. */
class XHost<A extends XKeyed<any[]> = {}> {
   /** This host's internal listener storage map. */
   events: { [B in keyof A]?: XHandler<A[B]>[] } = {};
   /** Fires an event. */
   fire<B extends keyof A> (name: B, ...data: A[B]) {
      const list = this.events[name];
      if (list) {
         return [ ...list.values() ].map(handler => {
            return (typeof handler === 'function' ? handler : handler.listener)(...data);
         });
      } else {
         return [];
      }
   }
   /** Removes an event listener from this host. */
   off<B extends keyof A> (name: B, handler: XHandler<A[B]>) {
      const list = this.events[name];
      if (list) {
         const index = list.indexOf(handler);
         if (index > -1) {
            list.splice(index, 1);
         }
      }
      return this;
   }
   /** Listens for an event and returns a promise that will resolve when the event is next fired. */
   on<B extends keyof A>(name: B): Promise<A[B]>;
   /** Listens for an event at a given priority and returns a promise that will resolve when the event is next fired. */
   on<B extends keyof A>(name: B, priority: number): Promise<A[B]>;
   /** Listens for an event and calls the given listener whenever the event is fired. */
   on<B extends keyof A>(name: B, listener: XHandler<A[B]>): this;
   on<B extends keyof A> (name: B, a2: number | XHandler<A[B]> = 0) {
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
         list!.sort(
            (handler1, handler2) =>
               (typeof handler1 === 'function' ? 0 : handler1.priority) -
               (typeof handler2 === 'function' ? 0 : handler2.priority)
         );
         return this;
      }
   }
   /** Accepts a provider function whose return value is then registered as a listener for a given event. */
   wrapOn<B extends keyof A> (name: B, provider: (host: this) => XHandler<A[B]>) {
      return this.on(name, provider(this));
   }
   /** Accepts a provider function whose return value is then unregistered as a listener for a given event. */
   wrapOff<B extends keyof A> (name: B, provider: (host: this) => XHandler<A[B]>) {
      return this.off(name, provider(this));
   }
}

/** A rendered object. */
class XObject extends XHost<{ tick: [] }> {
   /** The transparency value of this object. Carries over into all child objects. */
   alpha: XNumber;
   /**
    * The positional anchor of this object, which determines the origin point for the object's rotation as well as how
    * this object's final position is computed from its base position.
    * @example
    * // if unspecified, an anchor of (-1, -1) is used by default.
    * // this anchor value will result in the object's dimensions extending down and to the right from its base position.
    * new XObject({});
    *
    * // an anchor of (0, 0) will center the object's dimensions around its base position.
    * new XObject({ anchor: { x: 0, y: 0 } });
    *
    * // an anchor of (1, 1) will result in the object's dimensions extending up and to the left from its base position.
    * new XObject({ anchor: { x: 1, y: 1 } });
    *
    * // the X and Y of an anchor can be independently controlled.
    * // in the following example, the object will be top-aligned and horizontally centered.
    * new XObject({ anchor: { x 0, y: -1 } })
    *
    * // the X and Y of an anchor can also extend beyond 1 and -1, if necessary.
    * // in the following example, the object will be placed a fair distance down and to the left from it's base position.
    * new XObject({ anchor: { x: -5, y: -5 } });
    */
   anchor: XVector;
   /** The composite mode used for this object. Will inherit from parent if undefined. */
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
   /** The canvas fill style for this object. Will inherit from parent if undefined. */
   fill: string | void;
   /** Canvas context properties specific to line drawing. */
   line: {
      /**
       * Controls the value of `lineCap` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
       */
      cap: CanvasLineCap | void;
      /**
       * Controls the value of `lineDashOffset` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
       */
      dash: XNumber | void;
      /**
       * Controls the value of `lineJoin` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
       */
      join: CanvasLineJoin | void;
      /**
       * Controls the value of `miterLimit` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit
       */
      miter: XNumber | void;
      /**
       * Controls the value of `lineWidth` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth
       */
      width: XNumber | void;
   };
   /** Arbitrary metadata associated with this object. */
   metadata: XKeyed<XBasic>;
   /** A list of this object's children. */
   objects: XObject[];
   /**
    * The parallax of this object, which determines the amount of distance to add or remove from this object's base
    * position based on the renderer's camera position. Negative values subtract distance per pixel, while positive
    * values add distance per pixel. A value of (-1, -1) will "cancel out" camera movement, and a value of (1, 1) will
    * cause the object to move twice as fast as the camera moves. The X and Y values can be individually controlled. In
    * addition, the parallax value specified here will impact the base position of all child objects.
    */
   parallax: XVector;
   /** The base position of this object. */
   position: XVector;
   /** The priority value of this object. Higher priority objects are rendered atop lower priority objects. */
   priority: XNumber;
   /** The rotation value of this object, which spins the object around it's anchor point. */
   rotation: XNumber;
   /**
    * The scale of this object. A value of (1, 1) will result in no scaling, a value of (2, 2) will double the size,
    * etc. Negative values will cause the object to appear inverted.
    */
   scale: XVector;
   /** Canvas context properties specific to shadow drawing. */
   shadow: {
      /**
       * Controls the value of `shadowBlur` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
       */
      blur: XNumber | void;
      /**
       * Controls the value of `shadowColor` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor
       */
      color: string | void;
      /** Controls the values of `shadowOffsetX` and `shadowOffsetY` used when drawing this object. */
      offset: {
         /**
          * Controls the value of `shadowOffsetX` used when drawing this object. Will inherit from parent if undefined.
          * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX
          */
         x: XNumber | void;
         /**
          * Controls the value of `shadowOffsetY` used when drawing this object. Will inherit from parent if undefined.
          * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY
          */
         y: XNumber | void;
      };
   };
   /** The canvas stroke style for this object. Will inherit from parent if undefined. */
   stroke: string | void;
   /** Canvas context properties specific to text drawing. */
   text: {
      /**
       * Controls the value of `textAlign` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
       */
      align?: CanvasTextAlign | void;
      /**
       * Controls the value of `textBaseline` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
       */
      baseline?: CanvasTextBaseline | void;
      /**
       * Controls the value of `textDirection` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textDirection
       */
      direction?: CanvasDirection | void;
      /**
       * Controls the value of `font` used when drawing this object. Will inherit from parent if undefined.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
       */
      font?: string | void;
   };
   constructor ({
      alpha = 1,
      anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {},
      blend,
      fill = void 0,
      line: { cap = void 0, dash = void 0, join = void 0, miter = void 0, width = void 0 } = {},
      metadata = {},
      objects = [],
      parallax: { x: parallax_x = 0, y: parallax_y = 0 } = {},
      position: { x: position_x = 0, y: position_y = 0 } = {},
      priority = 0,
      rotation = 0,
      scale: { x: scale_x = 1, y: scale_y = 1 } = {},
      shadow: { blur = void 0, color = void 0, offset: { x: shadow$offset_x = 0, y: shadow$offset_y = 0 } = {} } = {},
      stroke = void 0,
      text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {}
   }: XObjectProperties = {}) {
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
      this.stroke = stroke;
      this.text = { align, baseline, direction, font };
   }
   /**
    * If this object is a hitbox and matches the given filter, its vertices are calculated and it is added to the input
    * list. The `calculate` method is then called on this object's children, and the process repeats until the entire
    * object tree has been iterated over and filtered into the list. The list is then returned.
    */
   calculate (filter: XProvider<boolean, [XHitbox]>, list: XHitbox[], camera: X2, transform: XTransform) {
      const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
      const rotation = transform[1].add(this.rotation);
      const scale = transform[2].multiply(this.scale);
      if (this instanceof XHitbox && X.provide(filter, this)) {
         list.push(this);
         const size = this.size.multiply(scale);
         const half = size.divide(2);
         const base = position.subtract(half.add(half.multiply(this.anchor)));
         const dimensions = `${base.x}:${base.y}:${position.x}:${position.y}:${rotation.value}:${size.x}:${size.y}`;
         if (dimensions !== this.state.dimensions) {
            const offset = rotation.value + 180;
            const corner2 = base.endpoint(0, size.x);
            const corner3 = corner2.endpoint(90, size.y);
            const corner4 = corner3.endpoint(180, size.x);
            this.state.vertices[0] = position
               .endpoint(position.direction(base) + offset, position.distance(base))
               .round(1e3);
            this.state.vertices[1] = position
               .endpoint(position.direction(corner2) + offset, position.distance(corner2))
               .round(1e3);
            this.state.vertices[2] = position
               .endpoint(position.direction(corner3) + offset, position.distance(corner3))
               .round(1e3);
            this.state.vertices[3] = position
               .endpoint(position.direction(corner4) + offset, position.distance(corner4))
               .round(1e3);
            this.state.dimensions = dimensions;
         }
      }
      for (const object of this.objects) {
         object.calculate(filter, list, camera, [ position, rotation, scale ]);
      }
   }
   /** Computes this object's size based on itself and the given canvas context. */
   compute(context: CanvasRenderingContext2D): XVector;
   compute () {
      return new XVector();
   }
   /** Draws this object to the given canvas context. */
   draw(context: CanvasRenderingContext2D, base: XVector): void;
   draw () {}
   /** Renders this object to a context with the given camera position and transform values. */
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
      const rads = (Math.PI / 180) * this.rotation.value;

      context.translate(position.x, position.y);
      context.rotate(rads);
      const matrix = context.getTransform();
      context.scale(this.scale.x, this.scale.y);
      context.translate(-position.x, -position.y);

      context.globalAlpha === 0 || this.draw(context, base);

      if (this.objects.length > 0) {
         for (const object of this.objects) {
            object.render(camera, context, [ position, rotation, scale ], debug);
         }
      }

      if (debug) {
         const previous = context.strokeStyle;
         context.strokeStyle = '#fff8';
         context.strokeRect(base.x, base.y, size.x, size.y);
         context.strokeStyle = previous;
      }

      context.translate(position.x, position.y);
      context.setTransform(matrix);
      context.rotate(-rads);
      context.translate(-position.x, -position.y);

      if (debug && this instanceof XHitbox) {
         // rainbow hitboxes! :D
         context.strokeStyle = `hsla(${(Date.now() % 1000) * 0.25}, 100%, 50%, 0.5)`;

         context.save();
         context.resetTransform();

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

         context.restore();
      }

      Object.assign(context, state);
   }
}

/** An asset, either loaded or not. */
class XAsset<A = any> extends XHost<{ load: []; unload: [] }> {
   /** The asset's loading function. */
   loader: () => Promise<A>;
   /** The asset's source URL. */
   source: string;
   state = { value: void 0 as A | void };
   /** The asset's unloading function. */
   unloader: () => Promise<void>;
   /** A getter for the asset's internal value. Throws an error if the asset is not current loaded. */
   get value () {
      const value = this.state.value;
      if (value === void 0) {
         throw `The asset of "${this.source}" is not currently loaded!`;
      } else {
         return value;
      }
   }
   constructor ({
      loader,
      source,
      unloader
   }: {
      loader: () => Promise<A>;
      source: string;
      unloader: () => Promise<void>;
   }) {
      super();
      this.loader = loader;
      this.source = source;
      this.unloader = unloader;
   }
   /** Loads the asset. */
   async load (force?: boolean) {
      if (force || this.state.value === void 0) {
         this.state.value = await this.loader();
         this.fire('load');
      }
   }
   /** Unloads the asset. */
   async unload (force?: boolean) {
      if (force || this.state.value !== void 0) {
         this.state.value = await this.unloader();
         this.fire('unload');
      }
   }
}

/**
 * The XAtlas class defines a system in which several XNavigator objects are associated with each other. When two
 * navigators share an atlas, those navigators can be traversed between.
 */
class XAtlas<A extends string = string> {
   /** The navigators associated with this atlas. */
   navigators: XKeyed<XNavigator<A>, A>;
   /** This navigator's state. Contains the currently open navigator. */
   state = { navigator: null as XNavigatorKey<A> };
   constructor ({ navigators = {} as XKeyed<XNavigator<A>, A> }: XAtlasProperties<A> = {}) {
      this.navigators = navigators;
   }
   /** Attaches navigators to a specific layer on a renderer. */
   attach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never, ...navigators: A[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].attach(renderer, layer);
      }
   }
   /** Detaches navigators from a specific layer on a renderer. */
   detach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never, ...navigators: A[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].detach(renderer, layer);
      }
   }
   /** Returns the current navigator. */
   navigator () {
      return this.state.navigator ? this.navigators[this.state.navigator] : void 0;
   }
   /** Alters the position of this atlas's current navigator, if any. */
   seek ({ x = 0, y = 0 }: XPrimitive<X2> = {}) {
      const navigator = this.navigator();
      if (navigator) {
         const origin = navigator.selection();
         const row = X.provide(navigator.grid, navigator, this);
         const flip = X.provide(navigator.flip, navigator, this);
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
         origin === navigator.selection() || navigator.fire('move', this, navigator);
      }
   }
   /**
    * This function accepts one of two values, those being `'next'` and `'prev'`. If this atlas has a navigator open,
    * the respective `next` or `prev` property on said open navigator is resolved and the navigator associated with the
    * resolved value is switched to, given it's associated with this atlas.
    */
   navigate (action: 'next' | 'prev') {
      switch (action) {
         case 'next':
         case 'prev':
            const navigator = this.navigator();
            if (navigator) {
               this.switch(X.provide(navigator[action], navigator, this) as XNavigatorKey<A>);
            } else {
               this.switch(null);
            }
      }
   }
   /**
    * Directly switch to a navigator associated with this atlas. If `null` is specified, the current navigator, if any,
    * will be closed. If `void` is specified, then nothing will happen.
    */
   switch (name: XNavigatorKey<A>) {
      if (name !== void 0) {
         let next: XNavigator<A> | null = null;
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

/** A hitbox object. Hitboxes have a defined size and a set of calculated vertices used for hit detection. */
class XHitbox extends XObject {
   /** The current size of this hitbox. */
   size: XVector;
   /** This hitbox's state. Contains the current dimensions and computed vertices, if any. */
   state = { dimensions: void 0, vertices: [] } as
      | { dimensions: void; vertices: [] }
      | { dimensions: string; vertices: [X2, X2, X2, X2] };
   constructor (properties: XHitboxProperties = {}) {
      super(properties);
      (({ size: { x: size_x = 0, y: size_y = 0 } = {} }: XHitboxProperties = {}) => {
         this.size = new XVector(size_x, size_y);
      })(properties);
   }
   /** Calculates the center of this hitbox's vertices. */
   center () {
      const vertices = this.vertices();
      return new XVector(vertices[0]).subtract(vertices[2]).divide(2).add(vertices[2]);
   }
   compute () {
      return this.size;
   }
   /**
    * Detects collision between this hitbox and others.
    * @author bokke1010, harrix432
    */
   detect (renderer: XRenderer, ...hitboxes: XHitbox[]) {
      renderer.calculate(hitbox => hitbox === this);
      const hits: XHitbox[] = [];
      const [ min1, max1 ] = this.region();
      for (const hitbox of hitboxes) {
         if (hitbox.state.dimensions === void 0) {
            continue;
         } else if ((this.size.x === 0 || this.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
            // zero exclusion - if both hitboxes have a volume of zero, treat them as single lines
            const [ min2, max2 ] = hitbox.region();
            if (X.math.intersection(min1, max1, min2, max2)) {
               hits.push(hitbox);
            }
         } else {
            const [ min2, max2 ] = hitbox.region();
            if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
               // aabb minmax exclusion - if the aabb formed by the min and max of both boxes collide, continue
               const vertices1 = this.vertices().map(vertex => new XVector(vertex).round(1000));
               const vertices2 = hitbox.vertices().map(vertex => new XVector(vertex).round(1000));
               if (
                  (vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                  (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)
               ) {
                  // alignment check - if the two boxes are axis-aligned at this stage, they are colliding
                  hits.push(hitbox);
               } else {
                  for (const a1 of vertices1) {
                     let miss = true;
                     const a2 = new XVector(a1).add(new XVector(max2).subtract(min2).multiply(2)).value();
                     for (const [ b1, b2 ] of [
                        [ vertices2[0], vertices2[1] ],
                        [ vertices2[1], vertices2[2] ],
                        [ vertices2[2], vertices2[3] ],
                        [ vertices2[3], vertices2[0] ]
                     ]) {
                        if (X.math.intersection(a1, a2, b1, b2)) {
                           if ((miss = !miss)) {
                              break;
                           }
                        }
                     }
                     if (!miss) {
                        // point raycast - if a line drawn from box1 intersects with box2 only once, there is collision
                        hits.push(hitbox);
                        break;
                     }
                  }
               }
            }
         }
      }
      return hits;
   }
   /** Returns the total height of this hitbox's region. */
   height () {
      const bounds = this.region();
      return bounds[1].y - bounds[0].y;
   }
   /** Calculates the distance from this hitbox's center to any given corner. */
   radius () {
      const vertices = this.vertices();
      return new XVector(vertices[0]).distance(vertices[2]) / 2;
   }
   /**
    * Calculates the minimum and maximum X and Y coordinates that this hitbox intersects with, effectively creating an
    * axis-aligned superstructure around the entirety of this hitbox.
    */
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
   /** Returns the vertices of this hitbox. */
   vertices () {
      if (this.state.dimensions === void 0) {
         throw "This object's vertices are unresolved!";
      } else {
         return this.state.vertices as [X2, X2, X2, X2];
      }
   }
   /** Returns the total width of this hitbox's region. */
   width () {
      const bounds = this.region();
      return bounds[1].x - bounds[0].x;
   }
}

/**
 * Handles mouse and keyboard inputs. Mouse inputs are represented as numeric values, while keyboard inputs are
 * represented by their key name in string form.
 */
class XInput extends XHost<XKeyed<[string | number], 'down' | 'up'>> {
   /** This input's state. Contains the currently active inputs. */
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
   /** Whether or not any of this input's valid codes are in an active state. */
   active () {
      return this.state.codes.size > 0;
   }
}

/**
 * The XNavigator class defines a system in which a grid can specify available options to navigate through. This class
 * doesn't do much without an associated atlas to control it.
 */
class XNavigator<A extends string = string> extends XHost<
   XKeyed<[XAtlas<A>, XNavigatorKey<A>, XNavigator<A> | void], 'from' | 'to'> & { move: [XAtlas<A>, XNavigator<A>] }
> {
   flip: XProvider<boolean, [XNavigator<A>, XAtlas<A>]>;
   grid: XProvider<XBasic[][], [XNavigator<A>, XAtlas<A> | void]>;
   next: XProvider<XNavigatorKey<A>, [XNavigator<A>, XAtlas<A>]>;
   objects: XObject[];
   position: X2;
   prev: XProvider<XNavigatorKey<A>, [XNavigator<A>, XAtlas<A>]>;
   constructor ({
      flip = false,
      grid = [],
      next = void 0,
      objects = [],
      position: { x = 0, y = 0 } = {},
      prev = void 0
   }: XNavigatorProperties<A> = {}) {
      super();
      this.flip = flip;
      this.grid = grid;
      this.next = next;
      this.objects = objects.map(object => (object instanceof XObject ? object : new XObject(object)));
      this.position = { x, y };
      this.prev = prev;
   }
   /** Attaches this navigator's objects to a specific layer on the given renderer. */
   attach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never) {
      renderer.attach(layer, ...this.objects);
   }
   /** Detaches this navigator's objects from a specific layer on the given renderer. */
   detach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never) {
      renderer.detach(layer, ...this.objects);
   }
   /** Returns the value in this navigator's grid at its current position. */
   selection () {
      return (X.provide(this.grid, this)[this.position.x] || [])[this.position.y];
   }
}

/** An object representing a numeric value. */
class XNumber {
   value: number;
   constructor();
   constructor(value: number);
   constructor (value = 0) {
      this.value = value;
   }
   /** Adds another value to this object's value and returns a new `XNumber` object with said value. */
   add (value: number | XNumber = 0): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value + value);
      } else {
         return this.add(value.value);
      }
   }
   /** Returns an `XNumber` object with the ceilinged value of this object's value. */
   ceil () {
      return new XNumber(Math.ceil(this.value));
   }
   /** Clamps this object's value between two numbers and returns a new `XNumber` object with the result as its value. */
   clamp (min: number, max: number) {
      return new XNumber(Math.min(Math.max(this.value, min), max));
   }
   /** Returns a new `XNumber` object with the same value as this object. */
   clone () {
      return new XNumber(this.value);
   }
   /** Divides this object's value by another value and returns a new `XNumber` object with said value. */
   divide (value: number | XNumber = 1): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value / value);
      } else {
         return this.divide(value.value);
      }
   }
   /** Returns an `XNumber` object with the floored value of this object's value. */
   floor () {
      return new XNumber(Math.floor(this.value));
   }
   /** Alter the internal value of this numeric over a specified duration. */
   modulate (duration: number, ...points: number[]) {
      return new Promise<void>(resolve => {
         let index = 0;
         const value = this.value;
         clearInterval(X.cache.modulationTasks.get(this));
         X.cache.modulationTasks.set(
            this,
            setInterval(() => {
               if (index < duration) {
                  this.value = X.math.bezier(index / duration, value, ...points);
                  index += 20;
               } else {
                  this.value = X.math.bezier(1, value, ...points);
                  clearInterval(X.cache.modulationTasks.get(this));
                  resolve();
               }
            }, 20) as any
         );
      });
   }
   /** Multiplies this object's value by another value and returns a new `XNumber` object with said value. */
   multiply (value: number | XNumber = 1): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value * value);
      } else {
         return this.multiply(value.value);
      }
   }
   /** Returns an `XNumber` object with the rounded value of this object's value. */
   round () {
      return Math.round(this.value);
   }
   /** Subtracts another value from this object's value and returns a new `XNumber` object with said value. */
   subtract (value: number | XNumber = 0): XNumber {
      if (typeof value === 'number') {
         return new XNumber(this.value - value);
      } else {
         return this.subtract(value.value);
      }
   }
}

/** A rendered object specifically designed to trace a path on a canvas. */
class XPath extends XObject {
   /** The size to use for this object. */
   size: XVector;
   /** The path tracer to use for this object. */
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
}

/** A rendered object specifically designed to draw a rectangle on a canvas. */
class XRectangle extends XObject {
   /** The size of the rectangle. */
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
}

/**
 * The business end of the Storyteller engine, where objects are rendered to canvases and all is made right with the
 * world. Jokes aside, this class is responsible for canvas and context management.
 */
class XRenderer<A extends string = string> extends XHost<{ tick: [] }> {
   /** The global transparency value all rendered objects should inherit. */
   alpha: XNumber;
   /** This renderer's camera position. */
   camera: XVector;
   /** The HTML element to insert this renderer's canvases into. */
   container: HTMLElement;
   /** Whether or not the debug overlay should be visible. */
   debug: boolean;
   /** The renderer's framerate. A value of 30-60 is recommended. */
   framerate: number;
   /** The renderer's layer map. Each layer has an associated canvas, canvas context, mode, and object list. */
   layers: XKeyed<XRendererLayer, A>;
   /** The minimum and maximum camera position for this renderer. */
   region: XRegion;
   /**
    * A screen-shake multiplier. Increasing this value will increase the amount of "shake" added to the renderer.
    * Setting this value to zero disables the shake effect all together.
    */
   shake: XNumber;
   /**
    * The base size of this renderer, which determines the number of vertical and horizontal pixels are visible
    * on-screen at any given time. In addition, when canvases are inserted into the container element, they are scaled
    * to fit within the container while maintaining the aspect ratio implied by this size.
    */
   size: XVector;
   /**
    * This renderer's state. Contains the last computed camera position, rendering interval timer handle, last known
    * container height, last computed scale, and last known container width.
    */
   state = {
      camera: { x: NaN, y: NaN },
      handle: void 0 as ReturnType<typeof setTimeout> | void,
      height: 0,
      scale: 1,
      width: 0
   };
   constructor ({
      alpha = 1,
      auto = false,
      camera: { x: camera_x = -1, y: camera_y = -1 } = {},
      container = document.body,
      debug = false,
      framerate = 30,
      layers = {},
      region: [
         { x: min_x = -Infinity, y: min_y = -Infinity } = {},
         { x: max_x = Infinity, y: max_y = Infinity } = {}
      ] = [],
      shake = 0,
      size: { x: size_x = 320, y: size_y = 240 } = {}
   }: XRendererProperties<A> = {}) {
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
      this.framerate = framerate;
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
                  context: X.context(canvas),
                  modifiers: value,
                  objects: [] as XObject[]
               }
            ];
         })
      ) as XKeyed<XRendererLayer, A>;
      this.region = [
         { x: min_x, y: min_y },
         { x: max_x, y: max_y }
      ];
      this.shake = new XNumber(shake);
      this.size = new XVector(size_x, size_y);
      auto && this.start();
   }
   /** Attaches objects to a specific layer on this renderer. */
   attach (key: A, ...objects: XObject[]) {
      if (key in this.layers) {
         const layer = this.layers[key];
         layer.modifiers.includes('ambient') && this.refresh();
         for (const object of objects) {
            layer.objects.includes(object) || layer.objects.push(object);
         }
         X.chain(layer as { objects: XObject[] }, (parent, next) => {
            parent.objects.sort((object1, object2) => object1.priority.value - object2.priority.value).forEach(next);
         });
      }
   }
   /**
    * Calls the `calculate` method on all objects in this renderer with the given filter, and returns a list of all
    * computed hitboxes.
    */
   calculate (filter = true as XProvider<boolean, [XHitbox]>) {
      const list: XHitbox[] = [];
      for (const key in this.layers) {
         for (const object of this.layers[key].objects) {
            object.calculate(filter, list, this.camera.clamp(...this.region), X.transform);
         }
      }
      return list;
   }
   /** Completely clears the given layer, detaching all of its objects. */
   clear (key: A) {
      if (key in this.layers) {
         const layer = this.layers[key];
         layer.modifiers.includes('ambient') && this.refresh();
         layer.objects.splice(0, layer.objects.length);
      }
   }
   /** Detaches objects from a specific layer on this renderer. */
   detach (key: A, ...objects: XObject[]) {
      if (key in this.layers) {
         const layer = this.layers[key];
         layer.modifiers.includes('ambient') && this.refresh();
         for (const object of objects) {
            const index = layer.objects.indexOf(object);
            if (index > -1) {
               layer.objects.splice(index, 1);
            }
         }
      }
   }
   /** Reads pixel data from the canvas within a specified range. */
   read (key: A, min: X2, max = new XVector(min).add(1 / this.state.scale)) {
      const resmin = this.resolve(key, min);
      const resmax = this.resolve(key, max);
      const w = Math.floor(resmax.x - resmin.x);
      const data = this.layers[key].context.getImageData(
         Math.floor(resmin.x),
         Math.floor(resmin.y),
         w,
         Math.floor(resmax.y - resmin.y)
      ).data;
      const pixels = data.length / 4;
      const output = [ [] ] as XColor[][];
      let index = 0;
      while (index < pixels) {
         if (output[output.length - 1].push([ ...data.slice(index, index + 4) ] as XColor) === w && ++index < pixels) {
            output.push([]);
         }
      }
      return output;
   }
   /** Resolves the given position to its corresponding pixel position. */
   resolve (key: A, position: X2) {
      const transform = this.layers[key].context.getTransform();
      return {
         x: position.x * this.state.scale + transform.e,
         y: position.y * this.state.scale + transform.f
      };
   }
   /** Restricts the given position to within the camera's scope. */
   restrict (position: X2) {
      return this.size
         .divide(2)
         .subtract(this.camera.clamp(...this.region))
         .add(position);
   }
   /** Starts the rendering loop and stops any previously active loop if applicable. */
   start () {
      this.stop();
      this.state.handle = setInterval(() => this.render(), 1e3 / this.framerate);
   }
   /** Stops the rendering loop if one is active. */
   stop () {
      typeof this.state.handle === 'number' && (this.state.handle = clearInterval(this.state.handle));
   }
   /** Forces an update to all ambient rendering layers. */
   refresh () {
      this.state.camera = { x: NaN, y: NaN };
   }
   /** Renders a single frame. */
   render () {
      this.fire('tick');
      let update = false;
      const camera = this.camera.clamp(...this.region).value();
      this.container.style.opacity = this.alpha.clamp(0, 1).value.toString();
      if (camera.x !== this.state.camera.x || camera.y !== this.state.camera.y) {
         update = true;
         Object.assign(this.state.camera, camera);
      }
      {
         let width = this.container.clientWidth;
         let height = this.container.clientHeight;
         if (width !== this.state.width || height !== this.state.height) {
            update = true;
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
               layer.context = X.context(layer.canvas, width, height);
            }
         }
      }
      for (const key in this.layers) {
         const { context, modifiers, objects } = this.layers[key];
         if (update || !modifiers.includes('ambient')) {
            const scale = this.state.scale;
            const center = this.size.divide(2);
            context.resetTransform();
            modifiers.includes('cumulative') || context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.setTransform(
               scale,
               0,
               0,
               scale,
               scale * (center.x + -(modifiers.includes('static') ? center.x : camera.x)) +
                  (this.shake.value ? scale * this.shake.value * (Math.random() - 0.5) : 0),
               scale * (center.y + -(modifiers.includes('static') ? center.y : camera.y)) +
                  (this.shake.value ? scale * this.shake.value * (Math.random() - 0.5) : 0)
            );
            if (modifiers.includes('vertical')) {
               objects.sort(
                  (object1, object2) =>
                     (object1.priority.value || object1.position.y) - (object2.priority.value || object2.position.y)
               );
            }
            for (const object of objects) {
               object.render(camera, context, X.transform, this.debug);
            }
         }
      }
   }
}

/** A rendered object specifically designed to draw an image or images on a canvas. */
class XSprite extends XObject {
   /** The crop to use when rendering the image. */
   crop: XKeyed<number, 'bottom' | 'left' | 'right' | 'top'>;
   /** The underlying frames of this sprite. */
   frames: XImage[];
   /** The default step value. */
   step: number;
   /** The number of steps per frame. */
   steps: number;
   /**
    * This sprite's state. Contains the index of the currently displayed frame, whether or not the sprite is active, and
    * the current step value.
    */
   state = { index: 0, active: false, step: 0 };
   constructor (properties: XSpriteProperties = {}) {
      super(properties);
      (({
         auto = false,
         crop: { bottom = 0, left = 0, right = 0, top = 0 } = {},
         step = 0,
         steps = 1,
         frames = []
      }: XSpriteProperties = {}) => {
         this.crop = { bottom, left, right, top };
         this.frames = frames;
         this.step = step;
         this.steps = steps;
         auto && (this.state.active = true);
      })(properties);
   }
   compute () {
      const texture = this.frames[this.state.index];
      if (texture) {
         const x = Math.round((this.crop.left < 0 ? texture.value.width : 0) + this.crop.left);
         const y = Math.round((this.crop.top < 0 ? texture.value.height : 0) + this.crop.top);
         const w = Math.round((this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right) - x;
         const h = Math.round((this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom) - y;
         return new XVector(w, h);
      } else {
         return new XVector(0, 0);
      }
   }
   /** Disables the sprite's animation. */
   disable () {
      this.state.active = false;
      return this;
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      const texture = this.frames[this.state.index];
      if (texture) {
         const x = Math.round((this.crop.left < 0 ? texture.value.width : 0) + this.crop.left);
         const y = Math.round((this.crop.top < 0 ? texture.value.height : 0) + this.crop.top);
         const w = Math.round((this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right) - x;
         const h = Math.round((this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom) - y;
         context.drawImage(texture.value, x, y, w, h, base.x, base.y, w, h);
      }
      if (this.steps <= ++this.state.step) {
         this.state.step = 0;
         if (this.state.active && this.frames.length <= ++this.state.index) {
            this.state.index = 0;
         }
      }
   }
   /** Enables the sprite's animation. */
   enable () {
      this.state.active = true;
      return this;
   }
   /** Loads this sprite's frames. */
   async load () {
      await Promise.all(this.frames.map(asset => asset.load()));
   }
   /** Resets the sprite's animation to its default state. */
   reset () {
      Object.assign(this.state, { active: false, index: 0, step: this.step });
      return this;
   }
   /** Unloads this sprite's frames. */
   async unload () {
      await Promise.all(this.frames.map(asset => asset.unload()));
   }
}

/** A rendered object specifically designed to draw text on a canvas. */
class XText extends XObject {
   /* The character set used for text height approximations. */
   charset: string;
   /**
    * The text content to draw. For a detailed guide on how to make the most out of this, please raise an issue telling
    * me (harrix432) to get off my horny ass and make one.
    */
   content: string;
   /** The vertical and horizontal spacing of the rendered text. */
   spacing: XVector;
   constructor (properties: XTextProperties = {}) {
      super(properties);
      (({
         charset = '/0123456789=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
         content = '',
         spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {}
      }: XTextProperties = {}) => {
         this.charset = charset;
         this.content = content;
         this.spacing = new XVector(spacing_x, spacing_y);
      })(properties);
   }
   compute (context: CanvasRenderingContext2D) {
      const lines = this.content.split('\n').map(section => {
         let total = 0;
         for (const char of section) {
            total += context.measureText(char).width + this.spacing.x;
         }
         return total;
      });
      const metrics = context.measureText(this.charset);
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      return new XVector(Math.max(...lines), height + (height + this.spacing.y) * (lines.length - 1));
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      let index = 0;
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
      const phase = Date.now() / 1000;
      const offset = { x: 0, y: 0 };
      const random = { x: 0, y: 0 };
      const swirl = { p: 0, r: 0, s: 0 };
      const metrics = context.measureText(this.charset);
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      while (index < this.content.length) {
         const char = this.content[index++];
         if (char === '\n') {
            offset.x = 0;
            offset.y += height + this.spacing.y;
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
                  offset.x = offsetX || 0;
                  offset.y = offsetY || 0;
                  break;
               case 'random':
                  const [ randomX, randomY ] = value.split(',').map(value => +value);
                  random.x = randomX || 0;
                  random.y = randomY || 0;
                  break;
               case 'stroke':
                  context.strokeStyle = value;
                  break;
               case 'swirl':
                  // period, radius, speed (rotations per second)
                  const [ swirlR, swirlS, swirlP ] = value.split(',').map(value => +value);
                  swirl.r = swirlR || 0;
                  swirl.s = swirlS || 0;
                  swirl.p = swirlP || 0;
                  break;
            }
         } else {
            let x = base.x + offset.x + random.x * (Math.random() - 0.5);
            let y = base.y + offset.y + random.y * (Math.random() - 0.5) + height;
            if (swirl.s > 0 && swirl.r > 0) {
               const endpoint = new XVector(x, y).endpoint(
                  ((phase * 360 * swirl.s) % 360) + index * (360 / swirl.p),
                  swirl.r
               );
               x = endpoint.x;
               y = endpoint.y;
            }
            context.fillText(char, x, y);
            context.strokeText(char, x, y);
            offset.x += context.measureText(char).width + this.spacing.x;
         }
      }
      Object.assign(context, state);
   }
}

class XTile extends XSprite {
   offset: XVector;
   size: XVector;
   constructor (properties: XTileProperties = {}) {
      super(properties);
      (({
         offset: { x: offset_x = 0, y: offset_y = 0 } = {},
         size: { x: size_x = 0, y: size_y = 0 } = {}
      }: XTileProperties = {}) => {
         this.offset = new XVector(offset_x, offset_y);
         this.size = new XVector(size_x, size_y);
      })(properties);
   }
   compute () {
      return this.size;
   }
   draw (context: CanvasRenderingContext2D, base: XVector) {
      const texture = this.frames[this.state.index];
      texture &&
         context.drawImage(
            texture.value,
            this.offset.x,
            this.offset.y,
            this.size.x,
            this.size.y,
            base.x,
            base.y,
            this.size.x,
            this.size.y
         );
      if (this.steps <= ++this.state.step) {
         this.state.step = 0;
         if (this.state.active && this.frames.length <= ++this.state.index) {
            this.state.index = 0;
         }
      }
   }
}

/** An object representing a two-dimensional positional value. */
class XVector {
   /** The X value of the underlying position. */
   x: number;
   /** The Y value of the underlying position. */
   y: number;
   constructor();
   constructor(x: number, y: number);
   constructor(a1: number | X2);
   constructor (a1: number | X2 = 0, y = a1 as number) {
      if (typeof a1 === 'number') {
         this.x = a1;
         this.y = y;
      } else {
         (this.x = a1.x || 0), (this.y = a1.y || 0);
      }
   }
   /** Adds another position to this object's position and returns a new `XVector` object with said position. */
   add(x: number, y: number): XVector;
   add(a1: number | X2): XVector;
   add (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x + a1, this.y + y);
      } else {
         return this.add(a1.x, a1.y);
      }
   }
   /** Clamps this object's position within a region and returns a new `XVector` object with the result as its position. */
   clamp (min: X2, max: X2) {
      return new XVector(new XNumber(this.x).clamp(min.x, max.x).value, new XNumber(this.y).clamp(min.y, max.y).value);
   }
   /** Returns a new `XVector` object with the same position as this object. */
   clone () {
      return new XVector(this);
   }
   /** Calculates the relative direction from this object's position and another position. */
   direction (vector: X2) {
      return (180 / Math.PI) * Math.atan2(this.y - vector.y, this.x - vector.x);
   }
   /** Calculates the distance between this object's position and another position. */
   distance (vector: X2) {
      return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
   }
   /** Divides this object's position by another position and returns a new `XVector` object with said position. */
   divide(x: number, y: number): XVector;
   divide(a1: number | X2): XVector;
   divide (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x / a1, this.y / y);
      } else {
         return this.divide(a1.x, a1.y);
      }
   }
   /**
    * Calculates the position in a specific direction and at a specific distance from this object's position and returns
    * a new `XVector` object with the result as its position.
    */
   endpoint (direction: number, distance: number) {
      const radians = (((direction + 90) % 360) * Math.PI) / 180;
      return new XVector(
         this.x + distance * Math.sin(Math.PI - radians),
         this.y + distance * Math.cos(Math.PI - radians)
      );
   }
   /** Alter the internal value of this positional over a specified duration. */
   modulate (duration: number, ...points: X2[]) {
      return new Promise<void>(resolve => {
         let index = 0;
         const x = this.x;
         const y = this.y;
         clearInterval(X.cache.modulationTasks.get(this));
         X.cache.modulationTasks.set(
            this,
            setInterval(() => {
               if (index < duration) {
                  this.x = X.math.bezier(index / duration, x, ...points.map(point => point.x));
                  this.y = X.math.bezier(index / duration, y, ...points.map(point => point.y));
                  index += 20;
               } else {
                  this.x = X.math.bezier(1, x, ...points.map(point => point.x));
                  this.y = X.math.bezier(1, y, ...points.map(point => point.y));
                  clearInterval(X.cache.modulationTasks.get(this));
                  resolve();
               }
            }, 20) as any
         );
      });
   }
   /** Multiplies this object's position by another position and returns a new `XVector` object with said position. */
   multiply(x: number, y: number): XVector;
   multiply(a1: number | X2): XVector;
   multiply (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x * a1, this.y * y);
      } else {
         return this.multiply(a1.x, a1.y);
      }
   }
   /** Returns an `XVector` object with the rounded position of this object's position. */
   round (base?: number): XVector {
      return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
   }
   /** Subtracts another position from this object's position and returns a new `XVector` object with said position. */
   subtract(x: number, y: number): XVector;
   subtract(a1: number | X2): XVector;
   subtract (a1: number | X2, y = a1 as number) {
      if (typeof a1 === 'number') {
         return new XVector(this.x - a1, this.y - y);
      } else {
         return this.subtract(a1.x, a1.y);
      }
   }
   /** Returns the raw values of this object's position. */
   value () {
      return { x: this.x, y: this.y };
   }
}

const X = {
   /** Gets an `AudioBuffer` from the given source URL. */
   audio (source: string) {
      if (source in X.cache.audios) {
         return X.cache.audios[source];
      } else {
         return (X.cache.audios[source] = new Promise<AudioBuffer>(resolve => {
            const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
            request.addEventListener('load', () => new AudioContext().decodeAudioData(request.response, resolve));
            request.open('GET', source, true);
            request.send();
         }));
      }
   },
   /** Returns an asset for a given audio source. */
   audioAsset (
      /** The audio's source. */
      source: string,
      {
         /**
          * The extra duration in which to keep this asset's source audio in memory after this asset and all of its
          * siblings (other assets which share this asset's source audio) are unloaded.
          */
         cache = 0,
         /** The data modifier to apply to the audio. */
         transformer = void 0 as ((value: number, index: XVector, total: X2) => number) | void,
         /** The trim to apply to the audio. */
         trim: { start = 0, stop = 0 } = {}
      } = {}
   ): XAudio {
      const asset = new XAsset({
         async loader () {
            const assets = X.cache.audioAssets[source] || (X.cache.audioAssets[source] = []);
            assets.includes(asset) || assets.push(asset);
            const audio = await X.audio(source);
            if (start || stop || transformer) {
               const c = audio.numberOfChannels;
               const b = Math.round(audio.sampleRate * ((start < 0 ? audio.duration : 0) + start));
               const l = Math.round(audio.sampleRate * ((stop < 0 ? 0 : audio.duration) - stop)) - b;
               const index = new XVector(-1);
               const clone = new AudioBuffer({ length: l, numberOfChannels: c, sampleRate: audio.sampleRate });
               while (++index.y < c) {
                  const data = audio.getChannelData(index.y).slice(b, b + l);
                  if (transformer) {
                     const total = { x: c, y: l };
                     while (++index.x < l) {
                        data[index.x] = transformer(data[index.x], index, total);
                     }
                     index.x = -1;
                  }
                  clone.copyToChannel(data, index.y);
               }
               return clone;
            } else {
               return audio;
            }
         },
         source,
         async unloader () {
            const assets = X.cache.audioAssets[source] || (X.cache.audioAssets[source] = []);
            X.pause(cache).then(() => {
               assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
               if (assets.length === 0) {
                  delete X.cache.audios[source];
               }
            });
         }
      });
      return asset;
   },
   /** A cache for various types of resources. */
   cache: {
      /** Stores promises for all audio requests. */
      audios: {} as XKeyed<Promise<AudioBuffer>>,
      /** All loaded assets attached to any given cached audio. */
      audioAssets: {} as XKeyed<XAudio[]>,
      /** Stores promises for all data requests. */
      datas: {} as XKeyed<Promise<XBasic>>,
      /** All loaded assets attached to any given cached data. */
      dataAssets: {} as XKeyed<XData[]>,
      /** Stores promises for all image requests. */
      images: {} as XKeyed<Promise<HTMLImageElement>>,
      /** All loaded assets attached to any given cached image. */
      imageAssets: {} as XKeyed<XImage[]>,
      /** Stores all active modulation tasks for any `AudioParam`, `XNumber`, or `XVector` objects. */
      modulationTasks: new Map<AudioParam | XNumber | XVector, number>()
   },
   /** A recursive operator function. */
   chain<A, B> (input: A, handler: (input: A, loop: (input: A) => B) => B) {
      const loop = (input: A) => handler(input, loop);
      return loop(input);
   },
   /** Sets the given canvas to the specified size and generates a new `CanvasRenderingContext2D` from it. */
   context (canvas: HTMLCanvasElement, width = 1, height = 1) {
      return Object.assign(Object.assign(canvas, { width, height }).getContext('2d'), { imageSmoothingEnabled: false });
   },
   /** Gets an `XBasic` from the given source URL. */
   data (source: string) {
      if (source in X.cache.datas) {
         return X.cache.datas[source];
      } else {
         return (X.cache.datas[source] = fetch(source).then(value => value.json() as Promise<XBasic>));
      }
   },
   /** Returns an asset for a given data source. */
   dataAsset<A extends XBasic = XBasic> (
      /** The data's source. */
      source: string,
      {
         /**
          * The extra duration in which to keep this asset's source data in memory after this asset and all of its
          * siblings (other assets which share this asset's source data) are unloaded.
          */
         cache = 0,
         /** The pixel shader to apply to the image. */
         modifier = void 0 as ((data: XBasic) => A) | void
      } = {}
   ): XData<A> {
      const asset = new XAsset<A>({
         async loader () {
            const assets = X.cache.dataAssets[source] || (X.cache.dataAssets[source] = []);
            assets.includes(asset) || assets.push(asset);
            const data = await X.data(source);
            if (modifier) {
               return modifier(data);
            } else {
               return data as A;
            }
         },
         source,
         async unloader () {
            const assets = X.cache.dataAssets[source] || (X.cache.dataAssets[source] = []);
            X.pause(cache).then(() => {
               assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
               if (assets.length === 0) {
                  delete X.cache.datas[source];
               }
            });
         }
      });
      return asset;
   },
   /** Gets an `HTMLImageElement` from the given source URL. */
   image (source: string) {
      if (source in X.cache.images) {
         return X.cache.images[source];
      } else {
         return (X.cache.images[source] = new Promise<HTMLImageElement>(resolve => {
            const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
            request.addEventListener('load', () => {
               const image = document.createElement('img');
               image.addEventListener('load', () => resolve(image));
               image.src = URL.createObjectURL(new Blob([ new Uint8Array(request.response) ], { type: 'image/jpeg' }));
            });
            request.open('GET', source, true);
            request.send();
         }));
      }
   },
   /** Returns an asset for a given image source. */
   imageAsset (
      /** The image's source. */
      source: string,
      {
         /**
          * The extra duration in which to keep this asset's source image in memory after this asset and all of its
          * siblings (other assets which share this asset's source image) are unloaded.
          */
         cache = 0,
         /** The pixel shader to apply to the image. */
         shader = void 0 as ((color: XColor, index: X2, total: X2) => XColor) | void
      } = {}
   ): XImage {
      const asset = new XAsset({
         async loader () {
            const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
            assets.includes(asset) || assets.push(asset);
            const image = await X.image(source);
            if (image.width === 0 || image.height === 0) {
               return await createImageBitmap(new ImageData(1, 1));
            } else if (shader) {
               const context = X.context(document.createElement('canvas'), image.width, image.height);
               context.drawImage(image, 0, 0);
               const { data } = context.getImageData(0, 0, image.width, image.height);
               const x4 = image.width * 4;
               const index = { x: -1, y: -1 };
               const total = { x: image.width, y: image.height };
               while (++index.x < image.width) {
                  const n4 = index.x * 4;
                  while (++index.y < image.height) {
                     let step = index.y * x4 + n4;
                     const color = shader([ data[step++], data[step++], data[step++], data[step++] ], index, total);
                     data[--step] = color[3];
                     data[--step] = color[2];
                     data[--step] = color[1];
                     data[--step] = color[0];
                  }
                  index.y = -1;
               }
               return await createImageBitmap(new ImageData(data, image.width));
            } else {
               return image;
            }
         },
         source,
         async unloader () {
            const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
            X.pause(cache).then(() => {
               assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
               if (assets.length === 0) {
                  X.cache.images[source].then(image => URL.revokeObjectURL(image.src));
                  delete X.cache.images[source];
               }
            });
         }
      });
      return asset;
   },
   /** Returns an inventory. */
   inventory<A extends XAsset[]> (...assets: A): XInventory<A> {
      return new XAsset({
         async loader () {
            return await Promise.all(assets.map(asset => asset.load())).then(() => assets);
         },
         source: assets.map(asset => asset.source).join('//'),
         async unloader () {
            await Promise.all(assets.map(asset => asset.unload()));
         }
      });
   },
   /** Various math-related methods used throughout the engine. */
   math: {
      /** Calculates the value of a position on an polynomial bezier curve. */
      bezier (value: number, ...points: number[]): number {
         return points.length > 1
            ? X.math.bezier(
                 value,
                 ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value)
              )
            : points[0] || 0;
      },
      /** Checks if two line segments intersect. */
      intersection (a1: X2, a2: X2, b1: X2, b2: X2) {
         return (
            X.math.rotation(a1, b1, b2) !== X.math.rotation(a2, b1, b2) &&
            X.math.rotation(a1, a2, b1) !== X.math.rotation(a1, a2, b2)
         );
      },
      /** Rotates a line segment for optimized intersection checking. */
      rotation (a1: X2, a2: X2, a3: X2) {
         return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
      },
      /** Maps a value to a sine wave with a 0-1 input and output range. */
      wave (value: number) {
         return Math.sin(((value + 0.5) * 2 - 1) * Math.PI) / 2 + 0.5;
      }
   },
   /** Parses JS objects previously stringified with `X.stringify()` */
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
               case '#':
                  return eval(value);
            }
         } else {
            return value;
         }
      });
   },
   provide<A extends XProvider<unknown, unknown[]>> (
      provider: A,
      ...args: A extends XProvider<any, infer B> ? B : never
   ): A extends XProvider<infer B, any[]> ? B : never {
      return typeof provider === 'function' ? provider(...args) : provider;
   },
   /** Returns a promise that will resolve after the specified duration in milliseconds. */
   pause (duration = 0) {
      return new Promise<void>(resolve => setTimeout(() => resolve(), duration));
   },
   /** Returns an audio daemon for generating audio player instances. */
   daemon (
      audio: XAudio,
      {
         /** The AudioContext to use for this daemon. */
         context = new AudioContext(),
         /** The base gain of this player. */
         gain = 1,
         /** Whether or not this player's instances should loop by default. */
         loop = false,
         /** The base playback rate of this player. */
         rate = 1,
         /** The audio router to use for this object. */
         router = ((context: AudioContext, input: GainNode) => input.connect(context.destination)) as XRouter
      } = {}
   ) {
      const daemon: XDaemon = {
         audio,
         context,
         gain,
         instance (offset = 0) {
            // initialize values
            const context = daemon.context;
            const gain = context.createGain();
            const source = context.createBufferSource();

            // set defaults
            gain.gain.value = daemon.gain;
            source.buffer = daemon.audio.value;
            source.loop = daemon.loop;
            source.playbackRate.value = daemon.rate;

            // establish connections
            daemon.router(context, gain);
            source.connect(gain);
            source.start(0, offset);

            // return controller
            return {
               context,
               daemon,
               gain: gain.gain,
               get loop () {
                  return source.loop;
               },
               set loop (value) {
                  source.loop = value;
               },
               rate: source.playbackRate,
               stop () {
                  source.stop();
                  source.disconnect();
                  source.buffer = null;
               }
            };
         },
         instances: [] as XInstance[],
         loop,
         rate,
         router
      };
      return daemon;
   },
   /** Converts JS objects to JSON with support for functions, undefined values, infinity, and nan values. */
   stringify (value: any) {
      return JSON.stringify(value, (key, value) => {
         switch (value) {
            case +Infinity:
               return '#+Infinity';
            case -Infinity:
               return '#-Infinity';
            default:
               switch (typeof value) {
                  case 'bigint':
                     return `#${value}n`;
                  case 'function':
                     return `@${value}`;
                  case 'number':
                     return value === value ? value : '#NaN';
                  case 'string':
                     return `!${value}`;
                  default:
                     return value;
               }
         }
      });
   },
   /** The inital transform used in rendering and vertex calculations. */
   transform: [ new XVector(), new XNumber(), new XVector(1) ] as XTransform
};

Object.assign(AudioParam.prototype, {
   modulate (duration: number, ...points: number[]) {
      return XNumber.prototype.modulate.call(this, duration, ...points);
   }
});
