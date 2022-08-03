import { init, createServer } from './server.js'
import { initializeClamScan } from './services/virus-scan.js'
import { REDIS } from '@defra/wls-connectors-lib'

REDIS.initialiseConnection()
  .then(() => initializeClamScan()
    .then(() => createServer()
      .then(s => init(s).catch(e => {
        console.error(e)
        process.exit(1)
      }))))
