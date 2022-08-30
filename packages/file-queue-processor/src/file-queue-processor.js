import { SEQUELIZE, REDIS, GRAPH } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { worker } from './worker.js'

Promise.all([
  REDIS.initialiseConnection(),
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  GRAPH.client().init(),
  createQueue(queueDefinitions.FILE_QUEUE, { type: 'subscriber' })
]).then(() => worker())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
