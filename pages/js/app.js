import * as xlsx from 'https://unpkg.com/xlsx/xlsx.mjs'

const exportExcel = (data, workSheetColumnNames, workSheetName) => {
  const workBook = xlsx.utils.book_new()
  const workSheetData = [workSheetColumnNames, ...data]
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData)
  xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName)
  xlsx.writeFile(workBook, 'TESTING.xlsx')
}

const exportArticlesToExcel = (
  articles,
  workSheetColumnNames,
  workSheetName
) => {
  const data = articles.map((article) => {
    return [
      article.Reference,
      article.Nomduproduit,
      article.prixPublic,
      article.prixPro,
      article.Stock,
      article.Famille,
    ]
  })
  exportExcel(data, workSheetColumnNames, workSheetName)
}

const btn = document.querySelector('button')


const getData = () => {
  fetch('http://localhost:8000/articles')
    .then((res) => res.json())
    .then((data) => {
      const articles = data
      console.log("Nombre d'articles: ", articles.length)

      const workSheetColumnNames = [
        'Reference',
        'Nom du produit',
        'Prix Public',
        'Prix Pro',
        'Stock',
        'Famille',
      ]
      const workSheetName = 'Articles'
      const filePath = '../../outputFiles/xlsx-from-js.xlsx'

      exportArticlesToExcel(
        articles,
        workSheetColumnNames,
        workSheetName,
        filePath
      )
    })
}

btn.addEventListener('click', () => getData())
