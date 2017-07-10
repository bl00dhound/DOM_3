( () => {

let articles = []

const getJSON = (url) => fetch(url)
  .then(response => response.json())
  .catch( error => {
    console.error(error)
  })


window.onload = () => getJSON(' https://api.myjson.com/bins/152f9j')
    .then( body => {
      articles = body.data






    })





})()