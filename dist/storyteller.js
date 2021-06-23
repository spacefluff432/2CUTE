"use strict";
//
//    #########   #########   #########   #########
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   ##     ##   ##
//    ##          ##     ##   #########   #######
//    ##          ##     ##   ##  ###     ##
//    ##          ##     ##   ##   ###    ##
//    #########   #########   ##    ###   #########
//
///// needs more optimizating //////////////////////////////////////////////////////////////////////
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// CONSTANTS
const XAssets = (() => {
    const storage = new Set();
    return {
        add(promise) {
            storage.add(promise);
        },
        ready(script) {
            Promise.all(storage).then(script).catch(reason => {
                console.error('XAssets Load Error!');
                console.error(reason);
                script();
            });
        }
    };
})();
const XMath = (() => {
    const value = (object) => {
        if (object instanceof Array) {
            return object[XMath.rand.range(0, object.length - 1)];
        }
        else {
            return XMath.rand.value(Object.values(object));
        }
    };
    return {
        bounds(entity) {
            return {
                x: entity.position.x + entity.bounds.x + Math.min(entity.bounds.w, 0),
                y: entity.position.y + entity.bounds.y + Math.min(entity.bounds.h, 0),
                w: Math.abs(entity.bounds.w),
                h: Math.abs(entity.bounds.h)
            };
        },
        center(entity) {
            const bounds = XMath.bounds(entity);
            return {
                x: entity.position.x + bounds.w / 2,
                y: entity.position.y + bounds.h / 2
            };
        },
        clamp(base, min = -Infinity, max = Infinity) {
            return Math.min(Math.max(base, min), max);
        },
        direction({ x = 0, y = 0 }, ...entities) {
            return entities.map(({ position }) => 180 / Math.PI * Math.atan2(position.y - y, position.x - x));
        },
        distance({ x = 0, y = 0 }, ...entities) {
            return entities.map(({ position }) => Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)));
        },
        endpoint({ x = 0, y = 0 }, direction, distance) {
            const radians = (direction % 360) * Math.PI / 180;
            return {
                x: x + distance * Math.sin(Math.PI - radians),
                y: y + distance * Math.cos(Math.PI - radians)
            };
        },
        intersection({ x = 0, y = 0, h = 0, w = 0 }, ...entities) {
            const list = new Set();
            for (const entity of entities) {
                const bounds = XMath.bounds(entity);
                if (x < bounds.x + bounds.w && x + w > bounds.x && y < bounds.y + bounds.h && y + h > bounds.y) {
                    list.add(entity);
                }
            }
            return list;
        },
        rand: {
            value,
            range(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            threshold(max) {
                return Math.random() < max;
            }
        }
    };
})();
const XTools = (() => {
    return {
        pause(time) {
            return new Promise(resolve => setTimeout(() => resolve(), time));
        }
    };
})();
// PRIMARY CLASSES
class XAtlas {
    constructor({ menu = null, navigators = {} } = {}) {
        this.state = { navigator: null };
        this.menu = menu;
        this.navigators = navigators;
    }
    get navigator() {
        return this.state.navigator === null ? null : this.navigators[this.state.navigator];
    }
    attach(overworld, ...navigators) {
        for (const navigator of navigators) {
            if (navigator in this.navigators) {
                this.navigators[navigator].attach(overworld);
            }
        }
    }
    clear(overworld) {
        this.detach(overworld, ...Object.keys(this.navigators));
    }
    detach(overworld, ...navigators) {
        for (const navigator of navigators) {
            if (navigator in this.navigators) {
                this.navigators[navigator].detach(overworld);
            }
        }
    }
    move({ x = 0, y = 0 } = {}) {
        const nav = this.navigator;
        if (nav) {
            const origin = nav.selection;
            const row = typeof nav.grid === 'function' ? nav.grid(nav, this) : nav.grid;
            const horizontal = typeof nav.horizontal === 'function' ? nav.horizontal(nav, this) : nav.horizontal;
            nav.position.x = XMath.clamp(nav.position.x, 0, row.length - 1);
            nav.position.x += horizontal ? y : x;
            if (row.length - 1 < nav.position.x) {
                nav.position.x = 0;
            }
            else if (nav.position.x < 0) {
                nav.position.x = row.length - 1;
            }
            const column = row[nav.position.x] || [];
            nav.position.y = XMath.clamp(nav.position.y, 0, column.length - 1);
            nav.position.y += horizontal ? x : y;
            if (column.length - 1 < nav.position.y) {
                nav.position.y = 0;
            }
            else if (nav.position.y < 0) {
                nav.position.y = column.length - 1;
            }
            origin === nav.selection || nav.move(nav, this);
        }
    }
    navigate(action) {
        const navigator = this.navigator;
        switch (action) {
            case 'menu':
                navigator || this.switch(this.menu);
                break;
            case 'next':
            case 'prev':
                if (navigator) {
                    const provider = navigator[action];
                    this.switch(typeof provider === 'function' ? provider(navigator, this) : provider);
                }
                else {
                    this.switch(null);
                }
                break;
        }
    }
    switch(destination) {
        const navigator = this.navigator;
        if (typeof destination === 'string' && destination in this.navigators) {
            navigator && navigator.to(navigator, this, destination, this.navigators[destination]);
            this.navigators[destination].from(this.navigators[destination], this, this.state.navigator, navigator);
            this.state.navigator = destination;
        }
        else if (destination === null) {
            navigator && navigator.to(navigator, this, null, null);
            this.state.navigator = null;
        }
    }
    tick() {
        const navigator = this.navigator;
        if (navigator) {
            navigator.tick(navigator, this);
        }
    }
}
class XAudio {
    constructor() {
        this.context = new AudioContext();
        this.state = { active: false };
        this.gain = this.context.createGain();
        this.gain.connect(this.context.destination);
        this.node = this.context.createBufferSource();
        this.node.connect(this.gain);
    }
    get rate() {
        return this.node.playbackRate;
    }
    start() {
        this.stop();
        this.node.start();
        this.state.active = true;
    }
    stop() {
        if (this.state.active) {
            const rate = this.rate;
            this.node.stop();
            this.node.disconnect();
            this.node = Object.assign(this.context.createBufferSource(), { buffer: this.node.buffer });
            this.node.playbackRate.value = rate.value;
            this.node.connect(this.gain);
            this.state.active = false;
        }
    }
}
class XCollection {
    constructor({ contents = [], style = {} } = {}) {
        this.contents = new Set(contents);
        this.style = style;
    }
    draw(context, position, entity, style) {
        for (const content of this.contents) {
            content.draw(context, position, entity, Object.assign({}, style, this.style));
        }
    }
}
class XEntity {
    constructor({ bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {}, content, depth = 0, direction = 0, metadata = {}, parallax: { x: x2 = 0, y: y2 = 0 } = {}, position: { x: x3 = 0, y: y3 = 0 } = {}, renderer = '', rotation = 0, scale: { x: x4 = 1, y: y4 = 1 } = {}, speed = 0, style: { alpha = 1, compositeOperation = 'source-over', fillStyle = '#000000ff', font = '10px monospace', lineCap = 'butt', lineDashOffset = 0, lineJoin = 'miter', lineWidth = 1, miterLimit = 10, shadowBlur = 0, shadowColor = '#00000000', shadowOffsetX = 0, shadowOffsetY = 0, strokeStyle = '#ffffffff', textAlign = 'start', textBaseline = 'alphabetic' } = {}, tick = () => { } } = {}) {
        this.state = { lifetime: 0 };
        this.bounds = { h, w, x: x1, y: y1 };
        this.content = content;
        this.depth = depth;
        this.direction = direction;
        this.metadata = metadata;
        this.parallax = { x: x2, y: y2 };
        this.position = { x: x3, y: y3 };
        this.renderer = renderer;
        this.rotation = rotation;
        this.scale = { x: x4, y: y4 };
        this.speed = speed;
        this.style = {
            alpha,
            compositeOperation,
            fillStyle,
            font,
            lineCap,
            lineDashOffset,
            lineJoin,
            lineWidth,
            miterLimit,
            shadowBlur,
            shadowColor,
            shadowOffsetX,
            shadowOffsetY,
            strokeStyle,
            textAlign,
            textBaseline
        };
        this.tick = tick;
    }
}
class XHost {
    constructor() {
        this.events = new Map();
    }
    on(name, listener) {
        this.events.has(name) || this.events.set(name, new Set());
        this.events.get(name).add(listener);
        return this;
    }
    once(name, listener) {
        const singleton = (...data) => {
            this.off(name, singleton);
            return (typeof listener === 'function' ? listener : listener.script)(...data);
        };
        return this.on(name, singleton);
    }
    off(name, listener) {
        this.events.has(name) && this.events.get(name).delete(listener);
        return this;
    }
    fire(name, ...data) {
        if (this.events.has(name)) {
            return [...this.events.get(name)]
                .sort((listener1, listener2) => {
                return ((typeof listener1 === 'function' ? 0 : listener1.priority) -
                    (typeof listener2 === 'function' ? 0 : listener2.priority));
            })
                .map(listener => {
                return (typeof listener === 'function' ? listener : listener.script)(...data);
            });
        }
        else {
            return [];
        }
    }
    when(name) {
        return new Promise(resolve => this.once(name, () => resolve()));
    }
}
class XItem {
    constructor({ children, element = document.createElement('div'), priority = 0, style = {} } = {}) {
        this.state = {
            element: void 0,
            fragment: '',
            node: void 0
        };
        this.children = children && [...children].sort((child1, child2) => child1.priority - child2.priority);
        this.element = element;
        this.priority = priority;
        this.style = style;
    }
    compute(scale = 1) {
        let element = typeof this.element === 'function' ? this.element() : this.element;
        if (typeof element === 'string') {
            if (element === this.state.fragment) {
                element = this.state.node;
            }
            else {
                this.state.fragment = element;
                element = document.createRange().createContextualFragment(element).children[0];
                this.state.node = element;
            }
        }
        if (element instanceof HTMLElement) {
            for (const key in this.style) {
                let property = this.style[key];
                if (property !== void 0) {
                    typeof property === 'function' && (property = property(element));
                    if (scale !== 1) {
                        property = property
                            .split(' ')
                            .map(term => (term.endsWith('px') ? `${+term.slice(0, -2) * scale}px` : term))
                            .map(term => (term.endsWith('px)') ? `${+term.slice(0, -3) * scale}px)` : term))
                            .join(' ');
                    }
                    element.style[key] = property;
                }
            }
            if (this.children) {
                //@ts-expect-error
                const current = new Set(element.children);
                const next = [];
                for (const child of this.children) {
                    const element = child.compute(scale);
                    element && next.push(element);
                }
                for (const child of current)
                    next.includes(child) || (current.has(child) && child.remove());
                for (const child of next) {
                    if (!current.has(child)) {
                        const siblings = next.slice(next.indexOf(child) + 1).filter(child => current.has(child));
                        if (siblings.length > 0) {
                            element.insertBefore(child, siblings[0]);
                        }
                        else {
                            element.appendChild(child);
                        }
                    }
                }
            }
            element === this.state.element || (this.state.element = element);
            return element;
        }
    }
}
class XNavigator {
    constructor({ entities = [], items = [], from = () => { }, grid = [], horizontal = false, next = () => { }, move = () => { }, position: { x = 0, y = 0 } = {}, prev = () => { }, tick = () => { }, to = () => { } } = {}) {
        this.entities = new Set(entities);
        this.from = from;
        this.grid = grid;
        this.items = new Set(items);
        this.move = move;
        this.next = next;
        this.horizontal = horizontal;
        this.position = { x, y };
        this.prev = prev;
        this.tick = tick;
        this.to = to;
    }
    get selection() {
        return ((typeof this.grid === 'function' ? this.grid(this) : this.grid)[this.position.x] || [])[this.position.y];
    }
    attach(overworld) {
        const children = overworld.wrapper.children;
        for (const entity of this.entities)
            overworld.entities.add(entity);
        for (const item of this.items) {
            if (!overworld.items.has(item)) {
                const container = new XItem({
                    children: [item],
                    style: {
                        gridArea: 'center',
                        height: () => `${overworld.size.y}px`,
                        margin: 'auto',
                        position: 'relative',
                        width: () => `${overworld.size.x}px`
                    }
                });
                overworld.items.set(item, container);
                children.push(container);
            }
        }
    }
    detach(overworld) {
        const children = overworld.wrapper.children;
        for (const entity of this.entities)
            overworld.entities.delete(entity);
        for (const item of this.items) {
            if (overworld.items.has(item)) {
                const container = overworld.items.get(item);
                overworld.items.delete(item);
                children.splice(children.indexOf(container), 1);
            }
        }
    }
}
class XPattern {
    constructor({ bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {}, parallax: { x: x2 = 0, y: y2 = 0 } = {}, position: { x: x3 = 0, y: y3 = 0 } = {}, rotation = 0, scale: { x: x4 = 1, y: y4 = 1 } = {}, style = {}, type = 'rectangle' } = {}) {
        this.bounds = { h, w, x: x1, y: y1 };
        this.parallax = { x: x2, y: y2 };
        this.position = { x: x3, y: y3 };
        this.rotation = rotation;
        this.scale = { x: x4, y: y4 };
        this.style = style;
        this.type = type;
    }
    draw(context, position, entity, style) {
        const source = this.bounds;
        const height = source.h * entity.scale.y * this.scale.y;
        const destination = {
            h: height,
            w: source.w * entity.scale.x * this.scale.x,
            x: entity.position.x + this.position.x + source.x + position.x * (entity.parallax.x + this.parallax.x),
            y: (entity.position.y + this.position.y + source.y) * -1 -
                height +
                position.y * (entity.parallax.y + this.parallax.y) // cartesian alignment
        };
        const center = {
            x: destination.x + destination.w / 2,
            y: destination.y + destination.h / 2
        };
        context.save();
        {
            context.translate(center.x, center.y);
            context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
            context.translate(center.x * -1, center.y * -1);
            context.globalAlpha = style.alpha;
            context.globalCompositeOperation = style.compositeOperation;
            Object.assign(context, this.style);
        }
        switch (this.type) {
            // TODO: add support for more pattern types!
            case 'rectangle':
                context.fillRect(destination.x, destination.y, destination.w, destination.h);
                context.strokeRect(destination.x, destination.y, destination.w, destination.h);
                break;
        }
        context.restore();
    }
}
class XRenderer {
    constructor({ attributes: { animated = false, smooth = false, static: $static = false } = {}, canvas = document.createElement('canvas') } = {}) {
        this.attributes = { animated, smooth, static: $static };
        this.canvas = canvas;
        this.reload();
    }
    draw(size, position, scale, ...entities) {
        const context = this.context;
        context.setTransform(scale, 0, 0, scale, this.attributes.static ? 0 : (position.x * -1 + size.x / 2) * scale, this.attributes.static ? size.y * scale : (position.y + size.y / 2) * scale // cartesian alignment
        );
        for (const entity of entities.sort((entity1, entity2) => entity1.depth - entity2.depth)) {
            const content = entity.content;
            if (content) {
                content.draw(context, position, entity, Object.assign({}, entity.style, content.style));
            }
        }
    }
    erase() {
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    reload() {
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = this.attributes.smooth;
    }
}
class XRoom {
    constructor({ bounds: { h = 0, w = 0, x = 0, y = 0 } = {}, entities = [] } = {}) {
        this.entities = new Set();
        this.layers = new Map();
        this.bounds = { h, w, x, y };
        for (const entity of entities)
            this.add(entity);
    }
    add(...entities) {
        for (const entity of entities) {
            this.entities.add(entity);
            this.layers.has(entity.renderer) || this.layers.set(entity.renderer, new Set());
            this.layers.get(entity.renderer).add(entity);
        }
    }
    remove(...entities) {
        for (const entity of entities) {
            this.layers.has(entity.renderer) && this.layers.get(entity.renderer).delete(entity);
            this.entities.delete(entity);
        }
    }
}
class XSheet {
    constructor({ grid: { x = 0, y = 0 } = {}, texture = new XTexture() } = {}) {
        this.grid = { x, y };
        this.texture = texture;
    }
    tile(x, y) {
        return new XTexture({
            bounds: { h: this.grid.y, w: this.grid.x, x: x * this.grid.x, y: y * this.grid.y },
            source: this.texture.image.src
        });
    }
}
class XSound {
    constructor({ rate = 1, source = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume = 1 } = {}) {
        this.audio = XSound.audio(source);
        this.rate = rate;
        this.volume = volume;
    }
    get rate() {
        return this.audio.rate.value;
    }
    set rate(value) {
        this.audio.rate.setValueAtTime(value, this.audio.context.currentTime);
    }
    get volume() {
        return this.audio.gain.gain.value;
    }
    set volume(value) {
        this.audio.gain.gain.setValueAtTime(value, this.audio.context.currentTime);
    }
    play() {
        this.audio.start();
    }
    static audio(source) {
        const audio = XSound.cache.get(source) || new XAudio();
        if (!XSound.cache.has(source)) {
            XSound.cache.set(source, audio);
            XAssets.add(new Promise(resolve => {
                const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
                request.addEventListener('load', () => {
                    audio.context.decodeAudioData(request.response, buffer => {
                        audio.node.buffer = buffer;
                        resolve();
                    });
                });
                request.open('GET', source);
                request.send();
            }));
        }
        return audio;
    }
}
XSound.cache = new Map();
class XSprite {
    constructor({ attributes: { persist = true, hold = false } = {}, default: $default = 0, interval = 1, parallax: { x: x1 = 0, y: y1 = 0 } = {}, position: { x: x2 = 0, y: y2 = 0 } = {}, rotation = 0, scale: { x: x3 = 1, y: y3 = 1 } = {}, style = {}, textures = [] } = {}) {
        this.state = { active: false, index: 0, step: 0 };
        this.attributes = { persist, hold };
        this.interval = interval;
        this.default = $default;
        this.parallax = { x: x1, y: y1 };
        this.position = { x: x2, y: y2 };
        this.rotation = rotation;
        this.scale = { x: x3, y: y3 };
        this.style = style;
        this.textures = [...textures];
        this.state.index = this.default;
    }
    compute() {
        if (this.state.active || this.attributes.persist) {
            const texture = this.textures[this.state.index];
            if (this.state.active && ++this.state.step >= this.interval) {
                this.state.step = 0;
                if (++this.state.index >= this.textures.length) {
                    this.state.index = 0;
                }
            }
            return texture;
        }
    }
    disable() {
        if (this.state.active) {
            this.state.active = false;
            this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
        }
    }
    draw(context, position, entity, style) {
        const texture = this.compute();
        if (texture) {
            const source = {
                h: texture.bounds.h === Infinity
                    ? texture.image.height - texture.bounds.y
                    : texture.bounds.h === -Infinity ? -texture.bounds.y : texture.bounds.h,
                w: texture.bounds.w === Infinity
                    ? texture.image.width - texture.bounds.x
                    : texture.bounds.w === -Infinity ? -texture.bounds.x : texture.bounds.w
            };
            const height = source.h * entity.scale.y * this.scale.y;
            const destination = {
                h: height,
                w: source.w * entity.scale.x * this.scale.x,
                x: entity.position.x + this.position.x + position.x * (entity.parallax.x + this.parallax.x),
                y: (entity.position.y + this.position.y) * -1 - height + position.y * (entity.parallax.y + this.parallax.y) // cartesian alignment
            };
            const center = {
                x: destination.x + destination.w / 2,
                y: destination.y + destination.h / 2
            };
            context.save();
            {
                context.translate(center.x, center.y);
                context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
                context.translate(center.x * -1, center.y * -1);
                context.globalAlpha = style.alpha;
                context.globalCompositeOperation = style.compositeOperation;
                Object.assign(context, this.style);
            }
            context.drawImage(texture.image, texture.bounds.x, texture.image.height - source.h - texture.bounds.y, // cartesian alignment
            source.w, source.h, destination.x, destination.y, destination.w, destination.h);
            context.restore();
        }
    }
    enable() {
        if (!this.state.active) {
            this.state.active = true;
            this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
        }
    }
}
class XText {
    constructor({ position: { x = 0, y = 0 } = {}, rotation = 0, spacing = 0, style = {}, text = '' } = {}) {
        this.position = { x, y };
        this.rotation = rotation;
        this.spacing = spacing;
        this.style = style;
        this.text = text;
    }
    draw(context, position, entity, style) {
        const text = this.text;
        if (text.length > 0) {
            const destination = {
                x: entity.position.x + this.position.x,
                y: (entity.position.y + this.position.y) * -1 // cartesian alignment
            };
            context.save();
            {
                context.translate(destination.x, destination.y);
                context.rotate(Math.PI / 180 * (entity.rotation + this.rotation));
                context.translate(destination.x * -1, destination.y * -1);
                context.globalAlpha = style.alpha;
                context.globalCompositeOperation = style.compositeOperation;
                Object.assign(context, this.style);
            }
            let left = 0;
            for (const character of text.split('')) {
                context.fillText(character, destination.x + left, destination.y);
                context.strokeText(character, destination.x + left, destination.y);
                left += this.spacing + context.measureText(character).width;
            }
            context.restore();
        }
    }
}
class XTexture {
    constructor({ bounds: { h = Infinity, w = Infinity, x = 0, y = 0 } = {}, source = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==' } = {}) {
        this.bounds = { h, w, x, y };
        this.image = XTexture.image(source);
    }
    static image(source) {
        const image = XTexture.cache.get(source) || Object.assign(new Image(), { src: source });
        if (!XTexture.cache.has(source)) {
            XTexture.cache.set(source, image);
            XAssets.add(new Promise(resolve => {
                image.addEventListener('load', () => {
                    resolve();
                });
            }));
        }
        return image;
    }
}
XTexture.cache = new Map();
class XVoice {
    constructor({ sounds = [] } = {}) {
        this.sounds = [...sounds];
    }
    play() {
        XMath.rand.value(this.sounds).play();
    }
}
// SECONDARY CLASSES
class XKey extends XHost {
    constructor({ keys = [] } = {}) {
        super();
        this.states = new Set();
        this.keys = new Set(keys);
        addEventListener('keydown', event => {
            if (this.keys.has(event.key) && !this.states.has(event.key)) {
                this.states.add(event.key);
                this.fire('down');
            }
        });
        addEventListener('keyup', event => {
            if (this.keys.has(event.key) && this.states.has(event.key)) {
                this.states.delete(event.key);
                this.fire('up');
            }
        });
        addEventListener('keypress', event => {
            this.keys.has(event.key) && this.fire('press');
        });
    }
    get active() {
        return this.states.size > 0;
    }
}
class XOverworld extends XHost {
    constructor({ entities = [], layers = {}, size: { x = 0, y = 0 } = {}, wrapper } = {}) {
        super();
        this.items = new Map();
        this.player = null;
        this.room = null;
        this.state = {
            bounds: { w: 0, h: 0, x: 0, y: 0 },
            scale: 1
        };
        this.entities = new Set(entities);
        this.layers = layers;
        this.size = { x, y };
        this.wrapper = new XItem({
            element: wrapper instanceof HTMLElement ? wrapper : void 0,
            style: {
                backgroundColor: '#000000ff',
                display: 'grid',
                gridTemplateAreas: "'top top top' 'left center right' 'bottom bottom bottom'",
                height: '100%',
                left: '0',
                position: 'absolute',
                top: '0',
                width: '100%'
            },
            children: Object.values(this.layers).map(layer => {
                return new XItem({ element: layer.canvas, style: { gridArea: 'center', margin: 'auto' } });
            })
        });
    }
    refresh() {
        const element = this.wrapper.compute(this.state.scale);
        if (element) {
            let { width, height } = element.getBoundingClientRect();
            if (width !== this.state.bounds.w || height !== this.state.bounds.h) {
                this.state.bounds.w = width;
                this.state.bounds.h = height;
                const ratio = this.size.x / this.size.y;
                if (this.state.bounds.w / this.state.bounds.h > ratio) {
                    width = height * ratio;
                    this.state.scale = height / this.size.y;
                }
                else {
                    height = width / ratio;
                    this.state.scale = width / this.size.x;
                }
                for (const renderer of Object.values(this.layers)) {
                    renderer.canvas.width = width;
                    renderer.canvas.height = height;
                    renderer.reload();
                }
                this.render();
            }
        }
    }
    render(animated = false) {
        const room = this.room;
        if (room) {
            const center = this.player ? XMath.center(this.player) : { x: this.size.x / 2, y: this.size.y / 2 };
            for (const [key, renderer] of Object.entries(this.layers)) {
                if (renderer.attributes.animated === animated) {
                    renderer.erase();
                    const zero = { x: room.bounds.x + this.size.x / 2, y: room.bounds.y + this.size.y / 2 };
                    renderer.draw(this.size, {
                        x: Math.min(Math.max(center.x, zero.x), zero.x + room.bounds.w),
                        y: Math.min(Math.max(center.y, zero.y), zero.y + room.bounds.h)
                    }, this.state.scale, ...(room.layers.get(key) || []), ...[this.player, ...this.entities].filter(entity => entity && key === entity.renderer));
                }
            }
        }
    }
    tick(modulator) {
        const room = this.room;
        if (room) {
            for (const entity of [this.player, ...room.entities, ...this.entities]) {
                if (entity) {
                    entity.tick(entity, this);
                    modulator(entity, entity.state.lifetime++);
                    entity.position = XMath.endpoint(entity.position, entity.direction, entity.speed);
                }
            }
        }
    }
}
class XReader extends XHost {
    constructor({ char = (char) => __awaiter(this, void 0, void 0, function* () { }), code = (code) => __awaiter(this, void 0, void 0, function* () { }) } = {}) {
        super();
        this.lines = [];
        this.mode = 'none';
        this.char = char;
        this.code = code;
    }
    add(...text) {
        const lines = text.join('\n').split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length > 0) {
            this.lines.push(...lines);
            if (this.mode === 'none') {
                this.mode = 'idle';
                this.fire('start');
                this.read();
            }
        }
    }
    advance() {
        if (this.mode === 'idle') {
            this.lines.splice(0, 1);
            this.read();
        }
    }
    parse(text) {
        if (text.startsWith('[') && text.endsWith(']')) {
            const style = new Map();
            for (const property of text.slice(1, -1).split('|')) {
                if (property.includes(':')) {
                    const [key, value] = property.split(':').slice(0, 2);
                    style.set(key, value);
                }
                else {
                    style.set(property, 'true');
                }
            }
            return style;
        }
        else {
            return text;
        }
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mode === 'idle') {
                if (this.lines.length > 0) {
                    const line = this.parse(this.lines[0]);
                    if (typeof line === 'string') {
                        this.mode = 'read';
                        this.fire('read');
                        let index = 0;
                        while (index < line.length) {
                            const char = line[index++];
                            if (char === '{') {
                                const code = line.slice(index, line.indexOf('}', index));
                                index = index + code.length + 1;
                                yield this.code(code);
                            }
                            else {
                                yield this.char(char);
                            }
                        }
                        this.mode = 'idle';
                        this.fire('idle');
                    }
                    else {
                        for (const entry of line)
                            this.fire('style', entry);
                        this.advance();
                    }
                }
                else {
                    this.mode = 'none';
                    this.fire('stop');
                }
            }
        });
    }
}
// TERTIARY CLASSES
class XDialogue extends XReader {
    constructor({ interval = 0, sprites = {}, voices = {} } = {}) {
        super({
            char: (char) => __awaiter(this, void 0, void 0, function* () {
                yield this.skipper(this.interval, () => {
                    char === ' ' || (this.voice && this.voice.play());
                });
                this.state.text.push(char);
                this.fire('text', this.compute());
            }),
            code: (code) => __awaiter(this, void 0, void 0, function* () {
                switch (code[0]) {
                    case '!':
                        this.fire('skip');
                        setTimeout(() => this.advance());
                        break;
                    case '^':
                        const number = +code.slice(1);
                        isFinite(number) && (yield this.skipper(number * this.interval));
                        break;
                    case '&':
                        switch (code.slice(1)) {
                            case 'u':
                            case 'x':
                                this.state.text.push(String.fromCharCode(parseInt(code.slice(2), 16)));
                                break;
                        }
                        break;
                    case '|':
                        this.state.text.push('<br>');
                        break;
                    case '<':
                    case '>':
                        this.state.text.push(`{${code}}`);
                }
            })
        });
        this.state = { sprite: '', text: String.prototype.split(''), skip: false, voice: '' };
        this.interval = interval;
        this.sprites = sprites;
        this.voices = voices;
        this.on('style', ([key, value]) => {
            switch (key) {
                case 'sound':
                    this.state.voice = value;
                    break;
                case 'sprite':
                    let active = this.sprite ? this.sprite.state.active : false;
                    this.state.sprite = value;
                    this.sprite && this.sprite[active ? 'enable' : 'disable']();
                    break;
                case 'interval':
                    const number = +value;
                    isFinite(number) && (this.interval = number);
                    break;
            }
        });
        this.on('read', () => {
            this.sprite && this.sprite.enable();
            this.state.skip = false;
            this.state.text = [];
            this.fire('text', this.compute());
        });
        this.on('idle', () => {
            this.sprite && this.sprite.disable();
        });
    }
    get voice() {
        return this.voices[this.state.voice || ''];
    }
    get sprite() {
        return this.sprites[this.state.sprite || ''];
    }
    compute() {
        let text = '';
        const tails = [];
        for (const section of this.state.text) {
            if (section.startsWith('{') && section.endsWith('}')) {
                switch (section[1]) {
                    case '<':
                        let attributes = '';
                        const [tag, properties] = section.slice(2, -1).split('?');
                        new URLSearchParams(properties).forEach((value, key) => (attributes += ` ${key}="${value}"`));
                        text += `<${tag}${attributes}>`;
                        tails.push(`</${tag}>`);
                        break;
                    case '>':
                        tails.length > 0 && (text += tails.pop());
                        break;
                }
            }
            else {
                text += section;
            }
        }
        while (tails.length > 0)
            text += tails.pop();
        return text;
    }
    skip() {
        this.fire('skip');
    }
    skipper(interval, callback = () => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.skip) {
                return true;
            }
            else {
                return yield Promise.race([
                    XTools.pause(interval).then(() => this.state.skip || callback()),
                    this.when('skip').then(() => {
                        this.state.skip = true;
                    })
                ]);
            }
        });
    }
}
//# sourceMappingURL=storyteller.js.map