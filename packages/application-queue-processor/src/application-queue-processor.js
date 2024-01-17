import { ERRBIT, SEQUELIZE } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions, queueWorker } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { applicationJobProcess } from './application-job-process.js'
import { licenceResendJobProcess } from './licence-resend-job-process.js'
import { returnJobProcess } from './return-job-process.js'
import { feedbackJobProcess } from './feedback-job-process.js'
import fs from 'fs'
import { userDetailsJobProcess } from './user-details-job-process.js'
import { organisationDetailsJobProcess } from './organisation-details-job-process.js'

ERRBIT.initialize('Application queue processor')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

const createQueues = async () => {
  await createQueue(queueDefinitions.APPLICATION_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.RETURN_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.LICENCE_RESEND_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.FEEDBACK_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.USER_DETAILS_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.ORGANISATION_DETAILS_QUEUE, { type: 'subscriber' })
}

const startQueues = async () => {
  await queueWorker(queueDefinitions.APPLICATION_QUEUE, applicationJobProcess)
  await queueWorker(queueDefinitions.RETURN_QUEUE, returnJobProcess)
  await queueWorker(queueDefinitions.LICENCE_RESEND_QUEUE, licenceResendJobProcess)
  await queueWorker(queueDefinitions.FEEDBACK_QUEUE, feedbackJobProcess)
  await queueWorker(queueDefinitions.USER_DETAILS_QUEUE, userDetailsJobProcess)
  await queueWorker(queueDefinitions.ORGANISATION_DETAILS_QUEUE, organisationDetailsJobProcess)
}

Promise.all([
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  createQueues()
]).then(startQueues)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
