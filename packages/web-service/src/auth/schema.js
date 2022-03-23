import Boom from '@hapi/boom'

export default (server, options) => ({
  authenticate: (request, h) => {
    // if (!authorization) {
    // throw Boom.unauthorized(null, 'default')
    // }

    return h.authenticated({ credentials: { user: 'john' } })
  }
})
