import './env.js';
import { atlas } from './menu.js';
import { global } from './garbo.js';
import { manager } from './data.js';
import { player, swapSprites } from './player.js';
import { destinations, detector, rooms, spawns } from './rooms.js';
////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
//    GAME INIT                                                                               //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
const game = XGame.build({
    auto: true,
    layers: {
        background: 'ambient',
        foreground: 'primary',
        overlay: 'ambient',
        menu: 'static'
    },
    player,
    rooms
});
const renderer = game.renderer;
const spawn = () => game.room(SAVE.room);
Object.assign(globalThis, {
    game,
    spawn,
    atlas,
    player,
    renderer,
    SAVE: manager.load('storyteller') || manager.default
});
////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
//    GAME DYNAMICS                                                                           //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
player.on('tick', () => {
    const original = player.priority.value;
    player.priority.value = 0;
    if (player.priority.value !== original) {
        renderer.attach('foreground');
    }
});
detector.on('tick', async (door) => {
    if (!global.interact && !door.metadata.interact && door.detect(renderer, player).length > 0) {
        switch (door.metadata.action) {
            case 'door':
                {
                    global.interact = true;
                    const { destination: room, key } = door.metadata;
                    game.room(room, 300).then(() => {
                        const destie = destinations[room][key];
                        Object.assign(player.position, destie.position);
                        player.face(destie.direction);
                        global.interact = false;
                    });
                }
                break;
        }
    }
});
game.on('teleport', room => {
    global.room = room;
    room === void 0 || Object.assign(player.position, spawns[room]);
    switch (room) {
        case 'lastCorridor':
            swapSprites('asrielSilhouette');
            break;
        default:
            swapSprites('asriel');
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
//    PLAYER INPUT                                                                            //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
new XInput({ codes: ['c', 'C', 'Control'] }).on('down', () => {
    global.interact || atlas.navigate('menu');
});
new XInput({ codes: ['z', 'Z', 'Enter'] }).on('down', () => {
    if (!global.interact) {
        let check = true;
        detector.on('tick').then(([door]) => {
            X.pause().then(() => (check = false));
            if (check && door.metadata.interact && door.detect(renderer, player).length > 0) {
                switch (door.metadata.action) {
                    case 'save':
                        atlas.switch('save');
                        break;
                }
            }
        });
    }
    atlas.navigator() && atlas.navigate('next');
});
const downKey = new XInput({ codes: ['s', 'S', 'ArrowDown'] }).on('down', () => {
    atlas.navigator() && atlas.seek({ y: 1 });
});
const leftKey = new XInput({ codes: ['a', 'A', 'ArrowLeft'] }).on('down', () => {
    atlas.navigator() && atlas.seek({ x: -1 });
});
const rightKey = new XInput({ codes: ['d', 'D', 'ArrowRight'] }).on('down', () => {
    atlas.navigator() && atlas.seek({ x: 1 });
});
const specialKey = new XInput({ codes: ['x', 'X', 'Shift'] }).on('down', () => {
    atlas.navigator() && atlas.navigate('prev');
});
const upKey = new XInput({ codes: ['w', 'W', 'ArrowUp'] }).on('down', () => {
    atlas.navigator() && atlas.seek({ y: -1 });
});
SAVE.name = 'Player';
atlas.switch(SAVE.name ? 'menyoo' : 'nastie');
////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
//    TRUE MOMENT #61502983650192873650912873659018723654028937650291386502913865910238765    //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
// wait for initial teleport to overworld
await game.on('teleport');
// enable player movement
renderer.on('tick', () => {
    if (global.interact) {
        player.walk({ x: 0, y: 0 }, renderer, () => false);
    }
    else {
        const y = player.position.y;
        player.walk({
            x: (leftKey.active() ? -3 : rightKey.active() ? 3 : 0) * (specialKey.active() ? 2 : 1),
            y: (upKey.active() ? -3 : downKey.active() ? 3 : 0) * (specialKey.active() ? 2 : 1)
        }, renderer, hitbox => hitbox.metadata.barrier === true);
        if (upKey.active() && downKey.active() && y === player.position.y) {
            player.position.y += 1;
            player.face('down');
        }
    }
});
// enable menu
atlas.menu = 'sidebar';
//# sourceMappingURL=index.js.map