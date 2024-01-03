import Nunjucks from 'nunjucks'
import path from 'path'
import find from 'find'
import { readFile } from 'fs/promises'

const GOVUK_FRONTEND = 'govuk-frontend'

const viewsPath = path.join(__dirname, './pages')

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

const compileTemplate = async (filePath) => {
  const source = await readFile(filePath, { encoding: 'utf8' })
  return Nunjucks.compile(source, environment)
}

export { compileTemplate }
