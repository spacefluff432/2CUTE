import { dialogue } from './dialogue.js';
import { overworld } from './overworld.js';

// mimic undertale env
const GLOBAL = {
   state: { interact: false },
   get interact () {
      return GLOBAL.state.interact;
   },
   set interact (value) {
      GLOBAL.state.interact = value;
      if (value) {
         overworld.interact = false;
         overworld.move = false;
         overworld.detect = false;
      } else {
         overworld.interact = true;
         overworld.move = true;
         overworld.detect = true;
      }
   }
};

overworld.on('interact', {
   priority: 0,
   script ({ metadata }: XEntity) {
      if (!GLOBAL.interact) {
         if (metadata.key === 'trivia') {
            GLOBAL.interact = true;
            dialogue.reader.add(...metadata.trivia);
         }
      }
   }
});

dialogue.on('disable', () => {
   setTimeout(() => {
      GLOBAL.interact = false;
   });
});

//@ts-expect-error
window.overworld = overworld;
//@ts-expect-error
window.dialogue = dialogue;
