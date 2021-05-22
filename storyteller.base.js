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
