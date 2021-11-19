import Hapi from '@hapi/hapi'
import { SERVER_PORT } from './constants.js'

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const createServer = async () => new Hapi.Server({ port: SERVER_PORT })

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {
  /*
   * Direct the generic hapi route handler to the openapi backend
   */
  server.route({
    method: 'GET',
    path: '/hello',
    handler: (req, h) => h.response('Hello world!').code(200)
  })

  /*
   * Set up shutdown handlers
   */
  const shutdown = async code => {
    console.log(`Web server is shutdown with ${code}`)
    await server.stop()
    process.exit(code)
  }

  process.on('SIGINT', () => shutdown(130))
  process.on('SIGTERM', () => shutdown(137))

  /*
   * Start the server
   */
  try {
    await server.start()
    console.log('Server running at:', server.info.uri)
  } catch (err) {
    console.log(err)
  }
}

export { init, createServer }
