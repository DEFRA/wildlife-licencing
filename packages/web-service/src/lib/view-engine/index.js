import Nunjucks from 'nunjucks'

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
  engineRender // Exported for unit testing
}
