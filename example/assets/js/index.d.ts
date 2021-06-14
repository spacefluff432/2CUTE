declare const SAVE: typeof GAME.default;
declare const helper: {
    wallEntity(bounds: XBounds): XEntity;
    staticSprite(source: string): XSprite;
    teleport(destination: string & keyof typeof ROOMS, origin?: string | undefined): void;
    nav: {
        show(...names: string[]): void;
        hide(...names: string[]): void;
        textStyle: {
            color: string;
            fontFamily: string;
            fontSize: string;
            lineHeight: string;
        };
        fixedSize(items: string[], size: number): string[];
        optionGrid(navigator: string, size: number, provider: () => string[], extra?: XOptional<XItemStyle>): XItem;
        topLevel(bounds: XBounds, space: XPosition, children: Iterable<XItem>, extra?: XOptional<XItemStyle>): XItem;
    };
};
declare const player: XEntity;
declare const GAME: {
    trivia(...garbo: string[]): void;
    room: string;
    battle: {
        buttons: {
            fight: XSprite;
            act: XSprite;
            item: XSprite;
            mercy: XSprite;
        };
        button: string[];
    };
    data: {};
    default: {
        armor: string;
        g: number;
        hp: number;
        lv: number;
        name: string;
        room: string;
        storage: {
            inv: string[];
            box1: string[];
            box2: string[];
        };
        weapon: string;
    };
    soul: XTexture;
    speed: number;
    state: {
        item: number;
        box: number;
        interact: boolean;
    };
    readonly at1: number;
    readonly at2: number;
    readonly box: string[];
    readonly df1: number;
    readonly df2: number;
    readonly hp: number;
    readonly xp1: number;
    readonly xp2: number;
    interact: boolean;
    item(index: number, action: number): void;
    items: XKeyed<{
        use: string;
        info: string;
        drop: string;
    }>;
    save(): void;
    load(): void;
    reset(): void;
};
declare const KEYS: {
    up: XKey;
    left: XKey;
    down: XKey;
    right: XKey;
    interact: XKey;
    special: XKey;
    menu: XKey;
};
declare const SPRITES: {
    up: XSprite;
    left: XSprite;
    down: XSprite;
    right: XSprite;
};
declare const ROOMS: XKeyed<XRoom>;
declare const NAVIGATORS: {
    dialoguer: XNavigator;
    sidebar: XNavigator;
    sidebarAddon: XNavigator;
    sidebarItem: XNavigator;
    sidebarItemOptions: XNavigator;
    sidebarStat: XNavigator;
    sidebarCell: XNavigator;
    sidebarCellBox: XNavigator;
    sidebarCellBoxAddon: XNavigator;
    sidebarCellBoxStorage: XNavigator;
    battle: XNavigator;
};
declare const atlas: XAtlas;
declare const overworld: XOverworld;
declare const dialoguer: XDialogue;
