import { init, createServer } from './server.js'
import { DATABASE } from '@defra/wls-connectors-lib'

DATABASE.initialiseConnection()
  .then(() => createServer()
    .then(s => init(s)
    ))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
