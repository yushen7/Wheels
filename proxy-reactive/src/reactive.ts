import { storeReactive } from './store'
import { Raw, ReactiveProxy } from '../types'
import { getHandlers, shouldInstrument } from './handlers'

//原始对象和其proxy的双向映射
export const rawToProxy: WeakMap<Raw, ReactiveProxy> = new WeakMap()
export const proxyToRaw: WeakMap<ReactiveProxy, Raw> = new WeakMap()

export function defineReactive<T extends Raw>(raw: T): T {
  //如果已经是reactive或者raw是内置对象
  if(proxyToRaw.has(raw) || !shouldInstrument(raw)) {
    return raw
  }

  //or
  const existProxy = rawToProxy.get(raw)
  if(existProxy) {
    return existProxy as T
  }

  //创建一个reactiveProxy
  return createReactive(raw)
}

function createReactive<T extends Raw>(raw: T): T {
  //handlers是proxy的handlers，
  //适配了基本情况：对基本值的访问的劫持，
  //以及collections的情况：对map、set、weakmap、weakset的劫持
  const proxy = new Proxy(raw, getHandlers(raw))

  //把他们分别添加进这两个全局双向映射map里
  rawToProxy.set(raw, proxy)
  proxyToRaw.set(proxy, raw)

  //存储这个proxy
  storeReactive(raw)


  //这个as T有点骗别人的意思
  //好像也不是骗人，毕竟返回的proxy和原先的T类型并没有什么不同
  return proxy as T
}










