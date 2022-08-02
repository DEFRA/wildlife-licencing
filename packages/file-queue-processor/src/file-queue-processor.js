import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
// import { worker } from './worker.js'
import { test } from './file-job-process.js'

Promise.all([
  REDIS.initialiseConnection(),
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  createQueue(queueDefinitions.FILE_QUEUE, { type: 'subscriber' })
]).then(() => test())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
