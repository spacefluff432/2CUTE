//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
//   ##    ##   ########   #######    ########   ########   ########   ########   ##         ########   //
//   ##    ##   ##    ##   ##    ##   ##         ##     ##     ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ##         ##     ##     ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ######     ########      ##      ########   ##         ######     //
//   ##    ##   ##    ##   ##    ##   ##         ##  ###       ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ##         ##   ###      ##      ##    ##   ##         ##         //
//   ########   ##    ##   #######    ########   ##    ###     ##      ##    ##   ########   ########   //
//                                                                                                      //
///// imagine using unitale //////////////////////////////////////////////////////////////////////////////

type XDialoguerProperties = XProperties<XDialoguer, 'interval'>;

type XBattlerProperties<X extends string = any> = {
   attack?: ((choice: X) => Promise<boolean | void>) | void;
   choices: XKeyed<X[] | ((self: XBattler<X>) => Promise<void>), X>;
   menu?: X[];
};

type XItemProperties = XProperties<XItem, 'type'> & {
   drop?: XProvider<string[]>;
   info?: XProvider<string[]>;
   use?: XProvider<string[]>;
   value?: XProvider<number>;
};

type XSaveData<A extends string = any> = {
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

type XWalkerProperties = {
   [x in Exclude<keyof XDefined<XHitboxProperties>, 'objects'>]?: XDefined<XHitboxProperties>[x]
} &
   XProperties<XWalker, 'sprites' | 'step'>;

class XBattler<X extends string> extends XHost<{ choice: [X] }> {
   attack: ((choice: X) => Promise<boolean | void>);
   choices: XKeyed<X[] | ((self: XBattler<X>) => Promise<void>), X>;
   menu: X[];
   state = { history: [] as X[] };
   constructor ({ attack = async () => {}, choices, menu = [] }: XBattlerProperties<X>) {
      super();
      this.attack = attack;
      this.choices = choices;
      this.menu = menu;
   }
   choice () {
      if (this.state.history.length > 0) {
         return this.choices[this.state.history[this.state.history.length - 1]];
      } else {
         return this.menu;
      }
   }
   list () {
      const choice = this.choice();
      if (choice && typeof choice === 'object') {
         return choice as X[];
      } else {
         return [];
      }
   }
   async loop () {
      const choice = (await this.on('choice'))[0];
      if (await this.attack(choice)) {
         this.state.history.splice(0, this.state.history.length);
         await this.loop();
      }
   }
   next (index: number | string) {
      const choice = this.choice();
      if (choice && typeof choice === 'object') {
         typeof index === 'string' && (index = choice.indexOf(index as any));
         if (index > -1 && index < choice.length) {
            const key = choice[index];
            if (key in this.choices) {
               this.state.history.push(key);
               const choice = this.choices[key];
               if (typeof choice === 'function') {
                  choice(this).then(() => this.fire('choice', key));
               }
            }
         }
      }
   }
   prev () {
      return typeof this.choice() === 'function' || (this.state.history.pop(), this.state.history.length === 0);
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

class XItem {
   drop: XProvider<string[]>;
   info: XProvider<string[]>;
   type: 'armor' | 'consumable' | 'weapon';
   use: XProvider<string[]>;
   value: XProvider<number>;
   constructor ({ drop = [], info = [], type = 'consumable', use = [], value = 0 }: XItemProperties = {}) {
      this.drop = drop;
      this.info = info;
      this.type = type;
      this.use = use;
      this.value = value;
   }
}

class XSave<A extends string = any> extends XHost<{
   activate: [XItem, 'use' | 'info' | 'drop', number];
   damage: [number];
}> {
   at: (this: XSave<A>) => number;
   data: XSaveData<A>;
   default: (this: XSave<A>) => XSaveData<A>;
   df: (this: XSave<A>) => number;
   hp: (this: XSave<A>) => number;
   items: XKeyed<XItem, A>;
   key: string;
   lv: (this: XSave<A>) => number;
   constructor (
      at: (this: XSave<A>) => number,
      $default: (this: XSave<A>) => XSaveData<A>,
      df: (this: XSave<A>) => number,
      hp: (this: XSave<A>) => number,
      items: XKeyed<XItem, A>,
      key: string,
      lv: (this: XSave<A>) => number
   ) {
      super();
      this.at = at;
      this.default = $default;
      this.df = df;
      this.hp = hp;
      this.items = items;
      this.key = key;
      this.lv = lv;
      this.data = this.load();
   }
   activate (index: number, action: 'use' | 'info' | 'drop') {
      const name = this.data.items[index];
      const item = this.items[name];
      switch (action) {
         case 'use':
            switch (item.type) {
               case 'armor':
               case 'weapon':
                  this.data.items[index] = this.data[item.type];
                  this.data[item.type] = name;
                  break;
               case 'consumable':
                  this.data.items.splice(index, 1);
                  this.data.hp = Math.min(
                     this.hp(),
                     this.data.hp + (typeof item.value === 'function' ? item.value() : item.value)
                  );
                  break;
            }
            break;
         case 'drop':
            this.data.items.splice(index, 1);
            break;
      }
      this.fire('activate', item, action, index);
   }
   atx () {
      const item = this.items[this.data.weapon];
      if (item) {
         return typeof item.value === 'function' ? item.value() : item.value;
      } else {
         return 0;
      }
   }
   // Undertale damage calculation formula - by Toby Fox
   damage (amount: number) {
      this.data.hp = Math.round(Math.max(0, this.data.hp - amount * (1 - (this.df() + this.dfx()) / 100)));
   }
   dfx () {
      const item = this.items[this.data.armor];
      if (item) {
         return typeof item.value === 'function' ? item.value() : item.value;
      } else {
         return 0;
      }
   }
   load () {
      const data = localStorage.getItem(this.key);
      if (data) {
         return JSON.parse(data, (x, value) => {
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
      } else {
         return this.default();
      }
   }
   reset () {
      localStorage.removeItem(this.key);
   }
   save () {
      localStorage.setItem(
         this.key,
         JSON.stringify(this.data, (x, value) => {
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
                  default:
                     return value === void 0 ? '' : value;
               }
            }
         })
      );
   }
   static build<A extends string> ({
      at = () => 0,
      default: $default,
      df = () => 0,
      hp = () => 0,
      key,
      items = {} as XKeyed<XItem | XItemProperties, A>,
      lv = () => 0
   }: {
      default: (this: XSave<A>) => XSaveData<A>;
      items?: XKeyed<XItem | XItemProperties, A> | void;
      key: string;
   } & Partial<XKeyed<(this: XSave<A>) => number, 'at' | 'df' | 'hp' | 'lv'>>) {
      return new XSave<A>(
         at,
         $default,
         df,
         hp,
         Object.fromEntries(
            Object.entries(items).map(([ key, value ]) => {
               return [ key, value instanceof XItem ? value : new XItem(value as XItemProperties) ];
            })
         ) as XKeyed<XItem, A>,
         key,
         lv
      );
   }
}

class XWalker extends XHitbox {
   objects: [] | [XSprite] = [];
   sprites: XKeyed<XSprite, XCardinal>;
   step: number;
   constructor (properties: XWalkerProperties = {}) {
      super(properties);
      ((
         {
            sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {},
            step = 1
         }: XWalkerProperties = {}
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
