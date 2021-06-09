import { player } from './player.js';
import { roomWall, staticSprite } from './helper.js';
export const throneRoom = new XRoom({
    entities: [
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 60, w: 20, x: 120, y: 0 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 20, w: 40, x: 140, y: -20 }),
        roomWall({ h: 60, w: 20, x: 180, y: 0 }),
        roomWall({ h: 20, w: 40, x: 100, y: 60 }),
        roomWall({ h: 20, w: 40, x: 60, y: 80 }),
        roomWall({ h: 20, w: 40, x: 180, y: 60 }),
        roomWall({ h: 20, w: 40, x: 220, y: 80 }),
        roomWall({ h: 20, w: 20, x: 40, y: 100 }),
        roomWall({ h: 320, w: 20, x: 20, y: 120 }),
        roomWall({ h: 320, w: 20, x: 280, y: 120 }),
        roomWall({ h: 20, w: 20, x: 260, y: 100 }),
        roomWall({ h: 40, w: 20, x: 40, y: 440 }),
        roomWall({ h: 40, w: 20, x: 260, y: 440 }),
        roomWall({ h: 20, w: 20, x: 60, y: 480 }),
        roomWall({ h: 20, w: 120, x: 140, y: 480 }),
        roomWall({ h: 45, w: 70, x: 210, y: 120 }),
        roomWall({ h: 65, w: 45, x: 140, y: 360 }),
        new XEntity({
            attributes: { backdrop: true, see: true },
            sprite: staticSprite('assets/game/backgrounds/throne-room.png')
        }),
        new XEntity({
            attributes: { see: true },
            depth: 10,
            sprite: staticSprite('assets/game/backgrounds/throne-room-overlay.png')
        }),
        new XEntity({
            attributes: { see: true },
            depth: 10,
            sprite: staticSprite('assets/game/backgrounds/throne-room-overlay.png')
        }),
        new XEntity({
            attributes: { interact: true },
            bounds: { h: 55, w: 80 },
            metadata: {
                key: 'trivia',
                trivia: [
                    '[speaker:asgore]',
                    '[sprite:happygore]',
                    'boopski.{^4}.{^4}.',
                    'dootski.{^4}.{^4}.',
                    'boopski.{^4}.{^4}.',
                    'cheese!'
                ]
            },
            position: { x: 205, y: 115 }
        }),
        new XEntity({
            attributes: { interact: true },
            bounds: { h: 75, w: 55 },
            metadata: {
                key: 'trivia',
                trivia: [
                    '[speaker:asgore]',
                    '[sprite:happygore]',
                    'TORI!',
                    '[speaker:toriel]',
                    '[sprite:pissed]',
                    'Screw you, {^1}ASGORE.',
                    '[speaker:asgore]',
                    '[sprite:sadgore]',
                    'Tori.{^4}.{^4}.'
                ]
            },
            position: { x: 135, y: 355 }
        }),
        new XEntity({
            attributes: { trigger: true },
            bounds: { h: 20, w: 60 },
            metadata: { key: 'door', destination: 'next' },
            position: { x: 80, y: 480 }
        })
    ],
    player
});
export const next = new XRoom({
    entities: [
        new XEntity({
            attributes: { see: true, trigger: true },
            bounds: { h: 20, w: 20 },
            metadata: { key: 'door', destination: 'throneRoom' },
            sprite: new XSprite({
                attributes: { persist: true },
                textures: [
                    new XTexture({
                        source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_doorX.png'
                    })
                ]
            })
        })
    ],
    player
});
