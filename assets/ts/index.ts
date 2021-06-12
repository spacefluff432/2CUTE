// helper methods
const helper = {
   wallEntity (bounds: XBounds) {
      return new XEntity({
         attributes: { collide: true },
         bounds: { h: bounds.h, w: bounds.w, x: 0, y: 0 },
         position: { x: bounds.x, y: bounds.y }
      });
   },
   staticSprite (source: string) {
      return new XSprite({
         attributes: { persist: true },
         textures: [ new XTexture({ source }) ]
      });
   },
   itemTransformer (item: string) {
      return new XItem({});
   }
};

// mimic undertale env
const game = {
   speed: 3,
   state: { interact: false, item: 0, menu: 'none', index: 0, box: '' },
   storage: (() => {
      const out: XKeyed<string[]> = {
         ivtr: [ 'bscotchPie', 'seaTea' ],
         boxa: [ 'seaTea' ],
         boxb: [ 'seaTea' ]
      };
      return out;
   })(),
   get interact () {
      return game.state.interact;
   },
   set interact (value) {
      game.state.interact = value;
      if (value) {
         overworld.disable();
      } else {
         overworld.enable();
      }
   },
   get item () {
      //@ts-expect-error
      return game.items[game.storage.ivtr[game.state.item]];
   },
   get overworld (): XOverworld {
      return overworld;
   },
   door (to: string, from?: string) {
      overworld.teleport(to);
      for (const { metadata: { key, room }, position } of overworld.room!.entities) {
         if (from ? key === 'door-from' && room === from : key === 'origin') {
            overworld.player.position = position;
            break;
         }
      }
      overworld.render();
   },
   items: {
      bscotchPie: {
         name: 'Butterscotch Pie',
         blurb: "* Butterscotch Pie - Heals ALL HP{^4}{|}* Toriel's very own recipe.",
         use: '* You ate the Butterscotch Pie.',
         discard: '* You.{^2}.{^2}.{^6} threw away the Pie.{^2}.{^2}.{^6}{|}* How could you {<i}do{>i} such a thing??'
      },
      seaTea: {
         name: 'Sea Tea',
         blurb: '* Sea Tea - Heals 14 HP{^4}{|}* Idk wtf to put on this{|}second line!',
         use: '* You drank the Sea Tea.',
         discard: '* You threw away the Sea Tea.'
      }
   }
};

// soul for use in menus
const SOUL = new XTexture({
   // spr_heart_1
   source:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAGBJREFUOE9jYICC/wwM/0EYxsdFo6tjBCnEphEoAZaDAVxqGLFJwDTBDMGnhgnZFnLYeF1AjIEUu2DUAKTEgi+uscUGLI1QHIgoyRVkEyGXoCdx6rsAV+ZBtxmmjmIXAAACHRgNoVCjGAAAAABJRU5ErkJggg=='
});

// overworld layer
const overworld = new XOverworld({
   // keybinds (links keys to actions)
   binds: { up: 'u', left: 'l', down: 'd', right: 'r', interact: 'z', special: 'x', menu: 'c' },
   // dialoguer
   dialogue: new XDialogue({
      sprites: {
         happygore: new XSprite({
            attributes: { persist: true },
            interval: 10,
            textures: [
               new XTexture({
                  // spr_asgore_face0_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA2CAYAAABnctHeAAAABHNCSVQICAgIfAhkiAAAA0ZJREFUaEPlWtluwkAMhKr//8sUV53IDONrE/KQVkKwXnsOezetUO+32+3xfF3q5+tSbv7MXNLUdzapx+P1ZN7v9yz9I3srGsJJMZgpVrGPOPkDVXwqxhqkKVWIKak9Bj1iDR51OioNb6ZUAYAVwREGIoyMV+kEjl2S7eKoxLONRAYt3tW3TapbkJF+ek81WOl+O36fFnYG/v8zpUZ7Rqcjjq6eclJdoEjIUfGJjs2UuoQQNAE8yoTHyfiV7nJSRxjLRFVNWKl9MaVcc8dWSCrhat94Kq5Ib3tSbE4JUTEIqwSu4ivON1ORey6OREbxo+sznW+mjDwr4I4qEyrGdcpkVYeaSp80NTEGAgjitRLv8bmO83ldGfrFfr7S7yiy7hmBEsU1Pg8ivTiPwbXeVMeQ5YeTUuRMYAKMKCPDXpUD41FeFPeaNs3PD+mkkOg7WAmwmtWOo1HMp8RHsfL4+UJPGHXOH6WItMrp8ETYFk+/eOHCyAjyfHezSfn8DDPbY21+Xd4pLkYXVZxjnbUyj+PdqVc5Y1MKJIpxp3kd1e2Nj45fROa77YXzFHjK2Od4xNONj0xV5J1jww1g4xAOrJXpjkypTkGUEqEE8yRRVzVMcUextqmM1BvKJsGTjOr2TqttKuqKxWHYTw1xX+cbY5+5LuOY7LWeftmUJmQruTzdDkZpShnyRwwkPKWKHHcrwwLG1Fj6Z1JkyF92I1bCKlO8rzA7McaxdXqnVIf85VaAR8Siu8YmI650UqooOmZqWtwUXgOfxUYcSo+KtUxFghUgYqomMsE4qpaNc41fp8cvKuwQdHIyfGUsyuf4kikG4XVH0B7TzMfr8pHOBZWYjiHDrPIqHtbl12NTGRj2KkHVfocjy2mZmoqwKaDG3vEyIfa5mhILnvK3TDGJrSGMBUKAN4Z6b4iFRniKu4otPSggmN9ZPBv2+14Y46iGVEb8fuv3FApYJDrv3yfklqsMvQhc+C+b5eMHQSzMxyOD/qj5I8lNi+qr+MgU3wMG58nxPjegg6cwqtjIVAVm+xDqJ4A6f1cqQx2uKGdsSolRMRjko6aEqHoVU7UqNnpQKIBObO/TrMPhc04xNRW1N398/PYSnlF/SVM/m/cPbdOZ6hcAAAAASUVORK5CYII='
               }),
               new XTexture({
                  // spr_asgore_face0_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAA2CAYAAABnctHeAAAABHNCSVQICAgIfAhkiAAAAz9JREFUaEPlWItuIjEMhFP//5c5XHWQO8zYTnbhJK7SqsSx52En24rr5XK53Z+P+vnzUW5+zHykqa9qUrfb75N5vV6r9Jfs7Wiwk2KwUKxiL3HyA6r4VIw1SFOqEFNSewx6xho86nR0Gp5MqQIAK4IzDDiMilfpBE5cksfFUYnvNuIMRnyq7zGpaUFF+uo91WCl++n4vVrYO/D/P1NqtO/otOOY6mknNQVyQs6Kr+h4mFKXEIJWAM8ykXEqfqW7ndQZxipRXRN2an+ZUq65YzsknXC1Hzwdl9M7nhSbU0JUDMI6gbv4ivPJlHPPxU6ki59dX+l8MhXkVQF3VJlQMa5TJrs61HT6pKkVYyCAIF4r8Rmf6zif152hb+z7U35HUXUvCJQorsl5EJnFZQyuzaYmhiLfTkqRM0EICKKKDHtdDoy7PBfPmh6a7x/KSSExd7ATEDW7HUejmE+Jd7H2+OXCTOg6l4+SI+1yJjwOO+LlFy9c6IwgL3e3mlTOrzCrPdaW1+2d4mJ0UcU5Nlkr8zjek3qVs2xKgbgYd5rXru5ofOn4ObLc7Sycp8BTxj7HHc80vmSqI58cG24AG4dwYO1Md8mU6hREKRFKME8SdV3DFLeLjU1VpNlQNQmepKs7Oq2xKdeViMNwnhriuS43Jj5zXcWxsjd6+1VTWiHbyeXpTjBaU8pQPmIg4Sl15LhbFRYwVo2V/yY5Q/myB7ES1pnifYU5iTFOrMs7pTqUL7cCPCPm7hqbdFzlpFSRO2ZqWtwUXgOfxToOpUfFRqacYAWImKpxJhhH1bJxrsnr8vi5wgnBJKfCV8ZcPse3TDEIryeCjphmPl63r3Qu6MSEoS7H3a3M1WGwrrxeNlWBKVEhDk/sHxE75R6ZWhXi3l7AmRxP1aBTTSkwCGOBnXBn2OEp7i629aLAveHfIMOdYcN5PwtjHKw78W5/9HcKxSwS4vNvR+TiylDOXT36UTu6U5Wg2MvCsHY1eX+1rsLMe0umuq7x5JQInozKQazjc7VLphxIjkMIDOa9fFd2BU80LJtSYlQsyLOx6vKrehWbGPrmvT+j79KngCqvMqTyj8beYuqoyNX65eO3SvAv8j/S1F+ybg9tBRNaggAAAABJRU5ErkJggg=='
               })
            ]
         }),
         susriel: new XSprite({
            attributes: { persist: true },
            interval: 10,
            textures: [
               new XTexture({
                  // spr_face_torieltalk_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAWlJREFUWEfNVgGKwzAMS8f9/8u96UDDUx3ZyTZ2hVIcW5aspKXHGOO831+7bhXzeZ4D987VwVoBJD6OY4d/EOcGsAK2WBdBP516TNCZhr1WapcccFbGQbp1wFgBu3uvrro+OF2XI54dvpWpdCsQZz2xfhGwQ6QTV3F05EmAI1cbs9pOjbpjz0AsBiFJ8VQyxDGf1WTOPAToRCRgYyXUeo0VN8OXDsTGUVQ2TZZXYYprfYgIUjFVrGRZ/OeAU4mpMjsVgzg6wFitjyJQs7QFALuGWV6FqgulgMyhWVNd11jJEdszQOsJ7DTMapxrLQcy5e9a+78CaKWzr+MC8dnWAL/tgArTuCPuJQE6kcZLAir1VX5GVuGQb28Bm+E5axxzsxoVawVktsY1EkayCrMkQItJBBKdEPHOm1P+ESkRRGVTUmy3nnX2U6wOOJJZbbX+dAZUvcZVs1le+8T48lc8a/KpdfsWfIo09v0FvqvDVVUDv9MAAAAASUVORK5CYII='
               }),
               new XTexture({
                  // spr_face_torieltalk_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAWdJREFUWEfNVgGOwjAM69D9/8s7fFJQ8FwnLSBu0gRu49hxK8Qxxjjv79eeW6V8nufAu/N0uNZACB/HsaM/gucGsAa2VBdJP516TNCZJnqt1C4l4KLMg3TrwLEGds+eU3V9cLsuV1xdvpWp+CiAVU+sXwzsCPHEFc6JPBlw4hyjqu3UcDr2DuRiCIYoPlkMOO+rGpXMwwBPFALRmAW5njHzZvwygdw4m1LTqH02xrzWD1GQ2EyFWUzhvwScS0yl4mQOcE4gMEefTaBm6QhAdg3VPhvlFEoDKqFZU15nzOLA9g5E9EHsNFQ1LrVWAsr5u9b+r4GI0sXXSSH46mjA306AjTHumHvJAE/EeMlA5b7an4lVPOy3jyCa4ZO/M4ahSjxMWwMq1tnlDEHHUUlZA0xwIqidmeM+GZf/iFSUaspo2q2POvtTPHOuRGa11frTEXBjxlWz2T73yfjyr3jW5FPrS5fwEyZ+AcY6w1UzJq/eAAAAAElFTkSuQmCC'
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
         // narrator: new XSound()
      },
      interval: 50
   }),
   // dialogue box, sidebar, battle box, etc.
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
   // main renderer + other layers
   layers: {
      below: new XRenderer(),
      default: new XRenderer({ attributes: { animate: true } }),
      above: new XRenderer()
   },
   main: 'sidebar',
   navigators: {
      dialoguer: new XNavigator({
         from (overworld, navigator) {
            overworld.navigators.dialoguer.item.style.opacity = '1';
            switch (navigator) {
               case 'sidebarItemOptions':
                  overworld.navigators.sidebarItem.item.style.opacity = '0';
                  overworld.navigators.sidebarItemOptions.item.style.opacity = '0';
                  break;
            }
         },
         size: 0,
         type: 'none',
         next: overworld => {
            overworld.dialogue.advance();
            if (overworld.dialogue.mode === 'none') return null;
         },
         prev (overworld) {
            overworld.dialogue.fire('skip');
         },
         to (overworld, target) {
            if (target === null) {
               overworld.navigators.sidebar.item.style.opacity = '0';
               overworld.navigators.dialoguer.item.style.opacity = '0';
            }
         },
         item: new XItem({
            style: {
               position: 'absolute',
               left: '16px',
               width: '283px',
               top: '160px',
               height: '70px',
               color: '#ffffffff',
               fontFamily: 'Determination',
               backgroundColor: '#000000ff',
               fontSize: '20px',
               border: '3px solid #ffffffff',
               gridTemplateColumns: () => `${game.overworld.dialogue.sprite ? '70px ' : ''}1fr`,
               display: 'grid',
               opacity: '0'
            },
            children: [
               new XItem({
                  style: {
                     width: '50px',
                     height: '50px',
                     margin: '10px'
                  },
                  element: () => {
                     const sprite = game.overworld.dialogue.sprite;
                     if (sprite) {
                        const texture = sprite.compute();
                        if (texture) {
                           return texture.image;
                        }
                     }
                  }
               }),
               new XItem({
                  element: () => `<div>${game.overworld.dialogue.compute()}</div>`,
                  style: {
                     color: '#ffffffff',
                     fontSize: '15px',
                     lineHeight: '16px',
                     margin: '8px'
                  }
               })
            ]
         })
      }),
      sidebar: new XNavigator({
         from (overworld, navigator) {
            overworld.navigators.sidebar.item.style.opacity = '1';
            overworld.state.index = navigator === 'sidebarStat' ? 1 : navigator === 'sidebarCell' ? 2 : 0;
         },
         next: () => [ game.storage.ivtr.length ? 'sidebarItem' : void 0, 'sidebarStat', 'sidebarCell' ],
         prev: null,
         size: 3,
         to (overworld, navigator) {
            navigator === null && (overworld.navigators.sidebar.item.style.opacity = '0');
         },
         type: 'vertical',
         item: new XItem({
            style: {
               color: '#ffffffff',
               fontFamily: 'Determination',
               opacity: '0'
            },
            children: [
               new XItem({
                  style: {
                     position: 'absolute',
                     left: '16px',
                     width: '65px',
                     top: '26px',
                     height: '49px',
                     border: '3px solid #ffffffff',
                     backgroundColor: '#000000ff'
                  },
                  children: [
                     new XItem({
                        style: {
                           width: '58px',
                           height: '53px',
                           margin: '5px 4px',
                           marginRight: '0',
                           display: 'grid',
                           gridTemplateRows: '16px 1fr'
                        },
                        children: [
                           new XItem({
                              element: '<div>Chara</div>',
                              style: {
                                 fontSize: '15px',
                                 letterSpacing: '-1px',
                                 marginLeft: '-1px',
                                 lineHeight: '9px'
                              }
                           }),
                           new XItem({
                              style: {
                                 display: 'grid',
                                 gridTemplateRows: '1fr 1fr 1fr',
                                 gridTemplateColumns: '14px 1fr',
                                 height: '23px',
                                 gap: '3px',
                                 fontFamily: 'Crypt Of Tomorrow',
                                 fontSize: '7px',
                                 letterSpacing: '0px',
                                 lineHeight: '5px'
                              },
                              children: [
                                 new XItem({ element: '<div>LV</div>' }),
                                 new XItem({ element: '<div>1</div>' }),
                                 new XItem({ element: '<div>HP</div>' }),
                                 new XItem({ element: '<div>20/20</div>' }),
                                 new XItem({ element: '<div>G</div>' }),
                                 new XItem({ element: '<div>66</div>' })
                              ]
                           })
                        ]
                     })
                  ]
               }),
               new XItem({
                  style: {
                     position: 'absolute',
                     left: '16px',
                     width: '65px',
                     top: '84px',
                     height: '68px',
                     border: '3px solid #ffffffff',
                     backgroundColor: '#000000ff'
                  },
                  children: [
                     new XItem({
                        style: {
                           width: '58px',
                           height: '53px',
                           margin: '7px',
                           marginRight: '0',
                           display: 'grid',
                           gridTemplateRows: '1fr 1fr 1fr',
                           gap: '1px'
                        },
                        children: [ 'ITEM', 'STAT', 'CELL' ].map((option, index) => {
                           return new XItem({
                              style: {
                                 display: 'grid',
                                 gridTemplateAreas: "'soul option'",
                                 gridTemplateColumns: '13px 1fr',
                                 gap: '1px'
                              },
                              children: [
                                 // soul container
                                 new XItem({
                                    element () {
                                       const state = game.overworld.state;
                                       if (state.navigator === 'sidebar' && state.index === index) {
                                          return SOUL.image;
                                       }
                                    },
                                    style: {
                                       gridArea: 'soul',
                                       width: '9px',
                                       height: '9px',
                                       margin: '4px 2px'
                                    }
                                 }),
                                 // text container
                                 new XItem({
                                    element: `<div>${option}</div>`,
                                    style: {
                                       gridArea: 'option',
                                       margin: '4px 2px',
                                       fontSize: '15px',
                                       letterSpacing: '-1px',
                                       lineHeight: '9px'
                                    }
                                 })
                              ]
                           });
                        })
                     })
                  ]
               })
            ]
         })
      }),
      sidebarItem: new XNavigator({
         from (overworld) {
            overworld.navigators.sidebarItem.item.style.opacity = '1';
            overworld.navigators.sidebarItemOptions.item.style.opacity = '1';
         },
         next (overworld) {
            game.state.item = overworld.state.index;
            return 'sidebarItemOptions';
         },
         prev: 'sidebar',
         size: () => game.storage.ivtr.length,
         to (overworld, navigator) {
            if (navigator === 'sidebar') {
               overworld.navigators.sidebarItem.item.style.opacity = '0';
               overworld.navigators.sidebarItemOptions.item.style.opacity = '0';
            }
         },
         type: 'vertical',
         item: new XItem({
            style: {
               position: 'absolute',
               left: '94px',
               width: '164px',
               top: '26px',
               height: '172px',
               border: '3px solid #ffffffff',
               backgroundColor: '#000000ff',
               opacity: '0',
               color: '#ffffffff',
               fontFamily: 'Determination'
            },
            children: [
               new XItem({
                  children: new Array(8).join('.').split('.').map((option, index) => {
                     return new XItem({
                        style: {
                           display: 'grid',
                           gridTemplateAreas: "'soul option'",
                           gridTemplateColumns: '11px 1fr',
                           gap: '1px'
                        },
                        children: [
                           // soul container
                           new XItem({
                              element () {
                                 const state = game.overworld.state;
                                 if (state.navigator === 'sidebarItem' && state.index === index) {
                                    return SOUL.image;
                                 }
                              },
                              style: {
                                 gridArea: 'soul',
                                 width: '9px',
                                 height: '9px',
                                 margin: '3px 1px'
                              }
                           }),
                           // text container
                           new XItem({
                              element: () => {
                                 //@ts-expect-error
                                 const item = game.items[game.storage.ivtr[index]];
                                 if (item) return `<div>${item.name}</div>`;
                              },
                              style: {
                                 gridArea: 'option',
                                 margin: '2.6px 1px',
                                 fontSize: '15px',
                                 letterSpacing: '-1px',
                                 wordSpacing: '-3px',
                                 lineHeight: '9px'
                              }
                           })
                        ]
                     });
                  }),
                  style: {
                     marginTop: '12px',
                     marginLeft: '6px',
                     display: 'grid',
                     gridTemplateRows: 'repeat( 8, 15px )',
                     gap: '1px'
                  }
               })
            ]
         })
      }),
      sidebarStat: new XNavigator({
         from (overworld) {
            overworld.navigators.sidebarStat.item.style.opacity = '1';
         },
         prev: 'sidebar',
         to (overworld, navigator) {
            if (navigator === 'sidebar') {
               overworld.navigators.sidebarStat.item.style.opacity = '0';
            }
         },
         type: 'none',
         item: new XItem({
            style: {
               position: 'absolute',
               left: '94px',
               width: '164px',
               top: '26px',
               height: '172px',
               border: '3px solid #ffffffff',
               backgroundColor: '#000000ff',
               opacity: '0'
            }
         })
      }),
      sidebarCell: new XNavigator({
         from (overworld) {
            overworld.navigators.sidebarCell.item.style.opacity = '1';
         },
         next: [ 'sidebarCellToriel', 'sidebarCellPapyrus', 'sidebarCellBox', 'sidebarCellBox' ],
         prev: 'sidebar',
         size: 4,
         to (overworld, navigator) {
            overworld.navigators.sidebarCell.item.style.opacity = '0';
            switch (navigator) {
               case 'sidebarCellBox':
                  game.state.box = { 2: 'boxa', 3: 'boxb' }[overworld.state.index] || '';
                  break;
            }
         },
         type: 'vertical',
         item: new XItem({
            style: {
               position: 'absolute',
               left: '94px',
               width: '164px',
               top: '26px',
               height: '172px',
               border: '3px solid #ffffffff',
               backgroundColor: '#000000ff',
               opacity: '0',
               color: '#ffffffff',
               fontFamily: 'Determination'
            },
            children: [
               new XItem({
                  children: [ "Toriel's Phone", 'Papyrus and Undyne', 'A', 'B' ].map((option, index) => {
                     return new XItem({
                        style: {
                           display: 'grid',
                           gridTemplateAreas: "'soul option'",
                           gridTemplateColumns: '11px 1fr',
                           gap: '1px'
                        },
                        children: [
                           // soul container
                           new XItem({
                              element () {
                                 const state = game.overworld.state;
                                 if (state.navigator === 'sidebarCell' && state.index === index) {
                                    return SOUL.image;
                                 }
                              },
                              style: {
                                 gridArea: 'soul',
                                 width: '9px',
                                 height: '9px',
                                 margin: '3px 1px'
                              }
                           }),
                           // text container
                           new XItem({
                              element:
                                 index < 2
                                    ? `<span>${option}</span>`
                                    : `<div><span style="padding-right:2px">Dim</span>ensional Box ${option}</div>`,
                              style: {
                                 gridArea: 'option',
                                 margin: '2.6px 1px',
                                 fontSize: '15px',
                                 letterSpacing: '-1px',
                                 wordSpacing: '-3px',
                                 lineHeight: '9px'
                              }
                           })
                        ]
                     });
                  }),
                  style: {
                     marginTop: '12px',
                     marginLeft: '6px',
                     display: 'grid',
                     gridTemplateRows: 'repeat( 8, 15px )',
                     gap: '1px'
                  }
               })
            ]
         })
      }),
      sidebarCellBox: new XNavigator({
         from (overworld) {
            overworld.navigators.sidebarCellBox.item.style.opacity = '1';
            overworld.navigators.sidebarCellInventory.item.style.opacity = '1';
            const listener = () => {
               if (overworld.state.navigator === 'sidebarCellInventory') {
                  overworld.state.navigator = 'sidebarCellBox';
                  overworld.state.index > 7 && (overworld.state.index = 7);
               } else {
                  overworld.state.navigator = 'sidebarCellInventory';
               }
            };
            overworld.keys.l.on('down', listener);
            overworld.keys.r.on('down', listener);
            X.once(overworld.keys.x, 'down', () => {
               overworld.keys.l.off('down', listener);
               overworld.keys.r.off('down', listener);
            });
         },
         next () {
            const box = game.storage[game.state.box];
            if (typeof game.storage.ivtr[overworld.state.index] === 'string' && box.length < 10) {
               box.push(game.storage.ivtr.splice(overworld.state.index, 1)[0]);
            }
         },
         prev: null,
         size: 8,
         to (overworld) {
            overworld.navigators.sidebar.item.style.opacity = '0';
            overworld.navigators.sidebarCell.item.style.opacity = '0';
            overworld.navigators.sidebarCellBox.item.style.opacity = '0';
            overworld.navigators.sidebarCellInventory.item.style.opacity = '0';
         },
         type: 'vertical',
         item: new XItem({
            style: {
               position: 'absolute',
               left: '8px',
               width: '299px',
               top: '8px',
               height: '219px',
               border: '3px solid #ffffffff',
               backgroundColor: '#000000ff',
               opacity: '0',
               color: '#ffffffff',
               fontFamily: 'Determination',
               fontSize: '15px',
               letterSpacing: '-1px',
               lineHeight: '9px',
               wordSpacing: '-3px'
            },
            children: [
               new XItem({
                  element: '<div>INVENTORY</div>',
                  style: {
                     position: 'absolute',
                     left: '41px',
                     width: '80px',
                     top: '8px',
                     height: '9px'
                  }
               }),
               new XItem({
                  element: '<div>Press [X] to Finish</div>',
                  style: {
                     position: 'absolute',
                     left: '89px',
                     width: '150px',
                     top: '196px',
                     height: '9px'
                  }
               }),
               new XItem({
                  element: '<div>BOX</div>',
                  style: {
                     position: 'absolute',
                     left: '213px',
                     width: '80px',
                     top: '8px',
                     height: '9px'
                  }
               }),
               new XItem({
                  style: {
                     position: 'absolute',
                     left: '7px',
                     width: '142px',
                     top: '26px',
                     height: '159px',
                     display: 'grid',
                     gridTemplateRows: 'repeat( 8, 15px )'
                  },
                  children: new Array(8).join('.').split('.').map((option, index) => {
                     return new XItem({
                        style: {
                           display: 'grid',
                           gridTemplateAreas: "'soul option'",
                           gridTemplateColumns: '13px 1fr',
                           gap: '1px'
                        },
                        children: [
                           // soul container
                           new XItem({
                              element () {
                                 const state = game.overworld.state;
                                 if (state.navigator === 'sidebarCellBox' && state.index === index) {
                                    return SOUL.image;
                                 }
                              },
                              style: {
                                 gridArea: 'soul',
                                 width: '9px',
                                 height: '9px',
                                 margin: '3px 2px'
                              }
                           }),
                           // text container
                           new XItem({
                              element: () => {
                                 //@ts-expect-error
                                 const item = game.items[game.storage.ivtr[index]];
                                 if (item) return `<div>${item.name}</div>`;
                              },
                              style: {
                                 gridArea: 'option',
                                 margin: '2.6px 1px',
                                 fontSize: '15px'
                              }
                           })
                        ]
                     });
                  })
               }),
               new XItem({
                  style: {
                     position: 'absolute',
                     left: '158px',
                     width: '142px',
                     top: '26px',
                     height: '159px',
                     display: 'grid',
                     gridTemplateRows: 'repeat( 10, 15px )'
                  },
                  children: new Array(10).join('.').split('.').map((option, index) => {
                     return new XItem({
                        style: {
                           display: 'grid',
                           gridTemplateAreas: "'soul option'",
                           gridTemplateColumns: '13px 1fr',
                           gap: '1px'
                        },
                        children: [
                           // soul container
                           new XItem({
                              element () {
                                 const state = game.overworld.state;
                                 if (state.navigator === 'sidebarCellInventory' && state.index === index) {
                                    return SOUL.image;
                                 }
                              },
                              style: {
                                 gridArea: 'soul',
                                 width: '9px',
                                 height: '9px',
                                 margin: '3px 2px'
                              }
                           }),
                           // text container
                           new XItem({
                              element: () => {
                                 if (game.state.box) {
                                    //@ts-expect-error
                                    const item = game.items[game.storage[game.state.box][index]];
                                    if (item) return `<div>${item.name}</div>`;
                                 }
                              },
                              style: {
                                 gridArea: 'option',
                                 margin: '2.6px 1px',
                                 fontSize: '15px'
                              }
                           })
                        ]
                     });
                  })
               })
            ]
         })
      }),
      sidebarCellInventory: new XNavigator({
         next () {
            if (game.state.box) {
               const box = game.storage[game.state.box];
               if (typeof box[overworld.state.index] === 'string' && game.storage.ivtr.length < 8) {
                  game.storage.ivtr.push(box.splice(overworld.state.index, 1)[0]);
               }
            }
         },
         prev: null,
         size: 10,
         to (overworld) {
            overworld.navigators.sidebar.item.style.opacity = '0';
            overworld.navigators.sidebarCell.item.style.opacity = '0';
            overworld.navigators.sidebarCellBox.item.style.opacity = '0';
            overworld.navigators.sidebarCellInventory.item.style.opacity = '0';
         },
         type: 'vertical'
      }),
      sidebarItemOptions: new XNavigator({
         from (overworld) {
            overworld.navigators.sidebarItemOptions.item.style.opacity = '1';
         },
         size: 3,
         type: 'horizontal',
         next (overworld) {
            switch (overworld.state.index) {
               case 0:
                  overworld.dialogue.add(`[sprite:default|sound:narrator|interval:50]\n${game.item.use}`);
                  game.storage.ivtr.splice(game.state.item, 1);
                  break;
               case 1:
                  overworld.dialogue.add(`[sprite:default|sound:narrator|interval:50]\n${game.item.blurb}`);
                  break;
               case 2:
                  overworld.dialogue.add(`[sprite:default|sound:narrator|interval:50]\n${game.item.discard}`);
                  game.storage.ivtr.splice(game.state.item, 1);
                  break;
            }
            return 'dialoguer';
         },
         prev: 'sidebarItem',
         item: new XItem({
            style: {
               position: 'absolute',
               left: '104px',
               width: '148px',
               top: '184px',
               height: '9px',
               backgroundColor: '#000000ff',
               opacity: '0',
               display: 'grid',
               fontSize: '15px',
               letterSpacing: '-1px',
               lineHeight: '9px',
               color: '#ffffffff',
               fontFamily: 'Determination',
               gridTemplateColumns: '12px 36px 12px 45px 12px 36px',
               gridTemplateAreas: "'x a y b z c'"
            },
            children: [ 'x', 'USE', 'y', 'INFO', 'z', 'DROP' ].map((option, index) => {
               if (option.length === 1) {
                  return new XItem({
                     element () {
                        const state = game.overworld.state;
                        if (state.navigator === 'sidebarItemOptions' && state.index === index / 2) {
                           return SOUL.image;
                        } else {
                           return `<div></div>`;
                        }
                     },
                     style: {
                        gridArea: option,
                        height: '9px',
                        width: '9px',
                        margin: '0'
                     }
                  });
               } else {
                  return new XItem({ element: `<div>${option}</div>` });
               }
            })
         })
      })
   },
   // player entity
   player: new XEntity({
      attributes: { collide: true },
      bounds: { h: 5, w: 20 },
      layer: 'default',
      sprite: helper.staticSprite(
         // spr_maincharad_1
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
      ),
      position: { x: 150, y: 0 }
   }),
   // rooms in the overworld
   rooms: {
      throneRoom: new XRoom({
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
               layer: 'below',
               sprite: helper.staticSprite('assets/game/backgrounds/throne-room.png')
            }),
            // room overlays
            new XEntity({
               layer: 'above',
               sprite: helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
            }),
            new XEntity({
               layer: 'above',
               sprite: helper.staticSprite('assets/game/backgrounds/throne-room-overlay.png')
            }),
            // trivia interactions
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
            // room teleportation framework
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
               sprite: helper.staticSprite(
                  // spr_doorX
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAK1JREFUOE+9k0sOgCAMRNG4ceG1PLTXcsESFcE0MFMaNbgy/TymUxic88H9+E2cNQ88xzI+JOCbZgwdcfh9tANwX+1LArV4Kblw2fBiAEiYRK7N1YQaWTwSfeAeZnUS2lJ+Is+RLoXKtSlVMhuaCrMpEqDC7gY+snD5+S3Vgpo2sPStDe2x5VKVHA1tX+T5yNoCdCgZGRhehSo/I+sDsDpBeylVsS2QXoqt2FJ1APetUyiAm0/IAAAAAElFTkSuQmCC'
               )
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
   // player movement speed
   speed: game.speed,
   // player movement sprites
   sprites: {
      up: new XSprite({
         attributes: { persist: true },
         interval: 5,
         textures: [
            new XTexture({
               source:
                  // spr_maincharau_3
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
            }),
            new XTexture({
               source:
                  // spr_maincharau_0
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAS1JREFUSEvllLENwjAQRZ2IDomCgiEosgHpMwFbZAdWoGcAJqCHipaCGRAFBRJ14Bx953I+R4a4w1Kk5Pv87t/ZcWaUsZrPGkXuSafHM5MxnhADAkQCe7BvQBrQwX4BSWBOwhgQ75uFjR0wkwQGM3mqEgmYpYSlLXNs8/n6f3GGn1X+tLG9DK6Xx4S+m3P7yDktmXcFUdDQwqEKJjwDhyy3Fy25MXXhLk4JdkeDQAAEQR88j5EV2DIButaF2b/uuiOmrqcL+0VgWgOHDobYIVc8C0EwAHM9Ox7aqbKKdWcMrSmrLkVvAyBvdjduQn+vWxDfBAdDhtgyKYO6myTyCeoHesLfdYud6h1aud2UBBpc8x3kCdSehRzArSwP8d59pgVqWiihqlNpsmQ1kIlvB+iFpV3zlP4AAAAASUVORK5CYII='
            }),
            new XTexture({
               source:
                  // spr_maincharau_1
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAASdJREFUSEvllb0NwjAQhS+IDomCgiEosgH0TMAW2SEr0DMAE9BDRUvBDIiCAok65BmdZZ/PxiHpsBQpOb/7/M5/KUhpy9m0UcJe6PR4FlITBHJADJFAD9YFpAEt7BeQBI4Q6ANy583A+jY2MwiMzYyGKhHAYkjYsGX2nXw3/1+c8WGVhzZ3LqP5cpvguzl/HtmnDRZcQRClElMVjN0RXMhie9EGJ6pKe3FKsN0aADEgCmrxrkZWYMpk0LUqjZv96667cqKbydyAkcMOvTKhhaCm21cYVaHEOuOuHFfQwhm3wNnxQLRaE9W7DFegtM44h6F2AQDq2mSOmTO2KVcHfbwoeJerHN0aKVcyKabN+m8CprmWg3hbI1Wu60ZCuC+4HDUHsixoNN0bKBd7+KqggAgAAAAASUVORK5CYII='
            }),
            new XTexture({
               source:
                  // spr_maincharau_2
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAThJREFUSEvllbENwkAMRS8RHRIFBWIGimxA+kzAAPRZAbECPQMwAT1UtBTMgCgoIlEH/kU+HMcXArmOkyIlPvv523EukVHWfDwqFXPNdLwXkfRpGLqACCKBNdg3IA3oYL+AJDCGoQ+I983C+i4SEwRGYuJQJQIYhYSFLbNv83n8vyijj1V+tF176Y2XY4Ln8lRdck9L1jiC4NQW2FbBgGfgkNnmrCU3Jk/cwSnBbjQAIoAX9MJzH1mBLZNAlzyxanaPm66KWRfDiQUjhhQ6GPm1qeIZKDFsBHM9O+yNSTNjVstpJ1Xwx0IMLQsDOc2qP9J6e33v+u5yfcO9APlmdPfKilZAEVeFndpoaADqDTUbPtRXKaAxtHxECIQgOQYSpCqzTmwwNbU+28fzTFOg2XwJVDvKlKVKxycH84NQduLeYQAAAABJRU5ErkJggg=='
            })
         ]
      }),
      left: new XSprite({
         attributes: { persist: true },
         interval: 5,
         textures: [
            new XTexture({
               source:
                  // spr_maincharal_1
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAUpJREFUOE+dla8SwjAMxjtud7gJHgMxiwLPk+D2DnsFPI53wIPCItAoDoWYwo1+GRlpl3Z/etcbzZJfviTdkRhvrRdZ7dv88+VdJdLWHoYEy0AJIshYAMMYlEwFSNDMr3fK2YGcTw2Cn0OAqGTmd5oDx4BaJVNUcMJBPUGCmDIHkqwqgy1XLJj9UjSGHetrFuzlZht8ZaLlMDwGAJogWhmctw+A6dKIbUkmVopWSOfbgZN2/f1yfgnr0N3qJAPUqqOtJZABaSdaGPr6wa7qdGTm5f5GvjE1HSVw5kCpkmxFPqwfgDznH9r4vTs+6MlnrXxHCasozavxLf4h5cHaxFmDtXWzCs4M8CglIFFGu+5F3n65mFJMiTqdoNTACweCmwgFWJgGFGBr05I850+IX2hjBjx03YMQTfkoCABQI0EhAHzUxvoATZW0fQEX+6GEG5dAKAAAAABJRU5ErkJggg=='
            }),
            new XTexture({
               source:
                  // spr_maincharal_0
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAUlJREFUOE+dlT1OAzEQhb1RJAqkFCk4BEVaKtLnBByBLnfgCvR03IEeKloKaipERZGKbpM34UXP41nHu5YsZ8Yz3/w52i65dbtc9F7n5bffXae6k9DirI4KMshYAGEEdVMBCpr5eqfIGeT15Yjg2QJEJTPfaTqOAZ0ymZIFAzb1BAFqmWWQ9SYlbF01Z9rN0ZiWUjxcA1XLIbwGAMwg3c3OdrTOATBdG/GhpNS/LyLGoK7478Ayev6+nP+A/dDbKiICesjOdhRAHeaFtyjO9YOm4XQ08vXjh9nWsikygTEdNUvTbVdt/QDk++LPNn7fP3/ZSTkqPyuHWTw8/aS7y6vMHrqmpRF1MqMyQaQoIvoR6ZlZ0VhcwGm9WZlN1GQ688y+H1AOTedze4RGrzX7ZPBZM4KXVa/Z2HRIRxZ6qXder3JWjkKGwFE5ezNvqn9yAFg7AAAAAElFTkSuQmCC'
            })
         ]
      }),
      down: new XSprite({
         attributes: { persist: true },
         interval: 5,
         textures: [
            new XTexture({
               source:
                  // spr_maincharad_3
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
            }),
            new XTexture({
               source:
                  // spr_maincharad_0
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAW1JREFUSEudlDFOAzEQRXcjOiQKiogzUNBSkT4n4ADpcwWUK9BzAE5ADxUtBWdAFBSRUif6S775/jNOwq600vp75vmPPeu+S567y4ttIlfS28+695ggnAIixIEV7D+gDFhgY0AOnHjdY8Y0MsDc1etLRGaaRwVnTNJkB/mY0GHP1Fkr0F1gPJvX6sRLzJIOabp4KBOJ/e16eP1x3avox5bIhbTU1Jk6cjc653tWOUOgW/dSMXYIYwKMEy1oC4S80hr4aVsnS3AGYp7/9FlFQw9u339fX8zH4QpSogfrXOYkwBRw/fjRfS5vCgNjPKopNNxnBDAxrX0PZCyB1X2mTp433y1O0e/Pp50C08vxmCvSvNwzXR4tgON/WFyd5MpbpoKxj1ZPX0dh3TKGFBg3UU8zO0kisBWz+d9JQ6+c6VoKgs6x76e2Rrg1MOkgwLxJEeNaaFq68+5HYqZpNcGZTvLbHWROs7yDGpy5O03YATpFr1NIbGXnAAAAAElFTkSuQmCC'
            }),
            new XTexture({
               source:
                  // spr_maincharad_1
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
            }),
            new XTexture({
               source:
                  // spr_maincharad_2
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAV1JREFUSEudlLENwkAMRRNEh0RBwRAUaamgZwK2YAdWoGcAJqCHipaCGRAFBRJ1kA/+4fv2JZBIkWKf/fx9OV9ZOM9sNKwdd+I63h8lxxjHLyBAGJjA/gF5wAjrAmJgj/vuYkNIgLGqw94iPR9HGWVI0skMYhvQsGdaWS6QVYg9X6TeHrfoJTX5dHHTpiSW00d4+WE/d1F2bRGFdKuuMq2I1eg13rNEmQSydG5VbIYgxsCwkIPmQJIXj4YMbe7PAuyBkMdD73UUzmB9er9cjG1zBWkiB+s1T4mBacBkcw75l1UVOeLTtoaa+wzBALm9fwogFsDkPsPi7nnLMaJ/ORiHbw10L8c2VSByu30t4XsEquI3de9DjiOTwDR4vb22tlqs0mlIYKjgtcl/FJX034yDLk7v7AhEgwTCNsDm1hAgB+eKsD+7ZwzkDWSQrBtl4vQCPR8XaLRltJrmk5Nfw8euDoBua0sAAAAASUVORK5CYII='
            })
         ]
      }),
      right: new XSprite({
         attributes: { persist: true },
         interval: 5,
         textures: [
            new XTexture({
               source:
                  // spr_maincharar_1
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAdCAYAAABMr4eBAAAABHNCSVQICAgIfAhkiAAAAU1JREFUOE+dk6FywzAMhp1c78YCBvYQAaFDK8+TjOUd9grlZX2H8RaVFgwP7YYGgsY6/+4pUf5JSVzf+WLZ8qdfklMEGi+P1ZX32D799IXemxhrAPqywAZILkBgACXIvQABlZzvPXaZo+L4fgsh32wlfFHXJDsdS40LgbMXnevmQsSRQcVzHzD1cCHbluPd7Ou5CpgYCIDGuBA4CYjVML7k/4AdPEU6rUHJEozhSCmmEoZnrx2QIw7kEUoqlqJVgQGKEdOce9kblsm2pYB93O5I5Hp3Ge54akwlcMblj65JAA0KXZNqxmr+2YB8PfymOrwePtMXtuzxBVMJnN723yF0o3uy46hDTG+NGq0Ea63EUrOoZHwnT2NtlEKoc7szJrK8cpWk/GOHtu20Q+gYd8dtlbRZ67AAOJ+FWImwilkIDqFGgywAzrMKy1AJ8Ad1T6Lpdej7dAAAAABJRU5ErkJggg=='
            }),
            new XTexture({
               source:
                  // spr_maincharar_0
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAcCAYAAACH81QkAAAABHNCSVQICAgIfAhkiAAAAT1JREFUOE+dkyEOwlAQRH8JCYIEgeAQCG4AnhNwBBx34Ap4HHfAg8Ii0CiCQqBwJVOYZjvsNi1Nmnb3776dP7/NklzT4SDXnMbHxzOzuUrQBGCbCSshbQGEAVRA/gUQ1NH9/hN32qg47D8j+GytRButJ62346kJISiOpqtvIYSFCprNU8Jtr6zOWALQpDBCsFarhBMjAEGNPjYPYrdUKtGfSs3TmODys7cF8AgL9Mr6oqBGgwHKT5+77gC6StdYj1PXEYenw8njzbnsi9S4SlCM5stqUgAsKK0mhWeeokoOkFvvleO53F2LJ2LmFBBuZ729V2oX/VFCDqqibYVK0GBPyFNTq6TixXeMKkTaNdbKAmg2dww2Ra7L3vGyByemp/MD8UyzvwFgNsZ76Akn61TkOYhrP0pskYKsSgt/A2WJpvMoRDPiAAAAAElFTkSuQmCC'
            })
         ]
      })
   },
   wrapper: document.body
});

// overworld extensions
{
   // maps 'x' key as a sprint key
   overworld.keys.x.on('up', () => (overworld.speed = game.speed));
   overworld.keys.x.on('down', () => (overworld.speed = game.speed * 1.5));

   // handle room-to-room teleport triggers
   overworld.on('trigger', ({ metadata: { key, room } }: XEntity) => {
      switch (key) {
         case 'door-to':
            game.door(room, overworld.state.room);
            break;
      }
   });

   // handle overworld interaction messages
   overworld.on('interact', {
      priority: 0,
      script ({ metadata }: XEntity) {
         overworld.dialogue.add(...metadata.trivia);
         overworld.state.navigator = 'dialoguer';
         overworld.state.movement = false;
      }
   });
}

// set initial room (todo: use LOAD screen)
overworld.teleport('throneRoom');

// activate overworld
overworld.state.movement = true;

// render overworld at ~30FPS
X.ready(() => setInterval(() => overworld.tick(), 1e3 / 30));

// testie
Object.assign(window, { game, overworld });
