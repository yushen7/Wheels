import { ReactionFunction, Raw, ReactionsForRow, ReactionsForKey, Key, Operation } from '../types/index'

const reactionStore: WeakMap<Raw, ReactionsForRow> = new WeakMap()

//劫持ownkeys、values、keys等遍历操作
//数组的foreach等遍历操作由`length`这个key进行劫持
const ITERATION_KEY = Symbol("iteration key")

/** 
 * 把对响应式对象key的访问与观察函数建立关联
 * 后续就可以在修改这个key的时候 找到响应的观察函数触发
 */
export function storeReactive(raw: Raw) {
  const reactionsForRow: ReactionsForRow = new Map()
  reactionStore.set(raw, reactionsForRow)
}

//为operation注册reaction 操作目标为raw的key的映射
export function registerReactionsForOperation(reaction: ReactionFunction, {target, key, type}: Operation) {

  if (type === "iterate") {
    key = ITERATION_KEY
  }

  const reactionsForRaw = reactionStore.get(target)
  let reactionsForKey = reactionsForRaw.get(key)

  if(!reactionsForKey) {
    //如果这个key的观察函数还不存在，那么新建一个key的观察函数set
    reactionsForKey = new Set()

    //将reactionsForKey添加进reactionsForRaw，将reactionsForKey集合作为key的观察函数集合
    reactionsForRaw.set(key, reactionsForKey)
    
  }

  if(!reactionsForKey.has(reaction)) {
    //将reaction添加进raw的key的reactions集合中，这就完成了注册
    reactionsForKey.add(reaction)
    // 把key收集的观察函数集合 加到cleaners队列中 便于后续取消观察
    reaction.cleaners.push(reactionsForKey)
  }
}


//拿到operation注册的reactions，操作目标为key的映射
export function getReactionsForOperation({target, key, type}: Operation) {

  //获取到target对象的reactionsForRow
  const reactionsForTarget = reactionStore.get(target)


  //@toquestion
  //创建一个key的新集合，为何需要创建一个新的set存储reaction？
  const reactionsForKey: ReactionsForKey = new Set()
  //为reactionsForKey这个集合添加需要触发的reaction
  addReactionsForKey(reactionsForKey, reactionsForTarget, key)

  //对不同的操作进行适配
  //如果是增删数据的操作，那么需要调用 `遍历操作` 的reaction，因为一旦增删了数据，遍历raw之后的结果也将不同
  //增删数据的操作：add delete clear
  //遍历操作的key：length ITERATION_KEY
  if(type === 'add' || type === 'delete' || type === 'clear') {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATION_KEY
    addReactionsForKey(reactionsForKey, reactionsForTarget, iterationKey)
  }


  return reactionsForKey
}

function addReactionsForKey(reactionsForKey: ReactionsForKey, reactionsForTarget: ReactionsForRow, key: Key) {
  const reactions = reactionsForTarget.get(key)
  reactions && reactions.forEach(reaction => reactionsForKey.add(reaction))
}


//删除reaction对应的reactionsForKey的reaction
export function releaseReaction(reaction: ReactionFunction) {
  if(reaction.cleaners) {
    reaction.cleaners.forEach((reactionsForKey: ReactionsForKey) => {
      reactionsForKey.delete(reaction)
    })
  }

  reaction.cleaners = []
}
