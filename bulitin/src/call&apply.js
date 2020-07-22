/**
 * 
 * 
 * motivation: none
 * 
 * call模拟实现：
 *  1. call指定了调用的this
 *  2. call的参数是单个单个给出的
 *  3. call返回了原函数的返回值
 * 
 * @param {Function} fn function to call
 * @param {Object} obj this value
 */
export function myCall(fn, obj) {
  //1.检测参数
  if(typeof fn !== 'function') return new TypeError('fn must be a Function!')
  obj = typeof obj !== 'object' || obj === null ? window : obj

  var origin = null, tmpKey = 'tmpFn', hasProperty = false

  //2.绑定上下文this
  //可能存在同名字的属性
  if(obj.hasOwnProperty(tmpKey)) {
    hasProperty = true
    origin = obj[tmpKey]
  }
  obj[tmpKey] = fn

  //3.构造原函数参数
  //参数用于eval执行
  var args = []
  for(var i = 2; i < arguments.length; i++) {
    args.push('arguments[' + i + ']')
  }

  //4.执行绑定this且构造了参数的原函数
  var result = eval('obj[tmpKey](' + args + ')')
  

  //删除
  delete obj[tmpKey] 
  //恢复
  hasProperty && (obj[tmpKey] = origin)

  return result
}

const obj = {
  name: 'bendan',
  sayName(a, b, c, d) {
    return this.name + a + b + c + d
  }
}

myCall(obj.sayName, obj, 'a', 'b', 'c', 'd')


/**
 * 
 * @param {Object} obj this value 
 * @param {Function} fn function to apply 
 * @param {Array} arr arguments array
 */

export function myApply(fn, obj, arr) {
  if(typeof fn !== 'function') return new TypeError('fn must be a Function!')
  obj = typeof obj !== 'object' || obj === null ? window : obj

  //argument list here
  var origin = null, tmpKey = 'tmpFn', hasProperty = false

  //可能存在同名字的属性
  if(obj.hasOwnProperty(tmpKey)) {
    hasProperty = true
    origin = obj[tmpKey]
  }
  obj[tmpKey] = fn

  //参数用于eval执行
  var args = []
  for(var i = 2; i < arr.length; i++) {
    args.push('arguments[' + i + ']')
  }

  var result = eval('obj[tmpKey](' + args + ')')
  

  //删除
  delete obj[tmpKey] 
  //恢复
  hasProperty && (obj[tmpKey] = origin)

  return result  
} 



const obj2 = {
  name: 'shagua',
  sayName(arr) {
    return this.name + arr
  }
}

myApply(obj.sayName, obj2, ['a', 'b', 'c', 'd'])
