"use strict";
// overworld layer
const overworld = new XOverworld({
    // main renderer + other layers
    layers: {
        background: new XRenderer(),
        foreground: new XRenderer({ attributes: { animate: true } }),
        overlay: new XRenderer()
    },
    // rooms in the overworld
    rooms: {
        battle: new XRoom({
            bounds: { x: 160, y: 120, h: 0, w: 0 },
            entities: [
                // FIGHT button
                new XEntity({
                    renderer: 'foreground',
                    depth: -1,
                    position: { x: 15.5, y: 3 },
                    sprite: GAME.battle.buttons.fight
                }),
                // ACT button
                new XEntity({
                    renderer: 'foreground',
                    depth: -1,
                    position: { x: 93, y: 3 },
                    sprite: GAME.battle.buttons.act
                }),
                // ITEM button
                new XEntity({
                    renderer: 'foreground',
                    depth: -1,
                    position: { x: 171.5, y: 3 },
                    sprite: GAME.battle.buttons.item
                }),
                // MERCY button
                new XEntity({
                    renderer: 'foreground',
                    depth: -1,
                    position: { x: 250, y: 3 },
                    sprite: GAME.battle.buttons.mercy
                })
            ],
            player: new XEntity()
        }),
        throneRoom: new XRoom({
            bounds: { x: 160, y: 120, h: 380, w: 0 },
            entities: [
                // room walls
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 60, w: 20, x: 120, y: 0 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                helper.wallEntity({ h: 60, w: 20, x: 180, y: 0 }),
                helper.wallEntity({ h: 20, w: 40, x: 100, y: 60 }),
                helper.wallEntity({ h: 20, w: 40, x: 60, y: 80 }),
                helper.wallEntity({ h: 20, w: 40, x: 180, y: 60 }),
                helper.wallEntity({ h: 20, w: 40, x: 220, y: 80 }),
                helper.wallEntity({ h: 20, w: 20, x: 40, y: 100 }),
                helper.wallEntity({ h: 320, w: 20, x: 20, y: 120 }),
                helper.wallEntity({ h: 320, w: 20, x: 280, y: 120 }),
                helper.wallEntity({ h: 20, w: 20, x: 260, y: 100 }),
                helper.wallEntity({ h: 40, w: 20, x: 40, y: 440 }),
                helper.wallEntity({ h: 40, w: 20, x: 260, y: 440 }),
                helper.wallEntity({ h: 20, w: 20, x: 60, y: 480 }),
                helper.wallEntity({ h: 20, w: 120, x: 140, y: 480 }),
                helper.wallEntity({ h: 45, w: 70, x: 210, y: 120 }),
                helper.wallEntity({ h: 65, w: 45, x: 140, y: 360 }),
                // room backgrounds
                new XEntity({
                    renderer: 'background',
                    sprite: helper.staticSprite('assets/game/backgrounds/throne-room.png')
                }),
                // room overlays
                new XEntity({
                    renderer: 'overlay',
                    sprite: helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
                }),
                new XEntity({
                    renderer: 'overlay',
                    sprite: helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
                }),
                // trivia interactions
                new XEntity({
                    attributes: { interact: true },
                    bounds: { h: 55, w: 80 },
                    metadata: {
                        key: 'dialogue',
                        dialogue: [
                            '[interval:75|sound:asgore|sprite:happygore]',
                            '* Greetings.',
                            '* You have made yourself{|}{<i}completely{>} clear.',
                            '* I, {^4}your humble servant,{|}{^4}will follow you to the{|}utmost.{^2}.{^2}.{^2}'
                        ]
                    },
                    position: { x: 205, y: 115 }
                }),
                new XEntity({
                    attributes: { interact: true },
                    bounds: { h: 75, w: 55 },
                    metadata: {
                        key: 'dialogue',
                        dialogue: [
                            '[interval:75|sound:asgore|sprite:happygore]',
                            "It's me, ASGORE!",
                            '[interval:50|sound:toriel|sprite:susriel]',
                            "It's me, TORIEL.",
                            '[interval:75|sound:asgore|sprite:happygore]',
                            '.{^4}.{^4}.'
                        ]
                    },
                    position: { x: 135, y: 355 }
                }),
                // room teleportation framework
                new XEntity({ metadata: { key: 'origin' }, position: { x: 150 } }),
                new XEntity({
                    attributes: { trigger: true },
                    bounds: { h: 20, w: 60 },
                    metadata: { key: 'teleport:battle' },
                    position: { x: 80, y: 480 }
                })
            ]
        }),
        nextRoom: new XRoom({
            entities: [
                new XEntity({
                    attributes: { trigger: true },
                    bounds: { h: 20, w: 20 },
                    renderer: 'background',
                    metadata: { key: 'door-to', room: 'throneRoom' },
                    sprite: helper.staticSprite(
                    // spr_doorX
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAK1JREFUOE+9k0sOgCAMRNG4ceG1PLTXcsESFcE0MFMaNbgy/TymUxic88H9+E2cNQ88xzI+JOCbZgwdcfh9tANwX+1LArV4Kblw2fBiAEiYRK7N1YQaWTwSfeAeZnUS2lJ+Is+RLoXKtSlVMhuaCrMpEqDC7gY+snD5+S3Vgpo2sPStDe2x5VKVHA1tX+T5yNoCdCgZGRhehSo/I+sDsDpBeylVsS2QXoqt2FJ1APetUyiAm0/IAAAAAElFTkSuQmCC')
                }),
                new XEntity({
                    metadata: { key: 'door-from', room: 'throneRoom' },
                    position: { x: 0, y: 30 }
                })
            ]
        })
    },
    // game size
    size: { x: 320, y: 240 },
    wrapper: document.body
});
// maps 'x' key as a sprint key
special.on('up', () => (overworld.speed = GAME.speed));
special.on('down', () => (overworld.speed = GAME.speed * 1.5));
// teleport to battler
overworld.on('teleport-to', room => room === 'battle' && overworld.navigate('menu'));
// load into room
overworld.teleport(SAVE.room);
overworld.state.movement = true;
// player
// overworld movement handler
overworld.on('tick', () => {
    const step = GAME.step;
    const room = overworld.room;
    if (room && !GAME.interact) {
        const queue = new Set();
        const origin = Object.assign({}, player.position);
        const moveUp = up.active;
        const moveLeft = left.active;
        const moveDown = down.active;
        const moveRight = right.active;
        if (moveLeft || moveRight) {
            player.position.x -= moveLeft ? step : -step;
            const collisions = X.intersection(X.bounds(player), ...room.collidables);
            if (collisions.size > 0) {
                player.position = Object.assign({}, origin);
                let index = 0;
                let collision = false;
                while (!collision && ++index < step) {
                    player.position.x -= moveLeft ? 1 : -1;
                    collision = X.intersection(X.bounds(player), ...collisions).size > 0;
                }
                collision && (player.position.x += moveLeft ? 1 : -1);
                for (const entity of collisions)
                    queue.add(entity);
            }
        }
        if (moveUp || moveDown) {
            const origin = Object.assign({}, player.position);
            player.position.y += moveUp ? step : -step;
            const collisions = X.intersection(X.bounds(player), ...room.collidables);
            if (collisions.size > 0) {
                player.position = Object.assign({}, origin);
                let index = 0;
                let collision = false;
                while (!collision && ++index < step) {
                    player.position.y += moveUp ? 1 : -1;
                    collision = X.intersection(X.bounds(player), ...collisions).size > 0;
                }
                collision && (player.position.y -= moveUp ? 1 : -1);
                for (const entity of collisions)
                    queue.add(entity);
                // TEH FRISK DANCE
                if (collision && index === 1 && moveUp && moveDown) {
                    player.position.y -= 2;
                }
            }
        }
        if (player.position.x < origin.x) {
            player.sprite = sprites.left;
            sprites.left.enable();
        }
        else if (player.position.x > origin.x) {
            player.sprite = sprites.right;
            sprites.right.enable();
        }
        else {
            sprites.left.disable();
            sprites.right.disable();
            if (moveLeft) {
                player.sprite = sprites.left;
            }
            else if (moveRight) {
                player.sprite = sprites.right;
            }
            if (moveUp) {
                player.sprite = sprites.up;
            }
            else if (moveDown) {
                player.sprite = sprites.down;
            }
        }
        if (player.position.y > origin.y) {
            player.sprite = sprites.up;
            sprites.up.enable();
        }
        else if (player.position.y < origin.y) {
            player.sprite = sprites.down;
            sprites.down.enable();
        }
        else {
            sprites.up.disable();
            sprites.down.disable();
        }
        for (const entity of queue)
            overworld.fire('collide', entity);
        for (const entity of X.intersection(X.bounds(player), ...room.triggerables))
            overworld.fire('trigger', entity);
        if (player.position.x !== origin.x || player.position.y !== origin.y)
            overworld.render();
    }
    else {
        sprites.up.disable();
        sprites.left.disable();
        sprites.down.disable();
        sprites.right.disable();
    }
});
// activate overworld & render at ~30FPS
X.ready(() => setInterval(() => overworld.tick(), 1e3 / 30));
// testie
Object.assign(window, { helper, GAME, overworld });
/*
seaTea: {
   name: 'Sea Tea',
   blurb: '* Sea Tea - Heals 14 HP{^4}{|}* Idk wtf to put on this{|}second line!',
   use: '* You drank the Sea Tea.',
   discard: '* You threw away the Sea Tea.'
}
*/
