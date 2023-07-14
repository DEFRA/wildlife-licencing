import { SEQUELIZE, GRAPH, ERRBIT } from '@defra/wls-connectors-lib'
import { createQueue, queueDefinitions, queueWorker } from '@defra/wls-queue-defs'
import { createModels } from '@defra/wls-database-model'
import { applicationFileJobProcess } from './application-file-job-process.js'
import { returnFileJobProcess } from './return-file-job-process.js'
import fs from 'fs'

ERRBIT.initialize('File queue processor')
const json = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
console.log(`Starting ${json.name}:${json.version}`)

const createQueues = async () => {
  await createQueue(queueDefinitions.APPLICATION_FILE_QUEUE, { type: 'subscriber' })
  await createQueue(queueDefinitions.RETURN_FILE_QUEUE, { type: 'subscriber' })
}

const startQueues = async () => {
  await queueWorker(queueDefinitions.APPLICATION_FILE_QUEUE, applicationFileJobProcess)
  await queueWorker(queueDefinitions.RETURN_FILE_QUEUE, returnFileJobProcess)
}

Promise.all([
  SEQUELIZE.initialiseConnection().then(() => createModels()),
  GRAPH.client().init(),
  createQueues()
]).then(startQueues)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
