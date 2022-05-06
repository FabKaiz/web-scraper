const PORT = 8000
const axios = require('axios').default
const cheerio = require('cheerio')
const express = require('express')
const ObjectsToCsv = require('objects-to-csv')

const app = express()

// Max = the maximum number of articles page
const max = 38

const scrapeAll = () => {
  const articles = []
  for (let i = 1; i < max; i++) {
    const url = `https://shop.onikha.com/fr/Catalogue.html?All=1&page=${i}`

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
          .replace('€', '')

        // Get the pro price
        const prixProTtc = parseInt(prixPublicTtc.replace('€', ''))
        const prixProTtcCleaned = (prixProTtc - prixProTtc * 0.35).toFixed(2)

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
        articles.push({
          Reference: ref,
          Nomduproduit: productName,
          prixPublic: prixPublicTtc,
          prixPro: prixProTtcCleaned,
          Stock: stock,
          Famille: famille,
        })

        console.log(articles)
      })

      const dataToCsv = async (articlesArray) => {
        console.log('articles')
        const csv = new ObjectsToCsv(articles)

        // Save to file:
        await csv.toDisk('./test.csv', { allColumns: true })

        // Return the CSV file as string:
        console.log(await csv.toString())
      }
      
      // TODO
      // .xlsx file

      dataToCsv(articles)

    })
  }
}

scrapeAll()

// --=== SCRAPE ONLY FIRST PAGE ===--
// const number = 1
// const url = `https://shop.onikha.com/fr/Catalogue.html?All=1&page=${number}`

// axios(url)
//   .then(res => {
//     const html = res.data
//     const $ = cheerio.load(html)
//     const articles = []

//     $('.LigneProduit', html).each(function() {
//       // console.log('hello', $(this));
//       // Get the reference
//       const ref = $(this).find('.liRef').text().replace('Référence', '')
//       // Get the public price
//       const prixPublicTtc = $(this).find('.liPrix').text().replace('Prix TTC', '').replace(/\s+/g, '').replace('€', '')
//       // Get the pro price
//       const prixProTtc = parseInt(prixPublicTtc.replace('€', ''))
//       const prixProTtcCleaned = (prixProTtc - (prixProTtc * .35)).toFixed(2);
//       // Get the name of the product
//       const productName = $(this).find('.liNomprod').find('a').text().replace('’', "'").normalize("NFD").replace(/\p{Diacritic}/gu, "")
//       // Get the stock
//       const stock = $(this).find('.liStock').find('.QteStock').text().replace('Qté en stock :', '').replace(/\s+/g, '')
//       // Get the product familly
//       const famille = $(this).find('.liFamille').text().replace('Famille : ', '')

//       articles.push({
//         Reference: ref,
//         Nomduproduit: productName,
//         prixPublic: prixPublicTtc,
//         prixPro: prixProTtcCleaned,
//         Stock: stock,
//         Famille: famille,
//       })
//     })

//     console.log(articles);

//     (async () => {
//       const csv = new ObjectsToCsv(articles);

//       // Save to file:
//       await csv.toDisk('./test.csv', { allColumns: true });

//       // Return the CSV file as string:
//       console.log(await csv.toString());
//     })();

//   })

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
