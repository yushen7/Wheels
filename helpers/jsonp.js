/**
 * 
 * @param {String} url 请求地址
 * @param {Object} params 请求参数对象
 * @param {Function} calblack 回调函数
 */
function jsonp({url, params, callback}) {
  return new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script')
    const docBody =  document.body, delay = 5000
  
    //设置一个超时~
    const timer = setTimeout(() => {
      reject('request timeout!')
      //没有验证window[callback]是否存在，是否会误删
      delete window[callback]
    }, delay)
    //在callback执行的时候，移除该script
    window[callback] = (data) => {
      clearTimeout(timer)
      resolve(data)
      // docBody.removeChild(scriptEl)
    }
  
  
    const paramArr = Object.keys(params).map(key => `${key}=${params[key]}`)
  
    //append进去
    docBody.appendChild(scriptEl)
  
    //开始请求js
    scriptEl.src = `${url}?cb=${callback}&${paramArr.join('&')}`
  })

}


jsonp({  
  url: 'http://localhost:3000/api',
  params: {
    message: 'you idiot'
  },
  callback: 'show'
}
).then(message => {
  console.log(message)
}).catch(err => {
  throw new Error(err)
})