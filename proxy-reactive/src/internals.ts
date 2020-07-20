export const isObj = (val: any): boolean => {
  return val !== null && typeof val === 'object'
}




export const hasOwnProperty = Object.prototype.hasOwnProperty

export const globalObj = typeof window === 'object' ? window : Function('return this')();


