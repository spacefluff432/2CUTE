declare type XBounds = {
    h: number;
    w: number;
    x: number;
    y: number;
};
declare type XEntityAttributes = {
    collide: boolean;
    interact: boolean;
    trigger: boolean;
};
declare type XKeyed<X> = {
    [k: string]: X;
};
declare type XListener = ((...data: any[]) => any) | {
    priority: number;
    script: (...data: any[]) => any;
};
declare type XOptional<X> = {
    [k in keyof X]?: X[k];
};
declare type XPosition = {
    x: number;
    y: number;
};
declare type XRendererAttributes = {
    animate: boolean;
};
declare type XSpriteAttributes = {
    persist: boolean;
    hold: boolean;
};
declare const X: {
    storage: Set<Promise<void>>;
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
    intersection({ x, y, h, w }: XBounds, ...entities: XEntity[]): Set<XEntity>;
    once(host: XHost, name: string, listener: XListener): void;
    pause(time: number): Promise<void>;
    ready(script: () => void): void;
};
declare class XHost {
    events: Map<string, Set<XListener>>;
    on(name: string, listener: XListener): void;
    off(name: string, listener: XListener): void;
    fire(name: string, ...data: any[]): any[];
}
declare class XEntity extends XHost {
    attributes: XEntityAttributes;
    bounds: XBounds;
    depth: number;
    direction: number;
    metadata: XKeyed<any>;
    position: XPosition;
    renderer: string;
    speed: number;
    sprite: XSprite | void;
    state: {
        lifetime: number;
    };
    constructor({ attributes: { collide, interact, trigger }, bounds: { h, w, x: x1, y: y1 }, depth, direction, metadata, position: { x: x2, y: y2 }, renderer, speed, sprite }?: {
        attributes?: XOptional<XEntityAttributes>;
        bounds?: XOptional<XBounds>;
        depth?: number;
        direction?: number;
        metadata?: XKeyed<any>;
        position?: XOptional<XPosition>;
        renderer?: string;
        speed?: number;
        sprite?: XSprite | void;
    });
    tick(modulator?: XModulator): void;
}
declare class XRenderer {
    attributes: XRendererAttributes;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor({ attributes: { animate }, canvas }?: {
        attributes?: XOptional<XRendererAttributes>;
        canvas?: HTMLCanvasElement;
    });
    draw(size: XPosition, position: XPosition, scale: number, ...entities: XEntity[]): void;
    erase(): void;
    reload(): void;
}
declare class XSound {
    audio: HTMLAudioElement;
    constructor({ source }?: {
        source?: string;
    });
    static cache: Map<string, HTMLAudioElement>;
    static audio(source: string): HTMLAudioElement;
}
declare class XSprite {
    attributes: XSpriteAttributes;
    default: number;
    rotation: number;
    scale: number;
    state: {
        active: boolean;
        index: number;
        step: number;
    };
    interval: number;
    textures: XTexture[];
    constructor({ attributes: { persist, hold }, default: $default, rotation, scale, interval, textures }?: {
        attributes?: XOptional<XSpriteAttributes>;
        default?: number;
        rotation?: number;
        scale?: number;
        interval?: number;
        textures?: Iterable<XTexture>;
    });
    compute(): XTexture | undefined;
    disable(): void;
    enable(): void;
}
declare class XRoom {
    bounds: XBounds;
    collidables: Set<XEntity>;
    entities: Set<XEntity>;
    interactables: Set<XEntity>;
    layers: Map<string, Set<XEntity>>;
    triggerables: Set<XEntity>;
    constructor({ bounds: { h, w, x, y }, entities }?: {
        bounds?: XOptional<XBounds>;
        entities?: Iterable<XEntity>;
    });
    add(...entities: XEntity[]): void;
    remove(...entities: XEntity[]): void;
}
declare class XTexture {
    bounds: XBounds;
    image: HTMLImageElement;
    constructor({ bounds: { h, w, x, y }, source }?: {
        bounds?: XOptional<XBounds>;
        source?: string;
    });
    static cache: Map<string, HTMLImageElement>;
    static image(source: string): HTMLImageElement;
}
declare type XItemStyle = {
    [k in keyof CSSStyleDeclaration]: CSSStyleDeclaration[k] | ((element?: HTMLElement) => CSSStyleDeclaration[k]);
};
declare type XModulator = (entity: XEntity, lifetime: number) => void;
declare type XNavigatorType = 'horizontal' | 'none' | 'vertical';
declare class XItem {
    children: XItem[] | void;
    element: Element | string | void | (() => Element | string | void);
    priority: number;
    renderer: XRenderer | void;
    state: {
        element: HTMLElement | void;
        fragment: string;
        node: Element | void;
    };
    style: XOptional<XItemStyle>;
    constructor({ children, element, priority, renderer, style }?: {
        children?: Iterable<XItem>;
        element?: Element | string | void | (() => Element | string | void);
        priority?: number;
        renderer?: XRenderer;
        style?: XOptional<XItemStyle>;
    });
    compute(scale?: number): HTMLElement | undefined;
}
declare class XKey extends XHost {
    keys: Set<string>;
    states: Set<string>;
    get active(): boolean;
    constructor(...keys: string[]);
}
declare class XNavigator {
    from: ((atlas: XAtlas, navigator: string | null) => void);
    item: XItem;
    next: string | null | void | (string | null | void)[] | ((atlas: XAtlas) => string | null | void | (string | null | void)[]);
    prev: string | null | void | ((atlas: XAtlas) => string | null | void);
    size: number | ((atlas: XAtlas) => number);
    to: ((atlas: XAtlas, navigator: string | null) => void);
    type: string | ((atlas: XAtlas) => string);
    constructor({ from, item, next, prev, size, to, type }?: {
        from?: ((atlas: XAtlas, navigator: string | null) => void);
        item?: XItem;
        next?: string | null | void | (string | null | void)[] | ((atlas: XAtlas) => string | null | void | (string | null | void)[]);
        prev?: string | null | void | ((atlas: XAtlas) => string | null | void);
        size?: number | ((atlas: XAtlas) => number);
        to?: ((atlas: XAtlas, navigator: string | null) => void);
        type?: XNavigatorType | ((atlas: XAtlas) => XNavigatorType);
    });
}
declare class XAtlas {
    elements: XKeyed<XItem>;
    menu: string;
    navigators: XKeyed<XNavigator>;
    size: XPosition;
    state: {
        index: number;
        navigator: string | null;
    };
    get navigator(): XNavigator | void;
    constructor({ menu, navigators, size: { x, y } }?: {
        menu?: string;
        navigators?: XKeyed<XNavigator>;
        size?: XOptional<XPosition>;
    });
    attach(navigator: string, overworld: XOverworld): void;
    detach(navigator: string, overworld: XOverworld): void;
    navigate(action: 'menu' | 'move' | 'next' | 'prev', type?: string, shift?: -1 | 0 | 1): void;
    switch(destination: string | null | void): void;
}
declare class XOverworld extends XHost {
    layers: XKeyed<XRenderer>;
    player: XEntity | null;
    room: XRoom | null;
    size: XPosition;
    state: {
        bounds: XBounds;
        scale: number;
    };
    wrapper: XItem;
    constructor({ layers, size: { x, y }, wrapper }?: {
        layers?: XKeyed<XRenderer>;
        rooms?: XKeyed<XRoom>;
        size?: XOptional<XPosition>;
        wrapper?: Element;
    });
    refresh(): void;
    render(animate?: boolean): void;
    tick(modulator?: XModulator): void;
}
declare class XReader extends XHost {
    lines: string[];
    mode: string;
    char: (char: string) => Promise<void>;
    code: (code: string) => Promise<void>;
    constructor({ char, code }?: {
        char?: (char: string) => Promise<void>;
        code?: (code: string) => Promise<void>;
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
        sound: string;
    };
    sounds: XKeyed<XSound>;
    get sound(): XSound | void;
    get sprite(): XSprite | void;
    constructor({ interval, sprites, sounds }?: {
        interval?: number;
        sprites?: XKeyed<XSprite>;
        sounds?: XKeyed<XSound>;
    });
    compute(): string;
    skip(interval: number, callback?: () => void): Promise<unknown>;
}
