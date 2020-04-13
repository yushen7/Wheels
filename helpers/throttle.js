/**@param {function} cb
 * @param {number} delay
 * 
*/
const throttle = ((()=>{
  let timer = -1, count = 0;

  return (cb, delay = 1000) => {
    // closure varible 'timer'
    if(timer > 0) return;
    timer = setTimeout(() => {
      cb(); 
      timer = clearTimeout(timer);
      cb = null;
    }, delay);
  }
})());

