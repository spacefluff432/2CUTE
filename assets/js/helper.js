export function roomWall(bounds) {
    return new XEntity({
        attributes: { collide: true },
        bounds: { h: bounds.h, w: bounds.w, x: 0, y: 0 },
        position: { x: bounds.x, y: bounds.y }
    });
}
export function staticSprite(source) {
    return new XSprite({
        attributes: { persist: true },
        textures: [new XTexture({ source })]
    });
}
