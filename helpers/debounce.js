/**
 * @param {function} cb
 * @param {number} delay
 * 
 */
const debounce = ((function() {
  let timer = -1;
  return (cb, delay = 1000) => {
    
    
    timer > 0 && clearTimeout(timer);
    
    timer = setTimeout(()=>{
      cb();
    }, delay);
  }
})());