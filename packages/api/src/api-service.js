import db from 'debug'
import { init, createServer } from './server.js'
import { SEQUELIZE, REDIS, ERRBIT } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import fs from 'fs'

const initialize = async () => {
  await SEQUELIZE.initialiseConnection()
  await createModels()
  await REDIS.initialiseConnection()
  await createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.RETURN_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.LICENCE_RESEND_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.APPLICATION_FILE_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.RETURN_FILE_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.FEEDBACK_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.USER_DETAILS_QUEUE, { type: 'client' })
  await createQueue(queueDefinitions.ORGANISATION_DETAILS_QUEUE, { type: 'client' })
}

const debug = db('api:env')

// Warning -- may print sensitive info. Ensure disabled in production
debug(`Environment: ${JSON.stringify(process.env)}`)
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)
ERRBIT.initialize('API')

initialize()
  .then(() => createServer()
    .then(s => init(s)))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
