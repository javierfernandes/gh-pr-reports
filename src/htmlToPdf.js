import { readFileSync } from 'fs'
import { create } from 'html-pdf'

const toPDF = (fileName) => new Promise((resolve, reject) => {
  const html = readFileSync(fileName, 'utf8')
  const options = { format: 'Letter' }
  const pdfFileName = pdfExtension(fileName)
  create(html, options).toFile(pdfFileName, function(err, res) {
    if (err) return reject(err)
    console.log('Generated PDF', pdfFileName)
    resolve(res)
  })
})

const pdfExtension = file => `${file.substr(0, file.lastIndexOf("."))}.pdf`

export default toPDF