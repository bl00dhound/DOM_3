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
  * R.contains: http://ramdajs.com/docs/#contains
  * R.comparator: http://ramdajs.com/docs/#comparator
  * R.sortWith: http://ramdajs.com/docs/#sortWith
  */


  let btns = document.querySelectorAll("input[type='checkbox']")
  let input = document.querySelector('#search')
  let container = document.querySelector('.container')
  let row = document.querySelector('.row')
  let tags = []
  let articles = []
  let sortedArticles = []
  let startIdx = 0


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

  const cardDOM = () => {
    let curriedAdd = R.curry(addClass)
    let colSm12 = curriedAdd(createNode('div'))('col-sm-12')('')('')
    let card = curriedAdd(createNode('div'))('card')('mt-2')('')
    let cardHeader = curriedAdd(createNode('div'))('card-header')('')('')
    let cardBlock = curriedAdd(createNode('div'))('card-block')('')('')
    let cardTitle = curriedAdd(createNode('div'))('card-title')('')('')
    let cardText = curriedAdd(createNode('div'))('card-text')('')('')
    let date = curriedAdd(createNode('div'))('date')('pull-right')('')
    cardHeader.appendChild(date)
    card.appendChild(cardHeader)
    cardBlock.appendChild(cardTitle)
    cardBlock.appendChild(cardText)
    card.appendChild(cardBlock)
    colSm12.appendChild(card)
    return colSm12
  }

  const createCard = (article) => {
    let curriedAdd = R.curry(addClass)

    let colSm12 = cardDOM().cloneNode(true)
    colSm12.querySelector('.card-title').innerText = article.title
    let description = document.createTextNode(article.description)
    let img = curriedAdd(createNode('img'))('float-l')('mr-4')('')
    img.src = article.image
    colSm12.querySelector('.date').innerText = moment(article.createdAt).format('lll')
    let cardHeader = colSm12.querySelector('.card-header')
    let cardText = colSm12.querySelector('.card-text')

    if (!R.isEmpty(article.tags)) {
      R.forEach( tag => {
        let badge = curriedAdd(createNode('span'))('badge')('badge-danger')('mr-1')
        badge.innerText = `# ${tag.toLowerCase()}`
        cardHeader.appendChild(badge)
        }
      )(article.tags)
    }
    cardText.appendChild(img)
    cardText.appendChild(description)
    document.querySelector('.row').appendChild(colSm12)
  }

  const checkingTags = () => {
    tags = localStorage.getItem('tags')
    if ( !R.isNil(tags) && !R.isEmpty(tags) ) {
      R.map(tag => {
        let currentBtn = R.find(R.propEq('id', tag))(btns)
        currentBtn.checked = true
      })(tags.split(','))
    }
    sortedArticles = sortArticles()
    loadMore()
  }

  const loadMore = () => {
    // startIdx = startIdx > sortedArticles.length ? startIdx : startIdx + 10
    startIdx += 10
    if (startIdx < sortedArticles.length-1) R.map(createCard)(sortedArticles.slice(startIdx - 10, startIdx))
    if (startIdx >= sortedArticles.length-1) startIdx = sortedArticles.length
    console.log(startIdx)
  }

  const sortArticles = (articlesForSorting = articles) => {
    let result = R.map(article => {
      let tagWeight = 0
      R.forEach(tag => {
        if (R.contains(tag.toLowerCase(), tags)) tagWeight++
      })(article.tags)
      article.tagWeight = tagWeight
      return article
    })(articlesForSorting)
    return customSorting(result)
  }

  const clearDOM = () => {
    container.removeChild(document.querySelector('.row'))
    let row = document.createElement('div')
    row.classList.add('row')
    container.appendChild(row)
    startIdx = 0
  }

  const customSorting = R.sortWith([
    R.comparator( (a, b) => a.tagWeight > b.tagWeight),
    R.comparator( (a, b) => moment(a.createdAt).isAfter(b.createdAt))
  ])

  window.onscroll = debounce(event => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      loadMore()
    }
  })

  btns.forEach( elem => {
    elem.addEventListener('change', event => {
      tags = R.pluck('id', R.filter(checkbox => checkbox.checked)(btns))
      localStorage.setItem('tags', tags)
      sortedArticles = sortArticles()
      input.value = ''
      clearDOM()
      loadMore()

    })
  })

  input.addEventListener('input', debounce(event => {
    console.log(event.target.value)
    let filteredArticles = R.filter(article => R.test(new RegExp(event.target.value, 'i'), article.title))(articles)
    sortedArticles = sortArticles(filteredArticles)
    console.log(sortedArticles)
    clearDOM()
    loadMore()
  }, 200) )

  window.onload = () => getJSON(' https://api.myjson.com/bins/152f9j')
    .then( body => {
      articles = body.data
      checkingTags()
    })

})()