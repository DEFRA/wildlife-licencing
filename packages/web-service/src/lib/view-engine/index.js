import Nunjucks from 'nunjucks'
import filters from './filters.js'

const addFilters = (env) => {
  for (const key in filters) {
    env.addFilter(key, filters[key])
  }

  return env
}

const engineRender = (context, template) => {
  context.assetPath = '/public'
  return template.render(context)
}

const nunjucksEngine = {
  compile: (src, options) => {
    const template = Nunjucks.compile(src, options.environment)
    return (context) => engineRender(context, template)
  },

  prepare: (options, next) => {
    const paths = [
      options.path,
      `${options.path}/common/`,
      `${options.path}/forms/`,
      'node_modules/govuk-frontend/'
    ]

    const config = {
      noCache: true
    }

    const env = Nunjucks.configure(paths, config)
    addFilters(env)

    options.compileOptions.environment = env

    return next()
  }

}

export default {
  wrapper: {
    engines: {
      njk: nunjucksEngine
    },
    path: './views',
    isCached: process.env.NODE_ENV === 'production',
    defaultExtension: 'njk'
  },
  addFilters, // Exported for unit testing
  engineRender // Exported for unit testing
}
