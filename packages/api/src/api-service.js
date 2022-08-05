import { init, createServer } from './server.js'
import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'

const initialize = async () => {
  await SEQUELIZE.initialiseConnection()
  await createModels()
  await REDIS.initialiseConnection()
  await createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.FILE_QUEUE, { type: 'client' })
}

initialize()
  .then(() => createServer()
    .then(s => init(s)))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
