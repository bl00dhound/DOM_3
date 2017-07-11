( () => {
  // 'Ramda'(R) functions, that I used:
  // R.pluck: http://ramdajs.com/docs/#pluck
  // R.filter: http://ramdajs.com/docs/#filter
  // R.isNil: http://ramdajs.com/docs/#isNil
  // R.isEmpty: http://ramdajs.com/docs/#isEmpty
  // R.map: http://ramdajs.com/docs/#map
  // R.find: http://ramdajs.com/docs/#find
  // R.propEq: http://ramdajs.com/docs/#propEq

  let articles = []
  let btns = document.querySelectorAll("input[type='checkbox']")
  let tags = []


  const getJSON = (url) => fetch(url)
  .then(response => response.json())
  .catch( error => {
    console.error(error)
  })

  btns.forEach( elem => {
    elem.addEventListener('change', event => {
      tags = R.pluck('id', R.filter(checkbox => checkbox.checked)(btns))
      localStorage.setItem('tags', tags)
    })
  })


  window.onload = () => getJSON(' https://api.myjson.com/bins/152f9j')
    .then( body => {
      articles = body.data
      tags = localStorage.getItem('tags')

      if ( !R.isNil(tags) && !R.isEmpty(tags) ) {
        R.map(tag => {
          let currentBtn = R.find(R.propEq('id', tag))(btns)
          currentBtn.checked = true
        })(tags.split(','))
      }






    })





})()