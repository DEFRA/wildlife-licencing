import { APPLICATIONS } from '../uris.js'

export default [
  {
    method: 'GET',
    path: '/',
    handler: async (_request, h) => h.redirect(APPLICATIONS.uri),
    options: {
      auth: false
    }
  }
]
