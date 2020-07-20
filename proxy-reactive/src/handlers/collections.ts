
import {
  registerRunningReaction,
  queueReactionsForOperation,
  hasRunningReaction
} from '../reaction'
import { proxyToRaw, rawToProxy, defineReactive } from '../reactive'
import { Raw, Key, ReactiveProxy, MapUnionSet, MapUnionWeak } from '../../types'
import { hasOwnProperty, isObj } from '../internals'


function findReactive (obj: Raw) {
  const reactiveObj = rawToProxy.get(obj)
  if (hasRunningReaction() && isObj(obj)) {
    if (reactiveObj) {
      return reactiveObj
    }
    return defineReactive(obj)
  }
  return reactiveObj || obj
}

function patchIterator (iterator, isEntries) {
  const originalNext = iterator.next
  iterator.next = () => {
    let { done, value } = originalNext.call(iterator)
    if (!done) {
      if (isEntries) {
        value[1] = findReactive(value[1])
      } else {
        value = findReactive(value)
      }
    }
    return { done, value }
  }
  return iterator
}

const instrumentations = {
  has (key: Key) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as MapUnionSet
    registerRunningReaction({ target, key, type: 'has' })
    return proto.has.apply(target, arguments)
  },
  get (key: Key) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as any
    registerRunningReaction({ target, key, type: 'get' })
    return findReactive(proto.get.apply(target, arguments))
  },
  add (key: Key) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as Set<any> | WeakSet<any>
    const hadKey = proto.has.call(target, key)
    // forward the operation before queueing reactions
    const result = proto.add.apply(target, arguments)
    if (!hadKey) {
      queueReactionsForOperation({ target, key, value: key, type: 'add' })
    }
    return result
  },
  set (key, value) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as MapUnionWeak
    const hadKey = proto.has.call(target, key)
    const oldValue = proto.get.call(target, key)
    // forward the operation before queueing reactions
    const result = proto.set.apply(target, arguments)
    if (!hadKey) {
      queueReactionsForOperation({ target, key, value, type: 'add' })
    } else if (value !== oldValue) {
      queueReactionsForOperation({ target, key, type: 'set' })
    }
    return result
  },
  delete (key: Key) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as MapUnionSet
    const hadKey = proto.has.call(target, key)
    const oldValue = 'get' in proto && proto.get.call(target, key) || undefined
    // forward the operation before queueing reactions
    const result = proto.delete.apply(target, arguments)
    if (hadKey) {
      queueReactionsForOperation({ target, key, type: 'delete' })
    }
    return result
  },
  clear () {
    const target = proxyToRaw.get(this) as any
    const proto = Reflect.getPrototypeOf(this) as any
    const hadItems = target.size !== 0
    const oldTarget = target instanceof Map ? new Map(target) : new Set(target)
    // forward the operation before queueing reactions
    const result = proto.clear.apply(target, arguments)
    if (hadItems) {
      queueReactionsForOperation({ target, type: 'clear' })
    }
    return result
  },
  forEach (cb: Function, ...args: any[]) {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as any
    registerRunningReaction({ target, type: 'iterate' })
    //对foreach的value挨个进行劫持
    const wrappedCb = (value: any, ...rest: any[]) => cb(findReactive(value), ...rest)
    return proto.forEach.call(target, wrappedCb, ...args)
  },
  keys () {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this)  as any
    registerRunningReaction({ target, type: 'iterate' })
    return proto.keys.apply(target, arguments)
  },
  values () {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as any
    registerRunningReaction({ target, type: 'iterate' })
    const iterator = proto.values.apply(target, arguments)
    return patchIterator(iterator, false)
  },
  entries () {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this) as any
    registerRunningReaction({ target, type: 'iterate' })
    const iterator = proto.entries.apply(target, arguments)
    return patchIterator(iterator, true)
  },
  [Symbol.iterator] () {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this)
    registerRunningReaction({ target, type: 'iterate' })
    const iterator = proto[Symbol.iterator].apply(target, arguments)
    return patchIterator(iterator, target instanceof Map)
  },
  get size () {
    const target = proxyToRaw.get(this)
    const proto = Reflect.getPrototypeOf(this)
    registerRunningReaction({ target, type: 'iterate' })
    return Reflect.get(proto, 'size', target)
  }
}

export default {
  //暴露出去的handlers只有一个get方法
  //因为对`属性`的读取，都会触发get劫持（方法也是属性）
  //通过传进来的key，判断在调用哪个方法
  get (target: Raw, key: Key, receiver: ReactiveProxy) {
    // instrument methods and property accessors to be reactive
    target = hasOwnProperty.call(instrumentations, key)
      ? instrumentations
      : target
    return Reflect.get(target, key, receiver)
  }
}
