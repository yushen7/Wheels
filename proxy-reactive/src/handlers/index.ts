import BaseHandler from './base'
import CollectionHandlers from './collections'
import { Raw } from '../../types'
import { globalObj } from '../internals'


/* @ts-ignore */
export const handlers = new Map([
  [Map, CollectionHandlers],
  [Set, CollectionHandlers],
  [WeakMap, CollectionHandlers],
  [WeakSet, CollectionHandlers],
  [Object, BaseHandler],
  [Array, BaseHandler],
  [Int8Array, BaseHandler],
  [Uint8Array, BaseHandler],
  [Uint8ClampedArray, BaseHandler],
  [Int16Array, BaseHandler],
  [Uint16Array, BaseHandler],
  [Int32Array, BaseHandler],
  [Uint32Array, BaseHandler],
  [Float32Array, BaseHandler],
  [Float64Array, BaseHandler]
])
export function shouldInstrument ({ constructor }) {
  const isBuiltIn =
    typeof constructor === 'function' &&
    constructor.name in globalObj &&
    globalObj[constructor.name] === constructor
  return !isBuiltIn || handlers.has(constructor)
}

export function getHandlers(raw: Raw) {
  /* @ts-ignore */
  return handlers.get(raw.constructor)
}