import { APPLICATIONS } from '../uris.js'

export default [
  {
    method: 'GET',
    path: '/',
    handler: async (request, h) => h.redirect(APPLICATIONS.uri)
  }
]
