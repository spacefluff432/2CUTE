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
const X = (() => {
    const storage = new Set();
    return {
        storage,
        add(promise) {
            X.storage.add(promise);
        },
        bounds(entity) {
            return {
                x: entity.position.x + entity.bounds.x + Math.min(entity.bounds.w, 0),
                y: entity.position.y + entity.bounds.y + Math.min(entity.bounds.h, 0),
                w: Math.abs(entity.bounds.w),
                h: Math.abs(entity.bounds.h)
            };
        },
        center(entity) {
            const bounds = X.bounds(entity);
            return {
                x: entity.position.x + bounds.w / 2,
                y: entity.position.y + bounds.h / 2
            };
        },
        intersection({ x = 0, y = 0, h = 0, w = 0 }, ...entities) {
            const list = new Set();
            for (const entity of entities) {
                const bounds = X.bounds(entity);
                if (x < bounds.x + bounds.w && x + w > bounds.x && y < bounds.y + bounds.h && y + h > bounds.y) {
                    list.add(entity);
                }
            }
            return list;
        },
        once(host, name, listener) {
            const script = (...data) => {
                host.off(name, script);
                return (typeof listener === 'function' ? listener : listener.script)(...data);
            };
            host.on(name, script);
        },
        pause(time) {
            return new Promise(resolve => setTimeout(() => resolve(), time));
        },
        ready(script) {
            Promise.all(X.storage).then(script).catch(() => {
                script();
            });
        }
    };
})();
class XHost {
    constructor() {
        this.events = new Map();
    }
    on(name, listener) {
        this.events.has(name) || this.events.set(name, new Set());
        this.events.get(name).add(listener);
    }
    off(name, listener) {
        this.events.has(name) && this.events.get(name).delete(listener);
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
}
class XEntity extends XHost {
    constructor({ attributes: { collide = false, interact = false, trigger = false } = {
        collide: false,
        interact: false,
        trigger: false
    }, bounds: { h = 0, w = 0, x: x1 = 0, y: y1 = 0 } = {}, depth = 0, direction = 0, metadata = {}, position: { x: x2 = 0, y: y2 = 0 } = {}, renderer = '', speed = 0, sprite } = {}) {
        super();
        this.state = { lifetime: 0 };
        this.attributes = { collide, interact, trigger };
        this.bounds = { h, w, x: x1, y: y1 };
        this.depth = depth;
        this.direction = direction;
        this.metadata = metadata;
        this.position = { x: x2, y: y2 };
        this.speed = speed;
        this.renderer = renderer;
        this.sprite = sprite;
    }
    tick(modulator) {
        modulator && modulator(this, this.state.lifetime++);
        const radians = (this.direction % 360) * Math.PI / 180;
        this.position.x += this.speed * Math.cos(radians);
        this.position.y += this.speed * Math.sin(radians);
    }
}
class XRenderer {
    constructor({ attributes: { animate = false } = {}, canvas = document.createElement('canvas') } = {}) {
        this.attributes = { animate };
        this.canvas = canvas;
        this.reload();
    }
    draw(size, position, scale, ...entities) {
        this.context.setTransform(scale, 0, 0, scale, (position.x * -1 + size.x / 2) * scale, (position.y + size.y / 2) * scale);
        for (const entity of entities.sort((entity1, entity2) => entity1.depth - entity2.depth)) {
            const sprite = entity.sprite;
            if (sprite) {
                const texture = sprite.compute();
                if (texture) {
                    const width = isFinite(texture.bounds.w) ? texture.bounds.w : texture.image.width;
                    const height = isFinite(texture.bounds.h) ? texture.bounds.h : texture.image.height;
                    // TODO: HANDLE SPRITE ROTATION
                    this.context.drawImage(texture.image, texture.bounds.x, texture.bounds.y, width, height, entity.position.x, entity.position.y * -1 - height * sprite.scale, width * sprite.scale, height * sprite.scale);
                }
            }
        }
    }
    erase() {
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    reload() {
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
    }
}
class XSound {
    constructor({ source = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' } = {}) {
        this.audio = XSound.audio(source);
    }
    static audio(source) {
        const audio = XSound.cache.get(source) || new Audio(source);
        if (!XSound.cache.has(source)) {
            XSound.cache.set(source, audio);
            X.add(new Promise((resolve, reject) => {
                audio.addEventListener('canplay', () => {
                    resolve();
                });
                audio.addEventListener('error', reason => {
                    console.error('ASSET LOAD FAILED!', audio.src, reason);
                    reject();
                });
            }));
        }
        return audio;
    }
}
XSound.cache = new Map();
class XSprite {
    constructor({ attributes: { persist = false, hold = false } = {
        persist: false,
        hold: false
    }, default: $default = 0, rotation = 0, scale = 1, interval = 1, textures = [] } = {}) {
        this.state = { active: false, index: 0, step: 0 };
        this.attributes = { persist, hold };
        this.default = $default;
        this.rotation = rotation;
        this.scale = scale;
        this.interval = interval;
        this.textures = [...textures];
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
    enable() {
        if (!this.state.active) {
            this.state.active = true;
            this.attributes.hold || ((this.state.step = 0), (this.state.index = this.default));
        }
    }
}
class XRoom {
    constructor({ bounds: { h = 0, w = 0, x = 0, y = 0 } = {}, entities = [] } = {}) {
        this.collidables = new Set();
        this.entities = new Set();
        this.interactables = new Set();
        this.layers = new Map();
        this.triggerables = new Set();
        this.bounds = { h, w, x, y };
        for (const entity of entities)
            this.add(entity);
    }
    add(...entities) {
        for (const entity of entities) {
            this.entities.add(entity);
            entity.attributes.collide && this.collidables.add(entity);
            entity.attributes.interact && this.interactables.add(entity);
            entity.attributes.trigger && this.triggerables.add(entity);
            this.layers.has(entity.renderer) || this.layers.set(entity.renderer, new Set());
            this.layers.get(entity.renderer).add(entity);
        }
    }
    remove(...entities) {
        for (const entity of entities) {
            this.entities.delete(entity);
            entity.attributes.collide && this.collidables.delete(entity);
            entity.attributes.interact && this.interactables.delete(entity);
            entity.attributes.trigger && this.triggerables.delete(entity);
            this.layers.has(entity.renderer) && this.layers.get(entity.renderer).delete(entity);
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
            X.add(new Promise((resolve, reject) => {
                image.addEventListener('load', () => {
                    resolve();
                });
                image.addEventListener('error', () => {
                    reject();
                });
            }));
        }
        return image;
    }
}
XTexture.cache = new Map();
class XItem {
    constructor({ children, element = document.createElement('div'), priority = 0, renderer, style = {} } = {}) {
        this.state = {
            element: void 0,
            fragment: '',
            node: void 0
        };
        this.children = children && [...children].sort((child1, child2) => child1.priority - child2.priority);
        this.element = element;
        this.priority = priority;
        this.renderer = renderer;
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
class XKey extends XHost {
    constructor(...keys) {
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
class XNavigator {
    constructor({ from = () => { }, item = new XItem(), next, prev, size = 0, to = () => { }, type = 'none' } = {}) {
        this.from = from;
        this.item = item;
        this.next = next;
        this.prev = prev;
        this.size = size;
        this.to = to;
        this.type = type;
    }
}
class XAtlas {
    constructor({ menu = '', navigators = {}, size: { x = 0, y = 0 } = {} } = {}) {
        this.state = { index: 0, navigator: null };
        this.elements = Object.fromEntries(Object.entries(navigators).map(([key, { item }]) => {
            return [
                key,
                new XItem({
                    element: `<div class="storyteller navigator" id="st-nv-${encodeURIComponent(key)}"></div>`,
                    children: [item],
                    style: {
                        gridArea: 'c',
                        height: () => `${this.size.y}px`,
                        margin: 'auto',
                        position: 'relative',
                        width: () => `${this.size.x}px`
                    }
                })
            ];
        }));
        this.menu = menu;
        this.navigators = navigators;
        this.size = { x, y };
    }
    get navigator() {
        return this.state.navigator === null ? void 0 : this.navigators[this.state.navigator];
    }
    attach(navigator, overworld) {
        if (navigator in this.elements) {
            const element = this.elements[navigator];
            const children = overworld.wrapper.children;
            if (!children.includes(element)) {
                overworld.wrapper.children.push(this.elements[navigator]);
            }
        }
    }
    detach(navigator, overworld) {
        if (navigator in this.elements) {
            const element = this.elements[navigator];
            const children = overworld.wrapper.children;
            if (children.includes(element)) {
                children.splice(children.indexOf(element), 1);
            }
        }
    }
    navigate(action, type = '', shift = 0) {
        const navigator = this.navigator;
        switch (action) {
            case 'menu':
                this.switch(navigator ? null : this.menu);
                break;
            case 'move':
                if (navigator && navigator.type === type) {
                    if (shift > 0) {
                        const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                        if (size - 1 <= this.state.index) {
                            this.state.index = 0;
                        }
                        else {
                            this.state.index++;
                        }
                    }
                    else if (shift < 0) {
                        if (this.state.index <= 0) {
                            const size = typeof navigator.size === 'function' ? navigator.size(this) : navigator.size;
                            this.state.index = size - 1;
                        }
                        else {
                            this.state.index--;
                        }
                    }
                }
                break;
            case 'next':
            case 'prev':
                if (navigator) {
                    const provider = navigator[action];
                    let result = typeof provider === 'function' ? provider(this) : provider;
                    this.switch(result && typeof result === 'object' ? result[this.state.index] : result);
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
            navigator && navigator.to(this, destination);
            this.state.index = 0;
            this.navigators[destination].from(this, this.state.navigator);
            this.state.navigator = destination;
        }
        else if (destination === null) {
            navigator && navigator.to(this, null);
            this.state.index = -1;
            this.state.navigator = null;
        }
    }
}
class XOverworld extends XHost {
    constructor({ layers = {}, size: { x = 0, y = 0 } = {}, wrapper } = {}) {
        super();
        this.player = null;
        this.room = null;
        this.state = {
            bounds: { w: 0, h: 0, x: 0, y: 0 },
            scale: 1
        };
        this.layers = layers;
        this.size = { x, y };
        this.wrapper = new XItem({
            element: wrapper instanceof HTMLElement ? wrapper : void 0,
            style: {
                backgroundColor: '#000000ff',
                display: 'grid',
                gridTemplateAreas: "'a a a' 'b c d' 'e e e'",
                height: '100%',
                margin: '0',
                position: 'relative',
                width: '100%'
            },
            children: Object.values(this.layers).map(layer => {
                return new XItem({ element: layer.canvas, style: { gridArea: 'c', margin: 'auto' } });
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
    render(animate = false) {
        const room = this.room;
        if (room) {
            const center = this.player ? X.center(this.player) : { x: this.size.x / 2, y: this.size.y / 2 };
            for (const [key, renderer] of Object.entries(this.layers)) {
                if (renderer.attributes.animate === animate) {
                    renderer.erase();
                    if (room.layers.has(key) || (this.player && key === this.player.renderer)) {
                        const entities = [...(room.layers.get(key) || [])];
                        this.player && key === this.player.renderer && entities.push(this.player);
                        const zero = { x: room.bounds.x + this.size.x / 2, y: room.bounds.y + this.size.y / 2 };
                        renderer.draw(this.size, {
                            x: Math.min(Math.max(center.x, zero.x), zero.x + room.bounds.w),
                            y: Math.min(Math.max(center.y, zero.y), zero.y + room.bounds.h)
                        }, this.state.scale, ...entities);
                    }
                }
            }
        }
    }
    tick(modulator) {
        if (this.room) {
            for (const entity of this.room.entities)
                entity.tick(modulator);
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
class XDialogue extends XReader {
    constructor({ interval = 0, sprites = {}, sounds = {} } = {}) {
        super({
            char: (char) => __awaiter(this, void 0, void 0, function* () {
                yield this.skip(this.interval, () => {
                    //@ts-expect-error
                    char === ' ' || (this.sound && this.sound.audio.cloneNode().play());
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
                        isFinite(number) && (yield this.skip(number * this.interval));
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
        this.state = { sprite: '', text: String.prototype.split(''), skip: false, sound: '' };
        this.interval = interval;
        this.sprites = sprites;
        this.sounds = sounds;
        this.on('style', ([key, value]) => {
            switch (key) {
                case 'sound':
                    this.state.sound = value;
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
    get sound() {
        return this.sounds[this.state.sound || ''];
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
    skip(interval, callback = () => { }) {
        return Promise.race([
            X.pause(interval).then(() => this.state.skip || callback()),
            new Promise(resolve => {
                if (this.state.skip) {
                    resolve(0);
                }
                else {
                    X.once(this, 'skip', () => {
                        this.state.skip = true;
                        resolve(0);
                    });
                }
            })
        ]);
    }
}
//# sourceMappingURL=storyteller.js.map