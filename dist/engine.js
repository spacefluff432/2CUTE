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
/** An event host. The type parameter `A` defines which events this host should fire and listen for. */
class XHost {
    constructor() {
        /** This host's internal listener storage map. */
        this.events = {};
    }
    /** Fires an event. */
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
    /** Removes an event listener from this host. */
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
    /** Accepts a provider function whose return value is then registered as a listener for a given event. */
    wrapOn(name, provider) {
        return this.on(name, provider(this));
    }
    /** Accepts a provider function whose return value is then unregistered as a listener for a given event. */
    wrapOff(name, provider) {
        return this.off(name, provider(this));
    }
}
/** A rendered object. */
class XObject extends XHost {
    constructor({ alpha = 1, anchor: { x: anchor_x = -1, y: anchor_y = -1 } = {}, blend, fill = void 0, line: { cap = void 0, dash = void 0, join = void 0, miter = void 0, width = void 0 } = {}, metadata = {}, objects = [], parallax: { x: parallax_x = 0, y: parallax_y = 0 } = {}, position: { x: position_x = 0, y: position_y = 0 } = {}, priority = 0, rotation = 0, scale: { x: scale_x = 1, y: scale_y = 1 } = {}, shadow: { blur = void 0, color = void 0, offset: { x: shadow$offset_x = 0, y: shadow$offset_y = 0 } = {} } = {}, stroke = void 0, text: { align = void 0, baseline = void 0, direction = void 0, font = void 0 } = {} } = {}) {
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
        this.stroke = stroke;
        this.text = { align, baseline, direction, font };
    }
    /**
     * If this object is a hitbox and matches the given filter, its vertices are calculated and it is added to the input
     * list. The `calculate` method is then called on this object's children, and the process repeats until the entire
     * object tree has been iterated over and filtered into the list. The list is then returned.
     */
    calculate(filter, list, camera, transform) {
        const position = transform[0].add(this.position).add(this.parallax.multiply(camera));
        const rotation = transform[1].add(this.rotation);
        const scale = transform[2].multiply(this.scale);
        if (this instanceof XHitbox && X.provide(filter, this)) {
            list.push(this);
            const size = this.size.multiply(scale);
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
        for (const object of this.objects) {
            object.calculate(filter, list, camera, [position, rotation, scale]);
        }
    }
    compute() {
        return new XVector();
    }
    draw() { }
    /** Renders this object to a context with the given camera position and transform values. */
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
        const rads = (Math.PI / 180) * this.rotation.value;
        context.translate(position.x, position.y);
        context.rotate(rads);
        context.scale(this.scale.x, this.scale.y);
        context.translate(-position.x, -position.y);
        context.globalAlpha === 0 || this.draw(context, base);
        if (this.objects.length > 0) {
            for (const object of this.objects) {
                object.render(camera, context, [position, rotation, scale], debug);
            }
        }
        if (debug) {
            const previous = context.strokeStyle;
            context.strokeStyle = '#fff8';
            context.strokeRect(base.x, base.y, size.x, size.y);
            context.strokeStyle = previous;
        }
        context.translate(position.x, position.y);
        context.scale(1 / this.scale.x, 1 / this.scale.y);
        context.rotate(-rads);
        context.translate(-position.x, -position.y);
        if (debug && this instanceof XHitbox) {
            // rainbow hitboxes! :D
            context.strokeStyle = `hsla(${(Date.now() % 1000) * 0.25}, 100%, 50%, 0.5)`;
            context.save();
            context.resetTransform();
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
            context.restore();
        }
        Object.assign(context, state);
    }
}
/** An asset, either loaded or not. */
class XAsset extends XHost {
    constructor({ loader, source, unloader }) {
        super();
        this.state = { value: void 0 };
        this.loader = loader;
        this.source = source;
        this.unloader = unloader;
    }
    /** A getter for the asset's internal value. Throws an error if the asset is not current loaded. */
    get value() {
        const value = this.state.value;
        if (value === void 0) {
            throw `The asset of "${this.source}" is not currently loaded!`;
        }
        else {
            return value;
        }
    }
    /** Loads the asset. */
    async load(force) {
        if (force || this.state.value === void 0) {
            this.state.value = await this.loader();
            this.fire('load');
        }
    }
    /** Unloads the asset. */
    async unload(force) {
        if (force || this.state.value !== void 0) {
            this.state.value = await this.unloader();
            this.fire('unload');
        }
    }
}
/**
 * The XAtlas class defines a system in which several XNavigator objects are associated with each other. When two
 * navigators share an atlas, those navigators can be traversed between.
 */
class XAtlas {
    constructor({ navigators = {} } = {}) {
        /** This navigator's state. Contains the currently open navigator. */
        this.state = { navigator: null };
        this.navigators = navigators;
    }
    /** Attaches navigators to a specific layer on a renderer. */
    attach(renderer, layer, ...navigators) {
        for (const navigator of navigators) {
            navigator in this.navigators && this.navigators[navigator].attach(renderer, layer);
        }
    }
    /** Detaches navigators from a specific layer on a renderer. */
    detach(renderer, layer, ...navigators) {
        for (const navigator of navigators) {
            navigator in this.navigators && this.navigators[navigator].detach(renderer, layer);
        }
    }
    /** Returns the current navigator. */
    navigator() {
        return this.state.navigator ? this.navigators[this.state.navigator] : void 0;
    }
    /** Alters the position of this atlas's current navigator, if any. */
    seek({ x = 0, y = 0 } = {}) {
        const navigator = this.navigator();
        if (navigator) {
            const origin = navigator.selection();
            const row = X.provide(navigator.grid, navigator, this);
            const flip = X.provide(navigator.flip, navigator, this);
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
            origin === navigator.selection() || navigator.fire('move', this, navigator);
        }
    }
    /**
     * This function accepts one of two values, those being `'next'` and `'prev'`. If this atlas has a navigator open,
     * the respective `next` or `prev` property on said open navigator is resolved and the navigator associated with the
     * resolved value is switched to, given it's associated with this atlas.
     */
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
    /**
     * Directly switch to a navigator associated with this atlas. If `null` is specified, the current navigator, if any,
     * will be closed. If `void` is specified, then nothing will happen.
     */
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
/** A hitbox object. Hitboxes have a defined size and a set of calculated vertices used for hit detection. */
class XHitbox extends XObject {
    constructor(properties = {}) {
        super(properties);
        /** This hitbox's state. Contains the current dimensions and computed vertices, if any. */
        this.state = { dimensions: void 0, vertices: [] };
        (({ size: { x: size_x = 0, y: size_y = 0 } = {} } = {}) => {
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    /** Calculates the center of this hitbox's vertices. */
    center() {
        const vertices = this.vertices();
        return new XVector(vertices[0]).subtract(vertices[2]).divide(2).add(vertices[2]);
    }
    compute() {
        return this.size;
    }
    /**
     * Detects collision between this hitbox and others.
     * @author bokke1010, harrix432
     */
    detect(renderer, ...hitboxes) {
        renderer.calculate(hitbox => hitbox === this);
        const hits = [];
        const [min1, max1] = this.region();
        for (const hitbox of hitboxes) {
            if (hitbox.state.dimensions === void 0) {
                continue;
            }
            else if ((this.size.x === 0 || this.size.y === 0) && (hitbox.size.x === 0 || hitbox.size.y === 0)) {
                // zero exclusion - if both hitboxes have a volume of zero, treat them as single lines
                const [min2, max2] = hitbox.region();
                if (X.math.intersection(min1, max1, min2, max2)) {
                    hits.push(hitbox);
                }
            }
            else {
                const [min2, max2] = hitbox.region();
                if (min1.x < max2.x && min2.x < max1.x && min1.y < max2.y && min2.y < max1.y) {
                    // aabb minmax exclusion - if the aabb formed by the min and max of both boxes collide, continue
                    const vertices1 = this.vertices().map(vertex => new XVector(vertex).round(1000));
                    const vertices2 = hitbox.vertices().map(vertex => new XVector(vertex).round(1000));
                    if ((vertices1[0].x === vertices1[1].x || vertices1[0].y === vertices1[1].y) &&
                        (vertices2[0].x === vertices2[1].x || vertices2[0].y === vertices2[1].y)) {
                        // alignment check - if the two boxes are axis-aligned at this stage, they are colliding
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
                                // point raycast - if a line drawn from box1 intersects with box2 only once, there is collision
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
    /** Returns the total height of this hitbox's region. */
    height() {
        const bounds = this.region();
        return bounds[1].y - bounds[0].y;
    }
    /** Calculates the distance from this hitbox's center to any given corner. */
    radius() {
        const vertices = this.vertices();
        return new XVector(vertices[0]).distance(vertices[2]) / 2;
    }
    /**
     * Calculates the minimum and maximum X and Y coordinates that this hitbox intersects with, effectively creating an
     * axis-aligned superstructure around the entirety of this hitbox.
     */
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
    /** Returns the vertices of this hitbox. */
    vertices() {
        if (this.state.dimensions === void 0) {
            throw "This object's vertices are unresolved!";
        }
        else {
            return this.state.vertices;
        }
    }
    /** Returns the total width of this hitbox's region. */
    width() {
        const bounds = this.region();
        return bounds[1].x - bounds[0].x;
    }
}
/**
 * Handles mouse and keyboard inputs. Mouse inputs are represented as numeric values, while keyboard inputs are
 * represented by their key name in string form.
 */
class XInput extends XHost {
    constructor({ target = window, codes = [] } = {}) {
        super();
        /** This input's state. Contains the currently active inputs. */
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
    /** Whether or not any of this input's valid codes are in an active state. */
    active() {
        return this.state.codes.size > 0;
    }
}
/**
 * The XNavigator class defines a system in which a grid can specify available options to navigate through. This class
 * doesn't do much without an associated atlas to control it.
 */
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
    /** Attaches this navigator's objects to a specific layer on the given renderer. */
    attach(renderer, layer) {
        renderer.attach(layer, ...this.objects);
    }
    /** Detaches this navigator's objects from a specific layer on the given renderer. */
    detach(renderer, layer) {
        renderer.detach(layer, ...this.objects);
    }
    /** Returns the value in this navigator's grid at its current position. */
    selection() {
        return (X.provide(this.grid, this)[this.position.x] || [])[this.position.y];
    }
}
/** An object representing a numeric value. */
class XNumber {
    constructor(value = 0) {
        this.value = value;
    }
    /** Adds another value to this object's value and returns a new `XNumber` object with said value. */
    add(value = 0) {
        if (typeof value === 'number') {
            return new XNumber(this.value + value);
        }
        else {
            return this.add(value.value);
        }
    }
    /** Returns an `XNumber` object with the ceilinged value of this object's value. */
    ceil() {
        return new XNumber(Math.ceil(this.value));
    }
    /** Clamps this object's value between two numbers and returns a new `XNumber` object with the result as its value. */
    clamp(min, max) {
        return new XNumber(Math.min(Math.max(this.value, min), max));
    }
    /** Returns a new `XNumber` object with the same value as this object. */
    clone() {
        return new XNumber(this.value);
    }
    /** Divides this object's value by another value and returns a new `XNumber` object with said value. */
    divide(value = 1) {
        if (typeof value === 'number') {
            return new XNumber(this.value / value);
        }
        else {
            return this.divide(value.value);
        }
    }
    /** Returns an `XNumber` object with the floored value of this object's value. */
    floor() {
        return new XNumber(Math.floor(this.value));
    }
    /** Alter the internal value of this numeric over a specified duration. */
    modulate(duration, ...points) {
        return new Promise(resolve => {
            let index = 0;
            const value = this.value;
            clearInterval(X.cache.modulationTasks.get(this));
            X.cache.modulationTasks.set(this, setInterval(() => {
                if (index < duration) {
                    this.value = X.math.bezier(index / duration, value, ...points);
                    index += 20;
                }
                else {
                    this.value = X.math.bezier(1, value, ...points);
                    clearInterval(X.cache.modulationTasks.get(this));
                    resolve();
                }
            }, 20));
        });
    }
    /** Multiplies this object's value by another value and returns a new `XNumber` object with said value. */
    multiply(value = 1) {
        if (typeof value === 'number') {
            return new XNumber(this.value * value);
        }
        else {
            return this.multiply(value.value);
        }
    }
    /** Returns an `XNumber` object with the rounded value of this object's value. */
    round() {
        return Math.round(this.value);
    }
    /** Subtracts another value from this object's value and returns a new `XNumber` object with said value. */
    subtract(value = 0) {
        if (typeof value === 'number') {
            return new XNumber(this.value - value);
        }
        else {
            return this.subtract(value.value);
        }
    }
}
/** A rendered object specifically designed to trace a path on a canvas. */
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
}
/** A rendered object specifically designed to draw a rectangle on a canvas. */
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
}
/**
 * The business end of the Storyteller engine, where objects are rendered to canvases and all is made right with the
 * world. Jokes aside, this class is responsible for canvas and context management.
 */
class XRenderer extends XHost {
    constructor({ alpha = 1, auto = false, camera: { x: camera_x = -1, y: camera_y = -1 } = {}, container = document.body, debug = false, framerate = 30, layers = {}, region: [{ x: min_x = -Infinity, y: min_y = -Infinity } = {}, { x: max_x = Infinity, y: max_y = Infinity } = {}] = [], shake = 0, size: { x: size_x = 320, y: size_y = 240 } = {} } = {}) {
        super();
        /**
         * This renderer's state. Contains the last computed camera position, rendering interval timer handle, last known
         * container height, last computed scale, and last known container width.
         */
        this.state = {
            camera: { x: NaN, y: NaN },
            handle: void 0,
            height: 0,
            scale: 1,
            width: 0
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
                    modifiers: value,
                    objects: []
                }
            ];
        }));
        this.region = [
            { x: min_x, y: min_y },
            { x: max_x, y: max_y }
        ];
        this.shake = new XNumber(shake);
        this.size = new XVector(size_x, size_y);
        auto && this.start();
    }
    /** Attaches objects to a specific layer on this renderer. */
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
    /**
     * Calls the `calculate` method on all objects in this renderer with the given filter, and returns a list of all
     * computed hitboxes.
     */
    calculate(filter = true) {
        const list = [];
        for (const key in this.layers) {
            for (const object of this.layers[key].objects) {
                object.calculate(filter, list, this.camera.clamp(...this.region), X.transform);
            }
        }
        return list;
    }
    /** Completely clears the given layer, detaching all of its objects. */
    clear(key) {
        if (key in this.layers) {
            const layer = this.layers[key];
            layer.modifiers.includes('ambient') && this.refresh();
            layer.objects.splice(0, layer.objects.length);
        }
    }
    /** Detaches objects from a specific layer on this renderer. */
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
        }
    }
    /** Reads pixel data from the canvas within a specified range. */
    read(key, min, max = new XVector(min).add(1 / this.state.scale)) {
        const resmin = this.resolve(key, min);
        const resmax = this.resolve(key, max);
        const w = Math.floor(resmax.x - resmin.x);
        const data = this.layers[key].context.getImageData(Math.floor(resmin.x), Math.floor(resmin.y), w, Math.floor(resmax.y - resmin.y)).data;
        const pixels = data.length / 4;
        const output = [[]];
        let index = 0;
        while (index < pixels) {
            if (output[output.length - 1].push([...data.slice(index, index + 4)]) === w && ++index < pixels) {
                output.push([]);
            }
        }
        return output;
    }
    /** Resolves the given position to its corresponding pixel position. */
    resolve(key, position) {
        const transform = this.layers[key].context.getTransform();
        return {
            x: position.x * this.state.scale + transform.e,
            y: position.y * this.state.scale + transform.f
        };
    }
    /** Restricts the given position to within the camera's scope. */
    restrict(position) {
        return this.size
            .divide(2)
            .subtract(this.camera.clamp(...this.region))
            .add(position);
    }
    /** Starts the rendering loop and stops any previously active loop if applicable. */
    start() {
        this.stop();
        this.state.handle = setInterval(() => this.render(), 1e3 / this.framerate);
    }
    /** Stops the rendering loop if one is active. */
    stop() {
        typeof this.state.handle === 'number' && (this.state.handle = clearInterval(this.state.handle));
    }
    /** Forces an update to all ambient rendering layers. */
    refresh() {
        this.state.camera = { x: NaN, y: NaN };
    }
    /** Renders a single frame. */
    render() {
        this.fire('tick');
        let update = false;
        const camera = this.camera.clamp(...this.region).value();
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
            const { context, modifiers, objects } = this.layers[key];
            if (update || !modifiers.includes('ambient')) {
                const scale = this.state.scale;
                const center = this.size.divide(2);
                context.resetTransform();
                modifiers.includes('cumulative') || context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                context.setTransform(scale, 0, 0, scale, scale * (center.x + -(modifiers.includes('static') ? center.x : camera.x)) +
                    (this.shake.value ? scale * this.shake.value * (Math.random() - 0.5) : 0), scale * (center.y + -(modifiers.includes('static') ? center.y : camera.y)) +
                    (this.shake.value ? scale * this.shake.value * (Math.random() - 0.5) : 0));
                for (const object of objects) {
                    object.render(camera, context, X.transform, this.debug);
                }
            }
        }
    }
}
/** A rendered object specifically designed to draw an image or images on a canvas. */
class XSprite extends XObject {
    constructor(properties = {}) {
        super(properties);
        /**
         * This sprite's state. Contains the index of the currently displayed frame, whether or not the sprite is active, and
         * the current step value.
         */
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
        if (texture) {
            const x = Math.round((this.crop.left < 0 ? texture.value.width : 0) + this.crop.left);
            const y = Math.round((this.crop.top < 0 ? texture.value.height : 0) + this.crop.top);
            const w = Math.round((this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right) - x;
            const h = Math.round((this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom) - y;
            return new XVector(w, h);
        }
        else {
            return new XVector(0, 0);
        }
    }
    /** Disables the sprite's animation. */
    disable() {
        this.state.active = false;
        return this;
    }
    draw(context, base) {
        const texture = this.frames[this.state.index];
        if (texture) {
            const x = Math.round((this.crop.left < 0 ? texture.value.width : 0) + this.crop.left);
            const y = Math.round((this.crop.top < 0 ? texture.value.height : 0) + this.crop.top);
            const w = Math.round((this.crop.right < 0 ? 0 : texture.value.width) - this.crop.right) - x;
            const h = Math.round((this.crop.bottom < 0 ? 0 : texture.value.height) - this.crop.bottom) - y;
            context.drawImage(texture.value, x, y, w, h, base.x, base.y, w, h);
        }
        if (this.steps <= ++this.state.step) {
            this.state.step = 0;
            if (this.state.active && this.frames.length <= ++this.state.index) {
                this.state.index = 0;
            }
        }
    }
    /** Enables the sprite's animation. */
    enable() {
        this.state.active = true;
        return this;
    }
    /** Loads this sprite's frames. */
    async load() {
        await Promise.all(this.frames.map(asset => asset.load()));
    }
    /** Resets the sprite's animation to its default state. */
    reset() {
        Object.assign(this.state, { active: false, index: 0, step: this.step });
        return this;
    }
    /** Unloads this sprite's frames. */
    async unload() {
        await Promise.all(this.frames.map(asset => asset.unload()));
    }
}
/** A rendered object specifically designed to draw text on a canvas. */
class XText extends XObject {
    constructor(properties = {}) {
        super(properties);
        (({ charset = '/0123456789=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', content = '', spacing: { x: spacing_x = 0, y: spacing_y = 0 } = {} } = {}) => {
            this.charset = charset;
            this.content = content;
            this.spacing = new XVector(spacing_x, spacing_y);
        })(properties);
    }
    compute(context) {
        const lines = this.content.split('\n').map(section => {
            let total = 0;
            for (const char of section) {
                total += context.measureText(char).width + this.spacing.x;
            }
            return total;
        });
        const metrics = context.measureText(this.charset);
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        return new XVector(Math.max(...lines), height + (height + this.spacing.y) * (lines.length - 1));
    }
    draw(context, base) {
        let index = 0;
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
        const phase = Date.now() / 1000;
        const offset = { x: 0, y: 0 };
        const random = { x: 0, y: 0 };
        const swirl = { p: 0, r: 0, s: 0 };
        const metrics = context.measureText(this.charset);
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        while (index < this.content.length) {
            const char = this.content[index++];
            if (char === '\n') {
                offset.x = 0;
                offset.y += height + this.spacing.y;
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
                        offset.x = offsetX || 0;
                        offset.y = offsetY || 0;
                        break;
                    case 'random':
                        const [randomX, randomY] = value.split(',').map(value => +value);
                        random.x = randomX || 0;
                        random.y = randomY || 0;
                        break;
                    case 'stroke':
                        context.strokeStyle = value;
                        break;
                    case 'swirl':
                        // period, radius, speed (rotations per second)
                        const [swirlR, swirlS, swirlP] = value.split(',').map(value => +value);
                        swirl.r = swirlR || 0;
                        swirl.s = swirlS || 0;
                        swirl.p = swirlP || 0;
                        break;
                }
            }
            else {
                let x = base.x + offset.x + random.x * (Math.random() - 0.5);
                let y = base.y + offset.y + random.y * (Math.random() - 0.5) + height;
                if (swirl.s > 0 && swirl.r > 0) {
                    const endpoint = new XVector(x, y).endpoint(((phase * 360 * swirl.s) % 360) + index * (360 / swirl.p), swirl.r);
                    x = endpoint.x;
                    y = endpoint.y;
                }
                context.fillText(char, x, y);
                context.strokeText(char, x, y);
                offset.x += context.measureText(char).width + this.spacing.x;
            }
        }
        Object.assign(context, state);
    }
}
class XTile extends XSprite {
    constructor(properties = {}) {
        super(properties);
        (({ offset: { x: offset_x = 0, y: offset_y = 0 } = {}, size: { x: size_x = 0, y: size_y = 0 } = {} } = {}) => {
            this.offset = new XVector(offset_x, offset_y);
            this.size = new XVector(size_x, size_y);
        })(properties);
    }
    compute() {
        return this.size;
    }
    draw(context, base) {
        const texture = this.frames[this.state.index];
        texture &&
            context.drawImage(texture.value, this.offset.x, this.offset.y, this.size.x, this.size.y, base.x, base.y, this.size.x, this.size.y);
        if (this.steps <= ++this.state.step) {
            this.state.step = 0;
            if (this.state.active && this.frames.length <= ++this.state.index) {
                this.state.index = 0;
            }
        }
    }
}
/** An object representing a two-dimensional positional value. */
class XVector {
    constructor(a1 = 0, y = a1) {
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
    /** Clamps this object's position within a region and returns a new `XVector` object with the result as its position. */
    clamp(min, max) {
        return new XVector(new XNumber(this.x).clamp(min.x, max.x).value, new XNumber(this.y).clamp(min.y, max.y).value);
    }
    /** Returns a new `XVector` object with the same position as this object. */
    clone() {
        return new XVector(this);
    }
    /** Calculates the relative direction from this object's position and another position. */
    direction(vector) {
        return (180 / Math.PI) * Math.atan2(this.y - vector.y, this.x - vector.x);
    }
    /** Calculates the distance between this object's position and another position. */
    distance(vector) {
        return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
    }
    divide(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x / a1, this.y / y);
        }
        else {
            return this.divide(a1.x, a1.y);
        }
    }
    /**
     * Calculates the position in a specific direction and at a specific distance from this object's position and returns
     * a new `XVector` object with the result as its position.
     */
    endpoint(direction, distance) {
        const radians = (((direction + 90) % 360) * Math.PI) / 180;
        return new XVector(this.x + distance * Math.sin(Math.PI - radians), this.y + distance * Math.cos(Math.PI - radians));
    }
    /** Alter the internal value of this positional over a specified duration. */
    modulate(duration, ...points) {
        return new Promise(resolve => {
            let index = 0;
            const x = this.x;
            const y = this.y;
            clearInterval(X.cache.modulationTasks.get(this));
            X.cache.modulationTasks.set(this, setInterval(() => {
                if (index < duration) {
                    this.x = X.math.bezier(index / duration, x, ...points.map(point => point.x));
                    this.y = X.math.bezier(index / duration, y, ...points.map(point => point.y));
                    index += 20;
                }
                else {
                    this.x = X.math.bezier(1, x, ...points.map(point => point.x));
                    this.y = X.math.bezier(1, y, ...points.map(point => point.y));
                    clearInterval(X.cache.modulationTasks.get(this));
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
    /** Returns an `XVector` object with the rounded position of this object's position. */
    round(base) {
        return base ? this.multiply(base).round().divide(base) : new XVector(Math.round(this.x), Math.round(this.y));
    }
    subtract(a1, y = a1) {
        if (typeof a1 === 'number') {
            return new XVector(this.x - a1, this.y - y);
        }
        else {
            return this.subtract(a1.x, a1.y);
        }
    }
    /** Returns the raw values of this object's position. */
    value() {
        return { x: this.x, y: this.y };
    }
}
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
    /** A cache for various types of resources. */
    cache: {
        /** Stores promises for all audio requests. */
        audios: {},
        /** All loaded assets attached to any given cached audio. */
        audioAssets: {},
        /** Stores promises for all data requests. */
        datas: {},
        /** All loaded assets attached to any given cached data. */
        dataAssets: {},
        /** Stores promises for all image requests. */
        images: {},
        /** All loaded assets attached to any given cached image. */
        imageAssets: {},
        /** Stores all active modulation tasks for any `AudioParam`, `XNumber`, or `XVector` objects. */
        modulationTasks: new Map()
    },
    /** A recursive operator function. */
    chain(input, handler) {
        const loop = (input) => handler(input, loop);
        return loop(input);
    },
    /** Sets the given canvas to the specified size and generates a new `CanvasRenderingContext2D` from it. */
    context(canvas, width = 1, height = 1) {
        return Object.assign(Object.assign(canvas, { width, height }).getContext('2d'), { imageSmoothingEnabled: false });
    },
    /** Gets an `XBasic` from the given source URL. */
    data(source) {
        if (source in X.cache.datas) {
            return X.cache.datas[source];
        }
        else {
            return (X.cache.datas[source] = fetch(source).then(value => value.json()));
        }
    },
    /** Returns an asset for a given data source. */
    dataAsset(
    /** The data's source. */
    source, { 
    /**
     * The extra duration in which to keep this asset's source data in memory after this asset and all of its
     * siblings (other assets which share this asset's source data) are unloaded.
     */
    cache = 0, 
    /** The pixel shader to apply to the image. */
    modifier = void 0 } = {}) {
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
    /** Gets an `HTMLImageElement` from the given source URL. */
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
    /** Returns an asset for a given image source. */
    imageAsset(
    /** The image's source. */
    source, { 
    /**
     * The extra duration in which to keep this asset's source image in memory after this asset and all of its
     * siblings (other assets which share this asset's source image) are unloaded.
     */
    cache = 0, 
    /** The pixel shader to apply to the image. */
    shader = void 0 } = {}) {
        const asset = new XAsset({
            async loader() {
                const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
                assets.includes(asset) || assets.push(asset);
                const image = await X.image(source);
                if (image.width === 0 || image.height === 0) {
                    return await createImageBitmap(new ImageData(1, 1));
                }
                else if (shader) {
                    const context = X.context(document.createElement('canvas'), image.width, image.height);
                    context.drawImage(image, 0, 0);
                    const { data } = context.getImageData(0, 0, image.width, image.height);
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
                    return await createImageBitmap(new ImageData(data, image.width));
                }
                else {
                    return image;
                }
            },
            source,
            async unloader() {
                const assets = X.cache.imageAssets[source] || (X.cache.imageAssets[source] = []);
                X.pause(cache).then(() => {
                    assets.includes(asset) && assets.splice(assets.indexOf(asset), 1);
                    if (assets.length === 0) {
                        X.cache.images[source].then(image => URL.revokeObjectURL(image.src));
                        delete X.cache.images[source];
                    }
                });
            }
        });
        return asset;
    },
    /** Returns an inventory. */
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
    /** Various math-related methods used throughout the engine. */
    math: {
        /** Calculates the value of a position on an polynomial bezier curve. */
        bezier(value, ...points) {
            return points.length > 1
                ? X.math.bezier(value, ...points.slice(0, -1).map((point, index) => point * (1 - value) + points[index + 1] * value))
                : points[0] || 0;
        },
        /** Checks if two line segments intersect. */
        intersection(a1, a2, b1, b2) {
            return (X.math.rotation(a1, b1, b2) !== X.math.rotation(a2, b1, b2) &&
                X.math.rotation(a1, a2, b1) !== X.math.rotation(a1, a2, b2));
        },
        /** Rotates a line segment for optimized intersection checking. */
        rotation(a1, a2, a3) {
            return (a3.y - a1.y) * (a2.x - a1.x) > (a2.y - a1.y) * (a3.x - a1.x);
        },
        /** Maps a value to a sine wave with a 0-1 input and output range. */
        wave(value) {
            return Math.sin(((value + 0.5) * 2 - 1) * Math.PI) / 2 + 0.5;
        }
    },
    /** Parses JS objects previously stringified with `X.stringify()` */
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
                    case '#':
                        return eval(value);
                }
            }
            else {
                return value;
            }
        });
    },
    provide(provider, ...args) {
        return typeof provider === 'function' ? provider(...args) : provider;
    },
    /** Returns a promise that will resolve after the specified duration in milliseconds. */
    pause(duration = 0) {
        return new Promise(resolve => setTimeout(() => resolve(), duration));
    },
    /** Returns an audio daemon for generating audio player instances. */
    daemon(audio, { 
    /** The AudioContext to use for this daemon. */
    context = new AudioContext(), 
    /** The base gain of this player. */
    gain = 1, 
    /** Whether or not this player's instances should loop by default. */
    loop = false, 
    /** The base playback rate of this player. */
    rate = 1, 
    /** The audio router to use for this object. */
    router = ((context, input) => input.connect(context.destination)) } = {}) {
        const daemon = {
            audio,
            context,
            gain,
            instance(offset = 0) {
                // initialize values
                const context = daemon.context;
                const gain = context.createGain();
                const source = context.createBufferSource();
                // set defaults
                gain.gain.value = daemon.gain;
                source.buffer = daemon.audio.value;
                source.loop = daemon.loop;
                source.playbackRate.value = daemon.rate;
                // establish connections
                daemon.router(context, gain);
                source.connect(gain);
                source.start(0, offset);
                // return controller
                return {
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
                    }
                };
            },
            instances: [],
            loop,
            rate,
            router
        };
        return daemon;
    },
    /** Converts JS objects to JSON with support for functions, undefined values, infinity, and nan values. */
    stringify(value) {
        return JSON.stringify(value, (key, value) => {
            switch (value) {
                case +Infinity:
                    return '#+Infinity';
                case -Infinity:
                    return '#-Infinity';
                default:
                    switch (typeof value) {
                        case 'bigint':
                            return `#${value}n`;
                        case 'function':
                            return `@${value}`;
                        case 'number':
                            return value === value ? value : '#NaN';
                        case 'string':
                            return `!${value}`;
                        default:
                            return value;
                    }
            }
        });
    },
    /** The inital transform used in rendering and vertex calculations. */
    transform: [new XVector(), new XNumber(), new XVector(1)]
};
Object.assign(AudioParam.prototype, {
    modulate(duration, ...points) {
        return XNumber.prototype.modulate.call(this, duration, ...points);
    }
});
//# sourceMappingURL=engine.js.map