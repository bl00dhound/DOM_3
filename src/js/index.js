( () => {
  /** 'Ramda'(R) functions that I used:
  * R.pluck: http://ramdajs.com/docs/#pluck
  * R.filter: http://ramdajs.com/docs/#filter
  * R.isNil: http://ramdajs.com/docs/#isNil
  * R.isEmpty: http://ramdajs.com/docs/#isEmpty
  * R.map: http://ramdajs.com/docs/#map
  * R.find: http://ramdajs.com/docs/#find
  * R.propEq: http://ramdajs.com/docs/#propEq
  * R.curry: http://ramdajs.com/docs/#curry
  * R.forEach: http://ramdajs.com/docs/#forEach
  */


  let articles = []
  let btns = document.querySelectorAll("input[type='checkbox']")
  let input = document.querySelector('#search')
  let row = document.querySelector('#row')
  let tags = []


  const getJSON = (url) => fetch(url)
  .then(response => response.json())
  .catch( error => {
    console.error(error)
  })

  const debounce = (func, delay) => {
    let inDebounce = undefined
    return function() {
      let context = this
      let args = arguments
      clearTimeout(inDebounce)
      return inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
  }

  const addClass = (element, class1, class2, class3) => {
    element.classList.add(class1)
    if (class2) element.classList.add(class2)
    if (class3) element.classList.add(class3)
    return element
  }

  const createNode = (tag) => document.createElement(tag)

  const createCard = (article, tags) => {
    let curriedAdd = R.curry(addClass)

    let colSm12 = curriedAdd(createNode('div'))('col-sm-12')('')('')
    let card = curriedAdd(createNode('div'))('card')('mt-2')('')
    let cardHeader = curriedAdd(createNode('div'))('card-header')('')('')
    let cardBlock = curriedAdd(createNode('div'))('card-block')('')('')
    let cardTitle = curriedAdd(createNode('div'))('card-title')('')('')
    cardTitle.innerText = article.title
    let cardText = curriedAdd(createNode('div'))('card-text')('')('')
    let description = document.createTextNode(article.description)
    // cardText.innerText = article.description
    let img = curriedAdd(createNode('img'))('float-l')('mr-4')('')
    img.src = article.image
    let date = curriedAdd(createNode('div'))('date')('pull-right')('')
    date.innerText = moment(article.createdAt).format('lll')

    if (!R.isEmpty(article.tags)) {
      R.forEach( tag => {
        let badge = curriedAdd(createNode('span'))('badge')('badge-danger')('mr-1')
        badge.innerText = `# ${tag.toLowerCase()}`
        cardHeader.appendChild(badge)
        }
      )(article.tags)
    }
    cardHeader.appendChild(date)
    card.appendChild(cardHeader)
    cardText.appendChild(img)
    cardText.appendChild(description)
    cardBlock.appendChild(cardTitle)
    cardBlock.appendChild(cardText)
    card.appendChild(cardBlock)
    colSm12.appendChild(card)
    row.appendChild(colSm12)
  }




  btns.forEach( elem => {
    elem.addEventListener('change', event => {
      tags = R.pluck('id', R.filter(checkbox => checkbox.checked)(btns))
      localStorage.setItem('tags', tags)
    })
  })

  input.addEventListener('input', debounce(event => {
    console.log(event.target.value)
  }, 200) )


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

      createCard(articles[0], tags)


    })





})()