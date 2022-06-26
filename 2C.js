"use strict";
/////////////////////////////////////////////////////////////////
//                                                             //
//    ::::::::   ::::::::  :::    ::: ::::::::::: ::::::::::   //
//   :+:    :+: :+:    :+: :+:    :+:     :+:     :+:          //
//         +:+  +:+        +:+    +:+     +:+     +:+          //
//       +#+    +#+        +#+    +:+     +#+     +#++:++#     //
//     +#+      +#+        +#+    +#+     +#+     +#+          //
//    #+#       #+#    #+# #+#    #+#     #+#     #+#          //
//   ##########  ########   ########      ###     ##########   //
//                                                             //
//// needs more optimizating ////////////////////////////////////
class XAtlas {
    constructor({ navigators = {} } = {}) {
        this.state = { navigator: null };
        this.navigators = navigators;
    }
    attach(renderer, layer, ...navigators) {
        for (const navigator of navigators) {
            navigator in this.navigators && this.navigators[navigator].attach(renderer, layer);
        }
    }
    detach(renderer, layer, ...navigators) {
        for (const navigator of navigators) {
            navigator in this.navigators && this.navigators[navigator].detach(renderer, layer);
        }
    }
    navigator() {
        return this.state.navigator ? this.navigators[this.state.navigator] : void 0;
    }
    seek({ x = 0, y = 0 } = {}) {
        const navigator = this.navigator();
        if (navigator) {
            const origin = navigator.selection();
            const row = X.provide(navigator.grid, navigator, this);
            const flip = X.provide(navigator.flip, navigator, this);
            navigator.position.x = Math.min(Math.max(navigator.position.x, 0), row.length - 1);
            navigator.position.x += flip ? y : x;
            if (row.length - 1 < navigator.position.x) {
                navigator.position.x = 0;
            }
            else if (navigator.position.x < 0) {
                navigator.position.x = row.length - 1;
            }
            const column = row[navigator.position.x] || [];
            navigator.position.y = Math.min(Math.max(navigator.position.y, 0), column.length - 1);
            navigator.position.y += flip ? x : y;
            if (column.length - 1 < navigator.position.y) {
                navigator.position.y = 0;
            }
            else if (navigator.position.y < 0) {
                navigator.position.y = column.length - 1;
            }
            origin === navigator.selection() || navigator.fire('move', this, navigator);
        }
    }
    navigate(action) {
        switch (action) {
            case 'next':
            case 'prev':
                const navigator = this.navigator();
                if (navigator) {
                    this.switch(X.provide(navigator[action], navigator, this));
                }
                else {
                    this.switch(null);
                }
        }
    }
    switch(name) {
        if (name !== void 0) {
            let next = null;
            if (typeof name === 'string') {
                if (name in this.navigators) {
                    next = this.navigators[name];
                }
                else {
                    return;
                }
            }
            const navigator = this.navigator();
            navigator && navigator.fire('to', this, name, navigator);
            next && next.fire('from', this, this.state.navigator, navigator);
            this.state.navigator = name;
        }
    }
}
class XCache extends Map {
    constructor(compute) {
        super();
        this.compute = compute;
    }
    of(object) {
        this.has(object) || this.set(object, this.compute(object));
        return this.get(object);
    }
}
class XEffect {
    constructor(context, processor, value = 1) {
        this.context = context;
        this.processor = processor;
        this.dry = context.createGain();
        this.wet = context.createGain();
        this.output = context.createGain();
        this.dry.connect(this.output);
        this.processor.connect(this.wet).connect(this.output);
        this.value = value;
    }
    get value() {
        return this.wet.gain.value;
    }
    set value(value) {
        this.dry.gain.value = 1 - (this.wet.gain.value = value);
    }
    connect(target) {
        if (target instanceof AudioContext) {
            this.output.connect(target.destination);
        }
        else if (target instanceof AudioNode) {
            this.output.connect(target);
        }
        else {
            this.output.connect(target.dry);
            this.output.connect(target.processor);
        }
    }
    disconnect(target) {
        if (target instanceof AudioContext) {
            this.output.disconnect(target.destination);
        }
        else if (target instanceof AudioNode) {
            this.output.disconnect(target);
        }
        else if (target) {
            this.output.disconnect(target.dry);
            this.output.disconnect(target.processor);
        }
        else {
            this.output.disconnect();
        }
    }
    modulate(duration, ...points) {
        return XNumber.prototype.modulate.call(this, duration, ...points);
    }
}
class XHost {
    constructor() {
        this.events = {};
    }
    fire(name, ...data) {
        const list = this.events[name];
        if (list) {
            return [...list.values()].map(handler => {
                return (typeof handler === 'function' ? handler : handler.listener)(...data);
            });
        }
        else {
            return [];
        }
    }
    off(name, handler) {
        const list = this.events[name];
        if (list) {
            const index = list.indexOf(handler);
            if (index > -1) {
                list.splice(index, 1);
            }
        }
        return this;
    }
    on(name, a2 = 0) {
        if (typeof a2 === 'number') {
            return new Promise(resolve => {
                const singleton = {
                    listener: (...data) => {
                        this.off(name, singleton);
                        resolve(data);
                    },
                    priority: a2 || 0
                };
                this.on(name, singleton);
            });
        }
        else {
            const list = this.events[name] || (this.events[name] = []);
            list.push(a2);
            list.sort((handler1, handler2) => (typeof handler1 === 'function' ? 0 : handler1.priority) -
                (typeof handler2 === 'function' ? 0 : handler2.priority));
            return this;
        }
    }
    wrapOn(name, provider) {
        return this.on(name, provider(this));
    }
}
class XAsset extends XHost {
    constructor({ loader, source, unloader }) {
        super();
        this.state = { value: void 0 };
        this.loader = loader;
        this.source = source;
        this.unloader = unloader;
    }
    get value() {
        const value = this.state.value;
        if (value === void 0) {
            throw `The asset of "${this.source}" is not currently loaded!`;
        }
        else {
            return value;
        }
    }
    async load(force) {
        if (force || this.state.value === void 0) {
            this.state.value = await this.loader();
            this.fire('load');
        }
    }
    async unload(force) {
        if (force || this.state.value !== void 0) {
            this.state.value = await this.unloader();
            this.fire('unload');
        }
    }
}
class XInput extends XHost {
    constructor({ codes = [], target = window } = {}) {
        super();
        this.state = { codes: new Set() };
        target.addEventListener('keyup', ({ code }) => {
            if (codes.includes(code) && this.state.codes.has(code)) {
                this.state.codes.delete(code);
                this.fire('up', code);
            }
        });
        target.addEventListener('keydown', ({ code }) => {
            if (codes.includes(code) && !this.state.codes.has(code)) {
                this.state.codes.add(code);
                this.fire('down', code);
            }
        });
    }
    active() {
        return this.state.codes.size > 0;
    }
}
class XMixer {
    constructor(context, effects = []) {
        this.context = context;
        this.effects = effects;
        this.input = context.createGain();
        this.output = context.createGain();
        this.refresh();
    }
    refresh() {
        for (const [index, controller] of [this.input, ...this.effects].entries()) {
            controller.disconnect();
            if (index === this.effects.length) {
                controller.connect(this.output);
            }
            else if (controller instanceof XEffect) {
                controller.connect(this.effects[index]);
            }
            else {
                controller.connect(this.effects[index].dry);
                controller.connect(this.effects[index].processor);
            }
        }
    }
}
class XModule {
    constructor(name, script) {
        this.promise = void 0;
        this.name = name;
        this.script = script;
    }
    import(...args) {
        var _a;
        X.status(`IMPORT MODULE: ${this.name}`, { color: '#07f' });
        return ((_a = this.promise) !== null && _a !== void 0 ? _a : (this.promise = new Promise(async (resolve) => {
            try {
                resolve(await this.script(...args));
                X.status(`MODULE INITIALIZED: ${this.name}`, { color: '#0f0' });
            }
            catch (error) {
                X.status(`MODULE ERROR: ${this.name}`, { color: '#f00' });
                console.error(error);
            }
        })));
    }
}
class XNavigator extends XHost {
    constructor({ flip = false, grid = [], next = void 0, objects = [], position: { x = 0, y = 0 } = {}, prev = void 0 } = {}) {
        super();
        this.flip = flip;
        this.grid = grid;
        this.next = next;
        this.objects = objects.map(object => (object instanceof XObject ? object : new XObject(object)));
        this.position = { x, y };
        this.prev = prev;
    }
    attach(renderer, layer) {
        renderer.attach(layer, ...this.objects);
    }
    detach(renderer, layer) {
        renderer.detach(layer, ...this.objects);
    }
    selection() {
        return (X.provide(this.grid, this)[this.position.x] || [])[this.position.y];
    }
}
class XNumber {
    constructor(value = 0) {
        this.value = value;
    }
    modulate(duration, ...points) {
        const base = X.time;
        const value = this.value;
        return new Promise(resolve => {
            var _a;
            let active = true;
            (_a = X.cache.modulationTasks.get(this)) === null || _a === void 0 ? void 0 : _a.cancel();
            X.cache.modulationTasks.set(this, {
                cancel() {
                    active = false;
                }
            });
            const listener = () => {
                if (active) {
                    const elapsed = X.time - base;
                    if (elapsed < duration) {
                        this.value = X.math.bezier(elapsed / duration, value, ...points);
                    }
                    else {
                        X.cache.modulationTasks.delete(this);
                        this.value = points.length > 0 ? points[points.length - 1] : value;
                        X.timer.off('tick', listener);
                        resolve();
                    }
                }
                else {
                    X.timer.off('tick', listener);
                }
            };
            X.timer.on('tick', listener);
        });
    }
}
class XObject extends XHost {
    constructor({ alpha = 1, anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {}, blend, fill = void 0, friction = 1, gravity: { angle = 0, extent = 0 } = {}, line: { cap = void 0, dash = void 0, join = void 0, miter = void 0, width = void 0 } = {}, metadata = {}, objects = [], parallax: { x: parallax_x = 0, y: parallax_y = 0 } = {}, position: { x: position_x = 0, y: position_y = 0 } = {}, priority = 0, rotation = 0, scale: { x: scale_x = 1, y: scale_y = 1 } = {}, shadow: { blur = void 0, color = void 0, offset: { x: shadow$offset_x = 0, y: shadow$offset_y = 0 } = {} } = {}, stroke = void 0, text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {}, velocity: { x: velocity_x = 0, y: velocity_y = 0 } = {} } = {}) {
        super();
        this.alpha = new XNumber(alpha);
        this.anchor = new XVector(anchor_x, anchor_y);
        this.blend = blend;
        this.fill = fill;
        this.friction = new XNumber(friction);
        this.gravity = {
            angle: new XNumber(angle),
            extent: new XNumber(extent)
        };
        this.line = {
            cap,
            dash: dash === void 0 ? void 0 : new XNumber(dash),
            join,
            miter: miter === void 0 ? void 0 : new XNumber(miter),
            width: width === void 0 ? void 0 : new XNumber(width)
        };
        this.metadata = metadata;
        this.objects = objects.map(object => (object instanceof XObject ? object : new XObject(object)));
        this.parallax = new XVector(parallax_x, parallax_y);
        this.position = new XVector(position_x, position_y);
        this.priority = new XNumber(priority);
        this.rotation = new XNumber(rotation);
        this.scale = new XVector(scale_x, scale_y);
        this.shadow = {
            blur: blur === void 0 ? void 0 : new XNumber(blur),
            color,
            offset: {
                x: shadow$offset_x === void 0 ? void 0 : new XNumber(shadow$offset_x),
                y: shadow$offset_y === void 0 ? void 0 : new XNumber(shadow$offset_y)
            }
        };
        this.stroke = stroke;
        this.text = { align, baseline, direction, font };
        this.velocity = new XVector(velocity_x, velocity_y);
    }
    compute() {
        return X.zero;
    }
    draw() { }
    render(renderer, camera, transform, [quality, zoom], style) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        if (this.gravity.extent.value !== 0) {
            Object.assign(this.velocity, this.velocity.endpoint(this.gravity.angle.value, this.gravity.extent.value * X.speed.value).value());
        }
        if (this.friction.value !== 1) {
            Object.assign(this.velocity, this.velocity.divide((this.friction.value - 1) * X.speed.value + 1).value());
        }
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            Object.assign(this.position, this.position.add(this.velocity.multiply(X.speed.value)));
        }
        this.fire('tick');
        const subalpha = style.globalAlpha * Math.min(Math.max(this.alpha.value, 0), 1);
        if (subalpha > 0 || this.objects.length > 0) {
            const subtransform = [
                transform[0].add(this.position).add(this.parallax.multiply(camera)).shift(transform[1], 0, transform[0]),
                transform[1] + this.rotation.value,
                transform[2].multiply(this.scale)
            ];
            const substyle = {
                globalAlpha: subalpha,
                globalCompositeOperation: (_a = this.blend) !== null && _a !== void 0 ? _a : style.globalCompositeOperation,
                fillStyle: (_b = this.fill) !== null && _b !== void 0 ? _b : style.fillStyle,
                lineCap: (_c = this.line.cap) !== null && _c !== void 0 ? _c : style.lineCap,
                lineDashOffset: (_e = (_d = this.line.dash) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : style.lineDashOffset,
                lineJoin: (_f = this.line.join) !== null && _f !== void 0 ? _f : style.lineJoin,
                miterLimit: (_h = (_g = this.line.miter) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : style.miterLimit,
                lineWidth: (_k = (_j = this.line.width) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : style.lineWidth,
                shadowBlur: (_m = (_l = this.shadow.blur) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : style.shadowBlur,
                shadowColor: (_o = this.shadow.color) !== null && _o !== void 0 ? _o : style.shadowColor,
                shadowOffsetX: (_q = (_p = this.shadow.offset.x) === null || _p === void 0 ? void 0 : _p.value) !== null && _q !== void 0 ? _q : style.shadowOffsetX,
                shadowOffsetY: (_s = (_r = this.shadow.offset.y) === null || _r === void 0 ? void 0 : _r.value) !== null && _s !== void 0 ? _s : style.shadowOffsetY,
                strokeStyle: (_t = this.stroke) !== null && _t !== void 0 ? _t : style.strokeStyle,
                textAlign: (_u = this.text.align) !== null && _u !== void 0 ? _u : style.textAlign,
                textBaseline: (_v = this.text.baseline) !== null && _v !== void 0 ? _v : style.textBaseline,
                direction: (_w = this.text.direction) !== null && _w !== void 0 ? _w : style.direction,
                font: (_x = this.text.font) !== null && _x !== void 0 ? _x : style.font
            };
            subalpha === 0 || this.draw(renderer, subtransform, [quality, zoom], substyle);
            if (this.objects.length > 0) {
                for (const object of this.objects) {
                    object.render(renderer, camera, subtransform, [quality, zoom], substyle);
                }
            }
        }
    }
}
class XHitbox extends XObject {
    constructor(properties = {}) {
        super(properties);
        this.state = { dimensions: void 0, vertices: [] };
        (({ size: { x: size_x = 0, y: size_y = 0 } = {} } = {}) => {
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    compute() {
        return this.size;
    }
    region() {
        const vertices = this.vertices();
        const { x: x1, y: y1 } = vertices[0];
        const { x: x2, y: y2 } = vertices[1];
        const { x: x3, y: y3 } = vertices[2];
        const { x: x4, y: y4 } = vertices[3];
        return [
            new XVector(Math.min(x1, x2, x3, x4), Math.min(y1, y2, y3, y4)),
            new XVector(Math.max(x1, x2, x3, x4), Math.max(y1, y2, y3, y4))
        ];
    }
    vertices() {
        if (this.state.dimensions === void 0) {
            throw "This object's vertices are unresolved!";
        }
        else {
            return this.state.vertices;
        }
    }
}
class XEntity extends XHitbox {
    constructor(properties = {}) {
        super(properties);
        this.face = 'down';
        (({ sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {}, step = 1 } = {}) => {
            this.sprites = {
                down: down instanceof XSprite ? down : new XSprite(down),
                left: left instanceof XSprite ? left : new XSprite(left),
                right: right instanceof XSprite ? right : new XSprite(right),
                up: up instanceof XSprite ? up : new XSprite(up)
            };
            this.step = step;
        })(properties);
        this.on('tick', () => {
            this.objects[0] = this.sprites[this.face];
        });
    }
    get sprite() {
        return this.sprites[this.face];
    }
    move(offset, renderer, key, keys = [], filter) {
        const source = this.position.value();
        const hitboxes = filter && renderer ? keys.flatMap(key => renderer.calculate(key, filter)) : [];
        for (const axis of ['x', 'y']) {
            const distance = offset[axis];
            if (distance !== 0) {
                this.position[axis] += distance;
                const hits = renderer ? renderer.detect(key, this, ...hitboxes) : [];
                if (hits.length > 0) {
                    const single = (distance / Math.abs(distance)) * this.step;
                    while (this.position[axis] !== source[axis] && renderer.detect(key, this, ...hits).length > 0) {
                        this.position[axis] -= single;
                    }
                }
            }
        }
        if (this.position.x === source.x && this.position.y === source.y) {
            if (offset.y < 0) {
                this.face = 'up';
            }
            else if (offset.y > 0) {
                this.face = 'down';
            }
            else if (offset.x < 0) {
                this.face = 'left';
            }
            else if (offset.x > 0) {
                this.face = 'right';
            }
            for (const sprite of Object.values(this.sprites)) {
                sprite.reset();
            }
            return false;
        }
        else {
            if (this.position.y < source.y) {
                this.face = 'up';
            }
            else if (this.position.y > source.y) {
                this.face = 'down';
            }
            else if (this.position.x < source.x) {
                this.face = 'left';
            }
            else if (this.position.x > source.x) {
                this.face = 'right';
            }
            this.sprite.enable();
            return true;
        }
    }
    async walk(renderer, key, speed, ...points) {
        await renderer.on('tick');
        for (const sprite of Object.values(this.sprites)) {
            sprite.steps = Math.round(15 / speed);
        }
        for (const { x = this.position.x, y = this.position.y } of points) {
            const dirX = x - this.position.x < 0 ? -1 : 1;
            const dirY = y - this.position.y < 0 ? -1 : 1;
            await X.chain(void 0, async (z, next) => {
                const diffX = Math.abs(x - this.position.x);
                const diffY = Math.abs(y - this.position.y);
                this.move({
                    x: (diffX === 0 ? 0 : diffX < speed ? diffX : speed) * dirX,
                    y: (diffY === 0 ? 0 : diffY < speed ? diffY : speed) * dirY
                }, renderer, key);
                if (diffX > 0 || diffY > 0) {
                    await renderer.on('tick');
                    await next();
                }
            });
        }
    }
}
class XCharacter extends XEntity {
    constructor(properties) {
        super(properties);
        this.talk = false;
        (({ key, preset }) => {
            this.key = key;
            this.preset = preset;
        })(properties);
        this.on('tick', {
            priority: -1,
            listener: () => {
                this.sprites = this.talk ? this.preset.talk : this.preset.walk;
            }
        });
    }
}
class XPath extends XObject {
    constructor(properties = {}) {
        super(properties);
        (({ size: { x: size_x = 0, y: size_y = 0 } = {}, tracer = () => { } } = {}) => {
            this.tracer = tracer;
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    compute() {
        return this.size;
    }
    draw(renderer, transform, [quality, zoom], style) {
        this.tracer(renderer, transform, [quality, zoom], style);
    }
}
class XPlayer extends XEntity {
    constructor(properties = {}) {
        super(properties);
        this.walking = false;
        (({ extent: { x: extent_x = 0, y: extent_y = 0 } = {} } = {}) => {
            this.extent = new XVector(extent_x, extent_y);
        })(properties);
        this.on('tick').then(() => {
            this.objects[1] = new XHitbox().wrapOn('tick', self => () => {
                self.anchor.x = this.face === 'left' ? 1 : this.face === 'right' ? -1 : 0;
                self.anchor.y = this.face === 'up' ? 1 : this.face === 'down' ? -1 : 0;
                self.size.x = this.face === 'left' || this.face === 'right' ? this.extent.y : this.extent.x;
                self.size.y = this.face === 'down' || this.face === 'up' ? this.extent.y : this.extent.x;
            });
        });
    }
    async walk(renderer, key, speed, ...targets) {
        this.walking = true;
        await super.walk(renderer, key, speed, ...targets);
        this.walking = false;
    }
}
class XRandom {
    constructor(seed, base = (() => {
        let h = 1779033703 ^ seed.length;
        for (let i = 0; i < seed.length; i++) {
            (h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19));
        }
        let [a, b, c, d] = X.populate(4, () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        });
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    })()) {
        this.base = base;
    }
    step() {
        let hash = (this.base += 0x6d2b79f5);
        hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
        return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
    }
    next(threshold = 0) {
        const base = this.base;
        let step = this.step();
        while (Math.abs(this.base - base) < threshold) {
            step = this.step();
        }
        return step;
    }
}
class XRectangle extends XObject {
    constructor(properties = {}) {
        super(properties);
        (({ size: { x: size_x = 0, y: size_y = 0 } = {} } = {}) => {
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    compute() {
        return this.size;
    }
    draw(renderer, [position, rotation, scale], [quality, zoom], style) {
        const fill = style.fillStyle !== 'transparent';
        const stroke = style.strokeStyle !== 'transparent';
        if (fill || stroke) {
            const size = this.compute();
            const half = size.divide(2);
            const base = position.subtract(half.add(half.multiply(this.anchor)));
            const rectangle = new PIXI.Graphics();
            rectangle.pivot.set(size.x * ((this.anchor.x + 1) / 2), size.y * ((this.anchor.y + 1) / 2));
            rectangle.position.set((base.x + rectangle.pivot.x) * quality, (base.y + rectangle.pivot.y) * quality);
            rectangle.rotation = (Math.PI / 180) * (rotation % 360);
            rectangle.scale.set(scale.x, scale.y);
            rectangle.alpha = style.globalAlpha;
            rectangle.blendMode = X.blend(style.globalCompositeOperation);
            if (stroke) {
                const strokeColor = X.color(style.strokeStyle);
                if (strokeColor[3] > 0) {
                    rectangle.lineStyle({
                        alpha: strokeColor[3],
                        cap: { butt: PIXI.LINE_CAP.BUTT, round: PIXI.LINE_CAP.ROUND, square: PIXI.LINE_CAP.SQUARE }[style.lineCap],
                        color: parseInt(X.hex(strokeColor), 16),
                        join: { bevel: PIXI.LINE_JOIN.BEVEL, miter: PIXI.LINE_JOIN.MITER, round: PIXI.LINE_JOIN.ROUND }[style.lineJoin],
                        miterLimit: style.miterLimit,
                        width: style.lineWidth
                    });
                }
            }
            if (fill) {
                const fillColor = X.color(style.fillStyle);
                if (fillColor[3] > 0) {
                    rectangle.beginFill(parseInt(X.hex(fillColor), 16), fillColor[3]);
                }
                else {
                    rectangle.beginFill(0, 0);
                }
            }
            renderer.render(rectangle.drawRect(0, 0, size.x, size.y).endFill());
            rectangle.destroy();
        }
    }
}
class XRenderer extends XHost {
    constructor({ alpha = 1, auto = false, camera: { x: camera_x = 0, y: camera_y = 0 } = {}, container = document.body, framerate = 30, layers = {}, region: [{ x: min_x = -Infinity, y: min_y = -Infinity } = {}, { x: max_x = Infinity, y: max_y = Infinity } = {}] = [], shake = 0, size: { x: size_x = 320, y: size_y = 240 } = {}, quality = 1, zoom = 1 } = {}) {
        super();
        this.state = {
            camera: { x: NaN, y: NaN },
            active: false,
            rendererX: NaN,
            rendererY: NaN,
            scale: 1,
            windowX: NaN,
            windowY: NaN,
            quality: NaN,
            zoom: NaN
        };
        Object.assign(container.style, {
            display: 'grid',
            gridTemplateAreas: "'top top top' 'left center right' 'bottom bottom bottom'",
            gridTemplateColumns: '1fr max-content 1fr',
            gridTemplateRows: '1fr max-content 1fr'
        });
        this.alpha = new XNumber(alpha);
        this.camera = new XVector(camera_x, camera_y);
        this.container = container;
        this.framerate = framerate;
        this.layers = Object.fromEntries(Object.entries(layers).map(([key, value]) => {
            const canvas = document.createElement('canvas');
            Object.assign(canvas.style, {
                gridArea: 'center',
                imageRendering: 'pixelated'
            });
            this.container.appendChild(canvas);
            return [
                key,
                {
                    canvas,
                    modifiers: value,
                    objects: [],
                    renderer: new (GL ? PIXI.Renderer : PIXI.CanvasRenderer)({
                        antialias: false,
                        backgroundAlpha: 0,
                        clearBeforeRender: false,
                        view: canvas
                    })
                }
            ];
        }));
        this.region = [
            { x: min_x, y: min_y },
            { x: max_x, y: max_y }
        ];
        this.shake = new XNumber(shake);
        this.size = new XVector(size_x, size_y);
        this.quality = new XNumber(quality);
        this.zoom = new XNumber(zoom);
    }
    attach(key, ...objects) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.modifiers.includes('ambient') && this.refresh();
            for (const object of objects) {
                layer.objects.includes(object) || layer.objects.push(object);
            }
            X.chain(layer, (parent, next) => {
                parent.objects.sort((object1, object2) => object1.priority.value - object2.priority.value).forEach(next);
            });
        }
    }
    calculate(key, filter = true) {
        const list = [];
        const camera = this.camera.clamp(...this.region);
        X.chain([[new XVector(), 0, new XVector(1)], this.layers[key].objects], ([transform, objects], next) => {
            for (const object of objects) {
                const position = transform[0].add(object.position).add(object.parallax.multiply(camera));
                const rotation = transform[1] + object.rotation.value;
                const scale = transform[2].multiply(object.scale);
                if (object instanceof XHitbox && X.provide(filter, object)) {
                    list.push(object);
                    const size = object.size.multiply(scale);
                    const half = size.divide(2);
                    const base = position.subtract(half.add(half.multiply(object.anchor)));
                    const dimensions = `${base.x}:${base.y}:${position.x}:${position.y}:${rotation}:${size.x}:${size.y}`;
                    if (dimensions !== object.state.dimensions) {
                        const offset = rotation + 180;
                        const corner2 = base.endpoint(0, size.x);
                        const corner3 = corner2.endpoint(90, size.y);
                        const corner4 = corner3.endpoint(180, size.x);
                        object.state.vertices[0] = position
                            .endpoint(position.angle(base) + offset, position.extent(base))
                            .round(1e6);
                        object.state.vertices[1] = position
                            .endpoint(position.angle(corner2) + offset, position.extent(corner2))
                            .round(1e6);
                        object.state.vertices[2] = position
                            .endpoint(position.angle(corner3) + offset, position.extent(corner3))
                            .round(1e6);
                        object.state.vertices[3] = position
                            .endpoint(position.angle(corner4) + offset, position.extent(corner4))
                            .round(1e6);
                        object.state.dimensions = dimensions;
                    }
                }
                next([[position, rotation, scale], object.objects]);
            }
        });
        return list;
    }
    clear(key) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.modifiers.includes('ambient') && this.refresh();
            layer.objects.splice(0, layer.objects.length);
            this.reset(key);
        }
    }
    detach(key, ...objects) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.modifiers.includes('ambient') && this.refresh();
            for (const object of objects) {
                const index = layer.objects.indexOf(object);
                if (index > -1) {
                    layer.objects.splice(index, 1);
                }
            }
            if (layer.objects.length === 0) {
                this.reset(key);
            }
        }
    }
    detect(key, source, ...hitboxes) {
        key && this.calculate(key, hitbox => hitbox === source);
        const hits = [];
        const [min1, max1] = source.region();
        for (const hitbox of hitboxes) {
            if (hitbox.state.dimensions === void 0) {
                continue;
            }
            else if ((source.size.x === 0 || source.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
                const [min2, max2] = hitbox.region();
                if (X.math.intersection(min1, max1, min2, max2)) {
                    hits.push(hitbox);
                }
            }
            else {
                const [min2, max2] = hitbox.region();
                if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
                    const vertices1 = source.vertices();
                    const vertices2 = hitbox.vertices();
                    if ((vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                        (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)) {
                        hits.push(hitbox);
                    }
                    else {
                        for (const a1 of vertices1) {
                            let miss = true;
                            const a2 = new XVector(a1).add(new XVector(max2).subtract(min2).multiply(2)).value();
                            for (const [b1, b2] of [
                                [vertices2[0], vertices2[1]],
                                [vertices2[1], vertices2[2]],
                                [vertices2[2], vertices2[3]],
                                [vertices2[3], vertices2[0]]
                            ]) {
                                if (X.math.intersection(a1, a2, b1, b2)) {
                                    if ((miss = !miss)) {
                                        break;
                                    }
                                }
                            }
                            if (!miss) {
                                hits.push(hitbox);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return hits;
    }
    iterate(handler = (object) => object, key) {
        if (typeof key === 'string') {
            return X.chain(this.layers[key].objects, (objects, loop) => {
                return objects.flatMap(object => [handler(object), ...loop(object.objects)]);
            });
        }
        else {
            return Object.keys(this.layers).flatMap(key => this.iterate(handler, key));
        }
    }
    reset(key) {
        const renderer = this.layers[key].renderer;
        renderer instanceof PIXI.Renderer && renderer.reset();
        renderer.clear();
    }
    restrict(position) {
        return this.size
            .divide(2)
            .subtract(this.camera.clamp(...this.region))
            .add(position);
    }
    start() {
        const ticker = new PIXI.Ticker();
        ticker.add(() => {
            this.render();
            ticker.minFPS = this.framerate;
            ticker.maxFPS = this.framerate;
        });
        ticker.start();
        return { cancel: () => ticker.destroy() };
    }
    refresh() {
        this.state.camera = { x: NaN, y: NaN };
    }
    render() {
        this.fire('tick');
        let update = false;
        let resize = false;
        const camera = this.camera.clamp(...this.region);
        this.container.style.opacity = Math.min(Math.max(this.alpha.value, 0), 1).toString();
        if (this.zoom.value !== this.state.zoom) {
            update = true;
            this.state.zoom = this.zoom.value;
        }
        if (camera.x !== this.state.camera.x || camera.y !== this.state.camera.y) {
            update = true;
            this.state.camera = camera.value();
        }
        if (this.quality.value !== this.state.quality) {
            update = true;
            resize = true;
            this.state.quality = this.quality.value;
        }
        if (innerWidth !== this.state.windowX ||
            innerHeight !== this.state.windowY ||
            this.size.x !== this.state.rendererX ||
            this.size.y !== this.state.rendererY) {
            update = true;
            resize = true;
            this.state.windowX = innerWidth;
            this.state.windowY = innerHeight;
            this.state.rendererX = this.size.x;
            this.state.rendererY = this.size.y;
            const ratio = this.size.x / this.size.y;
            if (this.state.windowX / this.state.windowY > ratio) {
                this.state.scale = innerHeight / this.size.y;
            }
            else {
                this.state.scale = innerWidth / this.size.x;
            }
        }
        if (resize) {
            const width = this.size.x * this.quality.value;
            const height = this.size.y * this.quality.value;
            const scale = this.state.scale / this.quality.value;
            for (const key in this.layers) {
                const { canvas } = this.layers[key];
                canvas.width = width;
                canvas.height = height;
                canvas.style.transform = `scale(${scale})`;
                if (scale < 1) {
                    canvas.style.transformOrigin = innerWidth > innerHeight ? '50% 0' : '0 50%';
                }
                else {
                    canvas.style.transformOrigin = '';
                }
            }
        }
        const shakeX = this.shake.value ? this.shake.value * (Math.random() - 0.5) : 0;
        const shakeY = this.shake.value ? this.shake.value * (Math.random() - 0.5) : 0;
        for (const key in this.layers) {
            const { modifiers, objects, renderer } = this.layers[key];
            if (objects.length > 0 && (update || this.shake.value > 0 || !modifiers.includes('ambient'))) {
                const center = this.size.divide(2);
                const statik = modifiers.includes('static');
                this.reset(key);
                if (modifiers.includes('vertical')) {
                    objects.sort((object1, object2) => (object1.priority.value || object1.position.y) - (object2.priority.value || object2.position.y));
                }
                const zoom = statik ? 1 : this.zoom.value;
                const transform = [
                    new XVector(center.x + -(statik ? center.x : camera.x) + shakeX, center.y + -(statik ? center.y : camera.y) + shakeY),
                    0,
                    new XVector(this.quality.value * zoom)
                ];
                for (const object of objects) {
                    object.render(renderer, camera, transform, [this.quality.value * zoom, zoom], {
                        globalAlpha: 1,
                        globalCompositeOperation: 'source-over',
                        fillStyle: 'transparent',
                        lineCap: 'butt',
                        lineDashOffset: 0,
                        lineJoin: 'miter',
                        miterLimit: 10,
                        lineWidth: 1,
                        shadowBlur: 0,
                        shadowColor: 'transparent',
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        strokeStyle: 'transparent',
                        textAlign: 'start',
                        textBaseline: 'alphabetic',
                        direction: 'ltr',
                        font: '10px monospace'
                    });
                }
            }
        }
    }
}
class XSprite extends XObject {
    constructor(properties = {}) {
        super(properties);
        this.state = { index: 0, active: false, step: 0 };
        (({ auto = false, crop: { bottom = 0, left = 0, right = 0, top = 0 } = {}, step = 0, steps = 1, frames = [] } = {}) => {
            this.crop = { bottom, left, right, top };
            this.frames = frames;
            this.step = step;
            this.steps = steps;
            auto && (this.state.active = true);
        })(properties);
    }
    compute() {
        const texture = this.frames[this.state.index];
        if (texture && texture.state.value) {
            const x = (this.crop.left < 0 ? texture.value.width : 0) + this.crop.left;
            const y = (this.crop.top < 0 ? texture.value.height : 0) + this.crop.top;
            const w = (this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right - x;
            const h = (this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom - y;
            return new XVector(w, h);
        }
        else {
            return new XVector(0, 0);
        }
    }
    disable() {
        this.state.active = false;
        return this;
    }
    draw(renderer, [position, rotation, scale], [quality, zoom], style) {
        const texture = this.frames[this.state.index];
        if (texture && texture.state.value) {
            const r = (Math.PI / 180) * (rotation % 360);
            const a = (this.anchor.x + 1) / 2;
            const b = (this.anchor.y + 1) / 2;
            const x = (this.crop.left < 0 ? texture.value.width : 0) + this.crop.left;
            const y = (this.crop.top < 0 ? texture.value.height : 0) + this.crop.top;
            const w = (this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right - x;
            const h = (this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom - y;
            const sprite = new PIXI.Sprite(X.cache.textures.get(texture));
            sprite.anchor.set((x + w * a) / texture.value.width, (y + h * b) / texture.value.height);
            sprite.position.set(position.x * quality, position.y * quality);
            sprite.rotation = r;
            sprite.scale.set(scale.x, scale.y);
            sprite.alpha = style.globalAlpha;
            sprite.blendMode = X.blend(style.globalCompositeOperation);
            // mask setup
            const graphics = new PIXI.Graphics();
            graphics.position.set(sprite.position.x, sprite.position.y);
            graphics.pivot.set(w * a, h * b);
            graphics.rotation = r;
            graphics.scale.set(scale.x, scale.y);
            graphics.beginFill(0xffffff, 1).drawRect(0, 0, w, h).endFill();
            const mask = new PIXI.MaskData(graphics);
            mask.type = rotation % 90 === 0 ? PIXI.MASK_TYPES.SCISSOR : PIXI.MASK_TYPES.STENCIL;
            sprite.mask = mask;
            // render
            (GL && rotation % 90 === 0) || renderer.render(graphics);
            renderer.render(sprite);
            sprite.destroy();
            graphics.destroy();
        }
        if (Math.round(this.steps / X.speed.value) <= ++this.state.step) {
            this.state.step = 0;
            if (this.state.active && this.frames.length <= ++this.state.index) {
                this.state.index = 0;
            }
        }
    }
    enable(steps) {
        this.state.active = true;
        steps && (this.steps = steps);
        return this;
    }
    async load() {
        await Promise.all(this.frames.map(asset => asset && asset.load()));
    }
    read(min, max) {
        var _a, _b, _c, _d;
        const frame = this.frames[this.state.index];
        const colors = [];
        if (frame) {
            const sprite = PIXI.Sprite.from(X.cache.textures.get(frame));
            const originX = Math.round((_a = min === null || min === void 0 ? void 0 : min.x) !== null && _a !== void 0 ? _a : 0);
            const originY = Math.round((_b = min === null || min === void 0 ? void 0 : min.y) !== null && _b !== void 0 ? _b : 0);
            const sizeX = Math.round((_c = max === null || max === void 0 ? void 0 : max.x) !== null && _c !== void 0 ? _c : sprite.width) - originX;
            const sizeY = Math.round((_d = max === null || max === void 0 ? void 0 : max.y) !== null && _d !== void 0 ? _d : sprite.height) - originY;
            const pixels = [
                ...X.shader.plugins.extract.pixels(sprite).slice((originX + originY * sprite.width) * 4)
            ];
            sprite.destroy();
            while (colors.length < sizeY) {
                const subcolors = [];
                while (subcolors.length < sizeX) {
                    subcolors.push(pixels.splice(0, 4));
                }
                colors.push(subcolors);
                pixels.splice(0, (sprite.width - sizeY) * 4);
            }
        }
        return colors;
    }
    reset() {
        Object.assign(this.state, { active: false, index: 0, step: this.step });
        return this;
    }
    async unload() {
        await Promise.all(this.frames.map(asset => asset && asset.unload()));
    }
}
class XAnimation extends XSprite {
    constructor(properties) {
        super(properties);
        this.state = {
            index: 0,
            active: this.state.active,
            step: 0,
            previous: null
        };
        (({ subcrop: { left = 0, right = 0, bottom = 0, top = 0 } = {}, framerate = 30, resources, stepper = true }) => {
            this.subcrop = { left, right, bottom, top };
            this.framerate = framerate;
            this.resources = resources || null;
            this.stepper = stepper;
        })(properties);
    }
    refresh() {
        this.state.previous = null;
        this.compute();
        return this;
    }
    compute() {
        if (this.resources && this.resources.state.value) {
            const frames = this.resources.value[0].value.frames;
            const update = this.state.index !== this.state.previous;
            if (update) {
                this.state.previous = this.state.index;
            }
            const { duration, frame: { x, y, w, h } } = frames[this.state.index];
            const sx = (this.subcrop.left < 0 ? w : 0) + this.subcrop.left;
            const sy = (this.subcrop.top < 0 ? h : 0) + this.subcrop.top;
            const sw = (this.subcrop.right < 0 ? 0 : w) - this.subcrop.right - sx;
            const sh = (this.subcrop.bottom < 0 ? 0 : h) - this.subcrop.bottom - sy;
            this.crop = { left: x + sx, top: y + sy, right: -(x + sx + sw), bottom: -(y + sy + sh) };
            if (update) {
                const content = this.resources.value[1];
                this.frames = X.populate(frames.length, () => content);
                if (this.stepper) {
                    this.steps = Math.round(duration / (1000 / this.framerate));
                }
            }
            if (frames.length > 0) {
                return new XVector(sw, sh);
            }
            else {
                return new XVector();
            }
        }
        else {
            return new XVector();
        }
    }
    draw(renderer, transform, [quality, zoom], style) {
        this.compute();
        super.draw(renderer, transform, [quality, zoom], style);
    }
    update(resources) {
        this.resources = resources;
        if (this.state.active) {
            return this.reset().refresh().enable();
        }
        else {
            return this.reset().refresh();
        }
    }
    static resources(dataSource, imageSource) {
        return X.inventory(X.dataAsset(dataSource), X.imageAsset(imageSource));
    }
}
class XVector {
    constructor(a = 0, b = a) {
        if (typeof a === 'number') {
            this.x = a;
            this.y = b;
        }
        else {
            this.x = a.x || 0;
            this.y = a.y || 0;
        }
    }
    add(a, b = a) {
        if (typeof a === 'number') {
            return new XVector(this.x + a, this.y + b);
        }
        else {
            return this.add(a.x, a.y);
        }
    }
    clamp(min, max) {
        return new XVector(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y));
    }
    clone() {
        return new XVector(this);
    }
    angle(vector) {
        return ((180 / Math.PI) * Math.atan2(this.y - vector.y, this.x - vector.x) + 360) % 360;
    }
    extent(vector) {
        return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
    }
    divide(a, b = a) {
        if (typeof a === 'number') {
            return new XVector(this.x / a, this.y / b);
        }
        else {
            return this.divide(a.x, a.y);
        }
    }
    endpoint(angle, extent) {
        const rads = Math.PI - (((angle + 90) % 360) * Math.PI) / 180;
        return new XVector(this.x + extent * Math.sin(rads), this.y + extent * Math.cos(rads));
    }
    modulate(duration, ...points) {
        const x = this.x;
        const y = this.y;
        const base = X.time;
        return new Promise(resolve => {
            var _a;
            let active = true;
            (_a = X.cache.modulationTasks.get(this)) === null || _a === void 0 ? void 0 : _a.cancel();
            X.cache.modulationTasks.set(this, {
                cancel() {
                    active = false;
                }
            });
            const listener = () => {
                var _a, _b;
                if (active) {
                    const elapsed = X.time - base;
                    if (elapsed < duration) {
                        this.x = X.math.bezier(elapsed / duration, x, ...points.map(point => { var _a; return (_a = point.x) !== null && _a !== void 0 ? _a : x; }));
                        this.y = X.math.bezier(elapsed / duration, y, ...points.map(point => { var _a; return (_a = point.y) !== null && _a !== void 0 ? _a : y; }));
                    }
                    else {
                        X.cache.modulationTasks.delete(this);
                        this.x = points.length > 0 ? (_a = points[points.length - 1].x) !== null && _a !== void 0 ? _a : x : x;
                        this.y = points.length > 0 ? (_b = points[points.length - 1].y) !== null && _b !== void 0 ? _b : y : y;
                        X.timer.off('tick', listener);
                        resolve();
                    }
                }
                else {
                    X.timer.off('tick', listener);
                }
            };
            X.timer.on('tick', listener);
        });
    }
    multiply(a, b = a) {
        if (typeof a === 'number') {
            return new XVector(this.x * a, this.y * b);
        }
        else {
            return this.multiply(a.x, a.y);
        }
    }
    round(base) {
        return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
    }
    shift(angle, extent, origin = X.zero) {
        return origin.endpoint(this.angle(origin) + angle, this.extent(origin) + extent);
    }
    subtract(a, b = a) {
        if (typeof a === 'number') {
            return new XVector(this.x - a, this.y - b);
        }
        else {
            return this.subtract(a.x, a.y);
        }
    }
    value() {
        return { x: this.x, y: this.y };
    }
}
class XText extends XObject {
    constructor(properties = {}) {
        super(properties);
        (({ cache = true, charset = '/0123456789=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', content = '', spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {} } = {}) => {
            this.cache = cache;
            this.charset = charset;
            this.content = content;
            this.spacing = new XVector(spacing_x, spacing_y);
        })(properties);
    }
    compute() {
        return new XVector();
    }
    draw(renderer, [position, rotation, scale], [quality, zoom], style) {
        let index = 0;
        const state = Object.assign({}, style);
        const phase = X.time / 1e3;
        const offset = { x: 0, y: 0 };
        const random = { x: 0, y: 0 };
        const swirl = { p: 0, r: 0, s: 0 };
        const [fontSize, fontFamily] = style.font.split(' ');
        const shadowColor = X.color(style.shadowColor);
        const strokeColor = X.color(style.strokeStyle);
        const textStyle = new PIXI.TextStyle({
            dropShadow: shadowColor[3] > 0,
            dropShadowAlpha: shadowColor[3],
            dropShadowAngle: X.zero.angle({ x: style.shadowOffsetX, y: style.shadowOffsetY }),
            dropShadowBlur: style.shadowBlur,
            dropShadowColor: `#${X.hex(shadowColor)}`,
            dropShadowDistance: X.zero.extent({ x: style.shadowOffsetX, y: style.shadowOffsetY }),
            fill: `#${X.hex(X.color(style.fillStyle))}`,
            fontFamily,
            fontSize,
            lineJoin: style.lineJoin,
            miterLimit: style.miterLimit,
            stroke: `#${X.hex(strokeColor)}`,
            strokeThickness: strokeColor[3] > 0 ? style.lineWidth : 0,
            textBaseline: style.textBaseline
        });
        const metrics = X.metrics(textStyle, this.charset);
        const lines = this.content.split('\n').map(section => {
            let total = 0;
            for (const char of section) {
                total += X.metrics(textStyle, char).x + this.spacing.x;
            }
            return total;
        });
        const size = new XVector(Math.max(...lines), metrics.y + (metrics.y + this.spacing.y) * (lines.length - 1));
        const half = size.divide(2);
        const base = position
            .divide(scale)
            .multiply(quality)
            .subtract(half.add(half.multiply(this.anchor)));
        const container = new PIXI.Container();
        container.rotation = (Math.PI / 180) * (rotation % 360);
        container.scale.set(scale.x, scale.y);
        while (index < this.content.length) {
            const char = this.content[index++];
            if (char === '\n') {
                offset.x = 0;
                offset.y += metrics.y + this.spacing.y;
            }
            else if (char === '\xa7') {
                const code = this.content.slice(index, this.content.indexOf('\xa7', index));
                const [key, value] = code.split(':');
                index += code.length + 1;
                switch (key) {
                    case 'alpha':
                        style.globalAlpha = state.globalAlpha * Math.min(Math.max(+value, 0), 1);
                        break;
                    case 'blend':
                        style.globalCompositeOperation = value;
                        break;
                    case 'fill':
                        textStyle.fill = `#${X.hex(X.color(value))}`;
                        break;
                    case 'font':
                        style.font = value;
                        break;
                    case 'offset':
                        const [offsetX, offsetY] = value.split(',').map(value => +value);
                        offset.x = offsetX || 0;
                        offset.y = offsetY || 0;
                        break;
                    case 'random':
                        const [randomX, randomY] = value.split(',').map(value => +value);
                        random.x = randomX || 0;
                        random.y = randomY || 0;
                        break;
                    case 'stroke':
                        const strokeColor = X.color(value);
                        textStyle.stroke = `#${X.hex(strokeColor)}`;
                        textStyle.strokeThickness = strokeColor[3] > 0 ? style.lineWidth : 0;
                        break;
                    case 'swirl':
                        const [swirlR, swirlS, swirlP] = value.split(',').map(value => +value);
                        swirl.r = swirlR || 0;
                        swirl.s = swirlS || 0;
                        swirl.p = swirlP || 0;
                        break;
                }
            }
            else {
                let x = base.x - textStyle.strokeThickness / 2 + offset.x;
                let y = base.y - textStyle.strokeThickness / 2 + offset.y;
                if (random.x > 0) {
                    x += random.x * (Math.random() - 0.5);
                }
                if (random.y > 0) {
                    y += random.y * (Math.random() - 0.5);
                }
                if (swirl.s > 0 && swirl.r > 0) {
                    const endpoint = new XVector(x, y).endpoint(((phase * 360 * swirl.s) % 360) + index * (360 / swirl.p), swirl.r);
                    x = endpoint.x;
                    y = endpoint.y;
                }
                const font = X.font(textStyle, char, 40);
                const info = font.chars[char.charCodeAt(0)];
                if (info) {
                    const text = PIXI.Sprite.from(info.texture);
                    text.position.set(x + info.xOffset, y + info.yOffset);
                    text.alpha = style.globalAlpha;
                    text.blendMode = X.blend(style.globalCompositeOperation);
                    container.addChild(text);
                }
                offset.x += X.metrics(textStyle, char).x + this.spacing.x;
            }
        }
        renderer.render(container);
        container.destroy({ children: true });
        Object.assign(style, state);
    }
}
const GL = PIXI.utils.isWebGLSupported();
const X = {
    /** Gets an `AudioBuffer` from the given source URL. */
    audio(source) {
        if (source in X.cache.audios) {
            return X.cache.audios[source];
        }
        else {
            return (X.cache.audios[source] = new Promise(resolve => {
                const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
                request.addEventListener('load', () => new AudioContext().decodeAudioData(request.response, resolve));
                request.open('GET', source, true);
                request.send();
            }));
        }
    },
    /** Returns an asset for a given audio source. */
    audioAsset(
    /** The audio's source. */
    source, { 
    /**
     * The extra duration in which to keep this asset's source audio in memory after this asset and all of its
     * siblings (other assets which share this asset's source audio) are unloaded.
     */
    cache = 0, 
    /** The data modifier to apply to the audio. */
    transformer = void 0, 
    /** The trim to apply to the audio. */
    trim: { start = 0, stop = 0 } = {} } = {}) {
        const asset = new XAsset({
            async loader() {
                const assets = X.cache.audioAssets[source] || (X.cache.audioAssets[source] = []);
                assets.includes(asset) || assets.push(asset);
                const audio = await X.audio(source);
                if (start || stop || transformer) {
                    const c = audio.numberOfChannels;
                    const b = Math.round(audio.sampleRate * ((start < 0 ? audio.duration : 0) + start));
                    const l = Math.round(audio.sampleRate * ((stop < 0 ? 0 : audio.duration) - stop)) - b;
                    const index = new XVector(-1);
                    const clone = new AudioBuffer({ length: l, numberOfChannels: c, sampleRate: audio.sampleRate });
                    while (++index.y < c) {
                        const data = audio.getChannelData(index.y).slice(b, b + l);
                        if (transformer) {
                            const total = { x: c, y: l };
                            while (++index.x < l) {
                                data[index.x] = transformer(data[index.x], index, total);
                            }
                            index.x = -1;
                        }
                        clone.copyToChannel(data, index.y);
                    }
                    return clone;
                }
                else {
                    return audio;
                }
            },
            source,
            async unloader() {
                const assets = X.cache.audioAssets[source] || (X.cache.audioAssets[source] = []);
                X.pause(cache).then(() => {
                    assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
                    if (assets.length === 0) {
                        delete X.cache.audios[source];
                    }
                });
            }
        });
        return asset;
    },
    blend(input) {
        switch (input) {
            case 'lighten':
                return PIXI.BLEND_MODES.ADD;
            case 'multiply':
                return PIXI.BLEND_MODES.MULTIPLY;
            case 'screen':
                return PIXI.BLEND_MODES.SCREEN;
            default:
                return PIXI.BLEND_MODES.NORMAL;
        }
    },
    cache: {
        audios: {},
        audioAssets: {},
        color: {},
        datas: {},
        dataAssets: {},
        fonts: {},
        images: {},
        imageAssets: {},
        textMetrics: {},
        textures: new Map(),
        modulationTasks: new Map()
    },
    chain(input, handler) {
        const loop = (input) => handler(input, loop);
        return loop(input);
    },
    color(input) {
        if (input in X.cache.color) {
            return X.cache.color[input];
        }
        else {
            const element = document.createElement('x');
            element.style.color = input;
            document.body.appendChild(element);
            const color = getComputedStyle(element)
                .color.split('(')[1]
                .slice(0, -1)
                .split(', ')
                .map(value => +value);
            element.remove();
            color.length === 3 && color.push(1);
            return (X.cache.color[input] = color);
        }
    },
    daemon(audio, { context = new AudioContext(), gain = 1, loop = false, rate = 1, router = ((context, input) => input.connect(context.destination)) } = {}) {
        const daemon = {
            audio,
            context,
            gain,
            instance(offset = 0, store = false) {
                const context = daemon.context;
                const gain = context.createGain();
                const source = context.createBufferSource();
                gain.gain.value = daemon.gain;
                source.buffer = daemon.audio.value;
                source.loop = daemon.loop;
                source.playbackRate.value = daemon.rate;
                daemon.router(context, gain);
                source.connect(gain);
                source.start(0, offset);
                const instance = {
                    context,
                    daemon,
                    gain: gain.gain,
                    get loop() {
                        return source.loop;
                    },
                    set loop(value) {
                        source.loop = value;
                    },
                    rate: source.playbackRate,
                    stop() {
                        source.stop();
                        source.disconnect();
                        source.buffer = null;
                        store && daemon.instances.splice(daemon.instances.indexOf(instance), 1);
                    }
                };
                store && daemon.instances.push(instance);
                return instance;
            },
            instances: [],
            loop,
            rate,
            router
        };
        return daemon;
    },
    data(source) {
        if (source in X.cache.datas) {
            return X.cache.datas[source];
        }
        else {
            return (X.cache.datas[source] = fetch(source).then(value => value.json()));
        }
    },
    dataAsset(source, { cache = 0, modifier = void 0 } = {}) {
        const asset = new XAsset({
            async loader() {
                const assets = X.cache.dataAssets[source] || (X.cache.dataAssets[source] = []);
                assets.includes(asset) || assets.push(asset);
                const data = await X.data(source);
                if (modifier) {
                    return modifier(data);
                }
                else {
                    return data;
                }
            },
            source,
            async unloader() {
                const assets = X.cache.dataAssets[source] || (X.cache.dataAssets[source] = []);
                X.pause(cache).then(() => {
                    assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
                    if (assets.length === 0) {
                        delete X.cache.datas[source];
                    }
                });
            }
        });
        return asset;
    },
    font(style, charset, quality = 1) {
        const key = `${Object.values(style).join('\x00')}\x00${charset}\x00${quality}`;
        if (key in X.cache.fonts) {
            const font = X.cache.fonts[key];
            font.time = X.time;
            return font.value;
        }
        else {
            const size = typeof style.fontSize === 'number' ? style.fontSize : +style.fontSize.replace(/(px|pt|em|%)/g, '');
            return (X.cache.fonts[key] = {
                time: X.time,
                value: PIXI.BitmapFont.from(key, style, {
                    chars: charset.split(''),
                    padding: 0,
                    resolution: quality,
                    textureHeight: Math.max(size * quality * 1.25, 100),
                    textureWidth: Math.max(size * quality * 1.25, 100)
                })
            }).value;
        }
    },
    hex(color, alpha = false) {
        return color
            .slice(0, alpha ? 4 : 3)
            .map(value => value.toString(16).padStart(2, '0'))
            .join('');
    },
    hyperpromise() {
        let hyperresolve;
        const promise = new Promise(resolve => {
            hyperresolve = resolve;
        });
        return { promise, resolve: hyperresolve };
    },
    image(source) {
        if (source in X.cache.images) {
            return X.cache.images[source];
        }
        else {
            const texture = PIXI.BaseTexture.from(source);
            return (X.cache.images[source] = texture.resource.load().then(() => texture));
        }
    },
    imageAsset(source, { cache = 0, shader = void 0 } = {}) {
        const asset = new XAsset({
            async loader() {
                const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
                assets.includes(asset) || assets.push(asset);
                let image = await X.image(source);
                if (image.width === 0 || image.height === 0) {
                    image = PIXI.BaseTexture.from(await createImageBitmap(new ImageData(1, 1)));
                }
                else if (shader) {
                    const sprite = PIXI.Sprite.from(image);
                    const data = new Uint8ClampedArray(X.shader.plugins.extract.pixels(sprite));
                    sprite.destroy();
                    const x4 = image.width * 4;
                    const index = { x: -1, y: -1 };
                    const total = { x: image.width, y: image.height };
                    while (++index.x < image.width) {
                        const n4 = index.x * 4;
                        while (++index.y < image.height) {
                            let step = index.y * x4 + n4;
                            const color = shader([data[step++], data[step++], data[step++], data[step++]], index, total);
                            data[--step] = color[3];
                            data[--step] = color[2];
                            data[--step] = color[1];
                            data[--step] = color[0];
                        }
                        index.y = -1;
                    }
                    image = PIXI.BaseTexture.from(await createImageBitmap(new ImageData(data, image.width)));
                }
                X.cache.textures.set(asset, PIXI.Texture.from(image));
                return image;
            },
            source,
            async unloader() {
                const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
                X.pause(cache).then(() => {
                    var _a;
                    assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
                    if (assets.length === 0) {
                        (_a = X.cache.images[source]) === null || _a === void 0 ? void 0 : _a.then(image => image.destroy());
                        delete X.cache.images[source];
                        if (X.cache.textures.has(asset)) {
                            X.cache.textures.get(asset).destroy();
                            X.cache.textures.delete(asset);
                        }
                    }
                });
            }
        });
        return asset;
    },
    async import(source) {
        return (await fetch(source)).text();
    },
    async importJSON(source) {
        return (await fetch(source)).json();
    },
    inventory(...assets) {
        return new XAsset({
            async loader() {
                return await Promise.all(assets.map(asset => asset.load())).then(() => assets);
            },
            source: assets.map(asset => asset.source).join('//'),
            async unloader() {
                await Promise.all(assets.map(asset => asset.unload()));
            }
        });
    },
    math: {
        bezier(value, ...points) {
            return points.length > 1
                ? X.math.bezier(value, ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value))
                : points[0] || 0;
        },
        cardinal(angle) {
            if (angle < 45 || angle > 315) {
                return 'left';
            }
            else if (angle <= 135) {
                return 'up';
            }
            else if (angle < 225) {
                return 'right';
            }
            else {
                return 'down';
            }
        },
        format(value) {
            return Math.round(value);
        },
        intersection(a1, a2, b1, b2) {
            return (X.math.rotation(a1, b1, b2) !== X.math.rotation(a2, b1, b2) &&
                X.math.rotation(a1, a2, b1) !== X.math.rotation(a1, a2, b2));
        },
        remap(value, min2, max2, min1 = 0, max1 = 1) {
            return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
        },
        rotation(a1, a2, a3) {
            return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
        },
        wave(value) {
            return Math.sin(((value + 0.5) * 2 - 1) * Math.PI) / 2 + 0.5;
        }
    },
    metrics(style, content) {
        const key = `${style.toFontString()}\x00${content}`;
        if (key in X.cache.textMetrics) {
            return X.cache.textMetrics[key];
        }
        else {
            let index = 0;
            let width = 0;
            let height = 0;
            const font = X.font(style, content);
            while (index < content.length) {
                const info = font.chars[content.charCodeAt(index++)];
                if (info) {
                    width += info.texture.width + info.xOffset || 0 + info.xAdvance || 0;
                    height = Math.max(height, info.texture.height + info.yOffset || 0);
                }
            }
            return (X.cache.textMetrics[key] = { x: width, y: height });
        }
    },
    parse(text) {
        return JSON.parse(text, (key, value) => {
            if (value === '\x00') {
                return Infinity;
            }
            else if (value === '\x01') {
                return -Infinity;
            }
            else {
                return value;
            }
        });
    },
    pause(duration = 0) {
        if (duration === Infinity) {
            return new Promise(resolve => { });
        }
        else {
            return X.chain(0, async (elapsed, next) => {
                if (elapsed < duration) {
                    await next(elapsed + (await X.timer.on('tick'))[0]);
                }
            });
        }
    },
    populate(size, provider) {
        let index = 0;
        const array = [];
        while (index < size) {
            array.push(provider(index++));
        }
        return array;
    },
    provide(provider, ...args) {
        return typeof provider === 'function' ? X.provide(provider(...args)) : provider;
    },
    shader: new (GL ? PIXI.Renderer : PIXI.CanvasRenderer)({
        antialias: false,
        backgroundAlpha: 0,
        clearBeforeRender: false
    }),
    sound: {
        convolver(context, duration, ...pattern) {
            const convolver = context.createConvolver();
            convolver.buffer = X.sound.impulse(context, duration, ...pattern);
            return convolver;
        },
        filter(context, type, frequency) {
            const filter = context.createBiquadFilter();
            filter.type = type;
            filter.frequency.value = frequency;
            return filter;
        },
        impulse(context, duration, ...pattern) {
            let index = -1;
            const size = context.sampleRate * duration;
            const buffer = context.createBuffer(2, size, context.sampleRate);
            while (++index < size) {
                let channel = 0;
                while (channel < buffer.numberOfChannels) {
                    try {
                        const data = buffer.getChannelData(channel++);
                        data[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...pattern);
                        data[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...pattern);
                    }
                    catch (error) { }
                }
            }
            return buffer;
        }
    },
    speed: new XNumber(1),
    status(text, { backgroundColor = '#000', color = '#fff', fontFamily = 'Courier New', fontSize = '16px', padding = '4px 8px' } = {}) {
        console.log(`%c${text}`, `background-color:${backgroundColor};color:${color};font-family:${fontFamily};font-size:${fontSize};padding:${padding};`);
    },
    stringify(value) {
        return JSON.stringify(value, (key, value) => {
            if (value === Infinity) {
                return '\x00';
            }
            else if (value === -Infinity) {
                return '\x01';
            }
            else {
                return value;
            }
        });
    },
    text: (() => {
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            imageRendering: 'pixelated',
            webkitFontSmoothing: 'none'
        });
        return canvas;
    })(),
    time: 0,
    timer: (() => {
        const host = new XHost();
        host.on('init').then(() => {
            setInterval(() => {
                X.time += 5 * X.speed.value;
                X.timer.fire('tick', 5 * X.speed.value);
                for (const key in X.cache.fonts) {
                    X.time - X.cache.fonts[key].time > 30e3 && delete X.cache.fonts[key];
                }
            }, 5);
        });
        return host;
    })(),
    weighted(input, modifier = Math.random()) {
        const weights = X.provide(input);
        let total = 0;
        for (const entry of weights) {
            total += entry[1];
        }
        const value = modifier * total;
        for (const entry of weights) {
            if (value > (total -= entry[1])) {
                return entry[0];
            }
        }
    },
    when(condition) {
        return X.chain(void 0, async (v, n) => {
            await X.timer.on('tick');
            condition() || (await n());
        });
    },
    zero: new XVector()
};
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = false;
PIXI.settings.RESOLUTION = 1;
Object.assign(AudioParam.prototype, {
    modulate(duration, ...points) {
        return XNumber.prototype.modulate.call(this, duration, ...points);
    }
});
X.timer.fire('init');
//# sourceMappingURL=2C.js.map