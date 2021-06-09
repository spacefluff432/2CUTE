export const textElement = document.createElement('x');

// dialogue controller
export const dialogue: XDialogue = new XDialogue({
   menu: new XMenu({
      element: menu1,
      items: {
         a: new XItem({
            content: () => dialogue.computeImage(),
            style: {
               content: {
                  height: '80%',
                  width: '80%',
                  margin: '10%'
               }
            }
         }),
         b: new XItem({
            content: () => {
               textElement.innerHTML = dialogue.computeText();
               return textElement;
            },
            style: {
               item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
               },
               content: {
                  height: '3.75em',
                  lineHeight: '1.25em',
                  width: '100%',
                  paddingLeft: '10px',
                  fontFamily: 'Determination',
                  color: '#ffffffff',
                  fontSize: '30px',
                  display: 'block'
               }
            }
         })
      },
      style: {
         cssText: '--box-width:600px',
         border: '3px solid #ffffffff',
         margin: 'auto',
         position: 'absolute',
         width: 'var(--box-width)',
         height: '150px',
         top: '20px',
         left: 'calc(50% - (var(--box-width) / 2))',
         backgroundColor: '#000000ff',
         display: 'grid',
         gridTemplateColumns: '150px 1fr',
         gridTemplateAreas: "'a b'",
         opacity: '0'
      }
   }),
   speakers: {
      toriel: new XSpeaker({
         state: { sprite: 'pissed' },
         sprites: {
            pissed: new XSprite({
               attributes: { persist: true },
               textures: [
                  new XTexture({
                     source:
                        'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_face_toriel_goawayasgore_0.png'
                  })
               ]
            })
         }
      }),
      asgore: new XSpeaker({
         state: { sprite: 'happygore' },
         sprites: {
            sadgore: new XSprite({
               attributes: { persist: true },
               steps: 10,
               textures: [
                  new XTexture({
                     source:
                        'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_sadgore_face_9.png'
                  })
               ]
            }),
            happygore: new XSprite({
               attributes: { persist: true },
               steps: 10,
               textures: [
                  new XTexture({
                     source:
                        'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_asgore_face0_1.png'
                  }),
                  new XTexture({
                     source:
                        'https://raw.githubusercontent.com/Rovoska/undertale/master/sprites/images/spr_asgore_face0_0.png'
                  })
               ]
            })
         }
      })
   },
   interval: 50,
   advance: new XKey('z', 'Z'),
   skip: new XKey('x', 'X'),
   state: { speaker: 'asgore' }
});

// menus at ~60FPS
XCore.ready(() => setInterval(() => dialogue.menu.tick(), 1e3 / 60));
