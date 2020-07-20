import {
  ReactionFunction, Operation,
  Raw
} from '../types/index'

import { registerReactionsForOperation, getReactionsForOperation, releaseReaction } from './store'

const reactionStack: ReactionFunction[] = []


//set的时候，挨个触发观察函数
export function queueReactionsForOperation(operation: Operation) {
  getReactionsForOperation(operation).forEach(reaction => reaction())
}


//get的时候，收集依赖
export function registerRunningReaction(operation: Operation) {
  //获取当前的reaction观察函数
  const runninReaction = getRunningReaction()
  
  if(runninReaction) {
    registerReactionsForOperation(runninReaction, operation)
  }
}

//包装一下rawFn
export function runReactionWrap(reaction: ReactionFunction, rawFn: Function, context: any, args: any[]) {
  //如果reaction是unobserve的，那么直接调用rawFn
  if(!reaction.unobserved) {
    Reflect.apply(rawFn, context, args)
  }


  //reaction是否在栈中
  if(isRunning(reaction)) {
    return
  }

  //释放reaction，你自由了，不用再被对应的key触发了
  releaseReaction(reaction)

  try {
    //push reaction，将其作为runninreaction
    reactionStack.push(reaction)
    return Reflect.apply(rawFn, context, args)
  }finally {
    //pop reaction，不再是runningreaction
    reactionStack.pop()
  }

}


//获取当前的target，vue中的dep.target。现在需要收集的依赖
function getRunningReaction() {
  const [runningReaction] = reactionStack.slice(-1)
  return runningReaction
}


function isRunning(reaction: ReactionFunction) {
  return reactionStack.includes(reaction)
}


/** 当前是否有正在运行的观察函数 */
export function hasRunningReaction() {
  return reactionStack.length > 0
}
