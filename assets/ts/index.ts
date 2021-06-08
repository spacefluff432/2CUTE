declare const canvas1: HTMLCanvasElement;
declare const canvas2: HTMLCanvasElement;

addEventListener('keydown', event => {
   event.key === 'Tab' && event.preventDefault();
});

function roomWall (bounds: XBounds) {
   return XEntity.of({
      attributes: { collidable: true },
      bounds: { h: bounds.h, w: bounds.w, x: 0, y: 0 },
      position: { x: bounds.x, y: bounds.y }
   });
}

function staticSprite (source: string) {
   return XSprite.of({
      attributes: { persistent: true },
      textures: [ XTexture.of({ source }) ]
   });
}

const player = XEntity.of({
   attributes: { collidable: true, visible: true },
   bounds: { h: 5, w: 20 },
   sprite: XSprite.of({
      attributes: { persistent: true },
      textures: [
         XTexture.of({
            source:
               'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
         })
      ]
   }),
   position: { x: 150, y: 0 }
});

const throneRoomRoom = XRoom.of({
   background: [
      XEntity.of({
         attributes: { visible: true },
         sprite: staticSprite('assets/game/backgrounds/throne-room.png')
      })
   ],
   foreground: [
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
      XEntity.of({
         attributes: { triggerable: true },
         bounds: { h: 20, w: 60 },
         metadata: { key: 'door', destination: 'nextRoom' },
         position: { x: 80, y: 480 }
      }),
      XEntity.of({
         attributes: { interactable: true },
         bounds: { h: 75, w: 55 },
         metadata: { key: 'toriel-throne', interact: 0 },
         position: { x: 135, y: 355 }
      }),
      XEntity.of({
         attributes: { visible: true },
         priority: 10,
         sprite: staticSprite('assets/game/backgrounds/throne-room-overlay.png')
      }),
      XEntity.of({
         attributes: { visible: true },
         priority: 10,
         sprite: staticSprite('assets/game/backgrounds/throne-room-overlay.png')
      })
   ],
   player
});

const nextRoomRoom = XRoom.of({
   foreground: [
      XEntity.of({
         attributes: { visible: true, triggerable: true },
         bounds: { h: 20, w: 20 },
         metadata: { key: 'door', destination: 'throneRoom' },
         sprite: XSprite.of({
            attributes: { persistent: true },
            textures: [
               XTexture.of({
                  source: 'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_doorX.png'
               })
            ]
         })
      })
   ],
   player
});

const overworld = XOverworld.of({
   background: XRenderer.of({ canvas: canvas1, size: { x: 320, y: 240 } }),
   foreground: XRenderer.of({ canvas: canvas2, size: { x: 320, y: 240 } }),
   keys: {
      u: new XKey('w', 'W', 'ArrowUp'),
      l: new XKey('a', 'A', 'ArrowLeft'),
      d: new XKey('s', 'S', 'ArrowDown'),
      r: new XKey('d', 'D', 'ArrowRight'),
      z: new XKey('z', 'Z', 'Enter'),
      x: new XKey('x', 'X', 'Shift'),
      c: new XKey('c', 'C', 'Control')
   },
   room: throneRoomRoom,
   speed: 3,
   sprites: {
      u: XSprite.of({
         attributes: { persistent: true },
         steps: 10,
         textures: [
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAS1JREFUSEvllLENwjAQRZ2IDomCgiEosgHpMwFbZAdWoGcAJqCHipaCGRAFBRJ14Bx953I+R4a4w1Kk5Pv87t/ZcWaUsZrPGkXuSafHM5MxnhADAkQCe7BvQBrQwX4BSWBOwhgQ75uFjR0wkwQGM3mqEgmYpYSlLXNs8/n6f3GGn1X+tLG9DK6Xx4S+m3P7yDktmXcFUdDQwqEKJjwDhyy3Fy25MXXhLk4JdkeDQAAEQR88j5EV2DIButaF2b/uuiOmrqcL+0VgWgOHDobYIVc8C0EwAHM9Ox7aqbKKdWcMrSmrLkVvAyBvdjduQn+vWxDfBAdDhtgyKYO6myTyCeoHesLfdYud6h1aud2UBBpc8x3kCdSehRzArSwP8d59pgVqWiihqlNpsmQ1kIlvB+iFpV3zlP4AAAAASUVORK5CYII='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAThJREFUSEvllbENwkAMRS8RHRIFBWIGimxA+kzAAPRZAbECPQMwAT1UtBTMgCgoIlEH/kU+HMcXArmOkyIlPvv523EukVHWfDwqFXPNdLwXkfRpGLqACCKBNdg3IA3oYL+AJDCGoQ+I983C+i4SEwRGYuJQJQIYhYSFLbNv83n8vyijj1V+tF176Y2XY4Ln8lRdck9L1jiC4NQW2FbBgGfgkNnmrCU3Jk/cwSnBbjQAIoAX9MJzH1mBLZNAlzyxanaPm66KWRfDiQUjhhQ6GPm1qeIZKDFsBHM9O+yNSTNjVstpJ1Xwx0IMLQsDOc2qP9J6e33v+u5yfcO9APlmdPfKilZAEVeFndpoaADqDTUbPtRXKaAxtHxECIQgOQYSpCqzTmwwNbU+28fzTFOg2XwJVDvKlKVKxycH84NQduLeYQAAAABJRU5ErkJggg=='
            })
         ]
      }),
      l: XSprite.of({
         attributes: { persistent: true },
         steps: 10,
         textures: [
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAUpJREFUOE+dla8SwjAMxjtud7gJHgMxiwLPk+D2DnsFPI53wIPCItAoDoWYwo1+GRlpl3Z/etcbzZJfviTdkRhvrRdZ7dv88+VdJdLWHoYEy0AJIshYAMMYlEwFSNDMr3fK2YGcTw2Cn0OAqGTmd5oDx4BaJVNUcMJBPUGCmDIHkqwqgy1XLJj9UjSGHetrFuzlZht8ZaLlMDwGAJogWhmctw+A6dKIbUkmVopWSOfbgZN2/f1yfgnr0N3qJAPUqqOtJZABaSdaGPr6wa7qdGTm5f5GvjE1HSVw5kCpkmxFPqwfgDznH9r4vTs+6MlnrXxHCasozavxLf4h5cHaxFmDtXWzCs4M8CglIFFGu+5F3n65mFJMiTqdoNTACweCmwgFWJgGFGBr05I850+IX2hjBjx03YMQTfkoCABQI0EhAHzUxvoATZW0fQEX+6GEG5dAKAAAAABJRU5ErkJggg=='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAUlJREFUOE+dlT1OAzEQhb1RJAqkFCk4BEVaKtLnBByBLnfgCvR03IEeKloKaipERZGKbpM34UXP41nHu5YsZ8Yz3/w52i65dbtc9F7n5bffXae6k9DirI4KMshYAGEEdVMBCpr5eqfIGeT15Yjg2QJEJTPfaTqOAZ0ymZIFAzb1BAFqmWWQ9SYlbF01Z9rN0ZiWUjxcA1XLIbwGAMwg3c3OdrTOATBdG/GhpNS/LyLGoK7478Ayev6+nP+A/dDbKiICesjOdhRAHeaFtyjO9YOm4XQ08vXjh9nWsikygTEdNUvTbVdt/QDk++LPNn7fP3/ZSTkqPyuHWTw8/aS7y6vMHrqmpRF1MqMyQaQoIvoR6ZlZ0VhcwGm9WZlN1GQ688y+H1AOTedze4RGrzX7ZPBZM4KXVa/Z2HRIRxZ6qXder3JWjkKGwFE5ezNvqn9yAFg7AAAAAElFTkSuQmCC'
            })
         ]
      }),
      d: XSprite.of({
         attributes: { persistent: true },
         steps: 10,
         textures: [
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAW1JREFUSEudlDFOAzEQRXcjOiQKiogzUNBSkT4n4ADpcwWUK9BzAE5ADxUtBWdAFBSRUif6S775/jNOwq600vp75vmPPeu+S567y4ttIlfS28+695ggnAIixIEV7D+gDFhgY0AOnHjdY8Y0MsDc1etLRGaaRwVnTNJkB/mY0GHP1Fkr0F1gPJvX6sRLzJIOabp4KBOJ/e16eP1x3avox5bIhbTU1Jk6cjc653tWOUOgW/dSMXYIYwKMEy1oC4S80hr4aVsnS3AGYp7/9FlFQw9u339fX8zH4QpSogfrXOYkwBRw/fjRfS5vCgNjPKopNNxnBDAxrX0PZCyB1X2mTp433y1O0e/Pp50C08vxmCvSvNwzXR4tgON/WFyd5MpbpoKxj1ZPX0dh3TKGFBg3UU8zO0kisBWz+d9JQ6+c6VoKgs6x76e2Rrg1MOkgwLxJEeNaaFq68+5HYqZpNcGZTvLbHWROs7yDGpy5O03YATpFr1NIbGXnAAAAAElFTkSuQmCC'
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAV1JREFUSEudlLENwkAMRRNEh0RBwRAUaamgZwK2YAdWoGcAJqCHipaCGRAFBRJ1kA/+4fv2JZBIkWKf/fx9OV9ZOM9sNKwdd+I63h8lxxjHLyBAGJjA/gF5wAjrAmJgj/vuYkNIgLGqw94iPR9HGWVI0skMYhvQsGdaWS6QVYg9X6TeHrfoJTX5dHHTpiSW00d4+WE/d1F2bRGFdKuuMq2I1eg13rNEmQSydG5VbIYgxsCwkIPmQJIXj4YMbe7PAuyBkMdD73UUzmB9er9cjG1zBWkiB+s1T4mBacBkcw75l1UVOeLTtoaa+wzBALm9fwogFsDkPsPi7nnLMaJ/ORiHbw10L8c2VSByu30t4XsEquI3de9DjiOTwDR4vb22tlqs0mlIYKjgtcl/FJX034yDLk7v7AhEgwTCNsDm1hAgB+eKsD+7ZwzkDWSQrBtl4vQCPR8XaLRltJrmk5Nfw8euDoBua0sAAAAASUVORK5CYII='
            })
         ]
      }),
      r: XSprite.of({
         attributes: { persistent: true },
         steps: 10,
         textures: [
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAU1JREFUOE+dk6FywzAMhp1c78YCBvYQAaFDK8+TjOUd9grlZX2H8RaVFgwP7YYGgsY6/+4pUf5JSVzf+WLZ8qdfklMEGi+P1ZX32D799IXemxhrAPqywAZILkBgACXIvQABlZzvPXaZo+L4fgsh32wlfFHXJDsdS40LgbMXnevmQsSRQcVzHzD1cCHbluPd7Ou5CpgYCIDGuBA4CYjVML7k/4AdPEU6rUHJEozhSCmmEoZnrx2QIw7kEUoqlqJVgQGKEdOce9kblsm2pYB93O5I5Hp3Ge54akwlcMblj65JAA0KXZNqxmr+2YB8PfymOrwePtMXtuzxBVMJnN723yF0o3uy46hDTG+NGq0Ea63EUrOoZHwnT2NtlEKoc7szJrK8cpWk/GOHtu20Q+gYd8dtlbRZ67AAOJ+FWImwilkIDqFGgywAzrMKy1AJ8Ad1T6Lpdej7dAAAAABJRU5ErkJggg=='
            }),
            XTexture.of({
               source:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAT1JREFUOE+dkyEOwlAQRH8JCYIEgeAQCG4AnhNwBBx34Ap4HHfAg8Ii0CiCQqBwJVOYZjvsNi1Nmnb3776dP7/NklzT4SDXnMbHxzOzuUrQBGCbCSshbQGEAVRA/gUQ1NH9/hN32qg47D8j+GytRButJ62346kJISiOpqtvIYSFCprNU8Jtr6zOWALQpDBCsFarhBMjAEGNPjYPYrdUKtGfSs3TmODys7cF8AgL9Mr6oqBGgwHKT5+77gC6StdYj1PXEYenw8njzbnsi9S4SlCM5stqUgAsKK0mhWeeokoOkFvvleO53F2LJ2LmFBBuZ729V2oX/VFCDqqibYVK0GBPyFNTq6TixXeMKkTaNdbKAmg2dww2Ra7L3vGyByemp/MD8UyzvwFgNsZ76Akn61TkOYhrP0pskYKsSgt/A2WJpvMoRDPiAAAAAElFTkSuQmCC'
            })
         ]
      })
   }
});

overworld.on('interact', {
   priority: 0,
   script ({ metadata }: XEntity) {
      if (overworld.movement === false) {
         switch (metadata.key) {
            case 'toriel-throne':
               console.log('TORI!!');
               break;
            case 'asgore-throne':
               console.log('GOREY!!');
               break;
         }
      }
   }
});

overworld.on('trigger', {
   priority: 0,
   script ({ metadata }: XEntity) {
      if (metadata.key === 'door') {
         switch (metadata.destination) {
            case 'throneRoom':
               overworld.room = throneRoomRoom;
               overworld.room.player.position = { x: 100, y: 470 };
               break;
            case 'nextRoom':
               overworld.room = nextRoomRoom;
               overworld.room.player.position = { x: 0, y: 30 };
               break;
         }
      }
   }
});

/* SPRINT KEY!! */
overworld.keys.x.on('down', {
   priority: 0,
   script () {
      overworld.keys.x.active && (overworld.speed = 5);
   }
});

overworld.keys.x.on('up', {
   priority: 0,
   script () {
      overworld.keys.x.active || (overworld.speed = 3);
   }
});

overworld.rescale(innerHeight, innerWidth);
addEventListener('resize', () => {
   overworld.rescale(innerHeight, innerWidth);
});

const debug = new XKey('q', 'Q', 'Tab');
Promise.all(X.assets).then(() => {
   setInterval(() => overworld.render(debug.active), 1000 / 30);
});
