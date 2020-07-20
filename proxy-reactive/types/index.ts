export type Raw = object
export type ReactiveProxy = object
export type Key = string | number | symbol

export type ReactionFunction = Function & {
  unobserved?: boolean,
  cleaners?: ReactionsForKey[]
}

//对象的key的观察者，是一组set
export type ReactionsForKey = Set<ReactionFunction>


//对象的key和其观察者集合的映射，
export type ReactionsForRow = Map<Key, ReactionsForKey>

export type MapUnionSet = Map<any, any> | Set<any> | WeakMap<object, any> | WeakSet<object>
export type MapUnionWeak = Map<any, any> | WeakMap<object, any>
export type SetUnionWeak = Set<any> | WeakSet<object>
export type Operation = {
  type: 'get' | 'iterate' | 'add' | 'set' | 'delete' | 'clear' | 'has'

  //getter 和 setter四要素
  target: Raw,
  key?: Key,
  value?: any,
  receiver?: any
}