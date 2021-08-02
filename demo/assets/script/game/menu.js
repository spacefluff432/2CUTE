import * as assets from './assets.js';
import { manager } from './data.js';
import { dialoguer } from './dialoguer.js';
import { global } from './garbo.js';
import { roomNames } from './rooms.js';
function boxKeys(array) {
    return Object.keys(array).map(key => `${array.length}:${key}`);
}
function selection(navigator, selection) {
    return atlas.state.navigator === navigator && atlas.navigator().selection() === selection;
}
function fixedArray(array, size) {
    return [...array.slice(0, size), ...new Array(Math.max(0, size - array.length)).join(' ').split(' ')];
}
function position(navigator, { x, y }) {
    if (atlas.state.navigator === navigator) {
        const nav = atlas.navigator();
        return nav.position.x === x && nav.position.y === y;
    }
    else {
        return false;
    }
}
function menuSoul({ x = 0, y = 0 }, checker) {
    return new XSprite({
        position: { x: x + 1.5, y: y + 1.5 },
        textures: [assets.sprites.menu]
    }).wrapOn('tick', sprite => {
        return () => (sprite.alpha.value = checker() ? 1 : 0);
    });
}
function currentDimBox() {
    switch (atlas.navigators['sidebarCell'].selection()) {
        case '0':
            return SAVE.boxes[0];
        case '1':
            return SAVE.boxes[1];
        default:
            return [];
    }
}
function menuBox({ h = 0, w = 0, x = 0, y = 0 }, ...objects) {
    return new XRectangle({
        stroke: '#fff',
        fill: '#000',
        line: { width: 3 },
        position: { x: x + 1.5, y: y + 1.5 },
        size: { x: w + 3, y: h + 3 },
        objects
    });
}
function menuText({ x = 0, y = 0 }, { color = '#fff', font = '16px Menu', size = 9, spacing = {} }, provider) {
    const text = new XText({
        anchor: { y: 1 },
        stroke: '#0000',
        fill: color,
        text: { font },
        position: { x: x + 1.5, y: y + size + 1.5 },
        spacing
    });
    if (typeof provider === 'function') {
        text.on('tick', () => (text.content = provider()));
    }
    else {
        text.content = provider;
    }
    return text;
}
const presets = {
    miniStat: { font: '8px Stat', size: 5 }
};
export const atlas = new XAtlas({
    navigators: {
        //////////////////////////////////////////////////////////////////////////////////////////////
        //                                                                                          //
        //    OVERWORLD                                                                             //
        //                                                                                          //
        //////////////////////////////////////////////////////////////////////////////////////////////
        sidebar: new XNavigator({
            grid: [['sidebarItem', 'sidebarStat', 'sidebarCell']],
            next: self => {
                if (self.selection() === 'sidebarItem' && SAVE.items.length === 0) {
                    return void 0;
                }
                else {
                    return self.selection();
                }
            },
            prev: null,
            objects: [
                menuBox({ h: 49, w: 65, x: 16, y: 26 }, menuText({ x: 4, y: 5 }, {}, () => SAVE.name), menuText({ x: 4, y: 21 }, presets.miniStat, 'LV'), menuText({ x: 22, y: 21 }, presets.miniStat, () => manager.stat(SAVE).lv.toString()), menuText({ x: 4, y: 30 }, presets.miniStat, 'HP'), menuText({ x: 22, y: 30 }, presets.miniStat, () => `${SAVE.hp}/${manager.stat(SAVE).hp}`), menuText({ x: 4, y: 39 }, presets.miniStat, 'G'), menuText({ x: 22, y: 39 }, presets.miniStat, () => SAVE.g.toString())),
                menuBox({ h: 68, w: 65, x: 16, y: 84 }, menuSoul({ x: 9, y: 11 }, () => selection('sidebar', 'sidebarItem')), menuText({ x: 23, y: 11 }, {}, 'ITEM').wrapOn('tick', text => {
                    return () => (text.fill = SAVE.items.length === 0 ? '#808080' : '#ffffff');
                }), menuSoul({ x: 9, y: 29 }, () => selection('sidebar', 'sidebarStat')), menuText({ x: 23, y: 29 }, {}, 'STAT'), menuSoul({ x: 9, y: 47 }, () => selection('sidebar', 'sidebarCell')), menuText({ x: 23, y: 47 }, {}, 'CELL'))
            ]
        })
            .on('from', (atlas, key) => {
            assets.sounds.menu.start();
            if (!key) {
                global.interact = true;
                atlas.attach(renderer, 'menu', 'sidebar');
            }
        })
            .on('to', (atlas, key) => {
            if (key) {
                assets.sounds.select.start();
            }
            else {
                atlas.detach(renderer, 'menu', 'sidebar');
                global.interact = false;
            }
        })
            .on('move', () => {
            assets.sounds.menu.start();
        }),
        sidebarItem: new XNavigator({
            grid: () => [Object.keys(SAVE.items)],
            next: 'sidebarItemOptions',
            prev: 'sidebar',
            objects: [
                menuBox({ h: 175, w: 167, x: 94, y: 26 }, ...new Array(16).fill(0).map((x, index) => {
                    const row = Math.floor(index / 2);
                    if (index % 2 === 0) {
                        return menuSoul({ x: 7, y: 15 + row * 16 }, () => position('sidebarItem', { x: 0, y: row }));
                    }
                    else {
                        return menuText({ x: 19, y: 15 + row * 16 }, {}, () => SAVE.items[row] || '');
                    }
                }), menuSoul({ x: 7, y: 155 }, () => selection('sidebarItemOptions', 'use')), menuText({ x: 19, y: 155 }, {}, 'USE'), menuSoul({ x: 55, y: 155 }, () => selection('sidebarItemOptions', 'info')), menuText({ x: 67, y: 155 }, {}, 'INFO'), menuSoul({ x: 112, y: 155 }, () => selection('sidebarItemOptions', 'drop')), menuText({ x: 124, y: 155 }, {}, 'DROP'))
            ]
        })
            .wrapOn('from', self => {
            return (atlas, key) => {
                if (key === 'sidebar') {
                    self.position = { x: 0, y: 0 };
                    atlas.attach(renderer, 'menu', 'sidebarItem');
                }
            };
        })
            .on('to', (atlas, key) => {
            if (key === 'sidebar') {
                atlas.detach(renderer, 'menu', 'sidebarItem');
            }
            else {
                assets.sounds.select.start();
            }
        })
            .on('move', () => {
            assets.sounds.menu.start();
        }),
        sidebarItemOptions: new XNavigator({
            grid: [['use', 'info', 'drop']],
            flip: true,
            next: (self, atlas) => {
                // use item
            },
            prev: 'sidebarItem'
        })
            .wrapOn('from', self => {
            return (x, key) => {
                key === 'sidebarItem' && (self.position = { x: 0, y: 0 });
            };
        })
            .on('to', (atlas, key) => {
            key === 'sidebarItem' || assets.sounds.select.start();
        })
            .on('move', () => {
            assets.sounds.menu.start();
        }),
        sidebarStat: new XNavigator({
            prev: 'sidebar',
            objects: [
                menuBox({ h: 203, w: 167, x: 94, y: 26 }, menuText({ x: 11, y: 17 }, {}, () => `"${SAVE.name}"`), menuText({ x: 11, y: 47 }, {}, () => `LV \xa0\xa0\xa0${manager.stat(SAVE).lv}`), menuText({ x: 11, y: 63 }, {}, () => `HP \xa0\xa0\xa0${SAVE.hp} / ${manager.stat(SAVE).hp}`), menuText({ x: 11, y: 95 }, {}, () => {
                    const stat = manager.stat(SAVE);
                    return `AT \xa0\xa0\xa0${stat.at} (${stat.atx || 0})`;
                }), menuText({ x: 11, y: 111 }, {}, () => {
                    const stat = manager.stat(SAVE);
                    return `DF \xa0\xa0\xa0${stat.df} (${stat.dfx || 0})`;
                }), menuText({ x: 95, y: 95 }, {}, () => `EXP: ${SAVE.xp}`), menuText({ x: 95, y: 111 }, {}, () => `NEXT: ${manager.stat(SAVE).xp}`), menuText({ x: 11, y: 132 }, {}, () => `WEAPON: ${SAVE.weapon}`), menuText({ x: 11, y: 148 }, {}, () => `ARMOR: ${SAVE.armor}`), menuText({ x: 11, y: 168 }, {}, () => `GOLD: ${SAVE.g}`))
            ]
        })
            .on('from', atlas => {
            atlas.attach(renderer, 'menu', 'sidebarStat');
        })
            .on('to', atlas => {
            atlas.detach(renderer, 'menu', 'sidebarStat');
        }),
        sidebarCell: new XNavigator({
            grid: () => [['sidebarCellToriel', 'sidebarCellPapyrus', '0', '1']],
            next: self => {
                const selection = self.selection();
                return isNaN(+selection) ? selection : 'sidebarCellBox';
            },
            prev: 'sidebar',
            objects: [
                menuBox({ h: 129, w: 167, x: 94, y: 26 }, menuSoul({ x: 7, y: 15 }, () => selection('sidebarCell', 'sidebarCellToriel')), menuText({ x: 19, y: 15 }, {}, "Toriel's Phone"), menuSoul({ x: 7, y: 31 }, () => selection('sidebarCell', 'sidebarCellPapyrus')), menuText({ x: 19, y: 31 }, {}, 'Papyrus and Undyne'), menuSoul({ x: 7, y: 47 }, () => selection('sidebarCell', '0')), menuText({ x: 19, y: 47 }, {}, 'Dimensional Box A'), menuSoul({ x: 7, y: 63 }, () => selection('sidebarCell', '1')), menuText({ x: 19, y: 63 }, {}, 'Dimensional Box B'))
            ]
        })
            .wrapOn('from', self => {
            return (atlas, key) => {
                key === 'sidebar' && ((self.position = { x: 0, y: 0 }), atlas.attach(renderer, 'menu', 'sidebarCell'));
            };
        })
            .on('to', (atlas, key) => {
            atlas.detach(renderer, 'menu', 'sidebarCell');
            if (key === 'sidebarCellBox') {
                atlas.detach(renderer, 'menu', 'sidebar');
                assets.sounds.box.start();
            }
            else {
                key === 'sidebar' || assets.sounds.select.start();
            }
        })
            .on('move', () => {
            assets.sounds.menu.start();
        }),
        sidebarCellBox: new XNavigator({
            grid: () => [boxKeys(fixedArray(SAVE.items, 8)), boxKeys(fixedArray(currentDimBox(), 10))],
            next: self => {
                const left = self.position.x === 0;
                const source = left ? SAVE.items : currentDimBox();
                const target = left ? currentDimBox() : SAVE.items;
                const index = self.position.y;
                index < source.length && target.length < (left ? 10 : 8) && target.push(source.splice(index, 1)[0]);
            },
            prev: null,
            objects: [
                menuBox({ h: 219, w: 299, x: 8, y: 8 }, menuText({ x: 41, y: 8 }, {}, 'INVENTORY'), menuText({ x: 213, y: 8 }, {}, 'BOX'), menuText({ x: 89, y: 196 }, {}, 'Press [X] to Finish'), new XObject({
                    stroke: '#fff',
                    line: { width: 1 },
                    position: { x: 149, y: 29 },
                    objects: [
                        new XPath({
                            tracer(context, x, y) {
                                context.moveTo(x, y);
                                context.lineTo(x, y + 150);
                                context.stroke();
                            }
                        }),
                        new XPath({
                            position: { x: 2 },
                            tracer(context, x, y) {
                                context.moveTo(x, y);
                                context.lineTo(x, y + 150);
                                context.stroke();
                            }
                        })
                    ]
                }), ...new Array(24).fill(0).map((x, index) => {
                    const row = Math.floor(index / 3);
                    if (index % 3 === 0) {
                        return menuSoul({ x: 9, y: 29 + row * 16 }, () => position('sidebarCellBox', { x: 0, y: row }));
                    }
                    else if (index % 3 === 1) {
                        return menuText({ x: 21, y: 29 + row * 16 }, {}, () => SAVE.items[row] || '');
                    }
                    else {
                        return new XPath({
                            stroke: '#f00',
                            line: { width: 0.5 },
                            position: { x: 26, y: 35 + row * 16 },
                            tracer(context, x, y) {
                                if (!(row in SAVE.items)) {
                                    context.moveTo(x, y);
                                    context.lineTo(x + 90, y);
                                    context.stroke();
                                }
                            }
                        });
                    }
                }), ...new Array(30).fill(0).map((x, index) => {
                    const row = Math.floor(index / 3);
                    if (index % 3 === 0) {
                        return menuSoul({ x: 158, y: 29 + row * 16 }, () => position('sidebarCellBox', { x: 1, y: row }));
                    }
                    else if (index % 3 === 1) {
                        return menuText({ x: 170, y: 29 + row * 16 }, {}, () => currentDimBox()[row] || '');
                    }
                    else {
                        return new XPath({
                            stroke: '#f00',
                            line: { width: 0.5 },
                            position: { x: 175, y: 35 + row * 16 },
                            tracer(context, x, y) {
                                if (!(row in currentDimBox())) {
                                    context.moveTo(x, y);
                                    context.lineTo(x + 90, y);
                                    context.stroke();
                                }
                            }
                        });
                    }
                }))
            ]
        })
            .wrapOn('from', self => {
            return atlas => {
                self.position = { x: 0, y: 0 };
                atlas.attach(renderer, 'menu', 'sidebarCellBox');
            };
        })
            .on('to', atlas => {
            atlas.detach(renderer, 'menu', 'sidebarCellBox');
            global.interact = false;
        }),
        save: (() => {
            let saved = false;
            const saveText = new XObject({
                objects: [
                    menuText({ x: 13, y: 12 }, {}, () => SAVE.name),
                    menuText({ x: 79, y: 12 }, {}, () => `LV \xa0\xa0\xa0${manager.stat(SAVE).lv}`),
                    menuText({ x: 169, y: 12 }, {}, '?:??'),
                    menuText({ x: 13, y: 32 }, {}, () => roomNames[SAVE.room] || 'Unknown Location'),
                    menuSoul({ x: 14, y: 62 }, () => selection('save', 'save')),
                    menuText({ x: 28, y: 62 }, {}, () => (saved ? 'File saved.' : 'Save')),
                    menuSoul({ x: 104, y: 62 }, () => selection('save', 'return')),
                    menuText({ x: 118, y: 124 / 2 }, {}, () => (saved ? '' : 'Return'))
                ]
            });
            return new XNavigator({
                flip: true,
                grid: () => (saved ? [[]] : [['save', 'return']]),
                next: self => {
                    if (self.selection() === 'save') {
                        saved = true;
                        for (const text of saveText.objects)
                            text.fill = '#ff0';
                        assets.sounds.save.start();
                        self.position = { x: 0, y: 0 };
                        global.room === void 0 || (SAVE.room = global.room);
                        manager.save('FracturedQueenDev', SAVE);
                    }
                    else {
                        return null;
                    }
                },
                prev: null,
                objects: [menuBox({ h: 162 / 2, w: 412 / 2, x: 108 / 2, y: 118 / 2 }, saveText)]
            })
                .on('from', () => {
                global.interact = true;
                assets.sounds.heal.start();
                SAVE.hp = manager.stat(SAVE).hp;
                atlas.attach(renderer, 'menu', 'save');
            })
                .on('to', () => {
                atlas.detach(renderer, 'menu', 'save');
                for (const text of saveText.objects)
                    text.fill = '#fff';
                global.interact = false;
                saved = false;
            })
                .on('move', () => {
                assets.sounds.menu.start();
            });
        })(),
        //////////////////////////////////////////////////////////////////////////////////////////////
        //                                                                                          //
        //    DIALOGUERS                                                                            //
        //                                                                                          //
        //////////////////////////////////////////////////////////////////////////////////////////////
        storyDialoguer: new XNavigator({
            objects: [
                menuText({ x: 25, y: 150 }, { font: '16px Dialogue', spacing: { x: 0.2, y: 7.5 } }, (() => {
                    let text = '';
                    dialoguer.on('text', content => (text = content));
                    return () => text;
                })())
            ]
        })
            .on('from', () => {
            atlas.attach(renderer, 'menu', 'storyDialoguer');
        })
            .on('to', () => {
            atlas.detach(renderer, 'menu', 'storyDialoguer');
        }),
        //////////////////////////////////////////////////////////////////////////////////////////////
        //                                                                                          //
        //    FRONT-END                                                                             //
        //                                                                                          //
        //////////////////////////////////////////////////////////////////////////////////////////////
        menyoo: (() => {
            const menyooText = new XObject({
                objects: [
                    menuText({
                        x: 170 / 2,
                        y: 218 / 2
                    }, {}, '{@fill:#ff0}Continue'),
                    menuText({
                        x: 390 / 2,
                        y: 218 / 2
                    }, {}, 'Reset'),
                    menuText({
                        x: 264 / 2,
                        y: 258 / 2
                    }, {}, 'Settings')
                ]
            });
            return new XNavigator({
                flip: true,
                grid: [['continue']],
                next: self => {
                    const selection = self.selection();
                    if (selection === 'continue') {
                        spawn();
                        return null;
                    }
                    else {
                        return selection;
                    }
                },
                objects: [
                    menyooText,
                    menuText({
                        x: 140 / 2,
                        y: 132 / 2
                    }, {}, () => SAVE.name),
                    menuText({
                        x: 264 / 2,
                        y: 132 / 2
                    }, {}, () => `LV \xa0\xa0\xa0${manager.stat(SAVE).lv}`),
                    menuText({
                        x: 452 / 2,
                        y: 132 / 2
                    }, {}, '?:??'),
                    menuText({
                        x: 140 / 2,
                        y: 168 / 2
                    }, {}, () => roomNames[SAVE.room] || 'Unknown Location')
                ]
            })
                .on('from', () => {
                atlas.attach(renderer, 'menu', 'menyoo');
            })
                .on('to', () => {
                atlas.detach(renderer, 'menu', 'menyoo');
            });
        })()
    }
});
//# sourceMappingURL=menu.js.map