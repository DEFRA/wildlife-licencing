import Path from 'path'
import Hapi from '@hapi/hapi'
import HapiVision from '@hapi/vision'
import HapiInert from '@hapi/inert'
import routes from './routes/index.js'
import {SERVER_PORT} from './constants.js'
import viewEngine from './lib/view-engine/index.js'

/**
 * Create the hapi server. Exported for unit testing purposes
 * @returns {Promise<*>}
 */
const __dirname = Path.resolve();
console.log(Path.join(__dirname, 'public'))
const createServer = async () => new Hapi.Server({
    port: SERVER_PORT, routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
})

/**
 * Initialize the server. Exported for unit testing
 * @param server
 * @returns {Promise<any>}
 */
const init = async server => {

    /* Registering routes */
    await server.route(routes);

    /* Registering plugins */
    await server.register(HapiVision);
    await server.register(HapiInert);
    await server.views(viewEngine)
    server.route({
        method: 'GET',
        path: '/public/{param*}',
        handler: {
            directory: {
                path: Path.join(__dirname, 'public')
            }
        }
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

export {init, createServer}
