(async () => {
   const engine = new XEngine(document.createElement('canvas'), await X.import('entities/frisk.json'), {
      debug: true,
      animations: {
         down: await X.import('animations/frisk-walk-down.json'),
         left: await X.import('animations/frisk-walk-left.json'),
         right: await X.import('animations/frisk-walk-right.json'),
         up: await X.import('animations/frisk-walk-up.json')
      },
      framerate: 30,
      rooms: {
         intro: await X.import('rooms/intro-room.json'),
         flowey: await X.import('rooms/flowey-room.json')
      },
      state: { room: 'intro' }
   });
   document.body.appendChild(engine.canvas);
   return engine;
})().then((engine) => {
   window.engine = engine;
   engine.hooks.add((event, entity) => {
      if (event === 'trigger') {
         const metadata = entity.metadata;
         console.log(metadata);
         switch (metadata.type) {
            case 'teleporter':
               engine.update({ room: metadata.room });
               engine.player.position = { x: metadata.x, y: metadata.y, z: metadata.z };
               break;
         }
      }
   });
});
