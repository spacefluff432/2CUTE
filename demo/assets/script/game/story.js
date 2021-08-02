import * as assets from './assets.js';
import { dialoguer } from './dialoguer.js';
const anchor = { x: 0 };
const size = { x: 160, y: 120 };
export const elements = [
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-1.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#ffffffff'
        }),
        lines: [
            // panel 1
            '{#i:55}{#c:storyteller}Upon reaching the surface, {@break}monsters were once again {@break}shunned by humanity.{^22}',
            'FRISK, possessed by the HATE {@break}of their own past genocides, {@break}wasted no time in their {@break}betrayal of the monsters.{^22}'
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-2.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#00ffffff'
        }),
        lines: [
            // panel 2
            'This led the humans, with ten {@break}of their best wizards, to {@break}once again seal the monsters {@break}underground.{^22}',
            "In a twist of fate, the {@break}humans saw FRISK'S betrayal {@break}as dishonorable, trapping {@break}them with the monsters.{^22}"
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-3.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#ffffffff'
        }),
        lines: [
            // panel 3
            "Alphys resumed the {@break}determination experiments, {@break}and Undyne helped keep the {@break}monster's hopes up.{^22}"
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-4.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#00ffffff'
        }),
        lines: [
            // panel 4
            'Meanwhile, in a moment of {@break}anger, ASGORE killed four {@break}humans before the barrier was {@break}sealed off forever.{^22}'
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-5.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#ffffffff'
        }),
        lines: [
            // panel 5
            'After absorbing one of the {@break}SOULs to fight FRISK, he {@break}pushed the human to their {@break}absolute limit.{^22}',
            'And, without the power to {@break}LOAD... they had no choice {@break}but to FIGHT.{^22}'
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-6.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#00ffffff'
        }),
        lines: [
            // panel 6
            "Killing ASGORE caused FRISK's {@break}LOVE to shoot up dramatically, {@break}and their genocidal side took {@break}over.{^22}",
            'SANS, UNDYNE, and a few other {@break}monsters tried stopping the {@break}human... but they died in the {@break}process.{^22}'
        ]
    },
    {
        /*
        panel: new XTexture(
           {
              // source: 'assets/image/story/panel-7.png'
           }
        ),
        */
        panel: new XRectangle({
            anchor,
            size,
            fill: '#ffffffff'
        }),
        lines: [
            // panel 7
            '{#i:56}Seeing everything unfold, {@break}FLOWEY suggested that TORIEL {@break}should gain some LOVE of her {@break}own.{^22}',
            'After hearing about all the {@break}deaths in the kingdom, she {@break}realized something truly... {@break}{^3}{@fill:red}terrible.{^22}',
            'The only way to stop a {@break}genocidal maniac... was to {@break}become one herself.{^22}'
        ]
    },
    {
        panel: new XObject(),
        lines: [
            // panel 8 (black screen)
            '{#i:60}She had {^3}no {^6}other {^6}{@random:1,1}c{#triggerSlowdown3} {^2}h {^2}o {^2}i {^2}c {^2}e{^2}.{^50}',
            '{^1}'
        ]
    }
];
dialoguer.on('header', async (key) => {
    if (key === 'triggerSlowdown1') {
        assets.music.intro.rate.value = 0.9;
    }
    else if (key === 'triggerSlowdown2') {
        assets.music.intro.rate.value = 0.8;
    }
    else if (key === 'triggerSlowdown3') {
        while (assets.music.intro.rate.value > 0.5) {
            assets.music.intro.rate.value -= 0.01;
            await X.pause(100);
        }
    }
});
export const elementJobs = new Map();
for (const element of elements) {
    elementJobs.set(element, new XObject({
        position: { x: 160, y: 20 },
        alpha: 0,
        objects: [element.panel]
    }));
}
//# sourceMappingURL=story.js.map