import * as assets from './assets.js';
export const dialoguer = new XDialoguer();
export const dialoguerState = { character: 'storyteller' };
dialoguer.on('header', header => {
    switch (header[0]) {
        case 'c':
            dialoguerState.character = header.split(':')[1];
            break;
        case 'i':
            dialoguer.interval.value = +header.split(':')[1];
            break;
    }
});
dialoguer.on('text', content => {
    //@ts-expect-error
    content[0] && (content[content.length - 1] === ' ' || assets.sounds.dialoguer[dialoguerState.character].start(true));
});
//# sourceMappingURL=dialoguer.js.map