"use strict";
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
//   ##    ##   ########   #######    ########   ########   ########   ########   ##         ########   //
//   ##    ##   ##    ##   ##    ##   ##         ##     ##     ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ##         ##     ##     ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ######     ########      ##      ########   ##         ######     //
//   ##    ##   ##    ##   ##    ##   ##         ##  ###       ##      ##    ##   ##         ##         //
//   ##    ##   ##    ##   ##    ##   ##         ##   ###      ##      ##    ##   ##         ##         //
//   ########   ##    ##   #######    ########   ##    ###     ##      ##    ##   ########   ########   //
//                                                                                                      //
///// imagine using unitale //////////////////////////////////////////////////////////////////////////////
class XBattler extends XHost {
    constructor({ attack = async () => { }, choices, menu = [] }) {
        super();
        this.state = { history: [] };
        this.attack = attack;
        this.choices = choices;
        this.menu = menu;
    }
    choice() {
        if (this.state.history.length > 0) {
            return this.choices[this.state.history[this.state.history.length - 1]];
        }
        else {
            return this.menu;
        }
    }
    list() {
        const choice = this.choice();
        if (choice && typeof choice === 'object') {
            return choice;
        }
        else {
            return [];
        }
    }
    async loop() {
        const choice = (await this.on('choice'))[0];
        if (await this.attack(choice)) {
            this.state.history.splice(0, this.state.history.length);
            await this.loop();
        }
    }
    next(index) {
        const choice = this.choice();
        if (choice && typeof choice === 'object') {
            typeof index === 'string' && (index = choice.indexOf(index));
            if (index > -1 && index < choice.length) {
                const key = choice[index];
                if (key in this.choices) {
                    this.state.history.push(key);
                    const choice = this.choices[key];
                    if (typeof choice === 'function') {
                        choice(this).then(() => this.fire('choice', key));
                    }
                }
            }
        }
    }
    prev() {
        return typeof this.choice() === 'function' || (this.state.history.pop(), this.state.history.length === 0);
    }
}
class XDialoguer extends XHost {
    constructor({ interval = 1 } = {}) {
        super();
        this.state = { mode: 'empty', skip: true, text: [] };
        this.interval = new XNumber(interval);
    }
    read(force) {
        if (force) {
            switch (this.state.mode) {
                case 'read':
                    this.skip();
                case 'skip':
                    this.on('idle').then(() => X.pause()).then(() => this.read());
            }
        }
        else if (this.state.mode === 'idle') {
            this.fire('read');
            this.state.mode = 'read';
        }
    }
    skip(force) {
        (this.state.skip || force) && this.state.mode === 'read' && (this.fire('skip'), (this.state.mode = 'skip'));
    }
    // dialoguer text input preprocessor - by harrix432 & Toby Fox
    async text(...lines) {
        if (this.state.mode === 'empty') {
            this.fire('read');
            this.state.mode = 'read';
            for (const line of lines.map(line => line.trim()).filter(line => line.length > 0)) {
                let index = 0;
                let advance = false;
                while (advance === false && index < line.length) {
                    const char = line[index++];
                    // SUS: ts thinks 'this.state.mode' can only be 'read' or 'idle'
                    const skip = this.state.mode === 'skip';
                    if (char === '{') {
                        const code = line.slice(index, line.indexOf('}', index));
                        const data = code.slice(1);
                        index += code.length + 1;
                        this.fire('code', code);
                        switch (code[0]) {
                            // ! - auto-skip to the end of the text
                            case '!':
                                skip || this.skip(code[1] === '!');
                                break;
                            // @ - XText control code
                            case '@':
                                this.state.text.push(`\xa7${data}\xa7`);
                                break;
                            // # - fires a 'header' event as the dialoguer
                            case '#':
                                this.fire('header', data);
                                break;
                            // $ - pushes a chunk of data immediately
                            case '$':
                                this.state.text.push(data);
                                break;
                            // % - auto-advance to the next line
                            case '%':
                                advance = true;
                                break;
                            // ^ - delay the text by (input value) * (current interval)
                            case '^':
                                skip || (await Promise.race([this.on('skip'), X.pause(Number(data) * this.interval.value)]));
                                break;
                            // & - add a character from a hex code
                            case '&':
                                this.state.text.push(String.fromCharCode(parseInt(data, 16)));
                                break;
                            // * - prevent skipping
                            case '*':
                                this.state.skip = false;
                                break;
                        }
                    }
                    else {
                        this.fire('char', char);
                        skip || (await Promise.race([this.on('skip'), X.pause(this.interval.value)]));
                        this.state.text.push(char);
                        skip || this.fire('text', this.state.text.join(''));
                    }
                }
                this.state.mode === 'skip' && this.fire('text', this.state.text.join(''));
                this.fire('idle');
                this.state.mode = 'idle';
                advance || (await this.on('read'));
                this.state.text = [];
            }
            this.fire('text', '');
            this.fire('empty');
            this.state.mode = 'empty';
        }
        else {
            switch (this.state.mode) {
                case 'read':
                    this.skip();
                case 'skip':
                    await this.on('idle');
                    await X.pause();
                case 'idle':
                    this.read();
                    await X.pause();
                    await this.text(...lines);
            }
        }
    }
}
class XGame extends XHost {
    constructor(player, renderer, rooms) {
        super();
        this.state = { room: void 0 };
        this.player = player;
        this.renderer = renderer;
        this.rooms = rooms;
    }
    async room(value, fade = 0, unfade = fade) {
        if (typeof this.state.room === 'string' && this.state.room in this.rooms) {
            const room = this.rooms[this.state.room];
            await this.renderer.alpha.modulate(fade, 0);
            for (const key in room.layers) {
                this.renderer.detach(key, ...room.layers[key]);
            }
        }
        if (typeof value === 'string' && value in this.rooms) {
            const room = this.rooms[value];
            this.renderer.alpha.modulate(unfade, 1);
            for (const key in room.layers) {
                this.renderer.attach(key, ...this.rooms[value].layers[key]);
            }
            Object.assign(this.renderer.region[0], room.region[0]);
            Object.assign(this.renderer.region[1], room.region[1]);
        }
        this.state.room = value;
        this.fire('teleport', value);
    }
    static build({ alpha, auto, container, debug, framerate, layers, player, rooms, size } = {}) {
        const instance = new XGame(player instanceof XWalker ? player : new XWalker(player), new XRenderer({ alpha, auto, container, debug, framerate, layers, size }).on('tick', {
            priority: Infinity,
            listener() {
                Object.assign(instance.renderer.camera, instance.player.position.serialize());
            }
        }), Object.fromEntries(Object.entries(rooms || {}).map(([key, properties = {}]) => [
            key,
            properties instanceof XRoom ? properties : new XRoom(properties)
        ])));
        return instance;
    }
}
class XItem {
    constructor({ drop = [], info = [], type = 'consumable', use = [], value = 0 } = {}) {
        this.drop = drop;
        this.info = info;
        this.type = type;
        this.use = use;
        this.value = value;
    }
}
class XSave extends XHost {
    constructor(at, $default, df, hp, items, key, lv) {
        super();
        this.at = at;
        this.default = $default;
        this.df = df;
        this.hp = hp;
        this.items = items;
        this.key = key;
        this.lv = lv;
        this.data = this.load();
    }
    activate(index, action) {
        const name = this.data.items[index];
        const item = this.items[name];
        switch (action) {
            case 'use':
                switch (item.type) {
                    case 'armor':
                    case 'weapon':
                        this.data.items[index] = this.data[item.type];
                        this.data[item.type] = name;
                        break;
                    case 'consumable':
                        this.data.items.splice(index, 1);
                        this.data.hp = Math.min(this.hp(), this.data.hp + (typeof item.value === 'function' ? item.value() : item.value));
                        break;
                }
                break;
            case 'drop':
                this.data.items.splice(index, 1);
                break;
        }
        this.fire('activate', item, action, index);
    }
    atx() {
        const item = this.items[this.data.weapon];
        if (item) {
            return typeof item.value === 'function' ? item.value() : item.value;
        }
        else {
            return 0;
        }
    }
    // Undertale damage calculation formula - by Toby Fox
    damage(amount) {
        this.data.hp = Math.round(Math.max(0, this.data.hp - amount * (1 - (this.df() + this.dfx()) / 100)));
    }
    dfx() {
        const item = this.items[this.data.armor];
        if (item) {
            return typeof item.value === 'function' ? item.value() : item.value;
        }
        else {
            return 0;
        }
    }
    load() {
        const data = localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data, (x, value) => {
                if (typeof value === 'string') {
                    switch (value[0]) {
                        case '~':
                            return value.slice(1);
                        case '-Infinity':
                        case 'Infinity':
                        case 'NaN':
                            return eval(value);
                        default:
                            return void 0;
                    }
                }
                else {
                    return value;
                }
            });
        }
        else {
            return this.default();
        }
    }
    reset() {
        localStorage.removeItem(this.key);
    }
    save() {
        localStorage.setItem(this.key, JSON.stringify(this.data, (x, value) => {
            if (typeof value === 'string') {
                return `~${value}`;
            }
            else {
                switch (value) {
                    case -Infinity:
                        return '-Infinity';
                    case Infinity:
                        return 'Infinity';
                    case NaN:
                        return 'NaN';
                    default:
                        return value === void 0 ? '' : value;
                }
            }
        }));
    }
    static build({ at = () => 0, default: $default, df = () => 0, hp = () => 0, key, items = {}, lv = () => 0 }) {
        return new XSave(at, $default, df, hp, Object.fromEntries(Object.entries(items).map(([key, value]) => {
            return [key, value instanceof XItem ? value : new XItem(value)];
        })), key, lv);
    }
}
//# sourceMappingURL=undertale.js.map