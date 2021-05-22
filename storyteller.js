"use strict";
class XHost {
    constructor() {
        this.events = new Map();
    }
    on(name, ...listeners) {
        this.events.has(name) || this.events.set(name, new Set());
        const list = this.events.get(name);
        if (list != null) {
            for (const listener of listeners)
                list.add(listener);
        }
    }
    off(name, ...listeners) {
        if (this.events.has(name)) {
            const list = this.events.get(name);
            if (list != null) {
                for (const listener of listeners)
                    list.delete(listener);
            }
        }
    }
    fire(name, ...data) {
        if (this.events.has(name)) {
            const list = this.events.get(name);
            if (list != null) {
                for (const listener of [...list].sort((a, b) => (typeof a === 'function' ? 0 : a.priority || 0) - (typeof b === 'function' ? 0 : b.priority || 0))) {
                    typeof listener === 'function' ? listener(this, ...data) : listener.script(this, ...data);
                }
            }
        }
    }
}
class XAsset {
    constructor(source) {
        this.image = new Image();
        this.image.src = source;
    }
}
class XTexture {
    constructor(asset, { mapping: { x = 0, y = 0, w = asset.image.width - x, h = asset.image.height - y } = {} }) {
        this.asset = asset;
        this.mapping = { x, y, w, h };
    }
}
class XAnimation {
    constructor({ attributes: { sticky = false, single = false } = {}, default: $default = 0, steps = 1, textures = [] } = {}) {
        this.default = 0;
        this.index = 0;
        this.state = false;
        this.step = 0;
        this.attributes = { sticky, single };
        this.default = $default;
        this.steps = steps;
        this.textures = textures;
    }
    compute() {
        const texture = this.textures[this.state || this.attributes.sticky ? this.index : this.default];
        if (this.state && ++this.step >= this.steps) {
            this.step = 0;
            if (++this.index >= this.textures.length) {
                this.index = 0;
                this.attributes.single && (this.state = false);
            }
        }
        return texture;
    }
}
class XEntity {
    constructor({ animation, attributes: { collidable = false, interactable = false, visible = false, triggerable = false } = {}, hitbox: { x = 0, y = 0, w = 0, h = 0 } = {}, metadata = {}, position: { x: a = 0, y: b = 0, z: c = 0 } = {}, texture } = {}) {
        this.animation = animation;
        this.attributes = { collidable, interactable, visible, triggerable };
        this.hitbox = { x, y, w, h };
        this.metadata = metadata;
        this.position = { x: a, y: b, z: c };
        this.texture = texture;
    }
}
class XInput extends XHost {
    constructor(...keys) {
        super();
        this.state = false;
        addEventListener('keydown', (event) => {
            if (keys.includes(event.key) && !this.state) {
                this.fire('press', event);
                this.state = true;
            }
        });
        addEventListener('keyup', (event) => {
            if (keys.includes(event.key) && this.state) {
                this.fire('release', event);
                this.state = false;
            }
        });
    }
}
class XRoom {
    constructor({ entities = [], hitbox: { x = 0, y = 0, w = 0, h = 0 } = {} }) {
        this.collidables = new Set();
        this.interactables = new Set();
        this.triggerables = new Set();
        this.visibles = new Set();
        for (const entity of entities) {
            entity.attributes.collidable && this.collidables.add(entity);
            entity.attributes.interactable && this.interactables.add(entity);
            entity.attributes.triggerable && this.triggerables.add(entity);
            entity.attributes.visible && this.visibles.add(entity);
        }
        this.hitbox = { x, y, w, h };
    }
}
class XEngine {
    constructor(canvas, player, { animations: { left: l1 = new XAnimation(), right: r1 = new XAnimation(), down: d1 = new XAnimation(), up: u1 = new XAnimation() } = {}, debug = false, framerate = 30, inputs: { left: l2 = 'ArrowLeft', right: r2 = 'ArrowRight', down: d2 = 'ArrowDown', up: u2 = 'ArrowUp' } = {}, rooms = {}, state = {} } = {}) {
        this.hooks = new Set();
        this.queue = new Set();
        this.scale = 1;
        this.state = {};
        this.animations = { down: d1, left: l1, right: r1, up: u1 };
        this.canvas = canvas;
        this.debug = debug;
        this.inputs = { down: new XInput(d2), left: new XInput(l2), right: new XInput(r2), up: new XInput(u2) };
        this.player = player;
        this.rooms = new Map(Object.entries(rooms));
        this.inputs.down.on('release', () => {
            if (this.inputs.left.state) {
                player.animation = l1;
            }
            else if (this.inputs.right.state) {
                player.animation = r1;
            }
            else {
                player.animation && (player.animation.state = false);
            }
        });
        this.inputs.left.on('release', () => {
            if (this.inputs.right.state) {
                player.animation = r1;
            }
            else {
                player.animation && (player.animation.state = false);
            }
        });
        this.inputs.right.on('release', () => {
            player.animation && (player.animation.state = false);
        });
        this.inputs.up.on('release', () => {
            if (this.inputs.down.state) {
                player.animation = d1;
            }
            else if (this.inputs.left.state) {
                player.animation = l1;
            }
            else if (this.inputs.right.state) {
                player.animation = r1;
            }
            else {
                player.animation && (player.animation.state = false);
            }
        });
        this.resize();
        addEventListener('resize', () => this.resize());
        this.update(state);
        setInterval(() => this.render(), 1000 / framerate);
    }
    resize() {
        if (innerWidth / innerHeight > 4 / 3) {
            this.canvas.width = innerHeight * (4 / 3);
            this.canvas.height = innerHeight;
            this.scale = innerHeight / 240;
        }
        else {
            this.canvas.width = innerWidth;
            this.canvas.height = innerWidth / (4 / 3);
            this.scale = innerWidth / 320;
        }
        this.context = this.canvas.getContext('2d') || void 0;
        if (this.context) {
            this.context.lineWidth = 0.5;
            this.context.imageSmoothingEnabled = false;
        }
    }
    render() {
        if (this.context) {
            this.context.resetTransform();
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.room) {
                const origin = Object.assign({}, this.player.position);
                if (this.inputs.left.state) {
                    this.player.position.x -= 3;
                    this.player.animation = this.animations.left;
                    this.player.animation && (this.player.animation.state = true);
                }
                else if (this.inputs.right.state) {
                    this.player.position.x += 3;
                    this.player.animation = this.animations.right;
                    this.player.animation && (this.player.animation.state = true);
                }
                if (this.inputs.up.state) {
                    this.player.position.y += 3;
                    this.player.animation = this.animations.up;
                    this.player.animation && (this.player.animation.state = true);
                }
                else if (this.inputs.down.state) {
                    this.player.position.y -= 3;
                    this.player.animation = this.animations.down;
                    this.player.animation && (this.player.animation.state = true);
                }
                if (this.inputs.right.state || this.inputs.left.state || this.inputs.up.state || this.inputs.down.state) {
                    const colliders = X.intersection(X.hitbox(this.player), ...this.room.collidables);
                    if (colliders.size > 0) {
                        for (const collider of colliders)
                            this.queue.add({ event: 'collide', entity: collider });
                        this.player.position = origin;
                        if (this.inputs.right.state || this.inputs.left.state) {
                            let index = 0;
                            const increment = this.inputs.right.state ? 1 : -1;
                            while (index++ < 3) {
                                this.player.position.x += increment;
                                if (X.intersection(X.hitbox(this.player), ...colliders).size > 0) {
                                    this.player.position.x -= increment;
                                    break;
                                }
                            }
                        }
                        if (this.inputs.up.state || this.inputs.down.state) {
                            let index = 0;
                            const increment = this.inputs.up.state ? 1 : -1;
                            while (index++ < 3) {
                                this.player.position.y += increment;
                                if (X.intersection(X.hitbox(this.player), ...colliders).size > 0) {
                                    this.player.position.y -= increment;
                                    // the frisk dance
                                    if (this.inputs.up.state && this.inputs.down.state) {
                                        this.player.animation = this.animations.up;
                                        this.player.position.y -= 3;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                for (const trigger of X.intersection(X.hitbox(this.player), ...this.room.triggerables)) {
                    this.queue.add({ event: 'trigger', entity: trigger });
                }
                const offset = { x: 160 - this.player.hitbox.w / 2, y: 120 - this.player.hitbox.h / 2 };
                this.context.setTransform(this.scale, 0, 0, this.scale, (Math.min(Math.max(this.player.position.x, offset.x + this.room.hitbox.x), offset.x + this.room.hitbox.x + this.room.hitbox.w) *
                    -1 +
                    offset.x) *
                    this.scale, (Math.min(Math.max(this.player.position.y, offset.y + this.player.hitbox.h + this.room.hitbox.y), offset.y + this.room.hitbox.y + this.room.hitbox.h) +
                    offset.y) *
                    this.scale);
                for (const entity of [...this.room.visibles, this.player].sort((a, b) => a.position.z - b.position.z)) {
                    const texture = entity.animation instanceof XAnimation ? entity.animation.compute() : entity.texture;
                    if (texture instanceof XTexture) {
                        this.context.drawImage(texture.asset.image, texture.mapping.x, texture.mapping.y, texture.mapping.w, texture.mapping.h, entity.position.x, entity.position.y * -1 - texture.mapping.h, texture.mapping.w, texture.mapping.h);
                    }
                }
                if (this.debug) {
                    const colliders = [...this.room.collidables, this.player];
                    for (const entity of colliders) {
                        this.context.strokeStyle = '#ffffff30';
                        const hitbox = X.hitbox(entity);
                        for (const other of colliders) {
                            if (other !== entity && X.intersection(hitbox, other).size > 0) {
                                this.context.strokeStyle = '#ff0000ff';
                                break;
                            }
                        }
                        this.context.strokeRect(hitbox.x, hitbox.y * -1 - hitbox.h, hitbox.w, hitbox.h);
                        this.context.closePath();
                    }
                    const triggerables = [...this.room.triggerables, this.player];
                    for (const entity of triggerables) {
                        this.context.strokeStyle = '#ffffff30';
                        const hitbox = X.hitbox(entity);
                        for (const other of triggerables) {
                            if (other !== entity && X.intersection(hitbox, other).size > 0) {
                                this.context.strokeStyle = '#00ff00ff';
                                break;
                            }
                        }
                        this.context.strokeRect(hitbox.x, hitbox.y * -1 - hitbox.h, hitbox.w, hitbox.h);
                        this.context.closePath();
                    }
                }
            }
        }
        for (const entry of this.queue)
            for (const hook of this.hooks)
                hook(entry.event, entry.entity);
        this.queue.clear();
    }
    update(state = {}) {
        Object.assign(this.state, state);
        if (state.room != null) {
            if (this.rooms.has(state.room)) {
                this.room = this.rooms.get(state.room);
            }
            else {
                this.room = void 0;
            }
        }
    }
}
const X = {
    intersection({ x = 0, y = 0, h = 0, w = 0 }, ...entities) {
        const list = new Set();
        for (const entity of entities) {
            const hitbox = X.hitbox(entity);
            if (x < hitbox.x + hitbox.w && x + w > hitbox.x && y < hitbox.y + hitbox.h && y + h > hitbox.y) {
                list.add(entity);
            }
        }
        return list;
    },
    hitbox(entity) {
        return {
            x: entity.position.x + entity.hitbox.x + Math.min(entity.hitbox.w, 0),
            y: entity.position.y + entity.hitbox.y + Math.min(entity.hitbox.h, 0),
            w: Math.abs(entity.hitbox.w),
            h: Math.abs(entity.hitbox.h)
        };
    },
    async import(source) {
        if (X.imports.has(source)) {
            return X.imports.get(source);
        }
        else {
            let data, value;
            try {
                const response = await fetch(source);
                try {
                    data = await response.json();
                }
                catch (error) {
                    throw new SyntaxError(`Invalid Resource: ${source} - The resource could not be parsed.`);
                }
            }
            catch (error) {
                throw new ReferenceError(`Invalid Resource: ${source} - The resource could not be loaded.`);
            }
            switch (data.class) {
                case 'XAnimation':
                    if (data.attributes != null) {
                        if (typeof data.attributes !== 'object' || data.attributes instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes" must be of type "object"`);
                        }
                        else {
                            if (data.attributes.single == null) {
                                if (typeof data.attributes.single !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.single" must be of type "boolean"`);
                                }
                            }
                            if (data.attributes.sticky != null) {
                                if (typeof data.attributes.sticky !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.sticky" must be of type "boolean"`);
                                }
                            }
                        }
                    }
                    if (data.default != null) {
                        if (typeof data.default !== 'number') {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "default" must be of type "number"`);
                        }
                        else if (data.default < 0) {
                            throw new RangeError(`Invalid Resource: ${source} - Property "default" falls outside of the valid range [0..]`);
                        }
                    }
                    if (data.steps != null) {
                        if (typeof data.steps !== 'number') {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "steps" must be of type "number"`);
                        }
                        else if (data.steps < 1) {
                            throw new RangeError(`Invalid Resource: ${source} - Property "steps" falls outside of the valid range [1..]`);
                        }
                    }
                    if (data.textures != null) {
                        if (typeof data.textures !== 'object' || !(data.textures instanceof Array)) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "textures" must be of type "array"`);
                        }
                        else {
                            for (const [index, texture] of data.textures.entries()) {
                                if (typeof texture !== 'string') {
                                    throw new TypeError(`Invalid Resource: ${source} - All values in the "textures" array must be of type "string"`);
                                }
                                else {
                                    const value = await X.import(texture);
                                    if (value instanceof XTexture) {
                                        data.textures[index] = value;
                                    }
                                    else {
                                        throw new ReferenceError(`Invalid Resource: ${source} - The value "${texture}" at index ${index} in the "textures" array must refer to a texture file`);
                                    }
                                }
                            }
                        }
                    }
                    value = new XAnimation(data);
                    break;
                case 'XAsset':
                    if (typeof data.source !== 'string') {
                        throw new TypeError(`Invalid Resource: ${source} - Property "source" must be of type "string"`);
                    }
                    value = new XAsset(data.source);
                    break;
                case 'XEntity':
                    if (data.animation != null) {
                        if (typeof data.animation !== 'string') {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "animation" must be of type "string"`);
                        }
                        else {
                            const value = await X.import(data.animation);
                            if (value instanceof XAnimation) {
                                data.animation = value;
                            }
                            else {
                                throw new ReferenceError(`Invalid Resource: ${source} - If defined, property "animation" must refer to an animation file`);
                            }
                        }
                    }
                    if (data.attributes != null) {
                        if (typeof data.attributes !== 'object' || data.attributes instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes" must be of type "object"`);
                        }
                        else {
                            if (data.attributes.collidable != null) {
                                if (typeof data.attributes.collidable !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.collidable" must be of type "boolean"`);
                                }
                            }
                            if (data.attributes.interactable != null) {
                                if (typeof data.attributes.interactable !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.interactable" must be of type "boolean"`);
                                }
                            }
                            if (data.attributes.triggerable != null) {
                                if (typeof data.attributes.triggerable !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.triggerable" must be of type "boolean"`);
                                }
                            }
                            if (data.attributes.visible != null) {
                                if (typeof data.attributes.visible !== 'boolean') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "attributes.visible" must be of type "boolean"`);
                                }
                            }
                        }
                    }
                    if (data.hitbox != null) {
                        if (typeof data.hitbox !== 'object' || data.hitbox instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox" must be of type "object"`);
                        }
                        else {
                            if (data.hitbox.h != null) {
                                if (typeof data.hitbox.h !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.h" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.w != null) {
                                if (typeof data.hitbox.w !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.w" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.x != null) {
                                if (typeof data.hitbox.x !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.x" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.y != null) {
                                if (typeof data.hitbox.y !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.y" must be of type "number"`);
                                }
                            }
                        }
                    }
                    if (data.metadata != null) {
                        if (typeof data.metadata !== 'object' || data.metadata instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "metadata" must be of type "object"`);
                        }
                    }
                    if (data.position != null) {
                        if (typeof data.position !== 'object' || data.position instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "position" must be of type "object"`);
                        }
                        else {
                            if (data.position.x != null) {
                                if (typeof data.position.x !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "position.x" must be of type "number"`);
                                }
                            }
                            if (data.position.y != null) {
                                if (typeof data.position.y !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "position.y" must be of type "number"`);
                                }
                            }
                            if (data.position.z != null) {
                                if (typeof data.position.z !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "position.z" must be of type "number"`);
                                }
                            }
                        }
                    }
                    if (data.texture != null) {
                        if (typeof data.texture !== 'string') {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "texture" must be of type "string"`);
                        }
                        else {
                            const value = await X.import(data.texture);
                            if (value instanceof XTexture) {
                                data.texture = value;
                            }
                            else {
                                throw new ReferenceError(`Invalid Resource: ${source} - If defined, property "texture" must refer to a texture file`);
                            }
                        }
                    }
                    value = new XEntity(data);
                    break;
                case 'XInput':
                    if (data.keys != null) {
                        if (typeof data.keys !== 'object' || !(data.keys instanceof Array)) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "keys" must be of type "array"`);
                        }
                        else {
                            for (const entity of data.keys.values()) {
                                if (typeof entity !== 'string') {
                                    throw new TypeError(`Invalid Resource: ${source} - All values in the "keys" array must be of type "string"`);
                                }
                            }
                        }
                    }
                    value = new XInput(data);
                    break;
                case 'XRoom':
                    if (data.entities != null) {
                        if (typeof data.entities !== 'object' || !(data.entities instanceof Array)) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "entities" must be of type "array"`);
                        }
                        else {
                            for (const [index, entity] of data.entities.entries()) {
                                if (typeof entity !== 'string') {
                                    throw new TypeError(`Invalid Resource: ${source} - All values in the "entities" array must be of type "string"`);
                                }
                                else {
                                    const value = await X.import(entity);
                                    if (value instanceof XEntity) {
                                        data.entities[index] = value;
                                    }
                                    else {
                                        throw new ReferenceError(`Invalid Resource: ${source} - The value "${entity}" at index ${index} in the "entities" array must refer to an entity file`);
                                    }
                                }
                            }
                        }
                    }
                    if (data.hitbox != null) {
                        if (typeof data.hitbox !== 'object' || data.hitbox instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox" must be of type "object"`);
                        }
                        else {
                            if (data.hitbox.h != null) {
                                if (typeof data.hitbox.h !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.h" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.w != null) {
                                if (typeof data.hitbox.w !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.w" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.x != null) {
                                if (typeof data.hitbox.x !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.x" must be of type "number"`);
                                }
                            }
                            if (data.hitbox.y != null) {
                                if (typeof data.hitbox.y !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "hitbox.y" must be of type "number"`);
                                }
                            }
                        }
                    }
                    value = new XRoom(data);
                    break;
                case 'XTexture':
                    if (typeof data.asset !== 'string') {
                        throw new TypeError(`Invalid Resource: ${source} - The property "asset" must be of type "string"`);
                    }
                    else {
                        const value = await X.import(data.asset);
                        if (value instanceof XAsset) {
                            data.asset = value;
                        }
                        else {
                            throw new ReferenceError(`Invalid Resource: ${source} - The property "asset" must refer to an asset file`);
                        }
                    }
                    if (data.mapping != null) {
                        if (typeof data.mapping !== 'object' || data.mapping instanceof Array) {
                            throw new TypeError(`Invalid Resource: ${source} - If defined, property "mapping" must be of type "object"`);
                        }
                        else {
                            if (data.mapping.h != null) {
                                if (typeof data.mapping.h !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "mapping.h" must be of type "number"`);
                                }
                            }
                            if (data.mapping.w != null) {
                                if (typeof data.mapping.w !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "mapping.w" must be of type "number"`);
                                }
                            }
                            if (data.mapping.x != null) {
                                if (typeof data.mapping.x !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "mapping.x" must be of type "number"`);
                                }
                            }
                            if (data.mapping.y != null) {
                                if (typeof data.mapping.y !== 'number') {
                                    throw new TypeError(`Invalid Resource: ${source} - If defined, property "mapping.y" must be of type "number"`);
                                }
                            }
                        }
                    }
                    value = new XTexture(data.asset, data);
                    break;
            }
            X.imports.set(source, value);
            return value;
        }
    },
    imports: new Map()
};
