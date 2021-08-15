"use strict";
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
//   ########   ########   ########   ########                                                          //
//   ##         ##    ##   ##    ##   ##                                                                //
//   ##         ##    ##   ##    ##   ##                                                                //
//   ##         ##    ##   ########   ######                                                            //
//   ##         ##    ##   ## ###     ##                                                                //
//   ##         ##    ##   ##  ###    ##                                                                //
//   ########   ########   ##   ###   ########                                                          //
//                                                                                                      //
//// needs more optimizating /////////////////////////////////////////////////////////////////////////////
Object.assign(AudioParam.prototype, {
    modulate(duration, ...points) {
        return XNumber.prototype.modulate.call(this, duration, ...points);
    }
});
class XHost {
    constructor() {
        this.events = {};
    }
    fire(name, ...data) {
        const list = this.events[name];
        if (list) {
            return list.map(handler => (typeof handler === 'function' ? handler : handler.listener)(...data));
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
            list
                .sort((handler1, handler2) => (typeof handler1 === 'function' ? 0 : handler1.priority) -
                (typeof handler2 === 'function' ? 0 : handler2.priority))
                .forEach((value, index) => {
                list[index] = value;
            });
            return this;
        }
    }
    wrapOn(name, provider) {
        return this.on(name, provider(this));
    }
    wrapOff(name, provider) {
        return this.off(name, provider(this));
    }
}
class XObject extends XHost {
    constructor({ alpha = 1, anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {}, blend, fill = 'black', line: { cap = void 0, dash = void 0, join = void 0, miter = void 0, width = void 0 } = {}, metadata = {}, objects = [], parallax: { x: parallax_x = 0, y: parallax_y = 0 } = {}, position: { x: position_x = 0, y: position_y = 0 } = {}, priority = 0, rotation = 0, scale: { x: scale_x = 1, y: scale_y = 1 } = {}, shadow: { blur = void 0, color = void 0, offset: { x: shadow$offset_x = 0, y: shadow$offset_y = 0 } = {} } = {}, skew: { x: skew_x = 0, y: skew_y = 0 } = {}, stroke = 'white', text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {} } = {}) {
        super();
        this.alpha = new XNumber(alpha);
        this.anchor = new XVector(anchor_x, anchor_y);
        this.blend = blend;
        this.fill = fill;
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
        this.skew = new XVector(skew_x, skew_y);
        this.stroke = stroke;
        this.text = { align, baseline, direction, font };
    }
    calculate(filter, list, camera, transform) {
        const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
        const rotation = transform[1].add(this.rotation);
        const scale = transform[2]; // .multiply(this.scale);
        if (this instanceof XHitbox && filter(this)) {
            list.push(this);
            const size = this.size;
            const half = size.divide(2);
            const base = position.subtract(half.add(half.multiply(this.anchor)));
            const dimensions = `${base.x}:${base.y}:${position.x}:${position.y}:${rotation.value}:${size.x}:${size.y}`;
            if (dimensions !== this.state.dimensions) {
                const offset = rotation.value + 180;
                const corner2 = base.endpoint(0, size.x);
                const corner3 = corner2.endpoint(90, size.y);
                const corner4 = corner3.endpoint(180, size.x);
                this.state.vertices[0] = position
                    .endpoint(position.direction(base) + offset, position.distance(base))
                    .round(1e3);
                this.state.vertices[1] = position
                    .endpoint(position.direction(corner2) + offset, position.distance(corner2))
                    .round(1e3);
                this.state.vertices[2] = position
                    .endpoint(position.direction(corner3) + offset, position.distance(corner3))
                    .round(1e3);
                this.state.vertices[3] = position
                    .endpoint(position.direction(corner4) + offset, position.distance(corner4))
                    .round(1e3);
                this.state.dimensions = dimensions;
            }
        }
        for (const object of this.objects)
            object.calculate(filter, list, camera, [position, rotation, scale]);
    }
    compute() {
        return new XVector();
    }
    draw() { }
    render(camera, context, transform, debug) {
        this.fire('tick');
        const state = {
            direction: context.direction,
            font: context.font,
            fillStyle: context.fillStyle,
            globalAlpha: context.globalAlpha,
            globalCompositeOperation: context.globalCompositeOperation,
            lineCap: context.lineCap,
            lineDashOffset: context.lineDashOffset,
            lineJoin: context.lineJoin,
            lineWidth: context.lineWidth,
            miterLimit: context.miterLimit,
            shadowBlur: context.shadowBlur,
            shadowColor: context.shadowColor,
            shadowOffsetX: context.shadowOffsetX,
            shadowOffsetY: context.shadowOffsetY,
            strokeStyle: context.strokeStyle,
            textAlign: context.textAlign,
            textBaseline: context.textBaseline
        };
        this.alpha && (context.globalAlpha *= this.alpha.clamp(0, 1).value);
        this.blend && (context.globalCompositeOperation = this.blend);
        this.fill && (context.fillStyle = this.fill);
        this.line.cap && (context.lineCap = this.line.cap);
        this.line.dash && (context.lineDashOffset = this.line.dash.value);
        this.line.join && (context.lineJoin = this.line.join);
        this.line.miter && (context.miterLimit = this.line.miter.value);
        this.line.width && (context.lineWidth = this.line.width.value);
        this.shadow.blur && (context.shadowBlur = this.shadow.blur.value);
        this.shadow.color && (context.shadowColor = this.shadow.color);
        this.shadow.offset.x && (context.shadowOffsetX = this.shadow.offset.x.value);
        this.shadow.offset.y && (context.shadowOffsetY = this.shadow.offset.y.value);
        this.stroke && (context.strokeStyle = this.stroke);
        this.text.align && (context.textAlign = this.text.align);
        this.text.baseline && (context.textBaseline = this.text.baseline);
        this.text.direction && (context.direction = this.text.direction);
        this.text.font && (context.font = this.text.font);
        const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
        const rotation = transform[1].add(this.rotation);
        const scale = transform[2].multiply(this.scale);
        const size = this.compute(context);
        const half = size.divide(2);
        const base = position.subtract(half.add(half.multiply(this.anchor)));
        const rads = Math.PI / 180 * this.rotation.value;
        context.translate(position.x, position.y);
        context.rotate(rads);
        context.scale(scale.x, scale.y);
        context.translate(-position.x, -position.y);
        this.draw(context, base);
        if (debug) {
            if (this instanceof XHitbox) {
                context.strokeStyle = `hsla(${(Date.now() % 1000) * 0.36}, 100%, 50%, 0.5)`;
                try {
                    const vertices = this.vertices();
                    for (const [b1, b2] of [
                        [vertices[0], vertices[1]],
                        [vertices[1], vertices[2]],
                        [vertices[2], vertices[3]],
                        [vertices[3], vertices[0]]
                    ]) {
                        context.beginPath();
                        context.moveTo(b1.x, b1.y);
                        context.lineTo(b2.x, b2.y);
                        context.stroke();
                        context.closePath();
                    }
                }
                catch (error) {
                    //
                }
            }
            else {
                context.strokeStyle = `rgba(255, 255, 255, 0.25)`;
                context.strokeRect(base.x, base.y, size.x, size.y);
            }
        }
        if (this.objects.length > 0) {
            for (const object of this.objects)
                object.render(camera, context, [position, rotation, scale], debug);
        }
        context.translate(position.x, position.y);
        context.rotate(-rads);
        context.scale(1 / scale.x, 1 / scale.y);
        context.translate(-position.x, -position.y);
        Object.assign(context, state);
    }
    serialize() {
        return {
            alpha: this.alpha.value,
            anchor: this.anchor,
            blend: this.blend,
            fill: this.fill,
            line: this.line && {
                cap: this.line.cap,
                dash: this.line.dash === void 0 ? void 0 : this.line.dash.value,
                join: this.line.join,
                miter: this.line.miter === void 0 ? void 0 : this.line.miter.value,
                width: this.line.width === void 0 ? void 0 : this.line.width.value
            },
            metadata: this.metadata,
            objects: this.objects.map(object => object.serialize()),
            parallax: this.parallax.serialize(),
            position: this.position.serialize(),
            priority: this.priority.value,
            rotation: this.rotation.value,
            scale: this.scale.serialize(),
            shadow: this.shadow && {
                blur: this.shadow.blur === void 0 ? void 0 : this.shadow.blur.value,
                color: this.shadow.color,
                offset: this.shadow.offset && {
                    x: this.shadow.offset.x === void 0 ? void 0 : this.shadow.offset.x.value,
                    y: this.shadow.offset.y === void 0 ? void 0 : this.shadow.offset.y.value
                }
            },
            skew: this.skew.serialize(),
            stroke: this.stroke,
            text: this.text && {
                align: this.text.align,
                baseline: this.text.baseline,
                direction: this.text.direction,
                font: this.text.font
            }
        };
    }
}
class XAtlas {
    constructor({ menu, navigators = {} } = {}) {
        this.state = { navigator: null };
        this.menu = menu;
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
            const row = typeof navigator.grid === 'function' ? navigator.grid(navigator, this) : navigator.grid;
            const flip = typeof navigator.flip === 'function' ? navigator.flip(navigator, this) : navigator.flip;
            navigator.position.x = new XNumber(navigator.position.x).clamp(0, row.length - 1).value;
            navigator.position.x += flip ? y : x;
            if (row.length - 1 < navigator.position.x) {
                navigator.position.x = 0;
            }
            else if (navigator.position.x < 0) {
                navigator.position.x = row.length - 1;
            }
            const column = row[navigator.position.x] || [];
            navigator.position.y = new XNumber(navigator.position.y).clamp(0, column.length - 1).value;
            navigator.position.y += flip ? x : y;
            if (column.length - 1 < navigator.position.y) {
                navigator.position.y = 0;
            }
            else if (navigator.position.y < 0) {
                navigator.position.y = column.length - 1;
            }
            origin === navigator.selection() || navigator.fire('move', this);
        }
    }
    navigate(action) {
        switch (action) {
            case 'menu':
                this.navigator() || this.switch(this.menu);
                break;
            case 'next':
            case 'prev':
                const navigator = this.navigator();
                if (navigator) {
                    const provider = navigator[action];
                    this.switch(typeof provider === 'function' ? provider(navigator, this) : provider);
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
class XHitbox extends XObject {
    constructor(properties = {}) {
        super(properties);
        this.state = { dimensions: void 0, vertices: [] };
        (({ size: { x: size_x = 0, y: size_y = 0 } = {} } = {}) => {
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    center() {
        const vertices = this.vertices();
        return new XVector(vertices[0]).subtract(vertices[2]).divide(2).add(vertices[2]);
    }
    compute() {
        return this.size;
    }
    // OBB collison algorithm - by harrix432 & bokke1010
    detect(renderer, ...hitboxes) {
        renderer.calculate(hitbox => hitbox === this);
        const hits = [];
        const [min1, max1] = this.region();
        for (const hitbox of hitboxes) {
            if (hitbox.state.dimensions === void 0) {
                continue;
            }
            else {
                // zero exclusion - if both hitboxes have a volume of zero, treat them as single lines
                if ((this.size.x === 0 || this.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
                    const [min2, max2] = hitbox.region();
                    if (X.math.intersection(min1, max1, min2, max2)) {
                        hits.push(hitbox);
                    }
                }
                else {
                    // aabb minmax exclusion - if the aabb formed by the min and max of both boxes collide, continue
                    const [min2, max2] = hitbox.region();
                    if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
                        // alignment check - if the two boxes are axis-aligned at this stage, they are colliding
                        const vertices1 = this.vertices().map(vertex => new XVector(vertex).round(1000));
                        const vertices2 = hitbox.vertices().map(vertex => new XVector(vertex).round(1000));
                        if ((vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                            (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)) {
                            hits.push(hitbox);
                        }
                        else {
                            for (const a1 of vertices1) {
                                // point raycast - if a line drawn from box1 intersects with box2 once, there is collision
                                let hit = 0;
                                const a2 = new XVector(a1).add(new XVector(max2).subtract(min2).multiply(2)).serialize();
                                for (const [b1, b2] of [
                                    [vertices2[0], vertices2[1]],
                                    [vertices2[1], vertices2[2]],
                                    [vertices2[2], vertices2[3]],
                                    [vertices2[3], vertices2[0]]
                                ]) {
                                    if (X.math.intersection(a1, a2, b1, b2)) {
                                        if (hit++ === 1) {
                                            break;
                                        }
                                    }
                                }
                                if (hit === 1) {
                                    hits.push(hitbox);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return hits;
    }
    height() {
        const bounds = this.region();
        return bounds[1].y - bounds[0].y;
    }
    radius() {
        const vertices = this.vertices();
        return new XVector(vertices[0]).distance(vertices[2]) / 2;
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
    serialize() {
        return Object.assign(super.serialize(), { size: this.size.serialize() });
    }
    vertices() {
        if (this.state.dimensions === void 0) {
            throw 'This object\'s vertices have not yet been calculated!';
        }
        else {
            return this.state.vertices;
        }
    }
    width() {
        const bounds = this.region();
        return bounds[1].x - bounds[0].x;
    }
}
class XInput extends XHost {
    constructor({ target = window, codes = [] } = {}) {
        super();
        this.state = { codes: new Set() };
        target.addEventListener('keyup', ({ key }) => {
            if (codes.includes(key) && this.state.codes.has(key)) {
                this.state.codes.delete(key);
                this.fire('up', key);
            }
        });
        target.addEventListener('keydown', ({ key }) => {
            if (codes.includes(key) && !this.state.codes.has(key)) {
                this.state.codes.add(key);
                this.fire('down', key);
            }
        });
        target.addEventListener('mouseup', ({ button }) => {
            if (codes.includes(button) && !this.state.codes.has(button)) {
                this.state.codes.add(button);
                this.fire('up', button);
            }
        });
        target.addEventListener('mousedown', ({ button }) => {
            if (codes.includes(button) && !this.state.codes.has(button)) {
                this.state.codes.add(button);
                this.fire('down', button);
            }
        });
    }
    active() {
        return this.state.codes.size > 0;
    }
}
class XNavigator extends XHost {
    constructor({ flip = false, grid = [], next = '', objects = [], position: { x = 0, y = 0 } = {}, prev = '' } = {}) {
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
        return ((typeof this.grid === 'function' ? this.grid(this) : this.grid)[this.position.x] || [])[this.position.y];
    }
}
class XNumber {
    constructor(value = 0) {
        this.value = value;
    }
    add(value = 0) {
        if (typeof value === 'number') {
            return new XNumber(this.value + value);
        }
        else {
            return this.add(value.value);
        }
    }
    ceil() {
        return new XNumber(Math.ceil(this.value));
    }
    clamp(min, max) {
        return new XNumber(Math.min(Math.max(this.value, min), max));
    }
    clone() {
        return new XNumber(this.value);
    }
    divide(value = 1) {
        if (typeof value === 'number') {
            return new XNumber(this.value / value);
        }
        else {
            return this.divide(value.value);
        }
    }
    floor() {
        return new XNumber(Math.floor(this.value));
    }
    modulate(duration, ...points) {
        return new Promise(resolve => {
            let index = 0;
            const value = this.value;
            clearInterval(X.cache.modulators.get(this));
            X.cache.modulators.set(this, setInterval(() => {
                if (index < duration) {
                    this.value = X.math.bezier(index / duration, value, ...points);
                    index += 20;
                }
                else {
                    this.value = X.math.bezier(1, value, ...points);
                    clearInterval(X.cache.modulators.get(this));
                    resolve();
                }
            }, 20));
        });
    }
    multiply(value = 1) {
        if (typeof value === 'number') {
            return new XNumber(this.value * value);
        }
        else {
            return this.multiply(value.value);
        }
    }
    round() {
        return Math.round(this.value);
    }
    subtract(value = 0) {
        if (typeof value === 'number') {
            return new XNumber(this.value - value);
        }
        else {
            return this.subtract(value.value);
        }
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
    draw(context, base) {
        context.beginPath();
        this.tracer(context, base.x, base.y);
        context.fill();
        context.stroke();
        context.closePath();
    }
    serialize() {
        return Object.assign(super.serialize(), { size: this.size.serialize(), tracer: this.tracer });
    }
}
class XPlayer extends XHost {
    constructor({ buffer, rate = 1, router = (context, source) => source.connect(context.destination), volume = 1 } = {}) {
        super();
        this.state = (() => {
            const context = new AudioContext();
            return {
                context,
                gain: context.createGain(),
                rate: context.createGain().gain,
                sources: []
            };
        })();
        this.buffer = buffer || this.state.context.createBuffer(1, 1, 8000);
        this.rate = this.state.rate;
        this.router = router;
        this.volume = this.state.gain.gain;
        this.state.rate.value = rate;
        this.state.gain.gain.value = volume;
        this.router(this.state.context, this.state.gain);
    }
    source() {
        return this.state.sources[this.state.sources.length - 1];
    }
    start(stop) {
        stop && this.stop();
        const source = Object.assign(this.state.context.createBufferSource(), { buffer: this.buffer });
        source.connect(this.state.gain);
        source.playbackRate.value = this.rate.value;
        this.rate = source.playbackRate;
        source.start();
        this.state.sources.push(source);
        this.fire('start');
        return source;
    }
    stop() {
        for (const source of this.state.sources.splice(0, this.state.sources.length)) {
            source.stop();
            source.disconnect(this.state.gain);
        }
        this.fire('stop');
    }
    time() {
        return this.state.context.currentTime;
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
    draw(context, base) {
        context.fillRect(base.x, base.y, this.size.x, this.size.y);
        context.strokeRect(base.x, base.y, this.size.x, this.size.y);
    }
    serialize() {
        return Object.assign(super.serialize(), { size: this.size.serialize() });
    }
}
class XRenderer extends XHost {
    constructor({ alpha = 1, auto = false, camera: { x: camera_x = -1, y: camera_y = -1 } = {}, container = document.body, debug = false, framerate = 30, layers = {}, region: [{ x: min_x = -Infinity, y: min_y = -Infinity } = {}, { x: max_x = Infinity, y: max_y = Infinity } = {}] = [], size: { x: size_x = 320, y: size_y = 240 } = {} } = {}) {
        super();
        this.state = { camera: { x: NaN, y: NaN }, handle: void 0, height: 0, scale: 1, width: 0 };
        Object.assign(container.style, {
            display: 'grid',
            gridTemplateAreas: "'top top top' 'left center right' 'bottom bottom bottom'",
            gridTemplateColumns: '1fr max-content 1fr',
            gridTemplateRows: '1fr max-content 1fr'
        });
        this.alpha = new XNumber(alpha);
        this.camera = new XVector(camera_x, camera_y);
        this.container = container;
        this.debug = debug;
        this.framerate = framerate;
        this.layers = Object.fromEntries(Object.entries(layers).map(([key, value]) => {
            const canvas = document.createElement('canvas');
            Object.assign(canvas.style, {
                gridArea: 'center',
                imageRendering: 'pixelated',
                webkitFontSmoothing: 'none'
            });
            this.container.appendChild(canvas);
            return [
                key,
                {
                    canvas,
                    context: X.context(canvas),
                    mode: value,
                    objects: []
                }
            ];
        }));
        this.region = [{ x: min_x, y: min_y }, { x: max_x, y: max_y }];
        this.size = new XVector(size_x, size_y);
        auto && this.start();
    }
    attach(key, ...objects) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.mode === 'ambient' && this.refresh();
            for (const object of objects)
                layer.objects.includes(object) || layer.objects.push(object);
            layer.objects = layer.objects.sort((object1, object2) => {
                return object1.priority.value - object2.priority.value;
            });
        }
    }
    calculate(filter) {
        const list = [];
        for (const key in this.layers) {
            for (const object of this.layers[key].objects) {
                object.calculate(filter, list, this.camera.clamp(...this.region), X.transform);
            }
        }
        return list;
    }
    clear(key) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.mode === 'ambient' && this.refresh();
            layer.objects.splice(0, layer.objects.length);
        }
    }
    detach(key, ...objects) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.mode === 'ambient' && this.refresh();
            for (const object of objects) {
                const index = layer.objects.indexOf(object);
                if (index > -1) {
                    layer.objects.splice(index, 1);
                }
            }
            layer.objects = layer.objects.sort((object1, object2) => {
                return object1.priority.value - object2.priority.value;
            });
        }
    }
    start() {
        this.stop();
        this.state.handle = setInterval(() => this.render(), 1e3 / this.framerate);
    }
    stop() {
        typeof this.state.handle === 'number' && (this.state.handle = clearInterval(this.state.handle));
    }
    refresh() {
        this.state.camera = { x: NaN, y: NaN };
    }
    render() {
        this.fire('tick');
        let update = false;
        const camera = this.camera.clamp(...this.region).serialize();
        this.container.style.opacity = this.alpha.clamp(0, 1).value.toString();
        if (camera.x !== this.state.camera.x || camera.y !== this.state.camera.y) {
            update = true;
            Object.assign(this.state.camera, camera);
        }
        {
            let width = this.container.clientWidth;
            let height = this.container.clientHeight;
            if (width !== this.state.width || height !== this.state.height) {
                update = true;
                this.state.width = width;
                this.state.height = height;
                const ratio = this.size.x / this.size.y;
                if (this.state.width / this.state.height > ratio) {
                    width = height * ratio;
                    this.state.scale = height / this.size.y;
                }
                else {
                    height = width / ratio;
                    this.state.scale = width / this.size.x;
                }
                for (const key in this.layers) {
                    const layer = this.layers[key];
                    layer.context = X.context(layer.canvas, width, height);
                }
            }
        }
        for (const key in this.layers) {
            const { context, mode, objects } = this.layers[key];
            if (update || mode !== 'ambient') {
                const scale = this.state.scale;
                const center = this.size.divide(2);
                context.resetTransform();
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                context.setTransform(scale, 0, 0, scale, scale * (center.x + -(mode === 'static' ? center.x : camera.x)), scale * (center.y + -(mode === 'static' ? center.y : camera.y)));
                for (const object of objects)
                    object.render(camera, context, X.transform, this.debug);
            }
        }
    }
}
class XRoom {
    constructor({ layers = {}, region: [{ x: min_x = -Infinity, y: min_y = -Infinity } = {}, { x: max_x = Infinity, y: max_y = Infinity } = {}] = [] } = {}) {
        this.layers = Object.fromEntries(Object.entries(layers).map(([key, objects = []]) => {
            return [
                key,
                objects.map(properties => (properties instanceof XObject ? properties : new XObject(properties)))
            ];
        }));
        this.region = [{ x: min_x, y: min_y }, { x: max_x, y: max_y }];
    }
}
class XSprite extends XObject {
    constructor(properties = {}) {
        super(properties);
        this.state = { index: 0, active: false, step: 0 };
        (({ step = 0, steps = 1, textures = [] } = {}) => {
            this.step = step;
            this.steps = steps;
            this.textures = textures;
        })(properties);
    }
    compute() {
        const texture = this.textures[this.state.index];
        if (texture) {
            return new XVector(texture.width, texture.height);
        }
        else {
            return new XVector(0, 0);
        }
    }
    disable() {
        this.state.active = false;
        return this;
    }
    draw(context, base) {
        const texture = this.textures[this.state.index];
        texture && context.drawImage(texture, base.x, base.y);
        if (this.steps <= ++this.state.step) {
            this.state.step = 0;
            if (this.state.active && this.textures.length <= ++this.state.index) {
                this.state.index = 0;
            }
        }
    }
    enable() {
        this.state.active = true;
        return this;
    }
    reset() {
        Object.assign(this.state, { active: false, index: 0, step: this.step });
        return this;
    }
    serialize() {
        return Object.assign(super.serialize(), {
            step: this.step,
            steps: this.steps,
            textures: this.textures.map(texture => {
                return texture instanceof HTMLImageElement ? texture.cloneNode() : texture;
            })
        });
    }
}
class XText extends XObject {
    constructor(properties = {}) {
        super(properties);
        (({ content = '', spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {} } = {}) => {
            this.content = content;
            this.spacing = new XVector(spacing_x, spacing_y);
        })(properties);
    }
    compute(context) {
        const lines = this.content.split('\n').map(section => {
            let total = 0;
            for (const char of section)
                total += context.measureText(char).width + this.spacing.x;
            return total;
        });
        const ascent = context.measureText(this.content).actualBoundingBoxAscent;
        return new XVector(Math.max(...lines), ascent + (ascent + this.spacing.y) * (lines.length - 1));
    }
    draw(context, base) {
        let index = 0;
        const lines = this.content.split('\n');
        const state = {
            fillStyle: context.fillStyle,
            globalAlpha: context.globalAlpha,
            globalCompositeOperation: context.globalCompositeOperation,
            lineCap: context.lineCap,
            lineDashOffset: context.lineDashOffset,
            lineJoin: context.lineJoin,
            lineWidth: context.lineWidth,
            miterLimit: context.miterLimit,
            shadowBlur: context.shadowBlur,
            shadowColor: context.shadowColor,
            shadowOffsetX: context.shadowOffsetX,
            shadowOffsetY: context.shadowOffsetY,
            strokeStyle: context.strokeStyle
        };
        const offset = { x: 0, y: 0 };
        const random = { x: 0, y: 0 };
        const ascent = context.measureText(this.content).actualBoundingBoxAscent;
        const height = ascent + (ascent + this.spacing.y) * (lines.length - 1);
        while (index < this.content.length) {
            const char = this.content[index++];
            if (char === '\n') {
                offset.x = 0;
                offset.y += ascent + this.spacing.y;
            }
            else if (char === '\xa7') {
                const code = this.content.slice(index, this.content.indexOf('\xa7', index));
                const [key, value] = code.split(':');
                index += code.length + 1;
                switch (key) {
                    case 'alpha':
                        context.globalAlpha = state.globalAlpha * new XNumber(+value).clamp(0, 1).value;
                        break;
                    case 'blend':
                        context.globalCompositeOperation = value;
                        break;
                    case 'fill':
                        context.fillStyle = value;
                        break;
                    case 'line.cap':
                        context.lineCap = value;
                        break;
                    case 'line.dash':
                        const lineDash = +value;
                        isNaN(lineDash) || (context.lineDashOffset = lineDash);
                        break;
                    case 'line.join':
                        context.lineJoin = value;
                        break;
                    case 'line.miter':
                        const lineMiter = +value;
                        isNaN(lineMiter) || (context.miterLimit = lineMiter);
                        break;
                    case 'line.width':
                        const lineWidth = +value;
                        isNaN(lineWidth) || (context.lineWidth = lineWidth);
                        break;
                    case 'shadow.blur':
                        const shadowBlur = +value;
                        isNaN(shadowBlur) || (context.shadowBlur = shadowBlur);
                        break;
                    case 'shadow.color':
                        context.shadowColor = value;
                        break;
                    case 'shadow.offset.x':
                        const shadowOffsetX = +value;
                        isNaN(shadowOffsetX) || (context.shadowOffsetX = shadowOffsetX);
                        break;
                    case 'shadow.offset.y':
                        const shadowOffsetY = +value;
                        isNaN(shadowOffsetY) || (context.shadowOffsetY = shadowOffsetY);
                        break;
                    case 'offset':
                        const [offsetX, offsetY] = value.split(',').map(value => +value);
                        offset.x += offsetX || 0;
                        offset.y += offsetY || 0;
                        break;
                    case 'random':
                        const [randomX, randomY] = value.split(',').map(value => +value);
                        random.x = randomX || 0;
                        random.y = randomY || 0;
                        break;
                    case 'stroke':
                        context.strokeStyle = value;
                        break;
                }
            }
            else {
                const x = base.x + offset.x + random.x * (Math.random() - 0.5);
                const y = base.y + offset.y + random.y * (Math.random() - 0.5) + height;
                context.fillText(char, x, y);
                context.strokeText(char, x, y);
                const width = context.measureText(char).width;
                offset.x += width + this.spacing.x;
            }
        }
        Object.assign(context, state);
    }
    serialize() {
        return Object.assign(super.serialize(), { content: this.content });
    }
}
class XVector {
    constructor(a1 = 0, y = a1) {
        this.state = { modulator: void 0 };
        if (typeof a1 === 'number') {
            this.x = a1;
            this.y = y;
        }
        else {
            (this.x = a1.x || 0), (this.y = a1.y || 0);
        }
    }
    add(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x + a1, this.y + y);
        }
        else {
            return this.add(a1.x, a1.y);
        }
    }
    clamp(min, max) {
        return new XVector(new XNumber(this.x).clamp(min.x, max.x).value, new XNumber(this.y).clamp(min.y, max.y).value);
    }
    clone() {
        return new XVector(this);
    }
    direction(vector) {
        return 180 / Math.PI * Math.atan2(this.y - vector.y, this.x - vector.x);
    }
    distance(vector) {
        return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2));
    }
    divide(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x / a1, this.y / y);
        }
        else {
            return this.divide(a1.x, a1.y);
        }
    }
    endpoint(direction, distance) {
        const radians = ((direction + 90) % 360) * Math.PI / 180;
        return new XVector(this.x + distance * Math.sin(Math.PI - radians), this.y + distance * Math.cos(Math.PI - radians));
    }
    modulate(duration, ...points) {
        return new Promise(resolve => {
            let index = 0;
            const x = this.x;
            const y = this.y;
            clearInterval(X.cache.modulators.get(this));
            X.cache.modulators.set(this, setInterval(() => {
                if (index < duration) {
                    this.x = X.math.bezier(index / duration, x, ...points.map(point => point.x));
                    this.y = X.math.bezier(index / duration, y, ...points.map(point => point.y));
                    index += 20;
                }
                else {
                    this.x = X.math.bezier(1, x, ...points.map(point => point.x));
                    this.y = X.math.bezier(1, y, ...points.map(point => point.y));
                    clearInterval(X.cache.modulators.get(this));
                    resolve();
                }
            }, 20));
        });
    }
    multiply(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x * a1, this.y * y);
        }
        else {
            return this.multiply(a1.x, a1.y);
        }
    }
    round(base) {
        return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
    }
    serialize() {
        return { x: this.x, y: this.y };
    }
    subtract(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x - a1, this.y - y);
        }
        else {
            return this.subtract(a1.x, a1.y);
        }
    }
}
class XWalker extends XHitbox {
    constructor(properties = {}) {
        super(properties);
        this.objects = [];
        (({ sprites: { down = void 0, left = void 0, right = void 0, up = void 0 } = {}, step = 1 } = {}) => {
            this.sprites = {
                down: down instanceof XSprite ? down : new XSprite(down),
                left: left instanceof XSprite ? left : new XSprite(left),
                right: right instanceof XSprite ? right : new XSprite(right),
                up: up instanceof XSprite ? up : new XSprite(up)
            };
            this.step = step;
        })(properties);
    }
    face(cardinal) {
        const sprite = this.sprites[cardinal];
        if (sprite) {
            this.objects[0] = sprite;
        }
        else {
            this.objects.shift();
        }
    }
    serialize() {
        return Object.assign(super.serialize(), {
            sprites: {
                down: this.sprites.down.serialize(),
                left: this.sprites.left.serialize(),
                right: this.sprites.right.serialize(),
                up: this.sprites.up.serialize()
            }
        });
    }
    walk(offset, renderer, filter = false) {
        const source = this.position.serialize();
        const hitboxes = filter ? renderer.calculate(typeof filter === 'function' ? filter : () => true) : [];
        for (const axis of ['x', 'y']) {
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
            }
            else if (offset.y < 0) {
                this.face('up');
            }
            else if (offset.x < 0) {
                this.face('left');
            }
            else if (offset.x > 0) {
                this.face('right');
            }
            this.objects.length === 0 || this.objects[0].disable().reset();
            return false;
        }
        else {
            if (this.position.y > source.y) {
                this.face('down');
            }
            else if (this.position.y < source.y) {
                this.face('up');
            }
            else if (this.position.x < source.x) {
                this.face('left');
            }
            else if (this.position.x > source.x) {
                this.face('right');
            }
            this.objects.length === 0 || this.objects[0].enable();
            return true;
        }
    }
}
const X = {
    async bitmap(source, transformer, { bottom = 0, left = 0, right = 0, top = 0 } = {}) {
        const image = await X.image(source);
        if (image.width === 0 || image.height === 0) {
            return await createImageBitmap(new ImageData(1, 1));
        }
        else {
            const context = X.context(document.createElement('canvas'), image.width, image.height);
            context.drawImage(image, 0, 0);
            const max = image.width * 4;
            const size = new XVector(image.width, image.height);
            const sx = Math.round((left < 0 ? image.width : 0) + left);
            const sy = Math.round((top < 0 ? image.height : 0) + top);
            const sw = Math.round((right < 0 ? 0 : image.width) - right) - sx;
            const sh = Math.round((bottom < 0 ? 0 : image.height) - bottom) - sy;
            const data = context.getImageData(sx, sy, sw, sh).data.slice();
            const index = new XVector(-1, -1);
            while (++index.x < image.width) {
                const offset = index.x * 4;
                while (++index.y < image.height) {
                    let step = index.y * max + offset;
                    const color = transformer([data[step++], data[step++], data[step++], data[step++]], index, size);
                    data[--step] = color[3];
                    data[--step] = color[2];
                    data[--step] = color[1];
                    data[--step] = color[0];
                }
                index.y = -1;
            }
            index.x = -1;
            return await createImageBitmap(new ImageData(data, sw));
        }
    },
    buffer(source) {
        if (source in X.cache.buffers) {
            return X.cache.buffers[source];
        }
        else {
            return (X.cache.buffers[source] = new Promise(resolve => {
                const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
                request.addEventListener('load', () => new AudioContext().decodeAudioData(request.response, resolve));
                request.open('GET', source, true);
                request.send();
            }));
        }
    },
    cache: {
        buffers: {},
        dimensions: {},
        images: {},
        modulators: new Map()
    },
    context(canvas, width = 1, height = 1) {
        return Object.assign(Object.assign(canvas, { width, height }).getContext('2d'), { imageSmoothingEnabled: false });
    },
    image(source) {
        if (source in X.cache.images) {
            return X.cache.images[source];
        }
        else {
            return (X.cache.images[source] = new Promise(resolve => {
                const request = Object.assign(new XMLHttpRequest(), { responseType: 'arraybuffer' });
                request.addEventListener('load', () => {
                    const image = document.createElement('img');
                    image.addEventListener('load', () => resolve(image));
                    image.src = URL.createObjectURL(new Blob([new Uint8Array(request.response)], { type: 'image/jpeg' }));
                });
                request.open('GET', source, true);
                request.send();
            }));
        }
    },
    math: {
        bezier(value, ...points) {
            return points.length > 1
                ? X.math.bezier(value, ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value))
                : points[0] || 0;
        },
        intersection(a1, a2, b1, b2) {
            return (X.math.rotation(a1, b1, b2) !== X.math.rotation(a2, b1, b2) &&
                X.math.rotation(a1, a2, b1) !== X.math.rotation(a1, a2, b2));
        },
        rotation(a1, a2, a3) {
            return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
        }
    },
    parse(text) {
        return JSON.parse(text, (key, value) => {
            if (typeof value === 'string') {
                switch (value[0]) {
                    case '!':
                        return value.slice(1);
                    case '@':
                        try {
                            return eval(`(${value.slice(1)})`);
                        }
                        catch (error) {
                            try {
                                return eval(`({${value.slice(1)}})`)[key];
                            }
                            catch (error) {
                                return void 0;
                            }
                        }
                }
            }
            else {
                return value;
            }
        });
    },
    pause(duration = 0) {
        return new Promise(resolve => setTimeout(() => resolve(), duration));
    },
    stringify(value) {
        return JSON.stringify(value, (key, value) => {
            if (typeof value === 'string') {
                return `!${value}`;
            }
            else if (typeof value === 'function') {
                return `@${value}`;
            }
            else {
                return value;
            }
        });
    },
    transform: [new XVector(), new XNumber(), new XVector(1)]
};
//# sourceMappingURL=storyteller.js.map