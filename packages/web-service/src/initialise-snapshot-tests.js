import Nunjucks from 'nunjucks'
import path from 'path'
import find from 'find'

const GOVUK_FRONTEND = 'govuk-frontend'

const viewsPath = path.join(__dirname, './pages')

const rootDirectory = path.resolve(__dirname)

console.log('viewsPath', viewsPath)

console.log('rootDirectory', rootDirectory)

const pagesViewPaths = [...new Set(find.fileSync(/\.njk$/, viewsPath).map(f => path.dirname(f)))]

const paths = [
  path.join(__dirname, '../node_modules', GOVUK_FRONTEND),
  path.join(__dirname, '../node_modules', GOVUK_FRONTEND, 'govuk'),
  path.join(__dirname, '../node_modules', GOVUK_FRONTEND, 'govuk', 'components'),
  path.join(__dirname, 'pages/layout'),
  path.join(__dirname, 'pages/macros'),
  ...pagesViewPaths
]

const environment = Nunjucks.configure(paths)

export { Nunjucks, environment }
