import { ERRBIT, SEQUELIZE } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions, queueWorker } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { applicationJobProcess } from './application-job-process.js'
import { licenceResendJobProcess } from './licence-resend-job-process.js'
import { returnJobProcess } from './return-job-process.js'
import fs from 'fs'

ERRBIT.initialize('Application queue processor')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

const createQueues = async () => {
  await createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.RETURN_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.LICENCE_RESEND_QUEUE, { type: 'subscriber' })
}

const startQueues = async () => {
  await queueWorker(queueDefinitions.APPLICATION_QUEUE, applicationJobProcess)
  await queueWorker(queueDefinitions.RETURN_QUEUE, returnJobProcess)
  await queueWorker(queueDefinitions.LICENCE_RESEND_QUEUE, licenceResendJobProcess)
}

Promise.all([
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  createQueues()
]).then(startQueues)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
