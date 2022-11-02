const PORT = process.env.PORT || 8000
const axios = require('axios').default
const cheerio = require('cheerio')
const express = require('express')

const app = express()
let maxPages

// Static files
app.use(express.static('.'))
app.use('/css', express.static(__dirname + '/pages/css'))
app.use('/js', express.static(__dirname + '/pages/js'))
// app.use('/images', express.static(__dirname + '/pages/images'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/articles', async (req, res) => {
  const articles = []
  getMaxPages()

  // Get 10 pages and store data in articles array every 5 seconds
  for (let i = 1; i < 11; i++) {
    scrapeOne(i, articles)
  }

  setTimeout(() => {
    for (let i = 11; i < 21; i++) {
      scrapeOne(i, articles)
    }
  }, 5000)

  setTimeout(() => {
    for (let i = 21; i < 31; i++) {
      scrapeOne(i, articles)
    }
  }, 10000)

  setTimeout(() => {
    for (let i = 31; i < maxPages + 1; i++) {
      scrapeOne(i, articles)
    }
  }, 15000)

  // Send the array to the front at '/articles'
  setTimeout(() => {
    res.json(articles)
  }, 20000)
})

const getMaxPages = async () => {
  const url = `https://shop.onikha.com/fr/Catalogue.html?All=1&page=1`

  axios(url).then((res) => {
    const html = res.data
    const $ = cheerio.load(html)

    // Get number of pages
    const pages = $('.PaginationHaut')
      .find('.Numero')
      .find('a:nth-child(5)')
      .text()

    maxPages = parseInt(pages)
  })
}


// --=== SCRAPE ONE PAGE ===--
const scrapeOne = (number, articlesArray) => {
  const url = `https://shop.onikha.com/fr/Catalogue.html?All=1&page=${number}`

  axios(url).then((res) => {
    const html = res.data
    const $ = cheerio.load(html)

    $('.LigneProduit', html).each(function () {
      // Get the reference
      const ref = $(this)
        .find('.liRef')
        .text()
        .replace('Référence', '')
        .replace('’', "'")
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace('N°', 'N ')

      // Get the public price
      const prixPublicTtc = $(this)
        .find('.liPrix')
        .text()
        .replace('Prix TTC', '')
        .replace(/\s+/g, '')
        .replace(/ *\([^)]*\) */g, '')
        .replace('€', '')
        .replace(',', '.')

      // Get the pro price withtout VAT and public price converted to a Number
      const prixPublicTtcCleaned = parseFloat(prixPublicTtc)
      const prixProTtcCleaned = Number((prixPublicTtcCleaned - prixPublicTtcCleaned * 0.4).toFixed(2))

      // Get the name of the product
      const productName = $(this)
        .find('.liNomprod')
        .find('a')
        .text()
        .replace('’', "'")
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')

      // Get the stock
      const stock = $(this)
        .find('.liStock')
        .find('.QteStock')
        .text()
        .replace('Qté en stock :', '')
        .replace(/\s+/g, '')
        .replace(',', '')

      // Get the product familly
      const famille = $(this)
        .find('.liFamille')
        .text()
        .replace('Famille : ', '')
        .replace('’', "'")
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')

      // Push all the data in Array
      articlesArray.push({
        Reference: ref,
        Nomduproduit: productName,
        prixPublic: prixPublicTtcCleaned,
        prixPro: prixProTtcCleaned,
        Stock: Number(stock),
        Famille: famille,
      })
    })
  })
  return articlesArray
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
