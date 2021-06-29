type XBasic = { [k: string]: XBasic } | XBasic[] | string | number | boolean | null | void;
type XKeyed<X, Y = string> = { [k in string & Y]: X };
type XLoose<X, Y = any> = X & XKeyed<Y, Exclude<string, keyof X>>;
type XOptional<X> = Partial<X> | void;

type XProperties<X, Y extends keyof X = keyof X> = {
   [k in Exclude<Y, keyof XHost>]?: X[k] extends
      | string
      | BigInt
      | number
      | boolean
      | symbol
      | null
      | void
         ? X[k] | void
         : X[k] extends XKeyed<infer A, string> | void
            ? Partial<X[k]> | void
            : X[k] extends Map<string & infer A, infer B> | void
               ? XKeyed<B, A> | void
               : X[k] extends Iterable<infer A> | Set<infer A> | void
                  ? Iterable<A> | void
                  : X[k] extends XProvider<any> | ((...args: any[]) => any) | void ? X[k] | void : void;
}

type XProvider<X, Y extends any[] = []> = X | ((...args: Y) => X);

type XBounds = XKeyed<number, 'h' | 'w' | 'x' | 'y'>;
type XDirection = 'down' | 'left' | 'right' | 'up';
type XListener<X extends any[] = []> = ((...data: X) => any) | { priority: number; script: (...data: X) => any };

type XMetadata =
   | ({ undertale: 'door-from' } & XLoose<{ key: string; default: boolean, door: string; direction: XDirection }>)
   | ({ undertale: 'door-to' } & XLoose<{ key: string, door: string }>)
   | ({ undertale: void | never } & XLoose<{}>)

type XPosition = XKeyed<number, 'x' | 'y'>;

type UndertaleItem = {
   script?(this: UndertaleItem, game: UndertaleGame): void;
   sfx?: XSound | XVoice;
   text: { drop: string[]; info: string[]; use: string[] };
   type: 'armor' | 'consumable' | 'weapon';
   value: number;
};

type UndertaleSave = {
   armor: string;
   boxes: [string[], string[]];
   flags: XKeyed<string>;
   fun: number;
   g: number;
   hp: number;
   items: string[];
   name: string;
   room: string;
   xp: number;
   weapon: string;
};
