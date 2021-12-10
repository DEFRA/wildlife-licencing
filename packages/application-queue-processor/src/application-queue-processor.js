import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { jobProcess } from './process.js'

Promise.all([
  SEQUELIZE.initialiseConnection()
    .then(() => createModels()),
  createQueue(queueDefinitions.APPLICATION_QUEUE)
]).then(() => jobProcess())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
