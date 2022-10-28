import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions, queueWorker } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { applicationJobProcess } from './application-job-process.js'

Promise.all([
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'subscriber' })
]).then(() => queueWorker(queueDefinitions.APPLICATION_QUEUE, applicationJobProcess))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
