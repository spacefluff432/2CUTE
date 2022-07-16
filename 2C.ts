/////////////////////////////////////////////////////////////////
//                                                             //
//    ::::::::   ::::::::  :::    ::: ::::::::::: ::::::::::   //
//   :+:    :+: :+:    :+: :+:    :+:     :+:     :+:          //
//         +:+  +:+        +:+    +:+     +:+     +:+          //
//       +#+    +#+        +#+    +:+     +#+     +#++:++#     //
//     +#+      +#+        +#+    +#+     +#+     +#+          //
//    #+#       #+#    #+# #+#    #+#     #+#     #+#          //
//   ##########  ########   ########      ###     ##########   //
//                                                             //
//// needs more optimizating ////////////////////////////////////

declare const PIXI: typeof import('pixi.js-legacy');

interface AudioParam {
   modulate(duration: number, ...points: number[]): Promise<void>;
}

type PBaseTexture = import('pixi.js-legacy').BaseTexture;
type PBitmapFont = import('pixi.js-legacy').BitmapFont;
type PCanvasRenderer = import('pixi.js-legacy').CanvasRenderer;
type PExtract = import('pixi.js-legacy').Extract;
type PRenderer = import('pixi.js-legacy').Renderer;
type PResource = import('pixi.js-legacy').Resource;
type PTextStyle = import('pixi.js-legacy').TextStyle;
type PTexture = import('pixi.js-legacy').Texture<PResource>;

/** A raw vector. */
type X2 = {
   /** The vector's X-value. */
   x: number;
   /** The vector's Y-value. */
   y: number;
};

/** The data structure of animation resources. */
type XAnimationData<A extends string = string> = {
   /** The animation's frame data. */
   frames: {
      /** The frame's duration. */
      duration: number;
      /** The frame's base position and size. */
      frame: {
         /** The frame's base X-coordinate. */
         x: number;
         /** The frame's base Y-coordinate. */
         y: number;
         /** The frame's width. */
         w: number;
         /** The frame's height. */
         h: number;
      };
   }[];
   /** The animation's metadata. */
   meta: {
      /** The animation's tags. */
      frameTags: {
         /** The tag's name. */
         name: A;
         /** The tag's first frame index. */
         from: number;
         /** The tag's last frame index. */
         to: number;
      }[];
      /** The animation's size. */
      size: {
         /** The animation's width. */
         w: number;
         /** The animation's height. */
         h: number;
      };
   };
};

/** Properties for the `XAnimation` class. */
type XAnimationProperties = XNot<XSpriteProperties, 'crop' | 'frames' | 'steps'> & {
   /** Determines the animation's crop area. Refer to XSprite's `crop` for more information. */
   subcrop?: Partial<XKeyed<number, XSide>>;
   /** The framerate used to calculate the animation's frame timings. Defaults to `30`. */
   framerate?: number;
   /** The animation's resources. */
   resources?: XAnimationResources | null;
   /** Disables frame timing calculations for this animation. Defaults to `false`. */
   stepper?: boolean;
};

/**
 * An animation's resources.
 * @example
 * const resources = X.inventory(X.dataAsset('animation-data.json'), X.imageAsset('animation.png')) as XAnimationResources
 */
type XAnimationResources = XInventory<[XData<XAnimationData>, XImage]>;

/** Properties for the `XAtlas` class. */
type XAtlasProperties<A extends string = string> = {
   /** The navigators available to this atlas. */
   navigators?: XKeyed<XNavigator<A>, A> | void;
} | void;

/** An audio asset. */
type XAudio = XAsset<AudioBuffer>;

/** Serializable data. */
type XBasic =
   | {
        [k: string]: XBasic;
     }
   | XBasic[]
   | string
   | number
   | boolean
   | null
   | undefined
   | void;

/** A cardinal direction. */
type XCardinal = 'down' | 'left' | 'right' | 'up';

/** A character object's preset. */
type XCharacterPreset = XKeyed<XKeyed<XSprite, 'down' | 'left' | 'up' | 'right'>, 'walk' | 'talk'>;

/** Properties for the `XCharacter` class. */
type XCharacterProperties = XNot<XEntityProperties, 'sprites'> & {
   /** The character's preset. */
   preset: XCharacterPreset;
   /** The character's key, useful for dialogue animations and object filtering. */
   key: string;
};

/** Color data, in the form of `[R (0-255), G (0-255), B (0-255), A (0-1)]`. */
type XColor = [number, number, number, number];

/** An audio daemon. This is the preferred way to play audio. */
type XDaemon = {
   /** The daemon's audio asset. */
   audio: XAudio;
   /** The context used to play the audio. */
   context: AudioContext;
   /** The default gain value for all created instances. */
   gain: number;
   /** The default loop value for all created instances. */
   loop: boolean;
   /** Creates an instance and plays the audio. */
   instance(
      /** The start time offset in seconds. Defaults to `0`. */
      offset?: number,
      /** Store this instance in its daemon's `instances` array. Defaults to `false`. */
      store?: boolean
   ): XInstance;
   /** An array of stored instances. Instances in this array should not be removed directly -- instead, call the `stop` method on each instance you want to remove. */
   instances: XInstance[];
   /** The default rate vale for all created instances. */
   rate: number;
   /** This daemon's audio router. */
   router: XRouter;
};

/** A data asset. */
type XData<A extends XBasic = XBasic> = XAsset<A>;

/** Excludes `null`, `undefined`, and `void` from the given type. */
type XDefined<A> = Exclude<A, null | undefined | void>;

/** Properties for the `XEntity` class. */
type XEntityProperties = XNot<XHitboxProperties, 'objects'> & XProperties<XEntity, 'sprites' | 'step'>;

/** Factor data, in the form of `[quality, zoom]`. These properties are generally extrapolated from an `XRenderer`. */
type XFactor = [number, number];

/** An `XHost` event handler. */
type XHandler<A extends any[] = any> = ((...data: A) => any) | { listener: (...data: A) => any; priority: number };

/** Properties for the `XHitbox` class. */
type XHitboxProperties = XObjectProperties & XProperties<XHitbox, 'size'>;

/** An image asset. */
type XImage = XAsset<PBaseTexture>;

/** Properties for the `XInput` class. */
type XInputProperties = {
   /** The keycodes to listen for. */
   codes?: string[];
   /** The element to attach event listeners to. Defaults to `window`. */
   target?: HTMLElement;
} | void;

/** An audio instance created by an audio daemon. */
type XInstance = {
   /** The instance's context. */
   context: AudioContext;
   /** The instance's parent daemon. */
   daemon: XDaemon;
   /** While true, the audio will loop back to the start upon ending. In practice, it's better to set this value as a default in the instance's daemon. */
   loop: boolean;
   /** The instance's current volume. */
   gain: AudioParam;
   /** The instance's current playback speed. This value also affects the pitch of the audio since it changes the sampling rate. */
   rate: AudioParam;
   /** Stops the audio instance and removes it from its daemon's `instances` array if previously stored there. */
   stop(): void;
};

/** Groups assets together so they can be batch-loaded and batch-unloaded. */
type XInventory<A extends XAsset[] = XAsset[]> = XAsset<A>;

/** An object with strictly-defined keys. */
type XKeyed<A = any, B extends string = any> = { [x in B]: A };

/** A valid navigator key, used in `XAtlas` navigation functions. */
type XNavigatorKey<A extends string = string> = A | null | undefined | void;

/** Properties for the `XNavigator` class. */
type XNavigatorProperties<A extends string = string> = XProperties<XNavigator<A>, 'objects' | 'position'> &
   ({ [x in 'flip' | 'grid' | 'next' | 'prev']?: XNavigator<A>[x] | void } | void);

/** Excludes keys from an object. */
type XNot<A, B extends string> = { [x in Exclude<keyof XDefined<A>, B>]?: XDefined<A>[x] };

/** Properties for the `XObject` class. */
type XObjectProperties = XProperties<
   XObject,
   | 'alpha'
   | 'anchor'
   | 'blend'
   | 'fill'
   | 'friction'
   | 'gravity'
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
   | 'velocity'
>;

/** Properties for the `XPath` class. */
type XPathProperties = XObjectProperties & XProperties<XPath, 'size'> & ({ tracer?: XTracer | void } | void);

/** Properties for the `XPlayer` class. */
type XPlayerProperties = XEntityProperties & XProperties<XPlayer, 'extent'>;

/** Recursively converts common engine components into their primitive forms where possible. */
type XPrimitive<A> = A extends string | number | boolean | null | undefined
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

/** Extrapolates a properties object. */
type XProperties<A extends XKeyed, B extends keyof A> = XPrimitive<{ [x in B]: A[x] }>;

/** A type, a function returning said type, a function returning said function, and so on. */
type XProvider<A, B extends any[] = []> = A | ((...args: B) => XProvider<A>);

/** A min-max region, in the form of `[{ x: minX, y: minY }, { x: maxX, y: maxY }]`. Used for camera boundaries and collision detection. */
type XRegion = [X2, X2];

/** Properties for the `XRectangle` class. */
type XRectangleProperties = XObjectProperties & XProperties<XRectangle, 'size'>;

/** A rendering layer. */
type XRendererLayer = {
   /** The active state of this layer. */
   active: boolean;
   /** The canvas targeted by the layer. */
   canvas: HTMLCanvasElement;
   /** The layer's modifiers. */
   modifiers: XRendererLayerModifier[];
   /** The objects currently present on the layer. */
   objects: XObject[];
   /** The layer's internal renderer. */
   renderer: PRenderer | PCanvasRenderer | PCanvasRenderer;
};

/** A layer modifier. `ambient` prevents the layer from updating unless the renderer's camera, scale, canvas size, or quality value changes. `static` makes the layer ignore the camera position. `vertical` will automatically sort the layer's objects by their `Y` position (overridable with `priority`) before each frame. */
type XRendererLayerModifier = 'ambient' | 'static' | 'vertical';

/** Properties for the `XRenderer` class. */
type XRendererProperties<A extends string = string> = XProperties<
   XRenderer<A>,
   'alpha' | 'camera' | 'container' | 'framerate' | 'region' | 'shake' | 'size' | 'quality' | 'zoom'
> &
   ({ auto?: boolean | void; layers?: Partial<XKeyed<XRendererLayerModifier[], A>> | void } | void);

/** Extrapolates a promise result. */
type XResult<A> = A extends () => Promise<infer B> ? B : never;

/** An audio router. Useful for adding effects to audio before they reach the context. */
type XRouter = (context: AudioContext, input: GainNode) => void;

/** A rectangular side. */
type XSide = 'bottom' | 'left' | 'right' | 'top';

/** Properties for the `XSprite` class. */
type XSpriteProperties = XObjectProperties &
   XProperties<XSprite, 'crop' | 'step' | 'steps'> &
   ({
      /** Enables the sprite upon creation. Defaults to `false`. */
      auto?: boolean | void;
      /** An array of image assets to use as frames. */
      frames?: (XImage | null)[];
   } | void);

/** Rendering style, used during the rendering loop to determine colors, lines, and other variables in rendered objects. In practice, this object is not modified directly, but rather by properties on rendered objects such as `fill`, `text.font`, and `line.width`, among others. */
type XStyle = {
   globalAlpha: number;
   globalCompositeOperation: GlobalCompositeOperation;
   fillStyle: string;
   lineCap: CanvasLineCap;
   lineDashOffset: number;
   lineJoin: CanvasLineJoin;
   miterLimit: number;
   lineWidth: number;
   shadowBlur: number;
   shadowColor: string;
   shadowOffsetX: number;
   shadowOffsetY: number;
   strokeStyle: string;
   textAlign: CanvasTextAlign;
   textBaseline: CanvasTextBaseline;
   direction: CanvasDirection;
   font: string;
};

/** Properties for the `XText` class. */
type XTextProperties = XObjectProperties & XProperties<XText, 'cache' | 'charset' | 'content' | 'spacing'>;

/** A tracer function, used in the rendering of `XPath` objects. */
type XTracer = (
   /** The internal renderer of the path. */
   renderer: PRenderer | PCanvasRenderer,
   /** The current transform at render time. */
   transform: XTransform,
   /** The current quality and zoom at render time. */
   [ quality, zoom ]: XFactor,
   /** The current style at render time. This object should not be modified during rendering. */
   style: XStyle
) => void;

/** Transform data, in the form of `[{ x: positionX, y: positionY }, rotation, { x: scaleX, y: scaleY }]` */
type XTransform = [XVector, number, XVector];

/** The atlas system is used primarily to create a system of navigable menus. Each navigator in the atlas's `navigators` object serves as a menu which can be switched to, attached to a renderer, or detached from a renderer. When a navigator is switched to, it becomes the active navigator and will accept throughput from calls to the atlas's `seek` and `navigate` methods. Attaching and detaching navigators iterates over their `objects` array and calls the target renderer's `attach` or `detach` method respectively with the given objects. */
class XAtlas<A extends string = string> {
   /** The navigators available to this atlas. */
   navigators: XKeyed<XNavigator<A>, A>;
   /** The atlas's state, containing the currently active navigator. */
   state = { navigator: null as XNavigatorKey<A> };
   constructor ({ navigators = {} as XKeyed<XNavigator<A>, A> }: XAtlasProperties<A> = {}) {
      this.navigators = navigators;
   }
   /** Attaches navigators to a renderer. */
   attach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never, ...navigators: A[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].attach(renderer, layer);
      }
   }
   /** Detaches navigators from a renderer. */
   detach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never, ...navigators: A[]) {
      for (const navigator of navigators) {
         navigator in this.navigators && this.navigators[navigator].detach(renderer, layer);
      }
   }
   /** Returns the current navigator. */
   navigator () {
      return this.state.navigator ? this.navigators[this.state.navigator] : void 0;
   }
   /** Moves the position on the current navigator by the specified values. If the resulting position exceeds the navigator's current grid bounds, the position value is looped around. */
   seek ({ x = 0, y = 0 }: XPrimitive<X2> = {}) {
      const navigator = this.navigator();
      if (navigator) {
         const origin = navigator.selection();
         const row = X.provide(navigator.grid, navigator, this);
         const flip = X.provide(navigator.flip, navigator, this);
         navigator.position.x = Math.min(Math.max(navigator.position.x, 0), row.length - 1);
         navigator.position.x += flip ? y : x;
         if (row.length - 1 < navigator.position.x) {
            navigator.position.x = 0;
         } else if (navigator.position.x < 0) {
            navigator.position.x = row.length - 1;
         }
         const column = row[navigator.position.x] || [];
         navigator.position.y = Math.min(Math.max(navigator.position.y, 0), column.length - 1);
         navigator.position.y += flip ? x : y;
         if (column.length - 1 < navigator.position.y) {
            navigator.position.y = 0;
         } else if (navigator.position.y < 0) {
            navigator.position.y = column.length - 1;
         }
         origin === navigator.selection() || navigator.fire('move', this, navigator);
      }
   }
   /** Triggers the `next` or `prev` methods on the current navigator and switches to their returned value. If the returned value is `void`, the current navigator will remain unchanged. */
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
   /** Directly switches to a given navigator by it's key. Switching to `void` has no effect, and switching to `null` un-sets the atlas's current navigator. */
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

/** A simple map-based cache system. */
class XCache<A, B> extends Map<A, B> {
   /** The function used to compute a new value. */
   compute: (object: A) => B;
   constructor (
      /** The function used to compute a new value. */
      compute: (object: A) => B
   ) {
      super();
      this.compute = compute;
   }
   /** Retrieves or computes a value in the cache. */
   of (object: A) {
      this.has(object) || this.set(object, this.compute(object));
      return this.get(object) as B;
   }
}

/** An audio effect container with a dry/wet gain setup. Input should be fed into the `dry` and `wet` gain nodes, and output should be taken from the `output` gain node. */
class XEffect {
   /** The effect's audio context. */
   context: AudioContext;
   /** The dry gain node, which controls the level of the raw audio throughput. */
   dry: GainNode;
   /** The output node. */
   output: GainNode;
   /** The effect processor, such as a convolver node, panner node, or filter node. */
   processor: AudioNode;
   /** The wet gain node, which controls the gain of the effected audio. */
   wet: GainNode;
   /** The wet gain node's value. When modified, the dry gain value is set to the inverse of this value. */
   get value () {
      return this.wet.gain.value;
   }
   set value (value) {
      this.dry.gain.value = 1 - (this.wet.gain.value = value);
   }
   constructor (
      /** The effect's audio context. */
      context: AudioContext,
      /** The effect processor, such as a convolver node, panner node, or filter node. */
      processor: AudioNode,
      /** The wet gain node's value. When modified, the dry gain value is set to the inverse of this value. */
      value = 1
   ) {
      this.context = context;
      this.processor = processor;
      this.dry = context.createGain();
      this.wet = context.createGain();
      this.output = context.createGain();
      this.dry.connect(this.output);
      this.processor.connect(this.wet).connect(this.output);
      this.value = value;
   }
   /** A helper function which connects this effect's output to another effect, audio node, or audio context. */
   connect (target: XEffect | AudioNode | AudioContext) {
      if (target instanceof AudioContext) {
         this.output.connect(target.destination);
      } else if (target instanceof AudioNode) {
         this.output.connect(target);
      } else {
         this.output.connect(target.dry);
         this.output.connect(target.processor);
      }
   }
   /** A helper function which disconnects this effect's output from another previously connected effect, audio node, or audio context. */
   disconnect (target?: XEffect | AudioNode | AudioContext) {
      if (target instanceof AudioContext) {
         this.output.disconnect(target.destination);
      } else if (target instanceof AudioNode) {
         this.output.disconnect(target);
      } else if (target) {
         this.output.disconnect(target.dry);
         this.output.disconnect(target.processor);
      } else {
         this.output.disconnect();
      }
   }
   /** Modulates this effect's value over a period of time. See `XNumber.modulate` for specifics. */
   modulate (duration: number, ...points: number[]) {
      return XNumber.prototype.modulate.call(this, duration, ...points);
   }
}

/** An event host, capable of firing one-time and repeating events to listeners with variable priorities. */
class XHost<A extends XKeyed<any[]> = {}> {
   /** The events stored in the event host. This should not be modified directly. */
   events: { [B in keyof A]?: XHandler<A[B]>[] } = {};
   /** Fires an event. */
   fire<B extends keyof A> (
      /** The event's name. */
      name: B,
      /** The data to pass into each listener. */
      ...data: A[B]
   ) {
      const list = this.events[name];
      if (list) {
         return [ ...list.values() ].map(handler => {
            return (typeof handler === 'function' ? handler : handler.listener)(...data);
         });
      } else {
         return [];
      }
   }
   /** Detaches an event handler from an event. */
   off<B extends keyof A> (
      /** The name of the event to detach the handler from. */
      name: B,
      /** The handler to detach. */
      handler: XHandler<A[B]>
   ) {
      const list = this.events[name];
      if (list) {
         const index = list.indexOf(handler);
         if (index > -1) {
            list.splice(index, 1);
         }
      }
      return this;
   }
   /** Attaches an event handler to an event. In this form, no handler is specified, and a promise which resolves when the event is next fired is returned. */
   on<B extends keyof A>(
      /** The name of the event. */
      name: B
   ): Promise<A[B]>;
   /** Attaches an event handler to an event. In this form, no handler is specified, and a promise which resolves when the event is next fired is returned. */
   on<B extends keyof A>(
      /** The name of the event. */
      name: B,
      /** The priority to use for the internal promise-resolving handler. */
      priority: number
   ): Promise<A[B]>;
   /** Attaches an event handler to an event. */
   on<B extends keyof A>(
      /** The name of the event. */
      name: B,
      /** The event handler to attach. */
      listener: XHandler<A[B]>
   ): this;
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
   /** Passes `this` into a provider function, which is expected to return a listener. Useful for situations where there is no external variable for the host object to reference in the event listener. */
   wrapOn<B extends keyof A> (
      /** The name of the event. */
      name: B,
      /** A function which returns an event listener. */
      provider: (
         /** The host object. */
         host: this
      ) => XHandler<A[B]>
   ) {
      return this.on(name, provider(this));
   }
}

/** An asset, consisting of a loader, unloader, and source string for clarity in errors. */
class XAsset<A = any> extends XHost<{ load: []; unload: [] }> {
   /** This asset's loader method. Returns a promise which resolves with the loaded value. */
   loader: () => Promise<A>;
   /** This asset's source string. Used in thrown errors to help identify the faulty asset. */
   source: string;
   /** The state of the asset, containing the current loaded value, if any. */
   state = { value: void 0 as A | void };
   /** This asset's unloader, which unassigns the loaded value and returns a promise which resolves when the asset is fully unloaded. Certain assets, such as images and audios, use this function to perform necessary cleanup operations. */
   unloader: () => Promise<void>;
   /** Gets the value if defined, or throws an error stating the asset must be loaded. If you prefer not to recieve an error, check if `state.value` is defined before accessing this property. */
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
      /** This asset's loader method. Returns a promise which resolves with the loaded value. */
      loader: () => Promise<A>;
      /** This asset's source string. Used in thrown errors to help identify the faulty asset. */
      source: string;
      /** This asset's unloader, which unassigns the loaded value and returns a promise which resolves when the asset is fully unloaded. Certain assets, such as images and audios, use this function to perform necessary cleanup operations. */
      unloader: () => Promise<void>;
   }) {
      super();
      this.loader = loader;
      this.source = source;
      this.unloader = unloader;
   }
   /** Requests for the asset to be loaded. */
   async load (
      /** Forcefully re-load the asset, even if it is already available. Defaults to `false`. */
      force?: boolean
   ) {
      if (force || this.state.value === void 0) {
         this.state.value = await this.loader();
         this.fire('load');
      }
   }
   /** Requests for the asset to be unloaded. */
   async unload (
      /** Forcefully re-unload the asset, even if it is not already available. Defaults to `false`. */ force?: boolean
   ) {
      if (force || this.state.value !== void 0) {
         this.state.value = await this.unloader();
         this.fire('unload');
      }
   }
}

/** Handles keyboard input from multiple key codes. If a key is held while the window or tab is switched, stuck-key glitches may occur. There are a few potential fixes for this which you may want to consider implementing in your own code when using this class. If you choose to do so, remember that all active keys can be cleared with `state.codes.clear`. */
class XInput extends XHost<XKeyed<[string], 'down' | 'up'>> {
   /** The input's state, containing all currently active codes. */
   state = { codes: new Set<string>() };
   constructor ({ codes = [], target = window as any }: XInputProperties = {}) {
      super();
      target.addEventListener('keyup', ({ code }) => {
         if (codes.includes(code) && this.state.codes.has(code)) {
            this.state.codes.delete(code);
            this.fire('up', code);
         }
      });
      target.addEventListener('keydown', ({ code }) => {
         if (codes.includes(code) && !this.state.codes.has(code)) {
            this.state.codes.add(code);
            this.fire('down', code);
         }
      });
   }
   /** True if this key is currently active, in other words, if at least one key this input system listens for is pressed. */
   active () {
      return this.state.codes.size > 0;
   }
}

/** An audio mixer track, used to chain effects together. Remember that if the `effects` array is modified, you must call `refresh` to properly update the series of connections. */
class XMixer {
   /** The audio context used by this mixer. */
   context: AudioContext;
   /** The effects present in this mixer's effect chain. */
   effects: XEffect[];
   /** The input node. */
   input: GainNode;
   /** The output node. */
   output: GainNode;
   constructor (
      /** The audio context used by this mixer. */
      context: AudioContext,
      /** The effects present in this mixer's effect chain. */
      effects = [] as XEffect[]
   ) {
      this.context = context;
      this.effects = effects;
      this.input = context.createGain();
      this.output = context.createGain();
      this.refresh();
   }
   /** Refreshes the connections between the input, output, and all effects in this mixer. */
   refresh () {
      for (const [ index, controller ] of [ this.input, ...this.effects ].entries()) {
         controller.disconnect();
         if (index === this.effects.length) {
            controller.connect(this.output);
         } else if (controller instanceof XEffect) {
            controller.connect(this.effects[index]);
         } else {
            controller.connect(this.effects[index].dry);
            controller.connect(this.effects[index].processor);
         }
      }
   }
}

/** Can be exported from a file and then imported asynchronously and concurrently with `import`. */
class XModule<A, B extends any[]> {
   /** The display name of the module. */
   name: string;
   /** The script which returns the promise for the module content. */
   script: (...args: B) => Promise<A>;
   /** The cached promise, used by `import` internally. */
   promise = void 0 as Promise<A> | void;
   constructor (
      /** The display name of the module. */
      name: string,
      /** The script which returns the promise for the module content. */ script: (...args: B) => Promise<A>
   ) {
      this.name = name;
      this.script = script;
   }
   /** Imports the module. If already imported before, the same promise is returned. */
   import (...args: B) {
      X.status(`IMPORT MODULE: ${this.name}`, { color: '#07f' });
      return (this.promise ??= new Promise<A>(async resolve => {
         try {
            resolve(await this.script(...args));
            X.status(`MODULE INITIALIZED: ${this.name}`, { color: '#0f0' });
         } catch (error) {
            X.status(`MODULE ERROR: ${this.name}`, { color: '#f00' });
            console.error(error);
         }
      }));
   }
}

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
   attach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never) {
      renderer.attach(layer, ...this.objects);
   }
   detach<B extends XRenderer> (renderer: B, layer: B extends XRenderer<infer C> ? C : never) {
      renderer.detach(layer, ...this.objects);
   }
   selection () {
      return (X.provide(this.grid, this)[this.position.x] || [])[this.position.y];
   }
}

class XNumber {
   value: number;
   constructor (value = 0) {
      this.value = value;
   }
   modulate (duration: number, ...points: number[]) {
      const base = X.time;
      const value = this.value;
      return new Promise<void>(resolve => {
         let active = true;
         X.cache.modulationTasks.get(this)?.cancel();
         X.cache.modulationTasks.set(this, {
            cancel () {
               active = false;
            }
         });
         const listener = () => {
            if (active) {
               const elapsed = X.time - base;
               if (elapsed < duration) {
                  this.value = X.math.bezier(elapsed / duration, value, ...points);
               } else {
                  X.cache.modulationTasks.delete(this);
                  this.value = points.length > 0 ? points[points.length - 1] : value;
                  X.timer.off('tick', listener);
                  resolve();
               }
            } else {
               X.timer.off('tick', listener);
            }
         };
         X.timer.on('tick', listener);
      });
   }
}

class XObject extends XHost<{ tick: [] }> {
   alpha: XNumber;
   anchor: XVector;
   blend: GlobalCompositeOperation | void;
   fill: string | void;
   friction: XNumber;
   gravity: {
      angle: XNumber;
      extent: XNumber;
   };
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
   stroke: string | void;
   text: {
      align?: CanvasTextAlign | void;
      baseline?: CanvasTextBaseline | void;
      direction?: CanvasDirection | void;
      font?: string | void;
   };
   velocity: XVector;
   constructor ({
      alpha = 1,
      anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {},
      blend,
      fill = void 0,
      friction = 1,
      gravity: { angle = 0, extent = 0 } = {},
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
      text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {},
      velocity: { x: velocity_x = 0, y: velocity_y = 0 } = {}
   }: XObjectProperties = {}) {
      super();
      this.alpha = new XNumber(alpha);
      this.anchor = new XVector(anchor_x, anchor_y);
      this.blend = blend;
      this.fill = fill;
      this.friction = new XNumber(friction);
      this.gravity = {
         angle: new XNumber(angle),
         extent: new XNumber(extent)
      };
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
      this.velocity = new XVector(velocity_x, velocity_y);
   }
   compute(renderer: PRenderer | PCanvasRenderer): XVector;
   compute () {
      return X.zero;
   }
   draw(renderer: PRenderer | PCanvasRenderer, transform: XTransform, [ quality, zoom ]: XFactor, style: XStyle): void;
   draw () {}
   render (
      renderer: PRenderer | PCanvasRenderer,
      camera: X2,
      transform: XTransform,
      [ quality, zoom ]: XFactor,
      style: XStyle
   ) {
      if (this.gravity.extent.value !== 0) {
         Object.assign(
            this.velocity,
            this.velocity.endpoint(this.gravity.angle.value, this.gravity.extent.value * X.speed.value).value()
         );
      }
      if (this.friction.value !== 1) {
         Object.assign(this.velocity, this.velocity.divide((this.friction.value - 1) * X.speed.value + 1).value());
      }
      if (this.velocity.x !== 0 || this.velocity.y !== 0) {
         Object.assign(this.position, this.position.add(this.velocity.multiply(X.speed.value)));
      }
      this.fire('tick');
      const subalpha = style.globalAlpha * Math.min(Math.max(this.alpha.value, 0), 1);
      if (subalpha > 0 || this.objects.length > 0) {
         const subtransform: XTransform = [
            transform[0].add(this.position).add(this.parallax.multiply(camera)).shift(transform[1], 0, transform[0]),
            transform[1] + this.rotation.value,
            transform[2].multiply(this.scale)
         ];
         const substyle = {
            globalAlpha: subalpha,
            globalCompositeOperation: this.blend ?? style.globalCompositeOperation,
            fillStyle: this.fill ?? style.fillStyle,
            lineCap: this.line.cap ?? style.lineCap,
            lineDashOffset: this.line.dash?.value ?? style.lineDashOffset,
            lineJoin: this.line.join ?? style.lineJoin,
            miterLimit: this.line.miter?.value ?? style.miterLimit,
            lineWidth: this.line.width?.value ?? style.lineWidth,
            shadowBlur: this.shadow.blur?.value ?? style.shadowBlur,
            shadowColor: this.shadow.color ?? style.shadowColor,
            shadowOffsetX: this.shadow.offset.x?.value ?? style.shadowOffsetX,
            shadowOffsetY: this.shadow.offset.y?.value ?? style.shadowOffsetY,
            strokeStyle: this.stroke ?? style.strokeStyle,
            textAlign: this.text.align ?? style.textAlign,
            textBaseline: this.text.baseline ?? style.textBaseline,
            direction: this.text.direction ?? style.direction,
            font: this.text.font ?? style.font
         };
         subalpha === 0 || this.draw(renderer, subtransform, [ quality, zoom ], substyle);
         if (this.objects.length > 0) {
            for (const object of this.objects) {
               object.render(renderer, camera, subtransform, [ quality, zoom ], substyle);
            }
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
   compute () {
      return this.size;
   }
   region (): XRegion {
      const vertices = this.vertices();
      const { x: x1, y: y1 } = vertices[0];
      const { x: x2, y: y2 } = vertices[1];
      const { x: x3, y: y3 } = vertices[2];
      const { x: x4, y: y4 } = vertices[3];
      return [
         new XVector(Math.min(x1, x2, x3, x4), Math.min(y1, y2, y3, y4)),
         new XVector(Math.max(x1, x2, x3, x4), Math.max(y1, y2, y3, y4))
      ];
   }
   vertices () {
      if (this.state.dimensions === void 0) {
         throw "This object's vertices are unresolved!";
      } else {
         return this.state.vertices as [X2, X2, X2, X2];
      }
   }
}

class XEntity extends XHitbox {
   face: XCardinal = 'down';
   sprites: XKeyed<XSprite, XCardinal>;
   step: number;
   get sprite () {
      return this.sprites[this.face];
   }
   constructor (properties: XEntityProperties = {}) {
      super(properties);
      (({
         sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {},
         step = 1
      }: XEntityProperties = {}) => {
         this.sprites = {
            down: down instanceof XSprite ? down : new XSprite(down),
            left: left instanceof XSprite ? left : new XSprite(left),
            right: right instanceof XSprite ? right : new XSprite(right),
            up: up instanceof XSprite ? up : new XSprite(up)
         };
         this.step = step;
      })(properties);
      this.on('tick', () => {
         this.objects[0] = this.sprites[this.face];
      });
   }
   move<A extends string> (
      offset: X2,
      renderer?: XRenderer<A>,
      key?: A,
      keys: A[] = [],
      filter?: XProvider<boolean, [XHitbox]>
   ) {
      const source = this.position.value();
      const hitboxes = filter && renderer ? keys.flatMap(key => renderer.calculate(key, filter)) : [];
      for (const axis of [ 'x', 'y' ] as ['x', 'y']) {
         const distance = offset[axis];
         if (distance !== 0) {
            this.position[axis] += distance;
            const hits = renderer ? renderer.detect(key, this, ...hitboxes) : [];
            if (hits.length > 0) {
               const single = (distance / Math.abs(distance)) * this.step;
               while (this.position[axis] !== source[axis] && renderer!.detect(key, this, ...hits).length > 0) {
                  this.position[axis] -= single;
               }
            }
         }
      }
      if (this.position.x === source.x && this.position.y === source.y) {
         if (offset.y < 0) {
            this.face = 'up';
         } else if (offset.y > 0) {
            this.face = 'down';
         } else if (offset.x < 0) {
            this.face = 'left';
         } else if (offset.x > 0) {
            this.face = 'right';
         }
         for (const sprite of Object.values(this.sprites)) {
            sprite.reset();
         }
         return false;
      } else {
         if (this.position.y < source.y) {
            this.face = 'up';
         } else if (this.position.y > source.y) {
            this.face = 'down';
         } else if (this.position.x < source.x) {
            this.face = 'left';
         } else if (this.position.x > source.x) {
            this.face = 'right';
         }
         this.sprite.enable();
         return true;
      }
   }
   async walk<A extends string> (renderer: XRenderer<A>, key: A, speed: number, ...points: Partial<X2>[]) {
      await renderer.on('tick');
      for (const sprite of Object.values(this.sprites)) {
         sprite.steps = Math.round(15 / speed);
      }
      for (const { x = this.position.x, y = this.position.y } of points) {
         const dirX = x - this.position.x < 0 ? -1 : 1;
         const dirY = y - this.position.y < 0 ? -1 : 1;
         await X.chain<void, Promise<void>>(void 0, async (z, next) => {
            const diffX = Math.abs(x - this.position.x);
            const diffY = Math.abs(y - this.position.y);
            this.move(
               {
                  x: (diffX === 0 ? 0 : diffX < speed ? diffX : speed) * dirX,
                  y: (diffY === 0 ? 0 : diffY < speed ? diffY : speed) * dirY
               },
               renderer,
               key
            );
            if (diffX > 0 || diffY > 0) {
               await renderer.on('tick');
               await next();
            }
         });
      }
   }
}

class XCharacter extends XEntity {
   key: string;
   talk = false;
   preset: XCharacterPreset;
   constructor (properties: XCharacterProperties) {
      super(properties);
      (({ key, preset }: XCharacterProperties) => {
         this.key = key;
         this.preset = preset;
      })(properties);
      this.on('tick', {
         priority: -1,
         listener: () => {
            this.sprites = this.talk ? this.preset.talk : this.preset.walk;
         }
      });
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
   draw (renderer: PRenderer | PCanvasRenderer, transform: XTransform, [ quality, zoom ]: XFactor, style: XStyle) {
      this.tracer(renderer, transform, [ quality, zoom ], style);
   }
}

class XPlayer extends XEntity {
   extent: XVector;
   walking = false;
   constructor (properties: XPlayerProperties = {}) {
      super(properties);
      (({ extent: { x: extent_x = 0, y: extent_y = 0 } = {} }: XPlayerProperties = {}) => {
         this.extent = new XVector(extent_x, extent_y);
      })(properties);
      this.on('tick').then(() => {
         this.objects[1] = new XHitbox().wrapOn('tick', self => () => {
            self.anchor.x = this.face === 'left' ? 1 : this.face === 'right' ? -1 : 0;
            self.anchor.y = this.face === 'up' ? 1 : this.face === 'down' ? -1 : 0;
            self.size.x = this.face === 'left' || this.face === 'right' ? this.extent.y : this.extent.x;
            self.size.y = this.face === 'down' || this.face === 'up' ? this.extent.y : this.extent.x;
         });
      });
   }
   async walk<A extends string> (renderer: XRenderer<A>, key: A, speed: number, ...targets: Partial<X2>[]) {
      this.walking = true;
      await super.walk(renderer, key, speed, ...targets);
      this.walking = false;
   }
}

class XRandom {
   base: number;
   constructor (
      seed: string,
      base = (() => {
         let h = 1779033703 ^ seed.length;
         for (let i = 0; i < seed.length; i++) {
            (h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19));
         }
         let [ a, b, c, d ] = X.populate(4, () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
         });
         a >>>= 0;
         b >>>= 0;
         c >>>= 0;
         d >>>= 0;
         let t = (a + b) | 0;
         a = b ^ (b >>> 9);
         b = (c + (c << 3)) | 0;
         c = (c << 21) | (c >>> 11);
         d = (d + 1) | 0;
         t = (t + d) | 0;
         c = (c + t) | 0;
         return (t >>> 0) / 4294967296;
      })()
   ) {
      this.base = base;
   }
   step () {
      let hash = (this.base += 0x6d2b79f5);
      hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
      hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
      return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
   }
   next (threshold = 0) {
      const base = this.base;
      let step = this.step();
      while (Math.abs(this.base - base) < threshold) {
         step = this.step();
      }
      return step;
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
   draw (
      renderer: PRenderer | PCanvasRenderer,
      [ position, rotation, scale ]: XTransform,
      [ quality, zoom ]: XFactor,
      style: XStyle
   ) {
      const fill = style.fillStyle !== 'transparent';
      const stroke = style.strokeStyle !== 'transparent';
      if (fill || stroke) {
         const size = this.compute();
         const half = size.divide(2);
         const base = position.subtract(half.add(half.multiply(this.anchor)));
         const rectangle = new PIXI.Graphics();
         rectangle.pivot.set(size.x * ((this.anchor.x + 1) / 2), size.y * ((this.anchor.y + 1) / 2));
         rectangle.position.set((base.x + rectangle.pivot.x) * quality, (base.y + rectangle.pivot.y) * quality);
         rectangle.rotation = (Math.PI / 180) * (rotation % 360);
         rectangle.scale.set(scale.x, scale.y);
         rectangle.alpha = style.globalAlpha;
         rectangle.blendMode = X.blend(style.globalCompositeOperation);
         if (stroke) {
            const strokeColor = X.color(style.strokeStyle);
            if (strokeColor[3] > 0) {
               rectangle.lineStyle({
                  alpha: strokeColor[3],
                  cap: { butt: PIXI.LINE_CAP.BUTT, round: PIXI.LINE_CAP.ROUND, square: PIXI.LINE_CAP.SQUARE }[
                     style.lineCap
                  ],
                  color: parseInt(X.hex(strokeColor), 16),
                  join: { bevel: PIXI.LINE_JOIN.BEVEL, miter: PIXI.LINE_JOIN.MITER, round: PIXI.LINE_JOIN.ROUND }[
                     style.lineJoin
                  ],
                  miterLimit: style.miterLimit,
                  width: style.lineWidth
               });
            }
         }
         if (fill) {
            const fillColor = X.color(style.fillStyle);
            if (fillColor[3] > 0) {
               rectangle.beginFill(parseInt(X.hex(fillColor), 16), fillColor[3]);
            } else {
               rectangle.beginFill(0, 0);
            }
         }
         renderer.render(rectangle.drawRect(0, 0, size.x, size.y).endFill());
         rectangle.destroy();
      }
   }
}

class XRenderer<A extends string = string> extends XHost<{ tick: [] }> {
   alpha: XNumber;
   camera: XVector;
   container: HTMLElement;
   framerate: number;
   layers: XKeyed<XRendererLayer, A>;
   region: XRegion;
   shake: XNumber;
   size: XVector;
   state = {
      camera: { x: NaN, y: NaN },
      active: false,
      rendererX: NaN,
      rendererY: NaN,
      scale: 1,
      windowX: NaN,
      windowY: NaN,
      quality: NaN,
      zoom: NaN
   };
   quality: XNumber;
   zoom: XNumber;
   constructor ({
      alpha = 1,
      auto = false,
      camera: { x: camera_x = 0, y: camera_y = 0 } = {},
      container = document.body,
      framerate = 30,
      layers = {},
      region: [
         { x: min_x = -Infinity, y: min_y = -Infinity } = {},
         { x: max_x = Infinity, y: max_y = Infinity } = {}
      ] = [],
      shake = 0,
      size: { x: size_x = 320, y: size_y = 240 } = {},
      quality = 1,
      zoom = 1
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
      this.framerate = framerate;
      this.layers = Object.fromEntries(
         Object.entries(layers).map(([ key, value ]) => {
            const canvas = document.createElement('canvas');
            Object.assign(canvas.style, {
               gridArea: 'center',
               imageRendering: 'pixelated'
            });
            this.container.appendChild(canvas);
            return [
               key,
               {
                  active: true,
                  canvas,
                  modifiers: value,
                  objects: [] as XObject[],
                  renderer: new (GL ? PIXI.Renderer : PIXI.CanvasRenderer)({
                     antialias: false,
                     backgroundAlpha: 0,
                     clearBeforeRender: false,
                     view: canvas
                  })
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
      this.quality = new XNumber(quality);
      this.zoom = new XNumber(zoom);
   }
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
   calculate (key: A, filter: XProvider<boolean, [XHitbox]> = true) {
      const list: XHitbox[] = [];
      const camera = this.camera.clamp(...this.region);
      X.chain(
         [ [ new XVector(), 0, new XVector(1) ], this.layers[key].objects ] as [XTransform, XObject[]],
         ([ transform, objects ], next) => {
            for (const object of objects) {
               const position = transform[0].add(object.position).add(object.parallax.multiply(camera));
               const rotation = transform[1] + object.rotation.value;
               const scale = transform[2].multiply(object.scale);
               if (object instanceof XHitbox && X.provide(filter, object)) {
                  list.push(object);
                  const size = object.size.multiply(scale);
                  const half = size.divide(2);
                  const base = position.subtract(half.add(half.multiply(object.anchor)));
                  const dimensions = `${base.x}:${base.y}:${position.x}:${position.y}:${rotation}:${size.x}:${size.y}`;
                  if (dimensions !== object.state.dimensions) {
                     const offset = rotation + 180;
                     const corner2 = base.endpoint(0, size.x);
                     const corner3 = corner2.endpoint(90, size.y);
                     const corner4 = corner3.endpoint(180, size.x);
                     object.state.vertices[0] = position
                        .endpoint(position.angle(base) + offset, position.extent(base))
                        .round(1e6);
                     object.state.vertices[1] = position
                        .endpoint(position.angle(corner2) + offset, position.extent(corner2))
                        .round(1e6);
                     object.state.vertices[2] = position
                        .endpoint(position.angle(corner3) + offset, position.extent(corner3))
                        .round(1e6);
                     object.state.vertices[3] = position
                        .endpoint(position.angle(corner4) + offset, position.extent(corner4))
                        .round(1e6);
                     object.state.dimensions = dimensions;
                  }
               }
               next([ [ position, rotation, scale ], object.objects ]);
            }
         }
      );
      return list;
   }
   clear (key: A) {
      if (key in this.layers) {
         const layer = this.layers[key];
         layer.modifiers.includes('ambient') && this.refresh();
         layer.objects.splice(0, layer.objects.length);
         this.reset(key);
      }
   }
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
         if (layer.objects.length === 0) {
            this.reset(key);
         }
      }
   }
   detect (key: A | void, source: XHitbox, ...hitboxes: XHitbox[]) {
      key && this.calculate(key, hitbox => hitbox === source);
      const hits: XHitbox[] = [];
      const [ min1, max1 ] = source.region();
      for (const hitbox of hitboxes) {
         if (hitbox.state.dimensions === void 0) {
            continue;
         } else if ((source.size.x === 0 || source.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
            const [ min2, max2 ] = hitbox.region();
            if (X.math.intersection(min1, max1, min2, max2)) {
               hits.push(hitbox);
            }
         } else {
            const [ min2, max2 ] = hitbox.region();
            if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
               const vertices1 = source.vertices();
               const vertices2 = hitbox.vertices();
               if (
                  (vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                  (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)
               ) {
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
   iterate<B extends any = XObject> (handler = (object: XObject) => object as B, key?: A): B[] {
      if (typeof key === 'string') {
         return X.chain<XObject[], B[]>(this.layers[key].objects, (objects, loop) => {
            return objects.flatMap(object => [ handler(object), ...loop(object.objects) ]);
         });
      } else {
         return Object.keys(this.layers).flatMap(key => this.iterate(handler, key as A));
      }
   }
   reset (key: A) {
      const renderer = this.layers[key].renderer;
      renderer instanceof PIXI.Renderer && renderer.reset();
      renderer.clear();
   }
   restrict (position: X2) {
      return this.size
         .divide(2)
         .subtract(this.camera.clamp(...this.region))
         .add(position);
   }
   start () {
      const ticker = new PIXI.Ticker();
      ticker.add(() => {
         this.render();
         ticker.minFPS = this.framerate;
         ticker.maxFPS = this.framerate;
      });
      ticker.start();
      return { cancel: () => ticker.destroy() };
   }
   refresh () {
      this.state.camera = { x: NaN, y: NaN };
   }
   render () {
      this.fire('tick');
      let update = false;
      let resize = false;
      const camera = this.camera.clamp(...this.region);
      this.container.style.opacity = Math.min(Math.max(this.alpha.value, 0), 1).toString();
      if (this.zoom.value !== this.state.zoom) {
         update = true;
         this.state.zoom = this.zoom.value;
      }
      if (camera.x !== this.state.camera.x || camera.y !== this.state.camera.y) {
         update = true;
         this.state.camera = camera.value();
      }
      if (this.quality.value !== this.state.quality) {
         update = true;
         resize = true;
         this.state.quality = this.quality.value;
      }
      if (
         innerWidth !== this.state.windowX ||
         innerHeight !== this.state.windowY ||
         this.size.x !== this.state.rendererX ||
         this.size.y !== this.state.rendererY
      ) {
         update = true;
         resize = true;
         this.state.windowX = innerWidth;
         this.state.windowY = innerHeight;
         this.state.rendererX = this.size.x;
         this.state.rendererY = this.size.y;
         const ratio = this.size.x / this.size.y;
         if (this.state.windowX / this.state.windowY > ratio) {
            this.state.scale = innerHeight / this.size.y;
         } else {
            this.state.scale = innerWidth / this.size.x;
         }
      }
      if (resize) {
         const width = this.size.x * this.quality.value;
         const height = this.size.y * this.quality.value;
         const scale = this.state.scale / this.quality.value;
         for (const key in this.layers) {
            const { canvas } = this.layers[key];
            canvas.width = width;
            canvas.height = height;
            canvas.style.transform = `scale(${scale})`;
            if (scale < 1) {
               canvas.style.transformOrigin = innerWidth > innerHeight ? '50% 0' : '0 50%';
            } else {
               canvas.style.transformOrigin = '';
            }
         }
      }
      const shakeX = this.shake.value ? this.shake.value * (Math.random() - 0.5) : 0;
      const shakeY = this.shake.value ? this.shake.value * (Math.random() - 0.5) : 0;
      for (const key in this.layers) {
         const { active, modifiers, objects, renderer } = this.layers[key];
         if (active && objects.length > 0 && (update || this.shake.value > 0 || !modifiers.includes('ambient'))) {
            const center = this.size.divide(2);
            const statik = modifiers.includes('static');
            this.reset(key);
            if (modifiers.includes('vertical')) {
               objects.sort(
                  (object1, object2) =>
                     (object1.priority.value || object1.position.y) - (object2.priority.value || object2.position.y)
               );
            }
            const zoom = statik ? 1 : this.zoom.value;
            const transform: XTransform = [
               new XVector(
                  center.x + -(statik ? center.x : camera.x) + shakeX,
                  center.y + -(statik ? center.y : camera.y) + shakeY
               ),
               0,
               new XVector(this.quality.value * zoom)
            ];
            for (const object of objects) {
               object.render(renderer, camera, transform, [ this.quality.value * zoom, zoom ], {
                  globalAlpha: 1,
                  globalCompositeOperation: 'source-over',
                  fillStyle: 'transparent',
                  lineCap: 'butt',
                  lineDashOffset: 0,
                  lineJoin: 'miter',
                  miterLimit: 10,
                  lineWidth: 1,
                  shadowBlur: 0,
                  shadowColor: 'transparent',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  strokeStyle: 'transparent',
                  textAlign: 'start',
                  textBaseline: 'alphabetic',
                  direction: 'ltr',
                  font: '10px monospace'
               });
            }
         }
      }
   }
}

class XSprite extends XObject {
   crop: XKeyed<number, XSide>;
   frames: (XImage | null)[];
   step: number;
   steps: number;
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
      if (texture && texture.state.value) {
         const x = (this.crop.left < 0 ? texture.value.width : 0) + this.crop.left;
         const y = (this.crop.top < 0 ? texture.value.height : 0) + this.crop.top;
         const w = (this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right - x;
         const h = (this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom - y;
         return new XVector(w, h);
      } else {
         return new XVector(0, 0);
      }
   }
   disable () {
      this.state.active = false;
      return this;
   }
   draw (
      renderer: PRenderer | PCanvasRenderer,
      [ position, rotation, scale ]: XTransform,
      [ quality, zoom ]: XFactor,
      style: XStyle
   ) {
      const texture = this.frames[this.state.index];
      if (texture && texture.state.value) {
         const r = (Math.PI / 180) * (rotation % 360);
         const a = (this.anchor.x + 1) / 2;
         const b = (this.anchor.y + 1) / 2;
         const x = (this.crop.left < 0 ? texture.value.width : 0) + this.crop.left;
         const y = (this.crop.top < 0 ? texture.value.height : 0) + this.crop.top;
         const w = (this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right - x;
         const h = (this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom - y;
         const sprite = new PIXI.Sprite(X.cache.textures.get(texture)!);
         sprite.anchor.set((x + w * a) / texture.value.width, (y + h * b) / texture.value.height);
         sprite.position.set(position.x * quality, position.y * quality);
         sprite.rotation = r;
         sprite.scale.set(scale.x, scale.y);
         sprite.alpha = style.globalAlpha;
         sprite.blendMode = X.blend(style.globalCompositeOperation);

         // mask setup
         const graphics = new PIXI.Graphics();
         graphics.position.set(sprite.position.x, sprite.position.y);
         graphics.pivot.set(w * a, h * b);
         graphics.rotation = r;
         graphics.scale.set(scale.x, scale.y);
         graphics.beginFill(0xffffff, 1).drawRect(0, 0, w, h).endFill();
         const mask = new PIXI.MaskData(graphics);
         mask.type = rotation % 90 === 0 ? PIXI.MASK_TYPES.SCISSOR : PIXI.MASK_TYPES.STENCIL;
         sprite.mask = mask;

         // render
         (GL && rotation % 90 === 0) || renderer.render(graphics);
         renderer.render(sprite);
         sprite.destroy();
         graphics.destroy();
      }
      if (Math.round(this.steps / X.speed.value) <= ++this.state.step) {
         this.state.step = 0;
         if (this.state.active && this.frames.length <= ++this.state.index) {
            this.state.index = 0;
         }
      }
   }
   enable (steps?: number) {
      this.state.active = true;
      steps && (this.steps = steps);
      return this;
   }
   async load () {
      await Promise.all(this.frames.map(asset => asset && asset.load()));
   }
   read (min?: X2, max?: X2) {
      const frame = this.frames[this.state.index];
      const colors: XColor[][] = [];
      if (frame) {
         const sprite = PIXI.Sprite.from(X.cache.textures.get(frame)!);
         const originX = Math.round(min?.x ?? 0);
         const originY = Math.round(min?.y ?? 0);
         const sizeX = Math.round(max?.x ?? sprite.width) - originX;
         const sizeY = Math.round(max?.y ?? sprite.height) - originY;
         const pixels = [
            ...(X.shader.plugins.extract as PExtract).pixels(sprite).slice((originX + originY * sprite.width) * 4)
         ];
         while (colors.length < sizeY) {
            const subcolors: XColor[] = [];
            while (subcolors.length < sizeX) {
               subcolors.push(pixels.splice(0, 4) as XColor);
            }
            colors.push(subcolors);
            pixels.splice(0, (sprite.width - sizeY) * 4);
         }
         sprite.destroy();
      }
      return colors;
   }
   reset () {
      Object.assign(this.state, { active: false, index: 0, step: this.step });
      return this;
   }
   async unload () {
      await Promise.all(this.frames.map(asset => asset && asset.unload()));
   }
}

class XAnimation extends XSprite {
   subcrop: XKeyed<number, XSide>;
   framerate: number;
   resources: XAnimationResources | null;
   state: XSprite['state'] & { previous: number | null } = {
      index: 0,
      active: this.state.active,
      step: 0,
      previous: null as number | null
   };
   stepper: boolean;
   constructor (properties: XAnimationProperties) {
      super(properties);
      (({
         subcrop: { left = 0, right = 0, bottom = 0, top = 0 } = {},
         framerate = 30,
         resources,
         stepper = true
      }: XAnimationProperties) => {
         this.subcrop = { left, right, bottom, top };
         this.framerate = framerate;
         this.resources = resources || null;
         this.stepper = stepper;
      })(properties);
   }
   refresh () {
      this.state.previous = null;
      this.compute();
      return this;
   }
   compute () {
      if (this.resources && this.resources.state.value) {
         const frames = this.resources.value[0].value.frames;
         const update = this.state.index !== this.state.previous;
         if (update) {
            this.state.previous = this.state.index;
         }
         const {
            duration,
            frame: { x, y, w, h }
         } = frames[this.state.index];
         const sx = (this.subcrop.left < 0 ? w : 0) + this.subcrop.left;
         const sy = (this.subcrop.top < 0 ? h : 0) + this.subcrop.top;
         const sw = (this.subcrop.right < 0 ? 0 : w) - this.subcrop.right - sx;
         const sh = (this.subcrop.bottom < 0 ? 0 : h) - this.subcrop.bottom - sy;
         this.crop = { left: x + sx, top: y + sy, right: -(x + sx + sw), bottom: -(y + sy + sh) };
         if (update) {
            const content = this.resources.value[1];
            this.frames = X.populate(frames.length, () => content);
            if (this.stepper) {
               this.steps = Math.round(duration / (1000 / this.framerate));
            }
         }
         if (frames.length > 0) {
            return new XVector(sw, sh);
         } else {
            return new XVector();
         }
      } else {
         return new XVector();
      }
   }
   draw (renderer: PRenderer | PCanvasRenderer, transform: XTransform, [ quality, zoom ]: XFactor, style: XStyle) {
      this.compute();
      super.draw(renderer, transform, [ quality, zoom ], style);
   }
   update (resources: XAnimationResources | null) {
      this.resources = resources;
      if (this.state.active) {
         return this.reset().refresh().enable();
      } else {
         return this.reset().refresh();
      }
   }
   static resources (dataSource: string, imageSource: string): XAnimationResources {
      return X.inventory(X.dataAsset(dataSource), X.imageAsset(imageSource));
   }
}

class XVector {
   x: number;
   y: number;
   constructor();
   constructor(a: number | X2);
   constructor(x: number, y: number);
   constructor (a: number | X2 = 0, b = a as number) {
      if (typeof a === 'number') {
         this.x = a;
         this.y = b;
      } else {
         this.x = a.x || 0;
         this.y = a.y || 0;
      }
   }
   add(a: number | X2): XVector;
   add(x: number, y: number): XVector;
   add (a: number | X2, b = a as number) {
      if (typeof a === 'number') {
         return new XVector(this.x + a, this.y + b);
      } else {
         return this.add(a.x, a.y);
      }
   }
   ceil (base?: number): XVector {
      return base ? this.multiply(base).ceil().divide(base) : new XVector(Math.ceil(this.x), Math.ceil(this.y));
   }
   clamp (min: X2, max: X2) {
      return new XVector(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y));
   }
   clone () {
      return new XVector(this);
   }
   angle (vector: X2) {
      return ((180 / Math.PI) * Math.atan2(this.y - vector.y, this.x - vector.x) + 360) % 360;
   }
   divide(a: number | X2): XVector;
   divide(x: number, y: number): XVector;
   divide (a: number | X2, b = a as number) {
      if (typeof a === 'number') {
         return new XVector(this.x / a, this.y / b);
      } else {
         return this.divide(a.x, a.y);
      }
   }
   endpoint (angle: number, extent: number) {
      const rads = Math.PI - (((angle + 90) % 360) * Math.PI) / 180;
      return new XVector(this.x + extent * Math.sin(rads), this.y + extent * Math.cos(rads));
   }
   extent (vector: X2) {
      return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
   }
   floor (base?: number): XVector {
      return base ? this.multiply(base).floor().divide(base) : new XVector(Math.floor(this.x), Math.floor(this.y));
   }
   modulate (duration: number, ...points: Partial<X2>[]) {
      const x = this.x;
      const y = this.y;
      const base = X.time;
      return new Promise<void>(resolve => {
         let active = true;
         X.cache.modulationTasks.get(this)?.cancel();
         X.cache.modulationTasks.set(this, {
            cancel () {
               active = false;
            }
         });
         const listener = () => {
            if (active) {
               const elapsed = X.time - base;
               if (elapsed < duration) {
                  this.x = X.math.bezier(elapsed / duration, x, ...points.map(point => point.x ?? x));
                  this.y = X.math.bezier(elapsed / duration, y, ...points.map(point => point.y ?? y));
               } else {
                  X.cache.modulationTasks.delete(this);
                  this.x = points.length > 0 ? points[points.length - 1].x ?? x : x;
                  this.y = points.length > 0 ? points[points.length - 1].y ?? y : y;
                  X.timer.off('tick', listener);
                  resolve();
               }
            } else {
               X.timer.off('tick', listener);
            }
         };
         X.timer.on('tick', listener);
      });
   }
   multiply(a: number | X2): XVector;
   multiply(x: number, y: number): XVector;
   multiply (a: number | X2, b = a as number) {
      if (typeof a === 'number') {
         return new XVector(this.x * a, this.y * b);
      } else {
         return this.multiply(a.x, a.y);
      }
   }
   round (base?: number): XVector {
      return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
   }
   shift (angle: number, extent: number, origin = X.zero) {
      return origin.endpoint(this.angle(origin) + angle, this.extent(origin) + extent);
   }
   subtract(a: number | X2): XVector;
   subtract(x: number, y: number): XVector;
   subtract (a: number | X2, b = a as number) {
      if (typeof a === 'number') {
         return new XVector(this.x - a, this.y - b);
      } else {
         return this.subtract(a.x, a.y);
      }
   }
   value () {
      return { x: this.x, y: this.y };
   }
}

class XText extends XObject {
   cache: boolean;
   charset: string;
   content: string;
   spacing: XVector;
   constructor (properties: XTextProperties = {}) {
      super(properties);
      (({
         cache = true,
         charset = '/0123456789=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
         content = '',
         spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {}
      }: XTextProperties = {}) => {
         this.cache = cache;
         this.charset = charset;
         this.content = content;
         this.spacing = new XVector(spacing_x, spacing_y);
      })(properties);
   }
   compute () {
      return new XVector();
   }
   draw (
      renderer: PRenderer | PCanvasRenderer,
      [ position, rotation, scale ]: XTransform,
      [ quality, zoom ]: XFactor,
      style: XStyle
   ) {
      let index = 0;
      const state = Object.assign({}, style);
      const phase = X.time / 1e3;
      const offset = { x: 0, y: 0 };
      const random = { x: 0, y: 0 };
      const swirl = { p: 0, r: 0, s: 0 };
      const [ fontSize, fontFamily ] = style.font.split(' ');
      const shadowColor = X.color(style.shadowColor);
      const strokeColor = X.color(style.strokeStyle);
      const textStyle = new PIXI.TextStyle({
         dropShadow: shadowColor[3] > 0,
         dropShadowAlpha: shadowColor[3],
         dropShadowAngle: X.zero.angle({ x: style.shadowOffsetX, y: style.shadowOffsetY }),
         dropShadowBlur: style.shadowBlur,
         dropShadowColor: `#${X.hex(shadowColor)}`,
         dropShadowDistance: X.zero.extent({ x: style.shadowOffsetX, y: style.shadowOffsetY }),
         fill: `#${X.hex(X.color(style.fillStyle))}`,
         fontFamily,
         fontSize,
         lineJoin: style.lineJoin,
         miterLimit: style.miterLimit,
         stroke: `#${X.hex(strokeColor)}`,
         strokeThickness: strokeColor[3] > 0 ? style.lineWidth : 0,
         textBaseline: style.textBaseline
      });
      const metrics = X.metrics(textStyle, this.charset);
      const lines = this.content.split('\n').map(section => {
         let total = 0;
         for (const char of section) {
            total += X.metrics(textStyle, char).x + this.spacing.x;
         }
         return total;
      });
      const size = new XVector(Math.max(...lines), metrics.y + (metrics.y + this.spacing.y) * (lines.length - 1));
      const half = size.divide(2);
      const base = position
         .divide(scale)
         .multiply(quality)
         .subtract(half.add(half.multiply(this.anchor)));
      const container = new PIXI.Container();
      container.rotation = (Math.PI / 180) * (rotation % 360);
      container.scale.set(scale.x, scale.y);
      while (index < this.content.length) {
         const char = this.content[index++];
         if (char === '\n') {
            offset.x = 0;
            offset.y += metrics.y + this.spacing.y;
         } else if (char === '\xa7') {
            const code = this.content.slice(index, this.content.indexOf('\xa7', index));
            const [ key, value ] = code.split(':');
            index += code.length + 1;
            switch (key) {
               case 'alpha':
                  style.globalAlpha = state.globalAlpha * Math.min(Math.max(+value, 0), 1);
                  break;
               case 'blend':
                  style.globalCompositeOperation = value as GlobalCompositeOperation;
                  break;
               case 'fill':
                  textStyle.fill = `#${X.hex(X.color(value))}`;
                  break;
               case 'font':
                  style.font = value;
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
                  const strokeColor = X.color(value);
                  textStyle.stroke = `#${X.hex(strokeColor)}`;
                  textStyle.strokeThickness = strokeColor[3] > 0 ? style.lineWidth : 0;
                  break;
               case 'swirl':
                  const [ swirlR, swirlS, swirlP ] = value.split(',').map(value => +value);
                  swirl.r = swirlR || 0;
                  swirl.s = swirlS || 0;
                  swirl.p = swirlP || 0;
                  break;
            }
         } else {
            let x = base.x - textStyle.strokeThickness / 2 + offset.x;
            let y = base.y - textStyle.strokeThickness / 2 + offset.y;
            if (random.x > 0) {
               x += random.x * (Math.random() - 0.5);
            }
            if (random.y > 0) {
               y += random.y * (Math.random() - 0.5);
            }
            if (swirl.s > 0 && swirl.r > 0) {
               const endpoint = new XVector(x, y).endpoint(
                  ((phase * 360 * swirl.s) % 360) + index * (360 / swirl.p),
                  swirl.r
               );
               x = endpoint.x;
               y = endpoint.y;
            }
            const font = X.font(textStyle, char, 40);
            const info = font.chars[char.charCodeAt(0)];
            if (info) {
               const text = PIXI.Sprite.from(info.texture);
               text.position.set(x + info.xOffset, y + info.yOffset);
               text.alpha = style.globalAlpha;
               text.blendMode = X.blend(style.globalCompositeOperation);
               container.addChild(text);
            }
            offset.x += X.metrics(textStyle, char).x + this.spacing.x;
         }
      }
      renderer.render(container);
      container.destroy({ children: true });
      Object.assign(style, state);
   }
}

const GL = PIXI.utils.isWebGLSupported();

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
   blend (input: GlobalCompositeOperation) {
      switch (input) {
         case 'lighten':
            return PIXI.BLEND_MODES.ADD;
         case 'multiply':
            return PIXI.BLEND_MODES.MULTIPLY;
         case 'screen':
            return PIXI.BLEND_MODES.SCREEN;
         default:
            return PIXI.BLEND_MODES.NORMAL;
      }
   },
   cache: {
      audios: {} as XKeyed<Promise<AudioBuffer>>,
      audioAssets: {} as XKeyed<XAudio[]>,
      color: {} as XKeyed<XColor>,
      datas: {} as XKeyed<Promise<XBasic>>,
      dataAssets: {} as XKeyed<XData[]>,
      fonts: {} as XKeyed<{ time: number; value: PBitmapFont }>,
      images: {} as XKeyed<Promise<PBaseTexture>>,
      imageAssets: {} as XKeyed<XImage[]>,
      textMetrics: {} as XKeyed<X2>,
      textures: new Map<XImage, PTexture>(),
      modulationTasks: new Map<AudioParam | XNumber | XVector, { cancel: () => void }>()
   },
   chain<A, B> (input: A, handler: (input: A, loop: (input: A) => B) => B) {
      const loop = (input: A) => handler(input, loop);
      return loop(input);
   },
   color (input: string) {
      if (input in X.cache.color) {
         return X.cache.color[input];
      } else {
         const element = document.createElement('x');
         element.style.color = input;
         document.body.appendChild(element);
         const color = getComputedStyle(element)
            .color.split('(')[1]
            .slice(0, -1)
            .split(', ')
            .map(value => +value);
         element.remove();
         color.length === 3 && color.push(1);
         return (X.cache.color[input] = color as XColor);
      }
   },
   daemon (
      audio: XAudio,
      {
         context = new AudioContext(),
         gain = 1,
         loop = false,
         rate = 1,
         router = ((context: AudioContext, input: GainNode) => input.connect(context.destination)) as XRouter
      } = {}
   ) {
      const daemon: XDaemon = {
         audio,
         context,
         gain,
         instance (offset = 0, store = false) {
            const context = daemon.context;
            const gain = context.createGain();
            const source = context.createBufferSource();
            gain.gain.value = daemon.gain;
            source.buffer = daemon.audio.value;
            source.loop = daemon.loop;
            source.playbackRate.value = daemon.rate;
            daemon.router(context, gain);
            source.connect(gain);
            const instance = {
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
                  if (source.buffer) {
                     source.stop();
                     source.disconnect();
                     source.buffer = null;
                     store && daemon.instances.splice(daemon.instances.indexOf(instance), 1);
                     gain.disconnect();
                  }
               }
            };
            source.addEventListener('ended', () => {
               instance.loop || instance.stop();
            });
            source.start(0, offset);
            store && daemon.instances.push(instance);
            return instance;
         },
         instances: [] as XInstance[],
         loop,
         rate,
         router
      };
      return daemon;
   },
   data (source: string) {
      if (source in X.cache.datas) {
         return X.cache.datas[source];
      } else {
         return (X.cache.datas[source] = fetch(source).then(value => value.json() as Promise<XBasic>));
      }
   },
   dataAsset<A extends XBasic = XBasic> (
      source: string,
      { cache = 0, modifier = void 0 as ((data: XBasic) => A) | void } = {}
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
   font (style: PTextStyle, charset: string, quality = 1) {
      const key = `${Object.values(style).join('\x00')}\x00${charset}\x00${quality}`;
      if (key in X.cache.fonts) {
         const font = X.cache.fonts[key];
         font.time = X.time;
         return font.value;
      } else {
         const size =
            typeof style.fontSize === 'number' ? style.fontSize : +style.fontSize.replace(/(px|pt|em|%)/g, '');
         return (X.cache.fonts[key] = {
            time: X.time,
            value: PIXI.BitmapFont.from(key, style, {
               chars: charset.split(''),
               padding: 0,
               resolution: quality,
               textureHeight: Math.max(size * quality * 1.25, 100),
               textureWidth: Math.max(size * quality * 1.25, 100)
            })
         }).value;
      }
   },
   hex (color: XColor, alpha = false) {
      return color
         .slice(0, alpha ? 4 : 3)
         .map(value => value.toString(16).padStart(2, '0'))
         .join('');
   },
   hyperpromise<A = void> () {
      let hyperresolve: (value: A | PromiseLike<A>) => void;
      const promise = new Promise<A>(resolve => {
         hyperresolve = resolve;
      });
      return { promise, resolve: hyperresolve! };
   },
   image (source: string) {
      if (source in X.cache.images) {
         return X.cache.images[source];
      } else {
         const texture = PIXI.BaseTexture.from(source);
         return (X.cache.images[source] = texture.resource.load().then(() => texture));
      }
   },
   imageAsset (
      source: string,
      { cache = 0, shader = void 0 as ((color: XColor, index: X2, total: X2) => XColor) | void } = {}
   ): XImage {
      const asset = new XAsset({
         async loader () {
            const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
            assets.includes(asset) || assets.push(asset);
            let image = await X.image(source);
            if (image.width === 0 || image.height === 0) {
               image = PIXI.BaseTexture.from(await createImageBitmap(new ImageData(1, 1)));
            } else if (shader) {
               const sprite = PIXI.Sprite.from(image);
               const data = new Uint8ClampedArray((X.shader.plugins.extract as PExtract).pixels(sprite));
               sprite.destroy();
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
               image = PIXI.BaseTexture.from(await createImageBitmap(new ImageData(data, image.width)));
            }
            X.cache.textures.set(asset, PIXI.Texture.from(image));
            return image;
         },
         source,
         async unloader () {
            const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
            X.pause(cache).then(() => {
               assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
               if (assets.length === 0) {
                  X.cache.images[source]?.then(image => image.destroy());
                  delete X.cache.images[source];
                  if (X.cache.textures.has(asset)) {
                     X.cache.textures.get(asset)!.destroy();
                     X.cache.textures.delete(asset);
                  }
               }
            });
         }
      });
      return asset;
   },
   async import (source: string) {
      return (await fetch(source)).text();
   },
   async importJSON<X> (source: string) {
      return (await fetch(source)).json() as Promise<X>;
   },
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
   math: {
      bezier (value: number, ...points: number[]): number {
         return points.length > 1
            ? X.math.bezier(
                 value,
                 ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value)
              )
            : points[0] || 0;
      },
      cardinal (angle: number): XCardinal {
         if (angle < 45 || angle > 315) {
            return 'left';
         } else if (angle <= 135) {
            return 'up';
         } else if (angle < 225) {
            return 'right';
         } else {
            return 'down';
         }
      },
      format (value: number) {
         return Math.round(value);
      },
      intersection (a1: X2, a2: X2, b1: X2, b2: X2) {
         return (
            X.math.rotation(a1, b1, b2) !== X.math.rotation(a2, b1, b2) &&
            X.math.rotation(a1, a2, b1) !== X.math.rotation(a1, a2, b2)
         );
      },
      remap (value: number, min2: number, max2: number, min1 = 0, max1 = 1) {
         return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
      },
      rotation (a1: X2, a2: X2, a3: X2) {
         return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
      },
      wave (value: number) {
         return Math.sin(((value + 0.5) * 2 - 1) * Math.PI) / 2 + 0.5;
      }
   },
   metrics (style: PTextStyle, content: string) {
      const key = `${style.toFontString()}\x00${content}`;
      if (key in X.cache.textMetrics) {
         return X.cache.textMetrics[key];
      } else {
         let index = 0;
         let width = 0;
         let height = 0;
         const font = X.font(style, content);
         while (index < content.length) {
            const info = font.chars[content.charCodeAt(index++)];
            if (info) {
               width += info.texture.width + info.xOffset || 0 + info.xAdvance || 0;
               height = Math.max(height, info.texture.height + info.yOffset || 0);
            }
         }
         return (X.cache.textMetrics[key] = { x: width, y: height });
      }
   },
   parse (text: string) {
      return JSON.parse(text, (key, value) => {
         if (value === '\x00') {
            return Infinity;
         } else if (value === '\x01') {
            return -Infinity;
         } else {
            return value;
         }
      });
   },
   pause (duration = 0) {
      if (duration === Infinity) {
         return new Promise<void>(resolve => {});
      } else {
         return X.chain<number, Promise<void>>(0, async (elapsed, next) => {
            if (elapsed < duration) {
               await next(elapsed + (await X.timer.on('tick'))[0]);
            }
         });
      }
   },
   populate<A extends (index: number) => any>(size: number, provider: A) {
      let index = 0;
      const array = [] as ReturnType<A>[];
      while (index < size) {
         array.push(provider(index++));
      }
      return array;
   },
   provide<A extends XProvider<unknown, unknown[]>> (
      provider: A,
      ...args: A extends XProvider<any, infer B> ? B : never
   ): A extends XProvider<infer B, any[]> ? B : never {
      return typeof provider === 'function' ? X.provide(provider(...args)) : provider;
   },
   shader: new (GL ? PIXI.Renderer : PIXI.CanvasRenderer)({
      antialias: false,
      backgroundAlpha: 0,
      clearBeforeRender: false
   }) as PRenderer & PCanvasRenderer,
   sound: {
      convolver (context: AudioContext, duration: number, ...pattern: number[]) {
         const convolver = context.createConvolver();
         convolver.buffer = X.sound.impulse(context, duration, ...pattern);
         return convolver;
      },
      filter (context: AudioContext, type: BiquadFilterType, frequency: number) {
         const filter = context.createBiquadFilter();
         filter.type = type;
         filter.frequency.value = frequency;
         return filter;
      },
      impulse (context: AudioContext, duration: number, ...pattern: number[]) {
         let index = -1;
         const size = context.sampleRate * duration;
         const buffer = context.createBuffer(2, size, context.sampleRate);
         while (++index < size) {
            let channel = 0;
            while (channel < buffer.numberOfChannels) {
               try {
                  const data = buffer.getChannelData(channel++);
                  data[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...pattern);
                  data[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...pattern);
               } catch (error) {}
            }
         }
         return buffer;
      }
   },
   speed: new XNumber(1),
   status (
      text: string,
      {
         backgroundColor = '#000',
         color = '#fff',
         fontFamily = 'Courier New',
         fontSize = '16px',
         padding = '4px 8px'
      } = {}
   ) {
      console.log(
         `%c${text}`,
         `background-color:${backgroundColor};color:${color};font-family:${fontFamily};font-size:${fontSize};padding:${padding};`
      );
   },
   stringify (value: any) {
      return JSON.stringify(value, (key, value) => {
         if (value === Infinity) {
            return '\x00';
         } else if (value === -Infinity) {
            return '\x01';
         } else {
            return value;
         }
      });
   },
   text: (() => {
      const canvas = document.createElement('canvas');
      Object.assign(canvas.style, {
         imageRendering: 'pixelated',
         webkitFontSmoothing: 'none'
      });
      return canvas;
   })(),
   time: 0,
   timer: (() => {
      const host = new XHost<{ init: []; tick: [number] }>();
      host.on('init').then(() => {
         setInterval(() => {
            X.time += 5 * X.speed.value;
            X.timer.fire('tick', 5 * X.speed.value);
            for (const key in X.cache.fonts) {
               X.time - X.cache.fonts[key].time > 30e3 && delete X.cache.fonts[key];
            }
         }, 5);
      });
      return host;
   })(),
   weighted<A extends string> (input: XProvider<[A, number][]>, modifier = Math.random()) {
      const weights = X.provide(input);
      let total = 0;
      for (const entry of weights) {
         total += entry[1];
      }
      const value = modifier * total;
      for (const entry of weights) {
         if (value > (total -= entry[1])) {
            return entry[0];
         }
      }
   },
   when (condition: () => boolean) {
      return new Promise<void>(resolve => {
         const listener = () => {
            if (condition()) {
               resolve();
               X.timer.off('tick', listener);
            }
         };
         X.timer.on('tick', listener);
      });
   },
   zero: new XVector()
};

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = false;
PIXI.settings.RESOLUTION = 1;

AudioParam.prototype.modulate = function (duration: number, ...points: number[]) {
   return XNumber.prototype.modulate.call(this, duration, ...points);
};

X.timer.fire('init');
