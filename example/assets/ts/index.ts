declare const SAVE: typeof GAME.default;

import {
   X,
   XBounds,
   XEntity,
   XSprite,
   XTexture,
   XRoom,
   XPosition,
   XAtlas,
   XOverworld,
   XOptional,
   XItemStyle,
   XKey,
   XSound,
   XDialogue,
   XNavigator,
   XItem,
   XKeyed,
   XRenderer
} from '../../../dist/index.js';

// useful shit
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
   teleport (destination: string & keyof typeof ROOMS, origin?: string) {
      GAME.room = destination;
      overworld.room = ROOMS[destination];
      if (overworld.room && overworld.player) {
         let moved = false;
         if (origin) {
            for (const { metadata: { key }, position } of overworld.room.entities) {
               if (key === `origin:${origin}`) {
                  Object.assign(overworld.player.position, position);
                  moved = true;
                  break;
               }
            }
         }
         if (!moved) {
            for (const { metadata: { key }, position } of overworld.room.entities) {
               if (key === 'origin') {
                  Object.assign(overworld.player.position, position);
                  break;
               }
            }
         }
      }
      if (overworld.room === ROOMS.battle) {
         atlas.switch('battle');
      } else {
         atlas.switch(null);
      }
      X.ready(() => overworld.render());
   },
   nav: {
      show (...names: string[]) {
         for (const name of names) atlas.attach(name, overworld);
      },
      hide (...names: string[]) {
         for (const name of names) atlas.detach(name, overworld);
      },
      textStyle: {
         color: '#ffffffff',
         fontFamily: 'Determination Sans',
         fontSize: '15px',
         lineHeight: '9px'
      },
      fixedSize (items: string[], size: number) {
         return [ ...items, ...new Array(size - items.length).join(' ').split(' ') ];
      },
      optionGrid (navigator: string, size: number, provider: () => string[], extra: XOptional<XItemStyle> = {}) {
         return new XItem({
            style: Object.assign(
               {
                  columnGap: '3px',
                  display: 'grid',
                  gridTemplateColumns: '9px 1fr',
                  gridTemplateRows: () => `repeat(${size}, 9px)`,
                  rowGap: '5px'
               },
               extra
            ),
            children: new Array(size)
               .join(' ')
               .split(' ')
               .map((x, index) => {
                  // @ts-expect-error
                  const image: HTMLImageElement = GAME.soul.image.cloneNode();
                  return [
                     new XItem({
                        element: () => {
                           const array = provider();
                           if (array.length > index) {
                              const state = atlas.state;
                              if (atlas.state.navigator === navigator && state.index === index) {
                                 return image;
                              } else {
                                 return '<div></div>';
                              }
                           }
                        },
                        style: { height: '9px', margin: '0', width: '9px' }
                     }),
                     new XItem({
                        element: () => {
                           const array = provider();
                           if (array.length > index) {
                              return `<div>${array[index]}</div>`;
                           } else {
                              return void 0;
                           }
                        }
                     })
                  ];
               })
               .flat()
         });
      },
      topLevel (bounds: XBounds, space: XPosition, children: Iterable<XItem>, extra: XOptional<XItemStyle> = {}) {
         return new XItem({
            style: Object.assign(
               {
                  // menu boundaries
                  height: `${bounds.h - space.y}px`,
                  left: `${bounds.x}px`,
                  top: `${bounds.y}px`,
                  width: `${bounds.w - space.x}px`,
                  // menu spacing
                  paddingLeft: `${space.x}px`,
                  paddingTop: `${space.y}px`,
                  // menu basic styles
                  backgroundColor: '#000000ff',
                  border: '3px solid #ffffffff',
                  position: 'absolute'
               },
               helper.nav.textStyle,
               extra
            ),
            children
         });
      }
   }
};

// player entity
const player = new XEntity({
   attributes: { collide: true },
   bounds: { h: 5, w: 20 },
   renderer: 'foreground',
   sprite: helper.staticSprite(
      // spr_maincharad_1
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
   ),
   position: { x: 150, y: 0 }
});

// create GAME object
const GAME = {
   trivia (...garbo: string[]) {
      dialoguer.add(...garbo);
      atlas.switch('dialoguer');
   },
   room: 'throneRoom',
   battle: {
      buttons: {
         fight: new XSprite({
            attributes: { persist: true },
            scale: 0.5,
            textures: [
               new XTexture({
                  // spr_fightbt_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAjdJREFUeF7tW1FOBTEIdI138ZjGY3qa5+smfakEWFpou5jxb2lhhpnSXU08Hl+fjzf8pFPgPR1jED4V+Kg6HN8/kCSBAs8b8mSJiUtgFkcRxnGqJIjBuAQmcRRhHKdKghiMS2ASR/H1VcktjsTqV4/lK7Xu7cGpdXtzWz6juW2e1h+3rxezaiLhhE7cKLke47x7ozhKdaS4lzfNDzWOFsfzPAXCjFt10uZJkatyyDsu0jTpTi+yUhztvaWt7bKI9qb1w/Xb8g4xbpUQbeNUBI2DtpeuUTG1uj1rFMeSq+WEXZUtEQ3QQnjnnizc3cbNOqE7zcuA7TYuQ5P/kWP4Oy7LVaOZmaEH18ThmtTsn7sWPnFeuleHYeY0SNgSprTfq4El3zVxFEBqkO7Ds1+BYeN2njZ/2/krDBtHW8e0UUXmPpvecXS6Zpo0s/aVlBWb9ivlcVytuVJNa9w0cZQgJUfXreDYN66AybhSHuaMizwj02ycZh6dwBlEUfOvAl3GaeLBPE2d+DWXceX6bK/QjOZl5FyOQZdxUpPVwJXvQYkLd7av9l6tczV3x0y/DnAkV5rE4ZeYJri2xtXr3c/VWBkzT1y2xlaKuAPLbFxL7g7TtkOsO2F2GwfTYuzjbjAuJqGZjaNfkFJBb7yHvBfLky8dYCneYmk9amttjeO58fxXYgugp1HkxihQjTVPXAwsqkQpAOOilFxcB8YtFjwKDsZFKbm4zusvJ9avmcX8ACcogIkThLl7+BdBOZdSgOOkswAAAABJRU5ErkJggg=='
               }),
               new XTexture({
                  // spr_fightbt_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAdBJREFUeF7tm1GOwzAIRDerPdgevTdL20iuLDQQO04wNNO/YDD4TbDdSl3W9X/94Scdgd90FbPgjcBf4bAsDyJJQOC1Q25VsuMSiIVKpHCISgIbhUsgEiqRwiEqCWwULoFIqMTPrRINXm0rN6SePOX22xtb35qPxtZx1i0c+fXmLEy0PLfruKMA5culzaPZZfzo8+2EGwUWJZ7CRVGis46pZxyqVdvT375yG7LOLWsM5fWwybVZ60HrrWsMJ5wFsF64hNAaJ/3kPBKm9D/6LPO0zGPFcKsUBC1YLbC9fCicF+mT81C4k4F6TZfqjPOCkmG7ZMd5vQ0n5wnXcXu3uiu7Qcut5dT8T9YITseOg1jiGylcfI1ghRQOYolvDHfGaeeJB8qSu/XsQrW2xo6uhx03SnBSPIWbBH40LYUbJTgpnsJNAj+a9vbCeV0mRoWS8WmF6wG+57s3LqFFeA73daAHigXcGkM5ev3RHJ62tB3nCSliLgoXUZWGmihcA6QrXNDWjGxa7nDC9RSvLcrDjn7ueufV7HVN1hqtsXqO5eW4/ZW4JaEHEOawCRRhw3WcXTZHCwEKl/RdoHAULimBpGV/fjlpvc0kXefXlc2tMqmkT8fPapH53u36AAAAAElFTkSuQmCC'
               })
            ]
         }),
         act: new XSprite({
            attributes: { persist: true },
            scale: 0.5,
            textures: [
               new XTexture({
                  // spr_actbt_center_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAgtJREFUeF7tW+1uwzAIXKa9Sx9z2mPuadomE5WVYBuMP2C9/iuOueMuYEtVt/v37f6BTzgFPsMxBuFDgS/SYfv5hSQBFHhOyIMlOi6AWRxFGMepEiAG4wKYxFGEcZwqAWIwLoBJHMXXrZJbnB2jG5MFV3I7tuKUMKy509pLOG46rlfBtTy1dclL0yOHBKf0jBvjSiSxdlUAxl01CRFxdcZxipXmvIeRpeHM8c3Vxz2bYnUzjoByRLgCa7Farn29VmANg9ZzWNr8uTxSHjU+tN5tVBJhbaHagkY8XxK7tDaCizSnybjdpNSoyOZJBfPynMk4zigu5qXY/8TDfMbtRlHneR0rVsM81qXuuPN4tIqC/W0KqDtuZodFvOi02aDfpe44PQR2jFAAxo1QdUJOGDdB5BEQ6jNuBIlcTsltbsY5yGFIuOXq6hFXdxwVsZp4j+Ij51B3HAzzYbe648600YFnReZ8NxnHmcbF5pTyXijqUZnKcx6bMG3ey2PquJRmZNO4WyPVVlqbZ9MVydRxpe67QvmOeDUop1q3jssBID5GARg3RtfhWWHccIn/AHKjOBev0ep2xtWAWtb3os431zRPS9H0s1QLH9pT4tTCL61Dmnt7bjr+SizdYCkYe+0KkMkYlXYtl2SAcUtkt4PCOLuGSzLAuCWy20Fft8qWG5odHhlaFUDHtSq3eN8D/6iJNu/10D0AAAAASUVORK5CYII='
               }),
               new XTexture({
                  // spr_actbt_center_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAbJJREFUeF7tm+0KwjAMRZ34/q88t0GlYJJmbkdSuP5Mu5vkXPuh6LKuj/Wh13QEntNVrIIPAq/GYVlEZAYC2w55vLTiZnDLqFHGGVBmCMm4GVwyapRxBpQZQjJuBpeMGj+3SmPs76F2Y7qSOHM7vponynFVu+89ylNmxd3V8EhnNJ5509yhkckTzSljXFSkxr4JyLhvJlNESp1xFrFon6+wZZ2p2arX68+a2+cqbZzXVGtgHx81aIG1Yl6us/qejpUzio10tFVu9CJI0VgEnh6TcTRhSF/GQWBp2dJnHN18Vr/idqkVl3Wv2LzSK+7sja4YW7QcrTgULycu4zi2qLKMQ/Fy4qXPuMxt7h/noJUjUxtnm34sRLJFtbVVong5cRnHsUWVZRyKlxOXcRxbVFnGbXitW2OjHo2hzgzES38cGNR+63BVg7wmteI8MsXjMq64QV55Ms4jc3Pc24q9+Ch96TNubyr6aumXpne9X57rQUY19fOyefp5We1le+j4q1z2gdE7QeMsgWaytkqWM6Yu4zC0rLCMY/li6jIOQ8sKf26V2RsQW47UswS04rKkis17A36MPlUef6+fAAAAAElFTkSuQmCC'
               })
            ]
         }),
         item: new XSprite({
            attributes: { persist: true },
            scale: 0.5,
            textures: [
               new XTexture({
                  // spr_itembt_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAkpJREFUeF7tW0FywzAIrDv9S5/Z6TP7mjRyh4xLQCxYio2H3AwIll0hy4cst6/P21v90jHwng5xAV4Z+CAelu+foiQBA/cTckVZE5dALAliCSexksBWwiUQSYJYwkmsJLCVcAlEkiA+bpWSc6aNbkfeGvz2e2QeFAuPo54l7Fos56kmjjMy4VkSSLJ5Su8WrgHYC8IDOGvslqMRfMFHJRXbjrIEQIrLSvZo3BJf0RqwcFSgFdfOYS8wnoevt/yEyYqz/Bp5fN02jmPVcsyyh45KCbRk64HukaKtk9ZINm29JrQVL/kjdaU8URssHAfaE4rHRsHVOp0BWDg9xX9PiYYytS9uuHD74FxvdW8j93wWEy7hrEKW3wJzVb/Ei2Tz9O8SriXWCmp2D5iKxRlwfw70xMPL5ojsXcCO5sE9cVYzOSTJj9I1cSTaVrw6IrFNMJoneOK0SWt2zYe1VFERBlwT1ytA4o3eWb2as31n7gUSzjNRdYzO3k5/+SHhNCh8R3oE1nKWHWMAfsfxdE00er9px2QJyVkb9xwSjkTbwiiRxomCZAoJhySumLkMHCZcZEIja+bSd1z20OWkEciPS35RQVqyhLD8SI1ZMcTBrPxW3pBwLakE/MxEW0RI/jP3AwnHp4uatBqLTKFEYNmeGYDfcV4RvPHP0GIWaTNJtlj286yChWuQUTHQuNE09ATq+UbjeEW+5d7Q+lfio8h+RZNXqkEb0DVxVyIgey8lXFIFS7gSLikDSWE/vuOudutKqgcMu45KmKpzBf4Cp7Owgt7MQqoAAAAASUVORK5CYII='
               }),
               new XTexture({
                  // spr_itembt_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAb5JREFUeF7tm9uOwjAMROmK///lAkVBbDSJ4zZl7Gp4w5fYmVNn05VY1vW23vRJp8Bfuo7V8KbAveiwLFIkgwLPE3L7aOIy0AI9ChwQJYNJ4DJQAj0KHBAlg0ngMlACPX5ulcB3qqncjrxF6tsvc53RXuq4smfUeyu21kkTVytywncECNk8pQXOo9aB2G9QR6G92qAdlQc0SJs6A1jZPBVcfZ7XG7P8ZRNWnOVvPQl13ndc3WtrjbPstKOyJ0prsygH2Vr5LdBWPPLvqYvW2WujgdvbsPLeCghc0idB4E4G1ztSez6rLYGzFJrgR4CQzVNK4DxqBYqlvg4E0gG2Yl35j04NLDpo1MQNChUtTBP3IyKzp1MT9yNws8to4jqKzp6STim3SxPnlixGgsDF4ODuQuDcksVIELgYHNxdCJxbshgJNHDWfyWQPHty0DpXsFFfBywQlp8J4NUb83WBCo4p/EjtyA8O7agcEU4xbQUuBw5NCbK1JcnhuRS4HqCeLweq/10uzw1tP5Vj/qHNKByr5/IAXmriWGIy6gocQ/UJNQVugoiMJQSOofqEmp8X8KvduiZoE3oJTVxoPO3mHhpiQFl1jFKZAAAAAElFTkSuQmCC'
               })
            ]
         }),
         mercy: new XSprite({
            attributes: { persist: true },
            scale: 0.5,
            textures: [
               new XTexture({
                  // spr_sparebt_1
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAmFJREFUeF7tm0tuwzAMROuid+kxix6zp0lDA0oEgqI4tGxTNgt0EYnfeaJiL7I8fr4fH/k3nQKf01WcBa8KfBUdlt+/lGQCBZ435FplTtwEsKQSE5ykygRrCW4CSFKJCU5SZYK1BDcBJKnE11OltLnXWnkyquO3nmp7ttJ+r26eyxqD+1Eejy/34XF7+5Q3zMTxYhFReqC0fSlvy57b8s8tvz16CQOON4eIogl21b1TrkpNzASmqfPeM4ErYvK7uJUCtW/F8a5rdV7lYJiuyiKEpWmLjRfICD8NaolPNhY7qZ4tvlK81poJHDkj8Gr7VuKo6zUwFN4WX1QPMzgLvLOvSLT5me0hcBq8LdC0k63tzSz81tphcBK8LdBKAxIgaW1rw0f6U/31f6vX+rmAPyO0NHCBk+C1Ehwp1My5CBiHpvVjeh3QAkTc6wmgHbKe76h+qYZeLq1O98SNauDOcTQw2h5p5p643mnxAOkV64kZ3UeaPIsOwyZuD5DRRLcIelTNrokrkEoj0aCNFtgbj+vijSMdBnjiODQKGhWg1LBnjQPwxBjtA4GToI0uKGq8aPAgcPV0cYGvMnXUR+tKiwTPDM5S9FXgaQeUH9izPpvBzdDMaBFbkzc6jyeeCZxl2kryK00dKmitE6IZmofsTeA8gaP67C0oxd87B2lreo9DrwzUfjTkI4QbXTMa73YThwoU1T7BRSXTqSvBdQTStpGvBMRWy1n2luf3wfpT4tGBLcnTBlegfH/nxOHahfBIcCEw4EUkOFyzEB4JLgQGvIjXC/gdXlpxeeJ65MTFZaNW9g9gVsvg0i16VgAAAABJRU5ErkJggg=='
               }),
               new XTexture({
                  // spr_sparebt_0
                  source:
                     'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAqCAYAAABSkm6BAAAABHNCSVQICAgIfAhkiAAAAgZJREFUeF7tm92SwyAIhZudff9X7pbM2HUY5CfGBM3pVSsgeL6g5qLb+/16v/CZToGf6SpGwbsCv0WHbYMiMyjw2SH3DzpuBlpCjQAniDLDEMDNQEmoEeAEUWYYArgZKAk1fm+Vgm3YULkZ1Qlat1rLV7JbhfNc3jl4HOU5Estj+LyWnfKm6ThebEQUC5Rml/K2/Lkv/92KG7GWNOD44iKiaIKtartlq9TEBDBNnX9bOnC+snUvfmbU3qs8GKm2Sh3HOVYNaslAPh4/qaKeWGm+1tjjwLWEqKFJ3604stewj4L35CEfgPMqlcwvBTjt6dRsybS8tJwU4GjFEiBp7FJ1OpOV846fe3xd9YWJX564bylpyVtlp963hHNgVhFLgrNEaD3FJJYVawnqtVMNVi6tzjRbpXfBK/lpYDQbaZCq46xiV4JW1iJ1nkcHdFzgafAIGpiuyzVVx3WtpAo+W+Cj8/Ez7Og8ki7oOEkVNsYBOEKGuwCcU+Js8ACOgaPtrLWlZYIHcI2Oa8FruF8+DHCK5JnhAZwCLmqqt9LR2+rjwI0WlOYfnYMeqCXf464QLtqNZ/s/ruPOFvCu+QDuLuU78wJch4CRW2fE11PS9jkP9r/KnT2xJzl84gqU8xsdF9cuRQTApcAQLwLg4pqliAC4FBjiRXxfwJ/w0hqXJ28EOi4vG7WyPzwXUHVBTgWCAAAAAElFTkSuQmCC'
               })
            ]
         })
      },
      button: [ 'fight', 'act', 'item', 'mercy' ]
   },
   data: {},
   default: {
      armor: 'Gross Bandage',
      g: 0,
      hp: 20,
      lv: 1,
      name: 'Chara',
      room: 'throneRoom',
      storage: {
         inv: [ 'Butterscotch Pie' ],
         box1: [ 'Ur Mom' ],
         box2: [ 'Ur Dad' ]
      },
      weapon: 'Stick'
   },
   soul: new XTexture({
      // spr_heart_1
      source:
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAGBJREFUOE9jYICC/wwM/0EYxsdFo6tjBCnEphEoAZaDAVxqGLFJwDTBDMGnhgnZFnLYeF1AjIEUu2DUAKTEgi+uscUGLI1QHIgoyRVkEyGXoCdx6rsAV+ZBtxmmjmIXAAACHRgNoVCjGAAAAABJRU5ErkJggg=='
   }),
   speed: 3,
   state: { item: 0, box: 0, interact: false },
   get at1 () {
      return 0;
   },
   get at2 () {
      return 0;
   },
   get box (): string[] {
      //@ts-expect-error
      return SAVE.storage[[ 'box1', 'box2' ][GAME.state.box]];
   },
   get df1 () {
      return 0;
   },
   get df2 () {
      return 0;
   },
   get hp () {
      return SAVE.lv > 19 ? 99 : SAVE.lv > 1 ? SAVE.lv * 4 + 16 : 20;
   },
   get xp1 () {
      return 0;
   },
   get xp2 () {
      return 0;
   },
   get interact () {
      return GAME.state.interact;
   },
   set interact (value) {
      GAME.state.interact = value;
      if (value) {
         SPRITES.up.disable();
         SPRITES.left.disable();
         SPRITES.down.disable();
         SPRITES.right.disable();
      } else {
         KEYS.up.active && SPRITES.up.disable();
         KEYS.left.active && SPRITES.left.disable();
         KEYS.down.active && SPRITES.down.disable();
         KEYS.right.active && SPRITES.right.disable();
      }
   },
   item (index: number, action: number) {
      const item = SAVE.storage.inv[index];
      switch (action) {
         case 0:
            GAME.trivia(`[sprite:default|sound:narrator|interval:50]\n${GAME.items[item].use}`);
            break;
         case 1:
            GAME.trivia(`[sprite:default|sound:narrator|interval:50]\n${GAME.items[item].info}`);
            return;
         case 2:
            GAME.trivia(`[sprite:default|sound:narrator|interval:50]\n${GAME.items[item].drop}`);
            break;
      }
      SAVE.storage.inv.splice(index, 1);
   },
   items: (() => {
      const value: XKeyed<{ use: string; info: string; drop: string }> = {
         'Butterscotch Pie': {
            use: '* You ate the Butterscotch Pie.',
            info: "* Butterscotch Pie - Heals ALL HP{^4}{|}* Toriel's very own recipe.",
            drop: '* You.{^2}.{^2}.{^6} threw away the Pie.{^2}.{^2}.{^6}{|}* How could you {<i}do{>i} such a thing??'
         }
      };
      return value;
   })(),
   save () {
      localStorage.setItem('data', JSON.stringify(GAME.data));
   },
   load () {
      GAME.data = JSON.parse(localStorage.getItem('data') || JSON.stringify(GAME.default));
   },
   reset () {
      localStorage.removeItem('SAVE');
      GAME.load();
   }
};

const KEYS = {
   up: new XKey('w', 'W', 'ArrowUp'),
   left: new XKey('a', 'A', 'ArrowLeft'),
   down: new XKey('s', 'S', 'ArrowDown'),
   right: new XKey('d', 'D', 'ArrowRight'),
   interact: new XKey('z', 'Z', 'Enter'),
   special: new XKey('x', 'X', 'Shift'),
   menu: new XKey('c', 'C', 'Control')
};

const SPRITES = {
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
};

const ROOMS: XKeyed<XRoom> = {
   battle: new XRoom({
      bounds: { x: 0, y: 0, h: 0, w: 0 },
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
      ]
   }),
   throneRoom: new XRoom({
      bounds: { x: 0, y: 0, h: 380, w: 0 },
      entities: [
         // animation test
         new XEntity({
            speed: 1,
            metadata: { key: 'test' },
            position: { x: 60, y: 40 },
            bounds: { h: 20, w: 20 },
            renderer: 'foreground',
            sprite: helper.staticSprite(
               // spr_doorX
               'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAK1JREFUOE+9k0sOgCAMRNG4ceG1PLTXcsESFcE0MFMaNbgy/TymUxic88H9+E2cNQ88xzI+JOCbZgwdcfh9tANwX+1LArV4Kblw2fBiAEiYRK7N1YQaWTwSfeAeZnUS2lJ+Is+RLoXKtSlVMhuaCrMpEqDC7gY+snD5+S3Vgpo2sPStDe2x5VKVHA1tX+T5yNoCdCgZGRhehSo/I+sDsDpBeylVsS2QXoqt2FJ1APetUyiAm0/IAAAAAElFTkSuQmCC'
            )
         }),
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
                  "* I, {^4}your humble servant,{|}{^4}will follow you to the{|}utmost.{^2}.{^2}.{^2} here's some more text for you!!!"
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
   })
};

const NAVIGATORS = {
   dialoguer: new XNavigator({
      size: 0,
      type: 'none',
      to: () => helper.nav.hide('sidebar', 'sidebarAddon', 'dialoguer'),
      from: () => helper.nav.show('dialoguer'),
      prev: () => void dialoguer.fire('skip'),
      next: () => (dialoguer.advance(), dialoguer.mode === 'none' ? null : void 0),
      item: helper.nav.topLevel(
         { h: 70, w: 283, x: 16, y: 160 },
         { x: 0, y: 0 },
         [
            new XItem({
               style: { width: '50px', height: '50px', margin: '10px' },
               element () {
                  const sprite = dialoguer.sprite;
                  if (sprite) return (sprite.compute() || {}).image;
               }
            }),
            new XItem({
               element: () => `<div>${dialoguer.compute()}</div>`,
               style: { margin: '8px' }
            })
         ],
         {
            display: 'grid',
            fontFamily: 'Determination Mono',
            gridTemplateColumns: () => `${dialoguer.sprite ? '70px ' : ''}1fr`,
            letterSpacing: '0',
            wordSpacing: '-3px',
            lineHeight: '13.5px'
         }
      )
   }),
   sidebar: new XNavigator({
      size: 3,
      type: 'vertical',
      to: (x, navigator) => navigator === null && helper.nav.hide('sidebar', 'sidebarAddon'),
      from: (atlas, navigator) => {
         helper.nav.show('sidebar', 'sidebarAddon');
         navigator && (atlas.state.index = { S: 1, C: 2 }[navigator[7]] || 0);
      },
      prev: null,
      next: () => [ SAVE.storage.inv.length > 0 ? 'sidebarItem' : void 0, 'sidebarStat', 'sidebarCell' ],
      item: helper.nav.topLevel({ h: 68, w: 65, x: 16, y: 84 }, { x: 9, y: 11 }, [
         helper.nav.optionGrid('sidebar', 3, () => [ 'ITEM', 'STAT', 'CELL' ], {
            columnGap: '5px',
            rowGap: '7px'
         })
      ])
   }),
   sidebarAddon: new XNavigator({
      item: helper.nav.topLevel(
         { h: 49, w: 65, x: 16, y: 26 },
         { x: 4, y: 5 },
         [
            new XItem({ element: () => `<div>${SAVE.name}</div>` }),
            new XItem({
               style: {
                  display: 'grid',
                  fontFamily: 'Crypt Of Tomorrow',
                  fontSize: '7px',
                  gap: '3px',
                  gridTemplateColumns: '14px 1fr',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  height: '23px',
                  letterSpacing: '0',
                  lineHeight: '5px'
               },
               children: [
                  new XItem({ element: '<div>LV</div>' }),
                  new XItem({ element: () => `<div>${isFinite(SAVE.lv) ? SAVE.lv : 'INF'}</div>` }),
                  new XItem({ element: '<div>HP</div>' }),
                  new XItem({ element: () => `<div>${isFinite(SAVE.hp) ? SAVE.hp : 'INF'}/${GAME.hp}</div>` }),
                  new XItem({ element: '<div>G</div>' }),
                  new XItem({ element: () => `<div>${isFinite(SAVE.g) ? SAVE.g : 'INF'}</div>` })
               ]
            })
         ],
         {
            display: 'grid',
            gridTemplateRows: '16px 1fr'
         }
      )
   }),
   sidebarItem: new XNavigator({
      size: () => SAVE.storage.inv.length,
      type: 'vertical',
      to: (x, navigator) => navigator === 'sidebar' && helper.nav.hide('sidebarItem'),
      from: () => helper.nav.show('sidebarItem'),
      prev: 'sidebar',
      next: atlas => ((GAME.state.item = atlas.state.index), 'sidebarItemOptions'),
      item: helper.nav.topLevel({ h: 175, w: 167, x: 94, y: 26 }, { x: 7, y: 15 }, [
         helper.nav.optionGrid('sidebarItem', 8, () => SAVE.storage.inv),
         helper.nav.optionGrid('sidebarItemOptions', 3, () => [ 'USE', 'INFO', 'DROP' ], {
            gridTemplateRows: '1fr',
            gridTemplateColumns: '9px 33px 9px 42px 9px 1fr',
            position: 'absolute',
            top: '155px'
         })
      ])
   }),
   sidebarItemOptions: new XNavigator({
      size: 3,
      type: 'horizontal',
      to: (x, navigator) => navigator === 'dialoguer' && helper.nav.hide('sidebarItem'),
      prev: 'sidebarItem',
      next (atlas) {
         GAME.item(GAME.state.item, atlas.state.index);
         return 'dialoguer';
      }
   }),
   sidebarStat: new XNavigator({
      to: () => helper.nav.hide('sidebarStat'),
      from: () => helper.nav.show('sidebarStat'),
      prev: 'sidebar',
      item: helper.nav.topLevel({ h: 203, w: 167, x: 94, y: 26 }, { x: 11, y: 17 }, [
         new XItem({
            element: () => `<div>"${SAVE.name}"</div>`,
            style: { height: '9px', width: '46px' }
         }),
         new XItem({
            element: () => `<div>LV ${isFinite(SAVE.lv) ? SAVE.lv : 'INF'}</div>`,
            style: { height: '9px', marginTop: '21px', width: '40px' }
         }),
         new XItem({
            element: () => `<div>HP ${isFinite(SAVE.hp) ? SAVE.hp : 'INF'} / ${GAME.hp}</div>`,
            style: { height: '9px', marginTop: '7px', width: '67px' }
         }),
         new XItem({
            element: () => `<div>AT ${GAME.at1} / ${GAME.at2}</div>`,
            style: { height: '9px', marginTop: '23px', width: '67px' }
         }),
         new XItem({
            element: () => `<div>DF ${GAME.df1} / ${GAME.df2}</div>`,
            style: { height: '9px', marginTop: '7px', width: '67px' }
         }),
         new XItem({
            element: () => `<div>WEAPON: ${SAVE.weapon}</div>`,
            style: { height: '9px', marginTop: '21px', width: 'max-content' }
         }),
         new XItem({
            element: () => `<div>ARMOR: ${SAVE.armor}</div>`,
            style: { height: '9px', marginTop: '7px', width: 'max-content' }
         }),
         new XItem({
            element: () => `<div>GOLD: ${isFinite(SAVE.g) ? SAVE.g : 'INF'}</div>`,
            style: { height: '9px', marginTop: '11px', width: '82px' }
         }),
         new XItem({
            element: () => `<div>EXP: ${GAME.xp1}</div>`,
            style: { height: '9px', left: '95px', position: 'absolute', top: '95px', width: '47px' }
         }),
         new XItem({
            element: () => `<div>NEXT: ${GAME.xp2}</div>`,
            style: { height: '9px', left: '95px', position: 'absolute', top: '111px', width: '47px' }
         })
      ])
   }),
   sidebarCell: new XNavigator({
      size: 4,
      type: 'vertical',
      to: (atlas, navigator) => {
         helper.nav.hide('sidebarCell');
         switch (navigator) {
            case 'sidebarCellToriel':
               break;
            case 'sidebarCellPapyrus':
               break;
            case 'sidebarCellBox':
               GAME.state.box = atlas.state.index - 2;
               break;
         }
      },
      from: (atlas, navigator) => {
         helper.nav.show('sidebarCell');
         navigator === 'sidebar' || (atlas.state.index = GAME.state.box + 2);
      },
      prev: 'sidebar',
      next: [ 'sidebarCellToriel', 'sidebarCellPapyrus', 'sidebarCellBox', 'sidebarCellBox' ],
      item: helper.nav.topLevel({ h: 129, w: 167, x: 94, y: 26 }, { x: 7, y: 15 }, [
         helper.nav.optionGrid('sidebarCell', 4, () => [
            "Toriel's Phone",
            'Papyrus and Undyne',
            'Dimensional Box A',
            'Dimensional Box B'
         ])
      ])
   }),
   sidebarCellBox: new XNavigator({
      size: 8,
      type: 'vertical',
      to: () => helper.nav.hide('sidebarCellBox', 'sidebarCellBoxAddon'),
      from (atlas) {
         helper.nav.show('sidebarCellBox', 'sidebarCellBoxAddon');
         const listener = () => {
            const storage = atlas.state.navigator === 'sidebarCellBoxStorage';
            if (storage) {
               atlas.state.navigator = 'sidebarCellBox';
               atlas.state.index > 7 && (atlas.state.index = 7);
            } else {
               atlas.state.navigator = 'sidebarCellBoxStorage';
            }
         };
         KEYS.left.on('down', listener);
         KEYS.right.on('down', listener);
         X.once(KEYS.special, 'down', () => {
            KEYS.left.off('down', listener);
            KEYS.right.off('down', listener);
         });
      },
      prev: 'sidebarCell',
      next (atlas) {
         if (atlas.state.index < SAVE.storage.inv.length) {
            GAME.box.length < 10 && GAME.box.push(SAVE.storage.inv.splice(atlas.state.index, 1)[0]);
         }
      },
      item: helper.nav.topLevel({ h: 219, w: 299, x: 7, y: 7 }, { x: 9, y: 29 }, [
         helper.nav.optionGrid('sidebarCellBox', 8, () => helper.nav.fixedSize(SAVE.storage.inv, 8)),
         helper.nav.optionGrid('sidebarCellBoxStorage', 10, () => helper.nav.fixedSize(GAME.box, 10), {
            left: '151px',
            position: 'absolute',
            top: '29px'
         })
      ])
   }),
   sidebarCellBoxAddon: new XNavigator({
      item: new XItem({
         style: Object.assign({}, helper.nav.textStyle),
         children: [
            new XItem({
               element: '<div>INVENTORY</div>',
               style: { height: '9px', left: '51px', position: 'absolute', top: '18px', width: '62px' }
            }),
            new XItem({
               element: '<div>BOX</div>',
               style: { height: '9px', left: '223px', position: 'absolute', top: '18px', width: '20px' }
            }),
            new XItem({
               element: '<div>Press [X] to Finish</div>',
               style: { height: '9px', left: '99px', position: 'absolute', top: '206px', width: '116px' }
            })
         ]
      })
   }),
   sidebarCellBoxStorage: new XNavigator({
      size: 10,
      type: 'vertical',
      to: () => helper.nav.hide('sidebarCellBox', 'sidebarCellBoxAddon'),
      prev: 'sidebarCell',
      next (atlas) {
         if (atlas.state.index < GAME.box.length) {
            SAVE.storage.inv.length < 8 && SAVE.storage.inv.push(GAME.box.splice(atlas.state.index, 1)[0]);
         }
      }
   }),
   battle: new XNavigator({
      size: 4,
      type: 'horizontal',
      to: () => helper.nav.hide('battle'),
      from: () => helper.nav.show('battle'),
      item: new XItem({
         style: {
            display: 'grid',
            gap: '70px',
            gridTemplateColumns: 'repeat(4, 8px)',
            height: '8px',
            left: '20px',
            position: 'absolute',
            top: '223px',
            width: '241px'
         },
         children: new Array(4).join(' ').split(' ').map((x, index) => {
            //@ts-expect-error
            const image: HTMLImageElement = GAME.soul.image.cloneNode();
            return new XItem({
               element: () => {
                  //@ts-expect-error
                  const button: XSprite = GAME.battle.buttons[GAME.battle.button[index]];
                  if (atlas.state.navigator === 'battle' && atlas.state.index === index) {
                     button.state.index = 1;
                     return image;
                  } else {
                     button.state.index = 0;
                     return '<div></div>';
                  }
               },
               style: {
                  width: '8px',
                  height: '8px',
                  margin: '0'
               }
            });
         })
      })
   })
};

const atlas = new XAtlas({ menu: 'sidebar', navigators: NAVIGATORS, size: { x: 320, y: 240 } });

const overworld = new XOverworld({
   // main renderer + other layers
   layers: {
      background: new XRenderer(),
      foreground: new XRenderer({ attributes: { animate: true } }),
      overlay: new XRenderer()
   },
   rooms: ROOMS,
   // game size
   size: { x: 320, y: 240 },
   wrapper: document.body
});

const dialoguer = new XDialogue({
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
});

// create SAVE object
Object.defineProperty(globalThis, 'SAVE', { get: () => GAME.data });

// load previous SAVE (if any)
GAME.load();

// add player to OW
overworld.player = player;

// handle triggers
overworld.on('trigger', ({ metadata: { key } }: XEntity) => {
   typeof key === 'string' && key.startsWith('teleport:') && helper.teleport(key.slice(9), GAME.room);
});

// handle interaction points
overworld.on('interact', ({ metadata: { key, dialogue } }: XEntity) => {
   if (key === 'dialogue' && dialogue instanceof Array) {
      GAME.trivia(...dialogue);
   }
});

// disbale movement on dialoguer
dialoguer.on('start', () => {
   GAME.interact = true;
});

dialoguer.on('stop', () => {
   GAME.interact = false;
});

// handle atlas nav
KEYS.up.on('down', () => atlas.state.navigator && atlas.navigate('move', 'vertical', -1));
KEYS.left.on('down', () => atlas.navigate('move', 'horizontal', -1));
KEYS.down.on('down', () => atlas.navigate('move', 'vertical', 1));
KEYS.right.on('down', () => atlas.navigate('move', 'horizontal', 1));

KEYS.menu.on('down', () => atlas.navigate('menu'));
KEYS.special.on('down', () => atlas.navigate('prev'));

KEYS.interact.on('down', () => {
   if (atlas.state.navigator === null) {
      const room = overworld.room;
      if (room && overworld.player && !GAME.state.interact) {
         for (const entity of X.intersection(X.bounds(overworld.player), ...room.interactables)) {
            overworld.fire('interact', entity);
         }
      }
   } else {
      atlas.navigate('next');
   }
});

// maps 'x' key as a sprint key
KEYS.special.on('up', () => (GAME.speed = 3));
KEYS.special.on('down', () => (GAME.speed = 4.5));

// activate overworld & render at ~30FPS
X.ready(() => {
   setInterval(() => {
      overworld.refresh();
      overworld.tick((entity, lifetime) => {
         if (entity.metadata.key === 'test') {
            // alphys when she says she names programming variables after undyne
            if (lifetime < 1.5 * 30) {
               entity.speed += 0.05;
            } else if (!entity.metadata.SCARM) {
               entity.speed -= 0.1;
               if (entity.speed <= 0) {
                  entity.metadata.SCARM = true;
                  entity.speed = 20;
                  entity.direction = 90;
               }
            } else {
               entity.speed -= 1;
               entity.direction = 90;
            }
            /*
            if (entity.metadata.boop) {
               entity.direction = -90;
               if (entity.position.y < 0) {
                  entity.metadata.boop = false;
               }
            } else {
               entity.direction = 90;
               if (entity.position.y > 80) {
                  entity.metadata.boop = true;
               }
            }
         */
         }
      });
      const step = GAME.speed;
      const room = overworld.room;
      if (room && !atlas.state.navigator && !GAME.interact) {
         const queue: Set<XEntity> = new Set();
         const origin = Object.assign({}, player.position);
         const moveUp = KEYS.up.active;
         const moveLeft = KEYS.left.active;
         const moveDown = KEYS.down.active;
         const moveRight = KEYS.right.active;
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
               for (const entity of collisions) queue.add(entity);
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
               for (const entity of collisions) queue.add(entity);
               // TEH FRISK DANCE
               if (collision && index === 1 && moveUp && moveDown) {
                  player.position.y -= 2;
               }
            }
         }
         if (player.position.x < origin.x) {
            player.sprite = SPRITES.left;
            SPRITES.left.enable();
         } else if (player.position.x > origin.x) {
            player.sprite = SPRITES.right;
            SPRITES.right.enable();
         } else {
            SPRITES.left.disable();
            SPRITES.right.disable();
            if (moveLeft) {
               player.sprite = SPRITES.left;
            } else if (moveRight) {
               player.sprite = SPRITES.right;
            }
            if (moveUp) {
               player.sprite = SPRITES.up;
            } else if (moveDown) {
               player.sprite = SPRITES.down;
            }
         }
         if (player.position.y > origin.y) {
            player.sprite = SPRITES.up;
            SPRITES.up.enable();
         } else if (player.position.y < origin.y) {
            player.sprite = SPRITES.down;
            SPRITES.down.enable();
         } else {
            SPRITES.up.disable();
            SPRITES.down.disable();
         }
         for (const entity of queue) overworld.fire('collide', entity);
         for (const entity of X.intersection(X.bounds(player), ...room.triggerables)) overworld.fire('trigger', entity);
         if (player.position.x !== origin.x || player.position.y !== origin.y) overworld.render();
      } else {
         SPRITES.up.disable();
         SPRITES.left.disable();
         SPRITES.down.disable();
         SPRITES.right.disable();
      }
      overworld.render(true);
   }, 1e3 / 30);
});

helper.teleport(GAME.room);

// testie
Object.assign(window, { atlas, helper, GAME, overworld });
