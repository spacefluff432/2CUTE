export const player = {
    asriel: {
        down: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.image('assets/image/players/asriel/asriel-down-0.png'),
                await X.image('assets/image/players/asriel/asriel-down-1.png'),
                await X.image('assets/image/players/asriel/asriel-down-0.png'),
                await X.image('assets/image/players/asriel/asriel-down-2.png')
            ]
        }),
        left: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.image('assets/image/players/asriel/asriel-left-0.png'),
                await X.image('assets/image/players/asriel/asriel-left-1.png'),
                await X.image('assets/image/players/asriel/asriel-left-0.png'),
                await X.image('assets/image/players/asriel/asriel-left-2.png')
            ]
        }),
        right: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.image('assets/image/players/asriel/asriel-right-0.png'),
                await X.image('assets/image/players/asriel/asriel-right-1.png'),
                await X.image('assets/image/players/asriel/asriel-right-0.png'),
                await X.image('assets/image/players/asriel/asriel-right-2.png')
            ]
        }),
        up: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.image('assets/image/players/asriel/asriel-up-0.png'),
                await X.image('assets/image/players/asriel/asriel-up-1.png'),
                await X.image('assets/image/players/asriel/asriel-up-0.png'),
                await X.image('assets/image/players/asriel/asriel-up-2.png')
            ]
        })
    },
    asrielSilhouette: {
        down: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.bitmap('assets/image/players/asriel/asriel-down-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-down-1.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-down-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-down-2.png', color => [0, 0, 0, color[3]])
            ]
        }),
        left: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.bitmap('assets/image/players/asriel/asriel-left-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-left-1.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-left-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-left-2.png', color => [0, 0, 0, color[3]])
            ]
        }),
        right: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.bitmap('assets/image/players/asriel/asriel-right-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-right-1.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-right-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-right-2.png', color => [0, 0, 0, color[3]])
            ]
        }),
        up: new XSprite({
            anchor: { x: 0, y: 1 },
            step: 3,
            steps: 6,
            textures: [
                await X.bitmap('assets/image/players/asriel/asriel-up-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-up-1.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-up-0.png', color => [0, 0, 0, color[3]]),
                await X.bitmap('assets/image/players/asriel/asriel-up-2.png', color => [0, 0, 0, color[3]])
            ]
        })
    }
};
export const backgrounds = {
    castleRoad: await X.image('assets/image/backgrounds/castle-road.png'),
    lastCorridor: await X.image('assets/image/backgrounds/last-corridor.png'),
    castleHook: await X.image('assets/image/backgrounds/castle-hook.png'),
    coffinStairs: await X.image('assets/image/backgrounds/coffin-stairs.png'),
    coffinRoom: await X.image('assets/image/backgrounds/coffin-room.png')
};
export const sprites = {
    menu: await X.image('assets/image/sprites/misc/menu.png'),
    pillar: await X.image('assets/image/sprites/misc/pillar.png'),
    save: [
        await X.image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAABHNCSVQICAgIfAhkiAAAAJVJREFUOE/Fk1sOwCAIBLEH6P3P2QvYgI8QBdm0JvbTLpMBlAj7MhYjutAgmkOAOT+CgywRIConuRSkm10J33HNdsOzQLUcXpC5JGuGPVgB7phTmWn7LywNFFAE8egNzsDPIMiwGaxMFWga2XSgWjLNK8ytW10bLkpDW94I+/kKGBb/CfATdO+eBh8zZAnzZYxtbzd8AcogIfTBlJSgAAAAAElFTkSuQmCC'),
        await X.image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAAABHNCSVQICAgIfAhkiAAAAGlJREFUGFeNUIENwCAIgx2w/+/cA8xWIcUty5oYkRaomJnFOH8QLmLEO1qjA2xc1IBQMpBfHHjPbiSYOee9vanT0VUw5VVYGtpY8OwquRaq+KGRv5B7tfHlG0Xwm9toGwGXR/e8T+JoQdyraSjCsdP8kAAAAABJRU5ErkJggg==')
    ]
};
function reverb(context, input, output, mix, seconds, ...points) {
    // impulse setup
    let index = -1;
    const size = context.sampleRate * seconds;
    const impulse = context.createBuffer(2, size, context.sampleRate);
    const channels = new Array(impulse.numberOfChannels).fill(0).map((x, index) => impulse.getChannelData(index));
    while (++index < size) {
        for (const channel of channels) {
            channel[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...points);
            channel[index] = (Math.random() * 2 - 1) * X.math.bezier(index / size, ...points);
        }
    }
    // nodes
    const wetNode = context.createGain();
    const dryNode = context.createGain();
    const convolver = context.createConvolver();
    // routing
    input.connect(convolver).connect(wetNode).connect(output);
    input.connect(dryNode).connect(output);
    // mix
    wetNode.gain.value = mix;
    dryNode.gain.value = 1 - mix;
    convolver.buffer = impulse;
}
export const sounds = {
    menu: new XPlayer({
        buffer: await X.buffer('assets/audio/sfx/menu.wav'),
        volume: 0.5,
        router: (context, source) => reverb(context, source, context.destination, 0.1, 0.25, 1, 0, 0)
    }),
    heal: new XPlayer({
        buffer: await X.buffer('assets/audio/sfx/heal.wav'),
        volume: 0.25,
        router: (context, source) => reverb(context, source, context.destination, 0.1, 0.5, 1, 1, 0)
    }),
    save: new XPlayer({
        buffer: await X.buffer('assets/audio/sfx/save.wav'),
        volume: 0.25,
        router: (context, source) => reverb(context, source, context.destination, 0.1, 0.5, 1, 1, 0)
    }),
    select: new XPlayer({
        buffer: await X.buffer('assets/audio/sfx/select.wav'),
        volume: 0.5,
        router: (context, source) => reverb(context, source, context.destination, 0.1, 0.25, 1, 0, 0)
    }),
    box: new XPlayer({
        buffer: await X.buffer('assets/audio/sfx/box.wav'),
        volume: 0.25,
        router: (context, source) => reverb(context, source, context.destination, 0.1, 0.25, 1, 0, 0)
    })
};
//# sourceMappingURL=assets.js.map