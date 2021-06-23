declare type XBounds = {
    h: number;
    w: number;
    x: number;
    y: number;
};
declare type XContent = XCollection | XPattern | XSprite | XText;
declare type XEntityAttributes = {
    collide: boolean;
    interact: boolean;
    trigger: boolean;
};
declare type XContentStyle = {
    alpha: number;
    compositeOperation: 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    lineCap: CanvasLineCap;
    lineDashOffset: number;
    lineJoin: CanvasLineJoin;
    lineWidth: number;
    miterLimit: number;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
};
declare type XItemStyle = {
    [k in keyof CSSStyleDeclaration]: CSSStyleDeclaration[k] | ((element?: HTMLElement) => CSSStyleDeclaration[k]);
};
declare type XKeyed<X> = {
    [k: string]: X;
};
declare type XListener = ((...data: any[]) => any) | {
    priority: number;
    script: (...data: any[]) => any;
};
declare type XModulator = (entity: XEntity, lifetime: number) => void;
declare type XNavigatorGrid = (any)[][];
declare type XOptional<X> = {
    [k in keyof X]?: X[k];
};
declare type XPatternType = 'rectangle';
declare type XPlayer = XSound | XVoice;
declare type XPosition = {
    x: number;
    y: number;
};
declare type XRendererAttributes = {
    animated: boolean;
    smooth: boolean;
    static: boolean;
};
declare type XSerializable = {
    [k: string]: XSerializable;
} | XSerializable[] | string | number | null | void;
declare type XSpriteAttributes = {
    persist: boolean;
    hold: boolean;
};
declare const XAssets: {
    add(promise: Promise<void>): void;
    ready(script: () => void): void;
};
declare const XMath: {
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
    direction({ x, y }: XPosition, ...entities: XEntity[]): number[];
    distance({ x, y }: XPosition, ...entities: XEntity[]): number[];
    endpoint({ x, y }: XPosition, direction: number, distance: number): {
        x: number;
        y: number;
    };
    intersection({ x, y, h, w }: XBounds, ...entities: XEntity[]): Set<XEntity>;
    rand: {
        value: {
            <X>(object: X[]): X;
            <X_1>(object: X_1): X_1[keyof X_1];
        };
        range(min: number, max: number): number;
        threshold(max: number): boolean;
    };
};
declare const XTools: {
    pause(time: number): Promise<void>;
};
declare class XAtlas {
    menu: string | null;
    navigators: XKeyed<XNavigator>;
    state: {
        navigator: string | null;
    };
    get navigator(): XNavigator | null;
    constructor({ menu, navigators }?: {
        menu?: string | null | void;
        navigators?: XKeyed<XNavigator> | void;
    });
    attach(overworld: XOverworld, ...navigators: string[]): void;
    clear(overworld: XOverworld): void;
    detach(overworld: XOverworld, ...navigators: string[]): void;
    move({ x, y }?: XOptional<XPosition>): void;
    navigate(action: 'menu' | 'next' | 'prev'): void;
    switch(destination: string | null | void): void;
    tick(): void;
}
declare class XAudio {
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
declare class XCollection {
    contents: Set<XContent>;
    style: XOptional<XContentStyle>;
    constructor({ contents, style }?: {
        contents?: Iterable<XContent> | void;
        style?: XOptional<XContentStyle> | void;
    });
    draw(context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle): void;
}
declare class XEntity {
    bounds: XBounds;
    content: XContent | void;
    depth: number;
    direction: number;
    metadata: XKeyed<any>;
    parallax: XPosition;
    position: XPosition;
    renderer: string;
    rotation: number;
    scale: XPosition;
    speed: number;
    state: {
        lifetime: number;
    };
    style: XContentStyle;
    tick: (self: XEntity, overworld: XOverworld) => void;
    constructor({ bounds: { h, w, x: x1, y: y1 }, content, depth, direction, metadata, parallax: { x: x2, y: y2 }, position: { x: x3, y: y3 }, renderer, rotation, scale: { x: x4, y: y4 }, speed, style: { alpha, compositeOperation, fillStyle, font, lineCap, lineDashOffset, lineJoin, lineWidth, miterLimit, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, strokeStyle, textAlign, textBaseline }, tick }?: {
        bounds?: XOptional<XBounds> | void;
        content?: XContent | void;
        depth?: number | void;
        direction?: number | void;
        metadata?: XKeyed<any> | void;
        parallax?: XOptional<XPosition> | void;
        position?: XOptional<XPosition> | void;
        renderer?: string | void;
        rotation?: number | void;
        scale?: XOptional<XPosition> | void;
        speed?: number | void;
        style?: XOptional<XContentStyle> | void;
        tick?: ((self: XEntity, overworld: XOverworld) => void) | void;
    });
}
declare class XHost {
    events: Map<string, Set<XListener>>;
    on(name: string, listener: XListener): this;
    once(name: string, listener: XListener): this;
    off(name: string, listener: XListener): this;
    fire(name: string, ...data: any[]): any[];
    when(name: string): Promise<void>;
}
declare class XItem {
    children: XItem[] | void;
    element: Element | string | void | (() => Element | string | void);
    priority: number;
    state: {
        element: HTMLElement | void;
        fragment: string;
        node: Element | void;
    };
    style: XOptional<XItemStyle>;
    constructor({ children, element, priority, style }?: {
        children?: Iterable<XItem> | void;
        element?: Element | string | (() => Element | string | void) | void;
        priority?: number | void;
        style?: XOptional<XItemStyle> | void;
    });
    compute(scale?: number): HTMLElement | undefined;
}
declare class XNavigator {
    entities: Set<XEntity>;
    from: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void);
    grid: XNavigatorGrid | ((self: XNavigator, atlas?: XAtlas) => XNavigatorGrid);
    horizontal: boolean | ((self: XNavigator, atlas?: XAtlas) => boolean);
    items: Set<XItem>;
    next: string | null | void | ((self: XNavigator, atlas: XAtlas) => string | null | void);
    move: ((self: XNavigator, atlas: XAtlas) => void);
    position: XPosition;
    prev: string | null | void | ((self: XNavigator, atlas: XAtlas) => string | null | void);
    tick: (self: XNavigator, atlas: XAtlas) => void;
    to: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void);
    get selection(): any;
    constructor({ entities, items, from, grid, horizontal, next, move, position: { x, y }, prev, tick, to }?: {
        entities?: Iterable<XEntity>;
        from?: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void) | void;
        grid?: XNavigatorGrid | ((self: XNavigator, atlas?: XAtlas) => XNavigatorGrid) | void;
        horizontal?: boolean | ((self: XNavigator, atlas?: XAtlas) => boolean) | void;
        items?: Iterable<XItem>;
        next?: string | null | ((self: XNavigator, atlas: XAtlas) => string | null | void) | void;
        move?: ((self: XNavigator, atlas: XAtlas) => void);
        position?: XOptional<XPosition> | void;
        prev?: string | null | ((self: XNavigator, atlas: XAtlas) => string | null | void) | void;
        tick?: ((self: XNavigator, atlas: XAtlas) => void) | void;
        to?: ((self: XNavigator, atlas: XAtlas, key: string | null, value: XNavigator | null) => void) | void;
    });
    attach(overworld: XOverworld): void;
    detach(overworld: XOverworld): void;
}
declare class XPattern {
    bounds: XBounds;
    parallax: XPosition;
    position: XPosition;
    rotation: number;
    scale: XPosition;
    style: XOptional<XContentStyle>;
    type: XPatternType;
    constructor({ bounds: { h, w, x: x1, y: y1 }, parallax: { x: x2, y: y2 }, position: { x: x3, y: y3 }, rotation, scale: { x: x4, y: y4 }, style, type }?: {
        bounds?: XOptional<XBounds> | void;
        parallax?: XOptional<XPosition> | void;
        position?: XOptional<XPosition> | void;
        rotation?: number | void;
        scale?: XOptional<XPosition> | void;
        style?: XOptional<XContentStyle> | void;
        type?: XPatternType | void;
    });
    draw(context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle): void;
}
declare class XRenderer {
    attributes: XRendererAttributes;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor({ attributes: { animated, smooth, static: $static }, canvas }?: {
        attributes?: XOptional<XRendererAttributes> | void;
        canvas?: HTMLCanvasElement | void;
    });
    draw(size: XPosition, position: XPosition, scale: number, ...entities: XEntity[]): void;
    erase(): void;
    reload(): void;
}
declare class XRoom {
    bounds: XBounds;
    entities: Set<XEntity>;
    layers: Map<string, Set<XEntity>>;
    constructor({ bounds: { h, w, x, y }, entities }?: {
        bounds?: XOptional<XBounds> | void;
        entities?: Iterable<XEntity> | void;
    });
    add(...entities: XEntity[]): void;
    remove(...entities: XEntity[]): void;
}
declare class XSheet {
    grid: XPosition;
    texture: XTexture;
    constructor({ grid: { x, y }, texture }?: {
        grid?: XOptional<XPosition> | void;
        texture?: XTexture | void;
    });
    tile(x: number, y: number): XTexture;
}
declare class XSound {
    audio: XAudio;
    get rate(): number;
    set rate(value: number);
    get volume(): number;
    set volume(value: number);
    constructor({ rate, source, volume }?: {
        rate?: number | void;
        source?: string | void;
        volume?: number | void;
    });
    play(): void;
    static cache: Map<string, XAudio>;
    static audio(source: string): XAudio;
}
declare class XSprite {
    attributes: XSpriteAttributes;
    default: number;
    interval: number;
    parallax: XPosition;
    position: XPosition;
    rotation: number;
    scale: XPosition;
    state: {
        active: boolean;
        index: number;
        step: number;
    };
    style: XOptional<XContentStyle>;
    textures: XTexture[];
    constructor({ attributes: { persist, hold }, default: $default, interval, parallax: { x: x1, y: y1 }, position: { x: x2, y: y2 }, rotation, scale: { x: x3, y: y3 }, style, textures }?: {
        attributes?: XOptional<XSpriteAttributes> | void;
        default?: number | void;
        interval?: number | void;
        parallax?: XOptional<XPosition> | void;
        position?: XOptional<XPosition> | void;
        rotation?: number | void;
        scale?: XOptional<XPosition> | void;
        style?: XOptional<XContentStyle> | void;
        textures?: Iterable<XTexture> | void;
    });
    compute(): XTexture | undefined;
    disable(): void;
    draw(context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle): void;
    enable(): void;
}
declare class XText {
    position: XPosition;
    rotation: number;
    spacing: number;
    style: XOptional<XContentStyle>;
    text: string;
    constructor({ position: { x, y }, rotation, spacing, style, text }?: {
        position?: XOptional<XPosition> | void;
        rotation?: number | void;
        spacing?: number | void;
        style?: XOptional<XContentStyle> | void;
        text?: string | void;
    });
    draw(context: CanvasRenderingContext2D, position: XPosition, entity: XEntity, style: XContentStyle): void;
}
declare class XTexture {
    bounds: XBounds;
    image: HTMLImageElement;
    constructor({ bounds: { h, w, x, y }, source }?: {
        bounds?: XOptional<XBounds> | void;
        source?: string | void;
    });
    static cache: Map<string, HTMLImageElement>;
    static image(source: string): HTMLImageElement;
}
declare class XVoice {
    sounds: XSound[];
    constructor({ sounds }?: {
        sounds?: Iterable<XSound> | void;
    });
    play(): void;
}
declare class XKey extends XHost {
    keys: Set<string>;
    states: Set<string>;
    get active(): boolean;
    constructor({ keys }?: {
        keys?: Iterable<string> | void;
    });
}
declare class XOverworld extends XHost {
    entities: Set<XEntity>;
    items: Map<XItem, XItem>;
    layers: XKeyed<XRenderer>;
    player: XEntity | null;
    room: XRoom | null;
    size: XPosition;
    state: {
        bounds: XBounds;
        scale: number;
    };
    wrapper: XItem;
    constructor({ entities, layers, size: { x, y }, wrapper }?: {
        entities?: Iterable<XEntity> | void;
        layers?: XKeyed<XRenderer> | void;
        size?: XOptional<XPosition> | void;
        wrapper?: Element | void;
    });
    refresh(): void;
    render(animated?: boolean): void;
    tick(modulator: XModulator): void;
}
declare class XReader extends XHost {
    lines: string[];
    mode: string;
    char: (char: string) => Promise<void>;
    code: (code: string) => Promise<void>;
    constructor({ char, code }?: {
        char?: ((char: string) => Promise<void>) | void;
        code?: ((code: string) => Promise<void>) | void;
    });
    add(...text: string[]): void;
    advance(): void;
    parse(text: string): string | Map<string, string>;
    read(): Promise<void>;
}
declare class XDialogue extends XReader {
    interval: number;
    sprites: XKeyed<XSprite>;
    state: {
        sprite: string;
        text: string[];
        skip: boolean;
        voice: string;
    };
    voices: XKeyed<XPlayer>;
    get voice(): XPlayer | void;
    get sprite(): XSprite | void;
    constructor({ interval, sprites, voices }?: {
        interval?: number | void;
        sprites?: XKeyed<XSprite> | void;
        voices?: XKeyed<XPlayer> | void;
    });
    compute(): string;
    skip(): void;
    skipper(interval: number, callback?: () => void): Promise<true | void>;
}
