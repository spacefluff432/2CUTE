type XPrimitive<A> =
   // actual primitives
   A extends string | number | boolean | null | undefined
   ? A | void :
   // hard-coded conversions
   A extends AudioBuffer
   ? AudioBuffer | void:
   A extends AudioParam | XNumber
   ? number | void :
   A extends HTMLElement
   ? HTMLElement :
   A extends (HTMLImageElement | ImageBitmap)[]
   ? (HTMLImageElement | ImageBitmap)[] | void :
   A extends XObject[]
   ? (XObject | XObjectProperties)[] | void :
   A extends XSprite
   ? XSprite | XSpriteProperties | void :
   A extends XVector
   ? { x?: number | void, y?: number | void } | void :
   // maps
   A extends Map<infer B, infer C>
   ? XPrimitive<{ [x in B]?: C }> | void :
   // arrays and sets
   A extends (infer B)[] | Set<infer B>
   ? XPrimitive<B>[] | void :
   // objects
   A extends XKeyed
   ? Partial<{ [x in keyof A]?: XPrimitive<A[x]> }> | void :
   // everything else
   never;