( () => {
  /** 'Ramda'(R) functions that I used:
   *
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
  * R.reject: http://ramdajs.com/docs/#reject
  * R.memoize: http://ramdajs.com/docs/#memoize
  */


  let btns = document.querySelectorAll("input[type='checkbox']")
  let input = document.querySelector('#search')
  let container = document.querySelector('.container')
  let row = document.querySelector('.row')
  let tags = []                     // array of tags that stores in localStorage
  let articles = []                 // general array of articles
  let sortedArticles = []           // array of articles that sorting depends of tags and dates
  let startIdx = 0                  // index for trimming array before output


  const getJSON = (url) => fetch(url)  // receive array of articles
  .then(response => response.json())
  .catch( error => {
    console.error(error)
  })

  const debounce = (func, delay) => {   // classic realizations of debounce-function
    let inDebounce = undefined
    return function() {
      let context = this
      let args = arguments
      clearTimeout(inDebounce)
      return inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
  }

  const addClass = (element, class1, class2, class3) => {  //function for creating element and adding some classes to its
    element.classList.add(class1)
    if (class2) element.classList.add(class2)
    if (class3) element.classList.add(class3)
    return element
  }

  const createNode = (tag) => document.createElement(tag)  // for createng element

  const removeCard = (event) => {           // function for removing elements from articles array
    articles = R.reject(R.propEq('id', Number(event.target.id)))(articles)  // anti-filter
    console.log(articles)
    input.value = ''
    clearDOM()
    checkingTags()
  }

  //draft DOM for creating element-card
  const cardDOM = R.memoize(() => {                // R.memoize execute function only once and after that returning its value
    let curriedAdd = R.curry(addClass)             // carrying func for comfort creating elements
    let colSm12 = curriedAdd(createNode('div'))('col-sm-12')('')('')
    let card = curriedAdd(createNode('div'))('card')('mt-2')('')
    let cardHeader = curriedAdd(createNode('div'))('card-header')('')('')
    let cardBlock = curriedAdd(createNode('div'))('card-block')('')('')
    let cardTitle = curriedAdd(createNode('div'))('card-title')('')('')
    let cardText = curriedAdd(createNode('div'))('card-text')('')('')
    let date = curriedAdd(createNode('div'))('date')('pull-right')('mr-2')
    let closeBtn = curriedAdd(createNode('button'))('fa')('fa-times')('pull-right')
    cardHeader.appendChild(closeBtn)
    cardHeader.appendChild(date)
    card.appendChild(cardHeader)
    cardBlock.appendChild(cardTitle)
    cardBlock.appendChild(cardText)
    card.appendChild(cardBlock)
    colSm12.appendChild(card)
    return colSm12
  })

  const createCard = (article) => {
    let curriedAdd = R.curry(addClass)

    let colSm12 = cardDOM().cloneNode(true)     // cloning draft and fill text values
    colSm12.querySelector('.card-title').innerText = article.title
    let description = document.createTextNode(article.description)
    let img = curriedAdd(createNode('img'))('float-l')('mr-4')('')
    img.src = article.image
    colSm12.querySelector('.date').innerText = moment(article.createdAt).format('lll')
    let cardHeader = colSm12.querySelector('.card-header')
    let cardText = colSm12.querySelector('.card-text')

    if (!R.isEmpty(article.tags)) {   //creating tags badges in header of card
      R.forEach( tag => {
        let badge = curriedAdd(createNode('span'))('badge')('badge-primary')('mr-1')
        badge.innerText = `# ${tag.toLowerCase()}`
        cardHeader.appendChild(badge)
        }
      )(article.tags)
    }
    cardText.appendChild(img)
    cardText.appendChild(description)
    document.querySelector('.row').appendChild(colSm12)
    let removeBtn = colSm12.querySelector('button.fa.fa-times')  // creating remove button
    removeBtn.id = article.id                                    // set id of article on button for binding elements
    removeBtn.addEventListener('click', removeCard)              // add listener to remove button
  }

  const checkingTags = () => {                                   // getting tags for localStorages
    tags = localStorage.getItem('tags')
    if (R.isNil(tags) || R.isEmpty(tags)) localStorage.setItem('tags', [])
    if ( !R.isNil(tags) && !R.isEmpty(tags) ) {
      R.map(tag => {
        let currentBtn = R.find(R.propEq('id', tag))(btns)
        currentBtn.checked = true
      })(tags.split(','))
    }
    sortedArticles = sortArticles()
    loadMore()
  }

  const loadMore = () => {        // depending on startIdx draw DOM elements
    if (startIdx < sortedArticles.length-1) R.map(createCard)(sortedArticles.slice(startIdx, startIdx + 10))
    if (startIdx >= sortedArticles.length-1) startIdx -= 10
    startIdx += 10
  }

  const sortArticles = (articlesForSorting = articles) => {  // add to articles new field - tagWeight for sorting by tags
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

  const clearDOM = () => {      // deleting all creating DOM-elements and set startIdx = 0
    container.removeChild(document.querySelector('.row'))
    let row = document.createElement('div')
    row.classList.add('row')
    container.appendChild(row)
    startIdx = 0
  }

  const customSorting = R.sortWith([   // creating function for sorting by two comparators, by tag and by date
    R.comparator( (a, b) => a.tagWeight > b.tagWeight),
    R.comparator( (a, b) => moment(a.createdAt).isAfter(b.createdAt))
  ])

  window.onscroll = debounce(event => {  // onscroll event for add next ten elements
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      loadMore()
    }
  })

  btns.forEach( elem => {     // add events to tag-button and save them value to LocalStorage
    elem.addEventListener('change', event => {
      tags = R.pluck('id', R.filter(checkbox => checkbox.checked)(btns))
      localStorage.setItem('tags', tags)
      sortedArticles = sortArticles()
      input.value = ''
      clearDOM()
      loadMore()
    })
  })


  const filterByValue = (query) =>  // function for filtering in articles by word
    R.filter(article => R.test(new RegExp(query, 'i'), article.title))(articles)

  input.addEventListener('input', debounce(event => {  // watcher on input, that filtering array of articles
    sortedArticles = sortArticles(filterByValue(event.target.value))
    clearDOM()
    loadMore()
  }, 200) )

  window.onload = () => getJSON('https://api.myjson.com/bins/152f9j')  // start working after load all
    .then( body => {
      let idx = 1
      articles = R.map(article => {         // creating articles, add to them new field - id
        article.id = idx++
        return article
      })(body.data)
      checkingTags()
    })

})()