/**
 * 
 * @param {Object} obj 
 * @param {Function} constructor 
 */
export function myInstanceof(obj, constructor) {
  if(!obj || typeof obj !== 'object') return new TypeError('obj must be an Object!')
  if(typeof constructor !== 'function') return new TypeError('constructor must be a Function!')
  var L = getProto(obj), R = constructor.prototype

  while(L !== R) {
    L  = getProto(L)
    if(!L) break
  }

  return L ? true : false
}

function Person(name) {
  this.name = name
}
var p1 = new Person('jack slowfuck')




myInstanceof(p1, Person)
myInstanceof(p1, function(){})
myInstanceof(p1, Object)





function getProto(obj) {
  if(Object.getPrototypeOf) {
    return Object.getPrototypeOf(obj)
  }else if(obj.__proto__){
    return obj.__proto__
  }else {
    return obj.constructor.prototype
  }
}