import { init, createServer } from './server.js'
import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'

Promise.all([
  SEQUELIZE.initialiseConnection()
    .then(() => createModels()),
  REDIS.initialiseConnection(),
  createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'client' })
]).then(() => createServer()
  .then(s => init(s)))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
