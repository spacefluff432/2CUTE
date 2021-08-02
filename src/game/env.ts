declare const container: HTMLElement;
declare const renderer: XRenderer;
declare const dialoguer: XDialoguer;
declare const SAVE: UndertaleSave;
declare function spawn (): void

type UndertaleItem = {
   script?(item: UndertaleItem): void;
   sfx?: XPlayer;
   text: { drop: string[]; info: string[]; use: string[] };
   type: 'armor' | 'consumable' | 'weapon';
   value: number;
};

type UndertaleSave = {
   armor: string;
   boxes: [string[], string[]];
   flags: XKeyed<XBasic>;
   fun: number;
   g: number;
   hp: number;
   items: string[];
   name: string;
   room: string;
   xp: number;
   weapon: string;
};
