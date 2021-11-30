import { init, createServer } from './server.js'
import { DATABASE, REDIS } from '@defra/wls-connectors-lib'

Promise.all([
  DATABASE.initialiseConnection(),
  REDIS.initialiseConnection()])
  .then(() => createServer()
    .then(s => init(s)
    ))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
