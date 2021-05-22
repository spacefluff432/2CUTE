type X2 = { x: number; y: number };
type X3 = { x: number; y: number; z: number };
type X4 = { x: number; y: number; w: number; h: number };

type X2Arg = { x?: number; y?: number };
type X3Arg = { x?: number; y?: number; z?: number };
type X4Arg = { x?: number; y?: number; w?: number; h?: number };

type XListener<Y> =
   | ((host: Y, ...data: any[]) => void)
   | { script: (host: Y, ...data: any[]) => void; priority?: number };

class XHost {
   events: Map<string, Set<XListener<this>>> = new Map();
   on (name: string, ...listeners: XListener<this>[]) {
      this.events.has(name) || this.events.set(name, new Set());
      const list = this.events.get(name);
      if (list != null) {
         for (const listener of listeners) list.add(listener);
      }
   }
   off (name: string, ...listeners: XListener<this>[]) {
      if (this.events.has(name)) {
         const list = this.events.get(name);
         if (list != null) {
            for (const listener of listeners) list.delete(listener);
         }
      }
   }
   fire (name: string, ...data: any[]) {
      if (this.events.has(name)) {
         const list = this.events.get(name);
         if (list != null) {
            for (const listener of [ ...list ].sort(
               (a, b) =>
                  (typeof a === 'function' ? 0 : a.priority || 0) - (typeof b === 'function' ? 0 : b.priority || 0)
            )) {
               typeof listener === 'function' ? listener(this, ...data) : listener.script(this, ...data);
            }
         }
      }
   }
}

class XAsset {
   image: HTMLImageElement = new Image();
   constructor (source: string) {
      this.image.src = source;
   }
}

class XTexture {
   asset: XAsset;
   mapping: X4;
   constructor (
      asset: XAsset,
      { mapping: { x = 0, y = 0, w = asset.image.width - x, h = asset.image.height - y } = {} }: { mapping: X4Arg }
   ) {
      this.asset = asset;
      this.mapping = { x, y, w, h };
   }
}

class XAnimation {
   attributes: { sticky: boolean; single: boolean };
   default: number = 0;
   index: number = 0;
   state: boolean = false;
   step: number = 0;
   steps: number;
   textures: XTexture[];
   constructor (
      {
         attributes: { sticky = false, single = false } = {},
         default: $default = 0,
         steps = 1,
         textures = []
      }: {
         attributes?: { sticky?: boolean; single?: boolean };
         default?: number;
         steps?: number;
         textures?: XTexture[];
      } = {}
   ) {
      this.attributes = { sticky, single };
      this.default = $default;
      this.steps = steps;
      this.textures = textures;
   }
   compute () {
      const texture = this.textures[this.state || this.attributes.sticky ? this.index : this.default];
      if (this.state && ++this.step >= this.steps) {
         this.step = 0;
         if (++this.index >= this.textures.length) {
            this.index = 0;
            this.attributes.single && (this.state = false);
         }
      }
      return texture;
   }
}

class XEntity {
   animation?: XAnimation;
   attributes: { collidable: boolean; interactable: boolean; visible: boolean; triggerable: boolean };
   hitbox: X4;
   metadata: { [$: string]: any };
   position: X3;
   texture?: XTexture;
   constructor (
      {
         animation,
         attributes: { collidable = false, interactable = false, visible = false, triggerable = false } = {},
         hitbox: { x = 0, y = 0, w = 0, h = 0 } = {},
         metadata = {},
         position: { x: a = 0, y: b = 0, z: c = 0 } = {},
         texture
      }: {
         animation?: XAnimation;
         attributes?: { collidable?: boolean; interactable?: boolean; visible?: boolean; triggerable?: boolean };
         hitbox?: X4Arg;
         metadata?: { [$: string]: any };
         position?: X3Arg;
         texture?: XTexture;
      } = {}
   ) {
      this.animation = animation;
      this.attributes = { collidable, interactable, visible, triggerable };
      this.hitbox = { x, y, w, h };
      this.metadata = metadata;
      this.position = { x: a, y: b, z: c };
      this.texture = texture;
   }
}

class XInput extends XHost {
   state: boolean = false;
   constructor (...keys: string[]) {
      super();
      addEventListener('keydown', (event) => {
         if (keys.includes(event.key) && !this.state) {
            this.fire('press', event);
            this.state = true;
         }
      });
      addEventListener('keyup', (event) => {
         if (keys.includes(event.key) && this.state) {
            this.fire('release', event);
            this.state = false;
         }
      });
   }
}

class XRoom {
   collidables: Set<XEntity> = new Set();
   hitbox: X4;
   interactables: Set<XEntity> = new Set();
   triggerables: Set<XEntity> = new Set();
   visibles: Set<XEntity> = new Set();
   constructor ({
      entities = [],
      hitbox: { x = 0, y = 0, w = 0, h = 0 } = {}
   }: {
      entities?: XEntity[];
      hitbox?: X4Arg;
   }) {
      for (const entity of entities) {
         entity.attributes.collidable && this.collidables.add(entity);
         entity.attributes.interactable && this.interactables.add(entity);
         entity.attributes.triggerable && this.triggerables.add(entity);
         entity.attributes.visible && this.visibles.add(entity);
      }
      this.hitbox = { x, y, w, h };
   }
}
