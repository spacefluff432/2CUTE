declare const X: {
    add(promise: Promise<void>): void;
    bounds(entity: XEntity): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    center(entity: XEntity): {
        x: number;
        y: number;
    };
    clamp(base: number, min?: number, max?: number): number;
    pause(time: number): Promise<void>;
    direction({ x, y }: XPosition, ...entities: XEntity[]): number[];
    distance({ x, y }: XPosition, ...entities: XEntity[]): number[];
    endpoint({ x, y }: XPosition, direction: number, distance: number): {
        x: number;
        y: number;
    };
    intersection({ x, y, h, w }: XBounds, ...entities: XEntity[]): Set<XEntity<any>>;
    rand: {
        value<X>(object: XKeyed<X, string> | X[]): X;
        range(min: number, max: number): number;
        threshold(max: number): boolean;
    };
    ready(script: () => void): void;
    storage: Set<Promise<void>>;
    tension(tension: number, value: number, bias: number): number;
};
declare class XClass {
    args: any[];
    constructor(...args: any[]);
    clone(): this;
    static clone(value: any): any;
}
declare class XHost<X extends XKeyed<any[]> = {}, Y extends XKeyed<any[]> = X> extends XClass {
    private events;
    constructor(...args: any[]);
    fire<Z extends keyof Y>(name: Z, ...data: Y[Z]): any[];
    off<Z extends keyof Y>(name: Z, listener: XListener<Y[Z]>): this;
    on<Z extends keyof Y>(name: Z, listener: XListener<Y[Z]>, once?: boolean): this;
    when<Z extends keyof Y>(name: Z): Promise<void>;
    with<Z extends keyof Y>(name: Z, listener: (self: this, ...data: Y[Z]) => any, once?: boolean): this;
}
declare class XMap<X, Y> extends Map<X, Y> {
    deleter: (key: X, value: Y) => void;
    setter: (key: X, value: Y) => void;
    constructor(properties?: XProperties<XMap<X, Y>, 'deleter' | 'setter'>);
    delete(key: X): boolean;
    set(key: X, value: Y): this;
}
declare class XSet<X> extends Set<X> {
    adder: (value: X) => void;
    deleter: (value: X) => void;
    constructor(properties?: XProperties<XSet<X>, 'adder' | 'deleter'>);
    add(value: X): this;
    delete(value: X): boolean;
}
declare class XAtlas<X extends XKeyed<any> = any> extends XHost<X> {
    menu: string | null;
    navigators: Map<string, XNavigator>;
    state: {
        navigator: string | null;
    };
    get navigator(): XNavigator | null;
    constructor(properties?: XProperties<XAtlas, 'menu' | 'navigators'>);
    attach(overworld: XOverworld, ...navigators: string[]): void;
    clear(overworld: XOverworld): void;
    detach(overworld: XOverworld, ...navigators: string[]): void;
    move({ x, y }?: Partial<XPosition>): void;
    navigate(action: 'menu' | 'next' | 'prev'): void;
    switch(navigator: string | null | void): void;
    tick(): void;
}
declare class XAudio<X extends XKeyed<any> = any> extends XHost<X> {
    context: AudioContext;
    gain: GainNode;
    node: AudioBufferSourceNode;
    state: {
        active: boolean;
    };
    get rate(): AudioParam;
    constructor();
    start(): void;
    stop(): void;
}
declare class XDrawn<X extends XKeyed<any> = any> extends XHost<X> {
    bounds: XBounds;
    constructor({ h, w, x, y }?: XProperties<XDrawn>['bounds']);
}
declare class XItem<X extends XKeyed<any> = any> extends XHost<X> {
    children: Set<XItem> | void;
    element: Element | string | void | (() => Element | string | void);
    priority: number;
    state: {
        element: void | HTMLElement;
        fragment: string;
        node: void | Element;
    };
    style: Partial<XKeyed<XProvider<string, [HTMLElement | void]>, keyof CSSStyleDeclaration>>;
    constructor(properties?: XProperties<XItem, Exclude<keyof XItem, 'compute' | 'state'>>);
    compute(scale?: number): HTMLElement | undefined;
}
declare class XKey extends XHost<XKeyed<[string], 'down' | 'press' | 'up'>> {
    keys: Set<string>;
    states: Set<string>;
    get active(): boolean;
    constructor(...keys: string[]);
}
declare class XModulator {
    points: Set<[number, 'linear' | 'ease' | 'ease-in' | 'ease-out' | XPosition[]]>;
    target: 'alpha' | 'bounds_h' | 'bounds_w' | 'bounds_x' | 'bounds_y' | 'direction' | 'rotation' | 'parallax_x' | 'parallax_y' | 'position_x' | 'position_y' | 'scale_x' | 'skew_x' | 'skew_y' | 'scale_y' | 'speed';
    constructor(properties?: XProperties<XModulator>);
}
declare class XNavigator extends XHost<XKeyed<[XAtlas, string | null, XNavigator | null], 'from' | 'to'> & XKeyed<[XAtlas], 'move' | 'tick'>> {
    entities: Set<XEntity>;
    grid: XProvider<XBasic[][], [XNavigator, XAtlas | void]>;
    horizontal: XProvider<boolean, [XNavigator, XAtlas]>;
    items: Set<XItem>;
    next: XProvider<string | null | void, [XNavigator, XAtlas]>;
    position: XPosition;
    prev: XProvider<string | null | void, [XNavigator, XAtlas]>;
    get selection(): XBasic;
    constructor(properties: XProperties<XNavigator, Exclude<keyof XNavigator, 'attach' | 'detach'>>);
    attach(overworld: XOverworld): void;
    detach(overworld: XOverworld): void;
}
declare class XOverworld extends XHost {
    associations: Map<XItem<any> | XRenderer<any>, XItem<any>>;
    entities: Set<XEntity<any>>;
    items: XSet<XItem<any>>;
    renderers: XMap<string, XRenderer<any>>;
    size: XPosition;
    state: {
        bounds: XBounds;
        scale: number;
    };
    wrapper: XItem;
    constructor(properties?: XProperties<XOverworld, 'size' | 'items' | 'renderers'> & {
        wrapper?: Element | void;
    });
    refresh(): boolean;
    render(room: XRoom, center: XPosition, animated: boolean): void;
}
declare class XReader<X extends XKeyed<[], 'start' | 'idle' | 'stop' | 'read'> & {
    style: [string, string];
} = any> extends XHost<X> {
    char: (char: string) => Promise<void>;
    code: (code: string) => Promise<void>;
    lines: string[];
    mode: string;
    constructor(properties?: XProperties<XReader, 'char' | 'code'>);
    add(...text: string[]): void;
    advance(): void;
    parse(text: string): string | Map<string, string>;
    read(): Promise<void>;
}
declare class XRendered<X extends XKeyed<any> = any> extends XHost<X> {
    alpha: number;
    parallax: XPosition;
    position: XPosition;
    rotation: number;
    scale: XPosition;
    constructor(properties?: XProperties<XRendered>);
}
declare class XRenderer<X extends XKeyed<any> = any> extends XHost<X> {
    attributes: XKeyed<boolean, 'animated' | 'smooth' | 'static'>;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(properties?: XProperties<XRenderer, 'attributes' | 'canvas'>);
    draw(size: XPosition, position: XPosition, scale: number, ...entities: XEntity[]): void;
    erase(): void;
    reload(): void;
}
declare class XRoom<X extends XKeyed<any> = any> extends XHost<X> {
    bounds: XBounds;
    entities: XSet<XEntity<any>>;
    layers: Map<string, Set<XEntity<any>>>;
    constructor(properties?: XProperties<XRoom, 'bounds' | 'entities'>);
}
declare class XSheet<X extends XKeyed<any> = any> extends XHost<X> {
    grid: XPosition;
    texture: XTexture;
    constructor(properties?: XProperties<XSheet, Exclude<keyof XSheet, 'tile'>>);
    tile(x: number, y: number): XTexture<any>;
}
declare class XSound<X extends XKeyed<any> = any> extends XHost<X> {
    audio: XAudio;
    get rate(): number;
    set rate(value: number);
    get volume(): number;
    set volume(value: number);
    constructor(properties?: XProperties<XSound, 'rate' | 'volume'> & {
        source?: string;
    });
    play(): void;
    static cache: Map<string, XAudio<any>>;
}
declare class XVoice<X extends XKeyed<any> = any> extends XHost<X> {
    sounds: XSound[];
    constructor(...sounds: XSound[]);
    play(): void;
}
declare class XEntity<X extends {
    tick: [];
} = any> extends XRendered<X> {
    attributes: XKeyed<boolean, 'collide' | 'interact' | 'trigger'>;
    bounds: XBounds;
    depth: number;
    direction: number;
    metadata: XKeyed<XBasic>;
    modulators: Set<XModulator>;
    renderer: string;
    speed: number;
    sprite: XSprite | void;
    state: {
        lifetime: number;
    };
    constructor(properties?: ConstructorParameters<typeof XRendered>[0] & XProperties<XEntity, Exclude<keyof XEntity, 'state' | 'tick'>>);
    tick(): void;
}
declare class XDialoguer<X extends XKeyed<[], 'start' | 'idle' | 'stop' | 'read' | 'skip'> & {
    style: [string, string];
    text: [string];
} = any> extends XReader<X> {
    sprites: Map<string, XSprite>;
    state: {
        interval: number;
        skip: boolean;
        sprite: string;
        text: string[];
        voice: string;
    };
    voices: Map<string, XSound | XVoice>;
    get sprite(): XSprite<any> | undefined;
    get voice(): XSound<any> | XVoice<any> | undefined;
    constructor(properties?: XProperties<XDialoguer, 'sprites' | 'voices'>);
    compute(): string;
    skip(): void;
    skipper(interval: number, callback?: () => void): Promise<boolean | void>;
}
declare class XRectangle<X extends XKeyed<any> = any> extends XDrawn<X> {
    style: XKeyed<string | CanvasGradient | CanvasPattern, 'fill' | 'stroke'> & {
        border: number;
    };
    constructor(properties?: XProperties<XRectangle, 'bounds' | 'style'>);
}
declare class XSprite<X extends XKeyed<any> = any> extends XRendered<X> {
    attributes: XKeyed<boolean, 'hide' | 'hold'>;
    composite: 'color' | 'color-burn' | 'color-dodge' | 'copy' | 'darken' | 'destination-atop' | 'destination-in' | 'destination-out' | 'destination-over' | 'difference' | 'exclusion' | 'hard-light' | 'hue' | 'lighten' | 'lighter' | 'luminosity' | 'multiply' | 'overlay' | 'saturation' | 'screen' | 'soft-light' | 'source-atop' | 'source-in' | 'source-out' | 'source-over' | 'xor';
    interval: number;
    state: {
        active: boolean;
        index: number;
        step: number;
    };
    objects: XDrawn[];
    constructor(properties?: ConstructorParameters<typeof XRendered>[0] & XProperties<XSprite, 'attributes' | 'composite' | 'interval' | 'objects'>);
    compute(): XDrawn<any> | undefined;
    disable(): void;
    enable(): void;
}
declare class XTexture<X extends XKeyed<any> = any> extends XDrawn<X> {
    image: HTMLImageElement;
    constructor(properties?: XProperties<XTexture, 'bounds'> & {
        source?: string;
    });
    static cache: Map<string, HTMLImageElement>;
}
declare class XPerishable<X extends {
    death: [];
    tick: [];
} = any> extends XEntity<X> {
    lifespan: number;
    constructor(properties?: ConstructorParameters<typeof XEntity>[0] & XProperties<XPerishable, 'lifespan'>);
    tick(): void;
}
declare class XWalker<X extends {
    tick: [];
    trigger: [XEntity];
} = any> extends XEntity<X> {
    sprites: Partial<XKeyed<XSprite, XDirection>>;
    stride: number;
    constructor(properties?: ConstructorParameters<typeof XEntity>[0] & XProperties<XWalker, 'sprites' | 'stride'>);
    walk(offset: XPosition, frisk: boolean, ...entities: XEntity[]): boolean;
}
declare const Undertale: {
    assets: {
        buttons: {
            act: XSprite<any>;
            fight: XSprite<any>;
            item: XSprite<any>;
            mercy: XSprite<any>;
        };
        sounds: {
            box: XSound<any>;
            engage: XSound<any>;
            heal: XSound<any>;
            menu: XSound<any>;
            noise: XSound<any>;
            save: XSound<any>;
            select: XSound<any>;
        };
        sprites: {
            battle: XSprite<any>;
            menu: XSprite<any>;
        };
        voices: {
            alphys: XSound<any>;
            asgore: XSound<any>;
            asriel1: XSound<any>;
            asriel2: XSound<any>;
            asriel3: XSound<any>;
            flowey1: XSound<any>;
            flowey2: XSound<any>;
            gaster: XVoice<any>;
            mettaton: XVoice<any>;
            narrator: XSound<any>;
            papyrus: XSound<any>;
            sans: XSound<any>;
            temmie: XVoice<any>;
            toriel: XSound<any>;
            undyne: XSound<any>;
            writer: XSound<any>;
        };
    };
    data: {
        load(key: string): UndertaleSave | void;
        love: number[];
        reset(key: string): void;
        save(key: string, data: UndertaleSave): void;
        stat(data: UndertaleSave): {
            at: number;
            df: number;
            hp: number;
            lv: number;
            xp: number;
        };
    };
};
declare class UndertaleGame<X extends {
    tick: [];
} = any> extends XHost<X> {
    atlas: XAtlas;
    data: UndertaleSave;
    default: UndertaleSave;
    dialoguer: XDialoguer;
    items: Map<string, UndertaleItem>;
    key: string;
    overworld: XOverworld;
    player: XWalker | null;
    rooms: XKeyed<XRoom>;
    state: {
        debug: boolean;
        frisk: boolean;
        interact: boolean;
    };
    get room(): XRoom<any>;
    get stat(): {
        at: number;
        df: number;
        hp: number;
        lv: number;
        xp: number;
    } & {
        atx: number;
        dfx: number;
    };
    constructor(properties: XProperties<UndertaleGame, 'items' | 'key' | 'player'> & XProperties<{
        framerate: number;
        inputs: XKeyed<XKey, 'down' | 'interact' | 'left' | 'menu' | 'right' | 'special' | 'up'>;
        key: string;
        menu: string | null;
        player: XWalker;
        size: XPosition;
        wrapper: Element;
    }> & Partial<{
        items: XKeyed<UndertaleItem>;
        navigators: XKeyed<XNavigator>;
        sprites: XKeyed<XSprite>;
        voices: XKeyed<XSound | XVoice>;
        rooms: XKeyed<XProperties<{
            bounds: XBounds;
            entities: XEntity[];
            walls: XOptional<XBounds>[];
        } & XKeyed<(ConstructorParameters<typeof XRendered>[0] & {
            object: XDrawn;
        })[], 'backgrounds' | 'overlays'> & XKeyed<XProperties<{
            bounds: XBounds;
            listener: XListener;
            metadata: XKeyed<XBasic>;
        }>[], 'interacts' | 'triggers'>> & {
            doors: XKeyed<XProperties<{
                bounds: XBounds;
                default: boolean;
                direction: XDirection;
                distance: number;
            }> & XKeyed<string, 'destination' | 'door'>>;
        }> | void;
    }> & {
        default: UndertaleSave;
    });
    activate(index: number, action: 'use' | 'info' | 'drop'): string[] | undefined;
    damage(amount: number): void;
    dialogue(...lines: string[]): Promise<void>;
    load(): void;
    render(animated?: boolean): void;
    reset(): void;
    save(): void;
    teleport(room: string, door?: string | void): Promise<void>;
}
