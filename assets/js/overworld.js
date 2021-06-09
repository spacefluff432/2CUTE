import { throneRoom, next } from './rooms.js';
const baseSpeed = 3;
export const overworld = new XOverworld({
    // load 2 canvas elements
    background: new XRenderer({ canvas: canvas1, size: { x: 320, y: 240 } }),
    foreground: new XRenderer({ canvas: canvas2, size: { x: 320, y: 240 } }),
    keys: {
        u: new XKey('w', 'W', 'ArrowUp'),
        l: new XKey('a', 'A', 'ArrowLeft'),
        d: new XKey('s', 'S', 'ArrowDown'),
        r: new XKey('d', 'D', 'ArrowRight'),
        z: new XKey('z', 'Z', 'Enter'),
        x: new XKey('x', 'X', 'Shift'),
        c: new XKey('c', 'C', 'Control')
    },
    // room to load on start
    room: throneRoom,
    speed: baseSpeed,
    sprites: {
        u: new XSprite({
            attributes: { persist: true },
            steps: 10,
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
            steps: 10,
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
            steps: 10,
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
            steps: 10,
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
// handle room-to-room teleport triggers
overworld.on('trigger', ({ metadata }) => {
    console.log(metadata);
    if (metadata.key === 'door') {
        switch (metadata.destination) {
            case 'throneRoom':
                overworld.room = throneRoom;
                overworld.room.player.position = { x: 100, y: 470 };
                break;
            case 'next':
                overworld.room = next;
                overworld.room.player.position = { x: 0, y: 30 };
                break;
            default:
                return;
        }
        overworld.render();
    }
});
// maps 'x' key as a sprint key
overworld.keys.x.on('down', () => overworld.keys.x.active && (overworld.speed = baseSpeed * 1.5));
overworld.keys.x.on('up', () => overworld.keys.x.active || (overworld.speed = baseSpeed));
// auto resizer
overworld.update(innerHeight, innerWidth);
addEventListener('resize', () => {
    overworld.update(innerHeight, innerWidth);
});
// render at ~30FPS
XCore.ready(() => setInterval(() => overworld.render(), 1e3 / 30));