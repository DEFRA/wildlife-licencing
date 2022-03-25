import { init, createServer } from './server.js'
import { REDIS } from '@defra/wls-connectors-lib'

REDIS.initialiseConnection()
  .then(() => createServer()
    .then(s =>
      init(s).catch(e => {
        console.error(e)
        process.exit(1)
      })
    ))
