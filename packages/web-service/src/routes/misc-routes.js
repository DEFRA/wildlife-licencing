import { APPLICATIONS } from '../uris.js'
import createApplication from '../handlers/create-application.js'

export default [
  {
    method: 'GET',
    path: '/',
    handler: async (_request, h) => h.redirect(APPLICATIONS.uri),
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/application/create',
    handler: createApplication
  }
]
