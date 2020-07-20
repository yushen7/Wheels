import { ReactionFunction } from '../types/index'
import { runReactionWrap } from './reaction'
import { releaseReaction } from './store'


const IS_REACTION_FN = Symbol('is reaction function')

export function observe(rawFn: Function): ReactionFunction {
  //进行判重，判断rawFn是否已经是reaction了
  if(rawFn[IS_REACTION_FN]) {
    return rawFn as ReactionFunction
  }


  const reaction = (...args: any[]) => {
    runReactionWrap(reaction, rawFn, this, args)
  }

  //对回调rawFn先执行一次，让store收集依赖
  reaction()

  return reaction
}

//释放观察函数
export function unobserve(reaction: ReactionFunction) {
  if(!reaction.unobserved) {
    reaction.unobserved = true
    releaseReaction(reaction)
  }
}