/**
 * 
 * @param {Object} origin 
 * @param {Boolean} deep
 */
export function clone({origin = {}, deep = false }) {
  let target = {}
  if(!deep) {
    // 1.
    //Object.assign(target, origin)

    // 2.
    Object.keys(origin).forEach(originKey => target[originKey] = origin[originKey])

  }else {

    // 1.
    //target = JSON.parse(JSON.stringify(origin))

    // 2.
    if(Array.isArray(origin)) {
      target = []
    }
    Object.keys(origin).forEach(originKey => {
      const value = origin[originKey]
      let _t
      if(isObj(value)) {
        _t = clone({origin: value, deep: true})
      }else {
        _t = value
      }
      target[originKey] = _t
    })
  }
  return target
}

function isObj(anyType) {
  return !!anyType && typeof anyType === 'object'
}


let origin = {
  name: 'origin',
  age: '18',
  children: [
    {
      name: 'johon',
      age: '1'
    },
    {
      name: 'jack',
      age: '2'
    }
  ]
}
let target = clone({origin, deep: true})