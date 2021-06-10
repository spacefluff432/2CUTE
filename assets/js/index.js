// mimic undertale env
const game = {
    speed: 3,
    state: { interact: false, soul: 'determination', menu: 'none' },
    souls: {
        determination: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heart_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heart_0.png'
                })
            ]
        }),
        bravery: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartorange_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartorange_0.png'
                })
            ]
        }),
        justice: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartyellow_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartyellow_0.png'
                })
            ]
        }),
        kindness: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartgreen_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartgreen_0.png'
                })
            ]
        }),
        patience: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartaqua_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartaqua_0.png'
                })
            ]
        }),
        integrity: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartblue_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartblue_0.png'
                })
            ]
        }),
        perserverance: new XSprite({
            attributes: { persist: true },
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartpurple_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_heartpurple_0.png'
                })
            ]
        })
    },
    get interact() {
        return game.state.interact;
    },
    set interact(value) {
        game.state.interact = value;
        if (value) {
            overworld.disable();
        }
        else {
            overworld.enable();
        }
    },
    get soul() {
        //@ts-expect-error
        return game.souls[game.state.soul];
    },
    door(to, from) {
        overworld.state.room = to;
        for (const { metadata: { key, room }, position } of overworld.room.entities) {
            if (from ? key === 'door-from' && room === from : key === 'origin') {
                overworld.player.position = position;
                break;
            }
        }
        overworld.render();
    }
};
const renderer = new XRenderer({ canvas: canvas2, size: { x: 320, y: 240 }, attributes: { animate: true } });
const overworld = new XOverworld({
    // player movement keys
    keys: {
        u: new XKey('w', 'W', 'ArrowUp'),
        l: new XKey('a', 'A', 'ArrowLeft'),
        d: new XKey('s', 'S', 'ArrowDown'),
        r: new XKey('d', 'D', 'ArrowRight'),
        z: new XKey('z', 'Z', 'Enter'),
        x: new XKey('x', 'X', 'Shift'),
        c: new XKey('c', 'C', 'Control')
    },
    layers: {
        below: new XRenderer({ canvas: canvas1, size: renderer.size }),
        default: renderer,
        above: new XRenderer({ canvas: canvas3, size: renderer.size })
    },
    // player entity
    player: new XEntity({
        attributes: { collide: true },
        bounds: { h: 5, w: 20 },
        layer: 'default',
        // spr_maincharad_1
        sprite: X.helper.staticSprite('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='),
        position: { x: 150, y: 0 }
    }),
    rooms: {
        throneRoom: new XRoom({
            entities: [
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 60, w: 20, x: 120, y: 0 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 140, y: -20 }),
                X.helper.wallEntity({ h: 60, w: 20, x: 180, y: 0 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 100, y: 60 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 60, y: 80 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 180, y: 60 }),
                X.helper.wallEntity({ h: 20, w: 40, x: 220, y: 80 }),
                X.helper.wallEntity({ h: 20, w: 20, x: 40, y: 100 }),
                X.helper.wallEntity({ h: 320, w: 20, x: 20, y: 120 }),
                X.helper.wallEntity({ h: 320, w: 20, x: 280, y: 120 }),
                X.helper.wallEntity({ h: 20, w: 20, x: 260, y: 100 }),
                X.helper.wallEntity({ h: 40, w: 20, x: 40, y: 440 }),
                X.helper.wallEntity({ h: 40, w: 20, x: 260, y: 440 }),
                X.helper.wallEntity({ h: 20, w: 20, x: 60, y: 480 }),
                X.helper.wallEntity({ h: 20, w: 120, x: 140, y: 480 }),
                X.helper.wallEntity({ h: 45, w: 70, x: 210, y: 120 }),
                X.helper.wallEntity({ h: 65, w: 45, x: 140, y: 360 }),
                new XEntity({
                    layer: 'below',
                    sprite: X.helper.staticSprite('assets/game/backgrounds/throne-room.png')
                }),
                new XEntity({
                    layer: 'above',
                    sprite: X.helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
                }),
                new XEntity({
                    layer: 'above',
                    sprite: X.helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
                }),
                new XEntity({
                    attributes: { interact: true },
                    bounds: { h: 55, w: 80 },
                    metadata: {
                        key: 'trivia',
                        trivia: [
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
                        key: 'trivia',
                        trivia: [
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
                new XEntity({ metadata: { key: 'origin' }, position: { x: 150 } }),
                new XEntity({
                    attributes: { trigger: true },
                    bounds: { h: 20, w: 60 },
                    metadata: { key: 'door-to', room: 'nextRoom' },
                    position: { x: 80, y: 480 }
                }),
                new XEntity({
                    metadata: { key: 'door-from', room: 'nextRoom' },
                    position: { x: 100, y: 470 }
                })
            ]
        }),
        nextRoom: new XRoom({
            entities: [
                new XEntity({
                    attributes: { trigger: true },
                    bounds: { h: 20, w: 20 },
                    layer: 'below',
                    metadata: { key: 'door-to', room: 'throneRoom' },
                    sprite: X.helper.staticSprite('https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_doorX.png')
                }),
                new XEntity({
                    metadata: { key: 'door-from', room: 'throneRoom' },
                    position: { x: 0, y: 30 }
                })
            ]
        })
    },
    // player movement speed
    speed: game.speed,
    // player movement sprites
    sprites: {
        u: new XSprite({
            attributes: { persist: true },
            interval: 5,
            textures: [
                // spr_maincharau_3
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
                }),
                // spr_maincharau_0
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAS1JREFUSEvllLENwjAQRZ2IDomCgiEosgHpMwFbZAdWoGcAJqCHipaCGRAFBRJ14Bx953I+R4a4w1Kk5Pv87t/ZcWaUsZrPGkXuSafHM5MxnhADAkQCe7BvQBrQwX4BSWBOwhgQ75uFjR0wkwQGM3mqEgmYpYSlLXNs8/n6f3GGn1X+tLG9DK6Xx4S+m3P7yDktmXcFUdDQwqEKJjwDhyy3Fy25MXXhLk4JdkeDQAAEQR88j5EV2DIButaF2b/uuiOmrqcL+0VgWgOHDobYIVc8C0EwAHM9Ox7aqbKKdWcMrSmrLkVvAyBvdjduQn+vWxDfBAdDhtgyKYO6myTyCeoHesLfdYud6h1aud2UBBpc8x3kCdSehRzArSwP8d59pgVqWiihqlNpsmQ1kIlvB+iFpV3zlP4AAAAASUVORK5CYII='
                }),
                // spr_maincharau_1
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
                }),
                // spr_maincharau_2
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAThJREFUSEvllbENwkAMRS8RHRIFBWIGimxA+kzAAPRZAbECPQMwAT1UtBTMgCgoIlEH/kU+HMcXArmOkyIlPvv523EukVHWfDwqFXPNdLwXkfRpGLqACCKBNdg3IA3oYL+AJDCGoQ+I983C+i4SEwRGYuJQJQIYhYSFLbNv83n8vyijj1V+tF176Y2XY4Ln8lRdck9L1jiC4NQW2FbBgGfgkNnmrCU3Jk/cwSnBbjQAIoAX9MJzH1mBLZNAlzyxanaPm66KWRfDiQUjhhQ6GPm1qeIZKDFsBHM9O+yNSTNjVstpJ1Xwx0IMLQsDOc2qP9J6e33v+u5yfcO9APlmdPfKilZAEVeFndpoaADqDTUbPtRXKaAxtHxECIQgOQYSpCqzTmwwNbU+28fzTFOg2XwJVDvKlKVKxycH84NQduLeYQAAAABJRU5ErkJggg=='
                })
            ]
        }),
        l: new XSprite({
            attributes: { persist: true },
            interval: 5,
            textures: [
                // spr_maincharal_1
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAUpJREFUOE+dla8SwjAMxjtud7gJHgMxiwLPk+D2DnsFPI53wIPCItAoDoWYwo1+GRlpl3Z/etcbzZJfviTdkRhvrRdZ7dv88+VdJdLWHoYEy0AJIshYAMMYlEwFSNDMr3fK2YGcTw2Cn0OAqGTmd5oDx4BaJVNUcMJBPUGCmDIHkqwqgy1XLJj9UjSGHetrFuzlZht8ZaLlMDwGAJogWhmctw+A6dKIbUkmVopWSOfbgZN2/f1yfgnr0N3qJAPUqqOtJZABaSdaGPr6wa7qdGTm5f5GvjE1HSVw5kCpkmxFPqwfgDznH9r4vTs+6MlnrXxHCasozavxLf4h5cHaxFmDtXWzCs4M8CglIFFGu+5F3n65mFJMiTqdoNTACweCmwgFWJgGFGBr05I850+IX2hjBjx03YMQTfkoCABQI0EhAHzUxvoATZW0fQEX+6GEG5dAKAAAAABJRU5ErkJggg=='
                }),
                // spr_maincharal_0
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAUlJREFUOE+dlT1OAzEQhb1RJAqkFCk4BEVaKtLnBByBLnfgCvR03IEeKloKaipERZGKbpM34UXP41nHu5YsZ8Yz3/w52i65dbtc9F7n5bffXae6k9DirI4KMshYAGEEdVMBCpr5eqfIGeT15Yjg2QJEJTPfaTqOAZ0ymZIFAzb1BAFqmWWQ9SYlbF01Z9rN0ZiWUjxcA1XLIbwGAMwg3c3OdrTOATBdG/GhpNS/LyLGoK7478Ayev6+nP+A/dDbKiICesjOdhRAHeaFtyjO9YOm4XQ08vXjh9nWsikygTEdNUvTbVdt/QDk++LPNn7fP3/ZSTkqPyuHWTw8/aS7y6vMHrqmpRF1MqMyQaQoIvoR6ZlZ0VhcwGm9WZlN1GQ688y+H1AOTedze4RGrzX7ZPBZM4KXVa/Z2HRIRxZ6qXder3JWjkKGwFE5ezNvqn9yAFg7AAAAAElFTkSuQmCC'
                })
            ]
        }),
        d: new XSprite({
            attributes: { persist: true },
            interval: 5,
            textures: [
                // spr_maincharad_3
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
                }),
                // spr_maincharad_0
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAW1JREFUSEudlDFOAzEQRXcjOiQKiogzUNBSkT4n4ADpcwWUK9BzAE5ADxUtBWdAFBSRUif6S775/jNOwq600vp75vmPPeu+S567y4ttIlfS28+695ggnAIixIEV7D+gDFhgY0AOnHjdY8Y0MsDc1etLRGaaRwVnTNJkB/mY0GHP1Fkr0F1gPJvX6sRLzJIOabp4KBOJ/e16eP1x3avox5bIhbTU1Jk6cjc653tWOUOgW/dSMXYIYwKMEy1oC4S80hr4aVsnS3AGYp7/9FlFQw9u339fX8zH4QpSogfrXOYkwBRw/fjRfS5vCgNjPKopNNxnBDAxrX0PZCyB1X2mTp433y1O0e/Pp50C08vxmCvSvNwzXR4tgON/WFyd5MpbpoKxj1ZPX0dh3TKGFBg3UU8zO0kisBWz+d9JQ6+c6VoKgs6x76e2Rrg1MOkgwLxJEeNaaFq68+5HYqZpNcGZTvLbHWROs7yDGpy5O03YATpFr1NIbGXnAAAAAElFTkSuQmCC'
                }),
                // spr_maincharad_1
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
                }),
                // spr_maincharad_2
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAV1JREFUSEudlLENwkAMRRNEh0RBwRAUaamgZwK2YAdWoGcAJqCHipaCGRAFBRJ1kA/+4fv2JZBIkWKf/fx9OV9ZOM9sNKwdd+I63h8lxxjHLyBAGJjA/gF5wAjrAmJgj/vuYkNIgLGqw94iPR9HGWVI0skMYhvQsGdaWS6QVYg9X6TeHrfoJTX5dHHTpiSW00d4+WE/d1F2bRGFdKuuMq2I1eg13rNEmQSydG5VbIYgxsCwkIPmQJIXj4YMbe7PAuyBkMdD73UUzmB9er9cjG1zBWkiB+s1T4mBacBkcw75l1UVOeLTtoaa+wzBALm9fwogFsDkPsPi7nnLMaJ/ORiHbw10L8c2VSByu30t4XsEquI3de9DjiOTwDR4vb22tlqs0mlIYKjgtcl/FJX034yDLk7v7AhEgwTCNsDm1hAgB+eKsD+7ZwzkDWSQrBtl4vQCPR8XaLRltJrmk5Nfw8euDoBua0sAAAAASUVORK5CYII='
                })
            ]
        }),
        r: new XSprite({
            attributes: { persist: true },
            interval: 5,
            textures: [
                // spr_maincharar_1
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAU1JREFUOE+dk6FywzAMhp1c78YCBvYQAaFDK8+TjOUd9grlZX2H8RaVFgwP7YYGgsY6/+4pUf5JSVzf+WLZ8qdfklMEGi+P1ZX32D799IXemxhrAPqywAZILkBgACXIvQABlZzvPXaZo+L4fgsh32wlfFHXJDsdS40LgbMXnevmQsSRQcVzHzD1cCHbluPd7Ou5CpgYCIDGuBA4CYjVML7k/4AdPEU6rUHJEozhSCmmEoZnrx2QIw7kEUoqlqJVgQGKEdOce9kblsm2pYB93O5I5Hp3Ge54akwlcMblj65JAA0KXZNqxmr+2YB8PfymOrwePtMXtuzxBVMJnN723yF0o3uy46hDTG+NGq0Ea63EUrOoZHwnT2NtlEKoc7szJrK8cpWk/GOHtu20Q+gYd8dtlbRZ67AAOJ+FWImwilkIDqFGgywAzrMKy1AJ8Ad1T6Lpdej7dAAAAABJRU5ErkJggg=='
                }),
                // spr_maincharar_0
                new XTexture({
                    source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAT1JREFUOE+dkyEOwlAQRH8JCYIEgeAQCG4AnhNwBBx34Ap4HHfAg8Ii0CiCQqBwJVOYZjvsNi1Nmnb3776dP7/NklzT4SDXnMbHxzOzuUrQBGCbCSshbQGEAVRA/gUQ1NH9/hN32qg47D8j+GytRButJ62346kJISiOpqtvIYSFCprNU8Jtr6zOWALQpDBCsFarhBMjAEGNPjYPYrdUKtGfSs3TmODys7cF8AgL9Mr6oqBGgwHKT5+77gC6StdYj1PXEYenw8njzbnsi9S4SlCM5stqUgAsKK0mhWeeokoOkFvvleO53F2LJ2LmFBBuZ729V2oX/VFCDqqibYVK0GBPyFNTq6TixXeMKkTaNdbKAmg2dww2Ra7L3vGyByemp/MD8UyzvwFgNsZ76Akn61TkOYhrP0pskYKsSgt/A2WJpvMoRDPiAAAAAElFTkSuQmCC'
                })
            ]
        })
    }
});
// dialogue controller
export const dialogue = new XDialogue({
    sprites: {
        happygore: new XSprite({
            attributes: { persist: true },
            interval: 10,
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_asgore_face0_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_asgore_face0_0.png'
                })
            ]
        }),
        susriel: new XSprite({
            attributes: { persist: true },
            interval: 10,
            textures: [
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_face_torieltalk_1.png'
                }),
                new XTexture({
                    source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_face_torieltalk_0.png'
                })
            ]
        })
    },
    sounds: {
        asgore: new XSound({
            source: 'assets/game/voices/asgore.wav'
        }),
        toriel: new XSound({
            source: 'assets/game/voices/toriel.wav'
        })
    },
    interval: 50
});
const dialogueText = document.createElement('x-item');
const dialogueMenu = new XItem({
    children: [
        new XItem({
            element: () => {
                const sprite = dialogue.sprite;
                if (sprite) {
                    const texture = sprite.compute();
                    if (texture) {
                        return texture.image;
                    }
                }
            },
            style: {
                gridArea: 'face',
                width: () => truePX(50),
                height: () => truePX(50),
                margin: () => truePX(10)
            }
        }),
        new XItem({
            element: dialogueText,
            style: {
                cssText: () => `--x-size: ${canvas2.height / 15}px`,
                color: '#ffffffff',
                fontSize: 'calc(var(--x-size) * 0.9)',
                lineHeight: 'var(--x-size)',
                margin: 'calc(var(--x-size) / 2)'
            }
        })
    ],
    style: {
        position: 'absolute',
        left: () => truePX(16),
        width: () => truePX(283),
        top: () => truePX(160),
        height: () => truePX(70),
        color: '#ffffffff',
        backgroundColor: '#000000ff',
        fontSize: () => truePX(20),
        border: () => `${truePX(3)} solid #ffffffff`,
        gridTemplateAreas: "'face text'",
        gridTemplateColumns: () => `${truePX(70)} 1fr`,
        display: 'none'
    }
});
function truePX(position) {
    return `${position * renderer.state.scale}px`;
}
// sidebar selector menu
let sidebarIndex = 0;
const sidebarOptions = ['ITEM', 'STAT', 'CELL'];
const sidebarMenu = new XItem({
    style: { display: 'none' },
    children: [
        new XItem({
            style: {
                position: 'absolute',
                left: () => truePX(16),
                width: () => truePX(65),
                top: () => truePX(26),
                height: () => truePX(49),
                border: () => `${truePX(3)} solid #ffffffff`,
                backgroundColor: '#000000ff'
            },
            children: [
                new XItem({
                    style: {
                        width: () => truePX(58),
                        height: () => truePX(53),
                        margin: () => `${truePX(5)} ${truePX(4)}`,
                        marginRight: '0',
                        display: 'grid',
                        gridTemplateRows: () => `${truePX(16)} 1fr`
                    },
                    children: [
                        new XItem({
                            element: (() => {
                                const element = document.createElement('x-item');
                                element.innerHTML = 'Chara';
                                return element;
                            })(),
                            style: {
                                fontSize: () => truePX(15),
                                letterSpacing: () => truePX(-1),
                                marginLeft: () => truePX(-1),
                                lineHeight: () => truePX(9)
                            }
                        }),
                        new XItem({
                            style: {
                                display: 'grid',
                                gridTemplateRows: `1fr 1fr 1fr`,
                                gridTemplateColumns: () => `${truePX(14)} 1fr`,
                                height: () => truePX(23),
                                gap: () => truePX(3),
                                fontFamily: 'Crypt Of Tomorrow',
                                fontSize: () => truePX(7),
                                letterSpacing: () => truePX(0),
                                lineHeight: () => truePX(5)
                            },
                            children: [
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = 'LV';
                                        return element;
                                    })()
                                }),
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = '1';
                                        return element;
                                    })()
                                }),
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = 'HP';
                                        return element;
                                    })()
                                }),
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = '20/20';
                                        return element;
                                    })()
                                }),
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = 'G';
                                        return element;
                                    })()
                                }),
                                new XItem({
                                    element: (() => {
                                        const element = document.createElement('x-item');
                                        element.innerHTML = '66';
                                        return element;
                                    })()
                                })
                            ]
                        })
                    ]
                })
            ]
        }),
        new XItem({
            style: {
                position: 'absolute',
                left: () => truePX(16),
                width: () => truePX(65),
                top: () => truePX(84),
                height: () => truePX(68),
                border: () => `${truePX(3)} solid #ffffffff`,
                backgroundColor: '#000000ff'
            },
            children: [
                new XItem({
                    style: {
                        width: () => truePX(58),
                        height: () => truePX(53),
                        margin: () => truePX(7),
                        marginRight: '0',
                        display: 'grid',
                        gridTemplateRows: `1fr 1fr 1fr`,
                        gap: () => truePX(1)
                    },
                    children: sidebarOptions.map((option, index) => {
                        const optionElement = document.createElement('x-item');
                        optionElement.innerHTML = option;
                        return new XItem({
                            style: {
                                height: '100%',
                                width: '100%',
                                display: 'grid',
                                gridTemplateAreas: "'soul option'",
                                gridTemplateColumns: () => `${truePX(13)} 1fr`,
                                gap: () => truePX(1)
                            },
                            children: [
                                // soul container
                                new XItem({
                                    style: {
                                        gridArea: 'soul',
                                        width: () => truePX(9),
                                        height: () => truePX(9),
                                        margin: () => `${truePX(4)} ${truePX(2)}`
                                    },
                                    element: () => {
                                        if (sidebarIndex === index) {
                                            const texture = game.soul.compute();
                                            if (texture) {
                                                return texture.image;
                                            }
                                        }
                                    }
                                }),
                                // text container
                                new XItem({
                                    element: optionElement,
                                    style: {
                                        gridArea: 'option',
                                        margin: () => `${truePX(4)} ${truePX(2)}`,
                                        fontSize: () => truePX(15),
                                        letterSpacing: () => truePX(-1),
                                        lineHeight: () => truePX(9)
                                    }
                                })
                            ]
                        });
                    })
                })
            ]
        })
    ]
});
// menu container
const menu = new XItem({
    element: menu1,
    children: [/* battleMenu,*/ dialogueMenu, sidebarMenu],
    style: {
        position: 'absolute',
        left: () => `${canvas2.offsetLeft}px`,
        width: () => `${canvas2.width}px`,
        top: () => `${canvas2.offsetTop}px`,
        height: () => `${canvas2.height}px`,
        color: '#ffffffff',
        fontFamily: 'Determination'
    }
});
// overworld extensions
{
    // auto resizer
    overworld.update(innerHeight, innerWidth);
    addEventListener('resize', () => {
        overworld.update(innerHeight, innerWidth);
    });
    // maps 'x' key as a sprint key
    overworld.keys.x.on('down', () => overworld.keys.x.active && (overworld.speed = game.speed * 1.5));
    overworld.keys.x.on('up', () => overworld.keys.x.active || (overworld.speed = game.speed));
    // handle room-to-room teleport triggers
    overworld.on('trigger', ({ metadata: { key, room } }) => {
        switch (key) {
            case 'door-to':
                game.door(room, overworld.state.room);
                break;
        }
    });
}
// overworld menu navigation
{
    // sound that plays when you arrow over an option
    const menuHighlight = new XSound({
        source: 'assets/game/sfx/highlight.mp3'
    });
    // sound that plays when u select option
    const menuSelect = new XSound({
        source: 'assets/game/sfx/select.mp3'
    });
    // maps 'c' key as menu
    overworld.keys.c.on('down', () => {
        if (game.state.menu === 'none') {
            game.interact = true;
            game.state.menu = 'sidebar';
            sidebarMenu.style.display = 'grid';
            //@ts-expect-error
            menuHighlight.audio.cloneNode().play();
            sidebarIndex = 0;
        }
    });
    // maps z key to selection
    overworld.keys.z.on('down', () => {
        switch (game.state.menu) {
            case 'sidebar':
                game.state.menu = 'dialoguer';
                sidebarMenu.style.display = 'none';
                dialogue.add(`[sprite:happygore|speed:200]\nYou selected: ${sidebarOptions[sidebarIndex]}`);
                break;
            default:
                return;
        }
        //@ts-expect-error
        menuSelect.audio.cloneNode().play();
    });
    // allow 'x' key to exit menus
    overworld.keys.x.on('down', () => {
        switch (game.state.menu) {
            case 'sidebar':
                game.state.menu = 'none';
                game.interact = false;
                sidebarMenu.style.display = 'none';
                break;
        }
    });
    // map directional keys to selection
    {
        overworld.keys.d.on('down', () => {
            switch (game.state.menu) {
                case 'sidebar':
                    ++sidebarIndex === sidebarOptions.length && (sidebarIndex = 0);
                    break;
                default:
                    return;
            }
            //@ts-expect-error
            menuHighlight.audio.cloneNode().play();
        });
        overworld.keys.u.on('down', () => {
            switch (game.state.menu) {
                case 'sidebar':
                    --sidebarIndex === -1 && (sidebarIndex = sidebarOptions.length - 1);
                    break;
                default:
                    return;
            }
            //@ts-expect-error
            menuHighlight.audio.cloneNode().play();
        });
    }
}
// menu extensions
{
    // show dialogue box when needed
    dialogue.on('start', () => (dialogueMenu.style.display = 'grid'));
    // close dialogue when done reading and relinquish control
    dialogue.on('stop', () => {
        game.state.menu = 'none';
        dialogueMenu.style.display = 'none';
        setTimeout(() => {
            game.interact = false;
        });
    });
    // get text input
    dialogue.on('text', (text) => {
        dialogueText.innerHTML = text;
    });
}
// overworld dialogue link
{
    // link overworld 'x' key to dialogue skip
    overworld.keys.x.on('down', () => dialogue.fire('skip'));
    // link overworld 'z' key to dialogue advance
    overworld.keys.z.on('down', () => dialogue.advance());
    // overworld trivia handler
    overworld.on('interact', {
        priority: 0,
        script({ metadata }) {
            if (!game.interact) {
                if (metadata.key === 'trivia') {
                    game.interact = true;
                    game.state.menu = 'dialoguer';
                    dialogue.add(...metadata.trivia);
                }
            }
        }
    });
}
// set initial room (todo: use LOAD screen)
overworld.state.room = 'throneRoom';
// activate overworld
overworld.state.active = true;
// render overworld at ~30FPS
X.ready(() => setInterval(() => overworld.tick(), 1e3 / 30));
// refresh all menus at at ~60FPS
X.ready(() => setInterval(() => menu.compute(), 1e3 / 60));
// testie
Object.assign(window, { dialogue, game, overworld });
