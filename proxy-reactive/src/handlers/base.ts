import { Raw, Key, ReactiveProxy, } from '../../types/index'
import { queueReactionsForOperation, registerRunningReaction } from '../reaction'
import { shouldInstrument } from './index'
import { isObj, hasOwnProperty } from '../internals'
import { rawToProxy, defineReactive } from '../reactive'


const wellKnownSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => Symbol[key])
    .filter(value => typeof value === 'symbol')
)
/**
 * get操作劫持（代理）
 * 
 *  
 * */
function get(target: Raw, key: Key, receiver: ReactiveProxy) {
  const value = Reflect.get(target, key, receiver)
  //1.这里对内置的对象属性忽略
  if(!shouldInstrument(value) || wellKnownSymbols.has(value)) {
    return value
  }
  
  //2.注册（订阅）
  registerRunningReaction({ target, key, receiver, type: "get" })

  const reactiveValue = rawToProxy.get(value)

  //3.如果这个属性值是对象，那么递归定义响应式数据
  if(isObj(value)) {
    //3.1如果这个对象已经是响应式数据了
    if(reactiveValue) 
      return reactiveValue
    //3.2如果不是，就递归
    return defineReactive(value)
  }
  //4.最后返回value，这时的value一定是基本类型值
  return value
}
/**
 * 
 * set操作劫持（代理）
 */
function set(target: Raw, key: Key, value: any, receiver: ReactiveProxy) {
  //如果新设置的值是object，那么判断是否在全局存储的映射有这个对象的proxy
  if(isObj(value)) {
    value = rawToProxy.get(value) || value
  }

  //1.判断value是否新增
  const hadProperty = hasOwnProperty.call(target, key)
  //2.判断value是否改变
  const oldValue = target[key]

  //3.需要返回这个修改之后的结果
  const setResult = Reflect.set(target, key, value, receiver)

  //4.对value的设置进行不同情况的讨论
  if(!hadProperty) {
    //4.1触发add操作的reaction，通知它们跑起来
    queueReactionsForOperation({ target, key, value, receiver, type: 'add' })
  }else if(oldValue !== value) {
    //4.2触发set操作的reaction，通知它们跑起来
    queueReactionsForOperation({ target, key, value, receiver, type: 'set' })
  }

  return setResult
}

//劫持对raw的ownKeys遍历
function ownKeys(target: Raw) {
  registerRunningReaction({target, type: 'iterate'})
  return Reflect.ownKeys(target)
}

//这是一个basehandler了
export default {
  get,
  set,
  ownKeys
}