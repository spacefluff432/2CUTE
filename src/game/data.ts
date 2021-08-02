export const manager = {
   default: {
      armor: 'Bandage',
      boxes: [ [], [] ],
      name: '',
      fun: Math.floor(Math.random() * 100) + 1,
      g: 0,
      hp: 20,
      items: [],
      room: 'lastCorridor',
      xp: 0,
      weapon: 'Stick'
   },
   load (key: string): UndertaleSave | void {
      const data = localStorage.getItem(key);
      if (data) {
         try {
            return JSON.parse(data, (x, value) => (value === 1e300 ? Infinity : value === -1e300 ? -Infinity : value));
         } catch (error) {
            manager.reset(key);
            return manager.load(key);
         }
      }
   },
   lv: [
      10,
      30,
      70,
      120,
      200,
      300,
      500,
      800,
      1200,
      1700,
      2500,
      3500,
      5000,
      7000,
      10000,
      15000,
      25000,
      50000,
      99999,
      Infinity
   ],
   reset (key: string) {
      localStorage.removeItem(key);
   },
   save (key: string, data: UndertaleSave) {
      localStorage.setItem(
         key,
         JSON.stringify(data, (x, value) => (value === Infinity ? 1e300 : value === -Infinity ? -1e300 : value))
      );
   },
   stat (data: UndertaleSave) {
      let lv = 1;
      while (manager.lv[lv - 1] < data.xp) lv++;
      return {
         atx: 0,
         at: lv * 2 + 8,
         df: Math.ceil(lv / 4) + 9,
         dfx: 0,
         hp: lv > 19 ? 99 : lv * 4 + 16,
         lv,
         xp: manager.lv[lv - 1]
      };
   }
};
