type UndertaleDialoguerProperties = XProperties<UndertaleDialoguer, 'interval'>;

type UndertaleData<A extends string = any> = {
   armor: A;
   boxes: A[][];
   flags: XKeyed<string | number | boolean>;
   fun: number;
   g: number;
   hp: number;
   items: A[];
   name: string;
   room: string;
   xp: number;
   weapon: A;
};

type UndertaleEntityProperties = {
   [x in Exclude<keyof XDefined<XHitboxProperties>, 'objects'>]?: XDefined<XHitboxProperties>[x]
} &
   XProperties<UndertaleEntity, 'sprites' | 'step'>;

type UndertaleInteractiveEntityProperties = UndertaleEntityProperties &
   XProperties<UndertaleInteractiveEntity, 'extent'>;

type UndertaleItem = {
   drop?: XProvider<string[]> | void;
   info?: XProvider<string[]> | void;
   name?: XProvider<string> | void;
   type?: 'armor' | 'consumable' | 'weapon' | void;
   use?: XProvider<string[]> | void;
   value?: XProvider<number> | void;
};

class UndertaleDialoguer extends XHost<
   XKeyed<[string], 'char' | 'code' | 'header' | 'text'> & XKeyed<[], 'empty' | 'idle' | 'read' | 'skip'>
> {
   interval: XNumber;
   state = { mode: 'empty' as 'empty' | 'idle' | 'read' | 'skip', skip: true, text: [] as string[] };
   constructor ({ interval = 1 }: UndertaleDialoguerProperties = {}) {
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
   // dialoguer text input preprocessor - by harrix432 & Toby Fox
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
                  skip || this.fire('text', this.state.text.join(''));
               }
            }
            (this.state.mode as string) === 'skip' && this.fire('text', this.state.text.join(''));
            this.fire('idle');
            this.state.mode = 'idle';
            advance || (await this.on('read'));
            this.state.text = [];
         }
         this.fire('text', '');
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

class UndertaleEntity extends XHitbox {
   sprites: XKeyed<XSprite, XCardinal>;
   step: number;
   constructor (properties: UndertaleEntityProperties = {}) {
      super(properties);
      ((
         {
            sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {},
            step = 1
         }: UndertaleEntityProperties = {}
      ) => {
         this.sprites = {
            down: down instanceof XSprite ? down : new XSprite(down),
            left: left instanceof XSprite ? left : new XSprite(left),
            right: right instanceof XSprite ? right : new XSprite(right),
            up: up instanceof XSprite ? up : new XSprite(up)
         };
         this.step = step;
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
   facing (cardinal: XCardinal) {
      return this.objects[0] === this.sprites[cardinal];
   }
   walk (offset: X2, renderer: XRenderer, filter: boolean | ((hitbox: XHitbox) => boolean) = false) {
      const source = this.position.value();
      const hitboxes = filter ? renderer.calculate(typeof filter === 'function' ? filter : () => true) : [];
      for (const axis of [ 'x', 'y' ] as ['x', 'y']) {
         const distance = offset[axis];
         if (distance !== 0) {
            this.position[axis] += distance;
            const hits = this.detect(renderer, ...hitboxes);
            if (hits.length > 0) {
               const single = distance / Math.abs(distance) * this.step;
               while (this.position[axis] !== source[axis] && this.detect(renderer, ...hits).length > 0) {
                  this.position[axis] -= single;
               }
            }
         }
      }
      if (this.position.x === source.x && this.position.y === source.y) {
         if (offset.y < 0) {
            this.face('up');
         } else if (offset.y > 0) {
            this.face('down');
         } else if (offset.x < 0) {
            this.face('left');
         } else if (offset.x > 0) {
            this.face('right');
         }
         this.objects.length === 0 || (this.objects[0] as XSprite).disable().reset();
         return false;
      } else {
         if (this.position.y < source.y) {
            this.face('up');
         } else if (this.position.y > source.y) {
            this.face('down');
         } else if (this.position.x < source.x) {
            this.face('left');
         } else if (this.position.x > source.x) {
            this.face('right');
         }
         this.objects.length === 0 || (this.objects[0] as XSprite).enable();
         return true;
      }
   }
}

class UndertaleInteractiveEntity extends UndertaleEntity {
   extent: XVector;
   constructor (properties: UndertaleInteractiveEntityProperties = {}) {
      super(properties);
      (({ extent: { x: extent_x = 0, y: extent_y = 0 } = {} }: UndertaleInteractiveEntityProperties = {}) => {
         this.extent = new XVector(extent_x, extent_y);
      })(properties);
   }
   face (cardinal: XCardinal) {
      super.face(cardinal);
      this.objects[1] = new XHitbox({
         anchor: {
            x: cardinal === 'left' ? 1 : cardinal === 'right' ? -1 : 0,
            y: cardinal === 'up' ? 1 : cardinal === 'down' ? -1 : 0
         },
         size: {
            x: cardinal === 'left' || cardinal === 'right' ? this.extent.y : this.extent.x,
            y: cardinal === 'down' || cardinal === 'up' ? this.extent.y : this.extent.x
         }
      });
   }
}

const Undertale = {
   battler<A extends string, B extends A> ({
      attack,
      choices,
      root
   }: {
      attack: ((choice: B) => Promise<boolean>);
      choices: XKeyed<B[] | (() => Promise<void>), A>;
      root: B[];
   }) {
      const state = { history: [] as B[] };
      const events = new XHost<{ player: [B]; opponent: [boolean] }>();
      function selection () {
         if (state.history.length > 0) {
            return choices[state.history[state.history.length - 1]];
         } else {
            return root;
         }
      }
      return {
         list (): B[] {
            const choice = selection();
            if (choice && typeof choice === 'object') {
               return choice;
            } else {
               return [];
            }
         },
         next (index: number | string) {
            const choice = selection();
            if (choice && typeof choice === 'object') {
               typeof index === 'string' && (index = choice.indexOf(index as any));
               if (index > -1 && index < choice.length) {
                  const key = choice[index];
                  if (key in choices) {
                     state.history.push(key);
                     const choice = choices[key];
                     if (typeof choice === 'function') {
                        state.history.splice(0, state.history.length);
                        choice().then(async () => {
                           events.fire('player', key);
                           events.fire('opponent', await attack(key));
                        });
                     }
                  }
               }
            }
         },
         prev () {
            if (typeof selection() === 'function') {
               return false;
            } else {
               state.history.pop();
               return state.history.length > 0;
            }
         },
         state
      };
   },
   game<A extends string, B extends A, C extends string, D extends C> ({
      container,
      debug,
      framerate,
      layers,
      player,
      region,
      rooms,
      shake,
      size
   }: {
      [x in Exclude<keyof XDefined<XRendererProperties>, 'alpha' | 'auto' | 'camera' | 'layers'>]?: XDefined<
         XRendererProperties
      >[x]
   } & {
      layers: XKeyed<XRendererLayerMode, A>;
      player?: XObject | void;
      rooms: XKeyed<
         {
            assets?: XAsset[] | void;
            layers?: Partial<XKeyed<XObject[], B>> | void;
            neighbors?: D[] | void;
            region?: XRegion | void;
         },
         C
      >;
   }) {
      const renderer = new XRenderer({
         alpha: 1,
         auto: true,
         container,
         debug,
         framerate,
         layers,
         region,
         shake,
         size
      }).on('tick', {
         priority: Infinity,
         listener () {
            state.player && Object.assign(renderer.camera, state.player.position.value());
         }
      });
      const state = { player, room: null as D | null };
      return {
         renderer,
         state,
         async teleport (target: D | null, fade?: boolean) {
            const prev = [] as XAsset[];
            const zero = renderer.size.divide(2).value();
            const source = state.room;
            if (typeof source === 'string') {
               const room = rooms[source];
               await renderer.alpha.modulate(fade ? 300 : 0, 0);
               for (const key in (room.layers || {}) as XKeyed<XObject[], B>)
                  renderer.detach(key, ...room.layers![key]!);
               for (const name of [ source, ...(room.neighbors || []) ]) {
                  for (const asset of rooms[name].assets || []) prev.includes(asset) || prev.push(asset);
               }
            }
            if (typeof target === 'string') {
               const room = rooms[target];
               const queue = [] as Promise<void>[];
               const region = room.region || [ zero, zero ];
               Object.assign(renderer.region[0], region[0]);
               Object.assign(renderer.region[1], region[1]);
               for (const name of [ target, ...(room.neighbors || []) ]) {
                  for (const asset of rooms[name].assets || []) {
                     if (prev.includes(asset)) {
                        prev.splice(prev.indexOf(asset), 1);
                     } else if (name === target) {
                        queue.push(asset.load());
                     } else {
                        asset.load();
                     }
                  }
               }
               await Promise.all(queue);
               for (const key in (room.layers || {}) as XKeyed<XObject[], B>)
                  renderer.attach(key, ...room.layers![key]!);
               renderer.alpha.modulate(fade ? 300 : 0, 1);
            } else {
               Object.assign(renderer.region[0], zero);
               Object.assign(renderer.region[1], zero);
            }
            for (const asset of prev) asset.unload();
            state.room = target;
         }
      };
   },
   levels: [
      10,
      30,
      70,
      120,
      200,
      300,
      500,
      800,
      1200,
      1700,
      2500,
      3500,
      5000,
      7000,
      10000,
      15000,
      25000,
      50000,
      99999,
      Infinity
   ],
   async manager<A extends string, B extends A> ({
      default: $default,
      items,
      key
   }: {
      items: XKeyed<UndertaleItem, A>;
      default: UndertaleData<string>;
      key: string;
   }) {
      let data: UndertaleData<B>;
      const template = Undertale.stringify($default);
      function hp () {
         const value = lv() * 4 + 16;
         if (value > 92) {
            return 99;
         } else {
            return value;
         }
      }
      function load () {
         data = Undertale.parse(localStorage.getItem(key) || template);
      }
      function lv () {
         let lv = 1;
         while (Undertale.levels[lv - 1] < data.xp) lv++;
         return lv;
      }
      function save () {
         localStorage.setItem(key, Undertale.stringify(data));
      }
      load();
      return {
         activate (index: number, action: 'use' | 'info' | 'drop') {
            const name = data.items[index];
            const item = items[name];
            switch (action) {
               case 'use':
                  switch (item.type) {
                     case 'armor':
                     case 'weapon':
                        data.items[index] = data[item.type];
                        data[item.type] = name;
                        break;
                     case 'consumable':
                        data.items.splice(index, 1);
                        data.hp = Math.min(
                           hp(),
                           data.hp + (typeof item.value === 'function' ? item.value() : item.value || 0)
                        );
                        break;
                  }
                  break;
               case 'drop':
                  this.data.items.splice(index, 1);
                  break;
            }
         },
         get at () {
            return lv() * 2 + 8;
         },
         get atx () {
            const item = this.items[this.data.weapon];
            if (item) {
               return typeof item.value === 'function' ? item.value() : item.value || 0;
            } else {
               return 0;
            }
         },
         get data () {
            return data;
         },
         get df () {
            return Math.ceil(lv() / 4) + 9;
         },
         get dfx () {
            const item = this.items[this.data.armor];
            if (item) {
               return typeof item.value === 'function' ? item.value() : item.value || 0;
            } else {
               return 0;
            }
         },
         get hp () {
            return hp();
         },
         getFlag (name: string) {
            return JSON.parse(localStorage.getItem(`${key}:flag:${name}`) || 'false') as XBasic;
         },
         items,
         load,
         get lv () {
            return lv();
         },
         reset (trueReset = false) {
            const next: UndertaleData<B> = Undertale.parse(template);
            trueReset || (next.name = data.name);
            data = next;
            save();
            if (trueReset) {
               for (const name of new Array(localStorage.length).fill(0).map((x, index) => localStorage.key(index))) {
                  if (name && !name.startsWith(`${key}:flag:$`)) {
                     localStorage.removeItem(name);
                  }
               }
            }
         },
         save,
         setFlag (name: string, value: XBasic) {
            localStorage.setItem(`${key}:flag:${name}`, JSON.stringify(value));
         }
      };
   },
   module<A, B extends any[]> (name: string, script: (...args: B) => Promise<A>) {
      let promise: void | Promise<A>;
      return (...args: B) => {
         Undertale.status(`IMPORT MODULE: ${name}`, '#07f');
         if (promise === void 0) {
            promise = script(...args);
            promise.then(() => {
               Undertale.status(`MODULE INITIALIZED: ${name}`, '#0f0');
            });
            promise.catch(reason => {
               Undertale.status(`MODULE ERROR: ${name}`, '#f00');
               console.error(reason);
            });
         }
         return promise;
      };
   },
   parse (text: string) {
      return JSON.parse(text, (x, value) => {
         if (typeof value === 'string') {
            switch (value[0]) {
               case '~':
                  return value.slice(1);
               case '-Infinity':
               case 'Infinity':
               case 'NaN':
                  return eval(value);
               default:
                  return void 0;
            }
         } else {
            return value;
         }
      });
   },
   status (text: string, color = '#fff', size = '16px') {
      console.log(
         `%c${text}`,
         `background:black;color:${color};font-family:Courier New;font-size:${size};padding:1em;`
      );
   },
   stringify (data: UndertaleData) {
      return JSON.stringify(data, (x, value) => {
         if (typeof value === 'string') {
            return `~${value}`;
         } else {
            switch (value) {
               case -Infinity:
                  return '-Infinity';
               case Infinity:
                  return 'Infinity';
               case NaN:
                  return 'NaN';
               case void 0:
                  return '';
               default:
                  return value;
            }
         }
      });
   }
};
