import { QUEUE } from '@defra/wls-connectors-lib'
import Queue from 'bull'

const queues = {}

const errorHandler = error => console.error(error)
const waitingHandler = jobId => console.log(`Job ${jobId} is waiting...`)
const activeHandler = job => console.log(`Job ${job.id} - ${JSON.stringify(job.data)} is active ...`)
const completedHandler = job => console.log(`Job ${job.id} - ${JSON.stringify(job.data)} has completed`)
const stalledHandler = job => console.error(`Job ${job.id} - ${JSON.stringify(job.data)} has stalled`)

export const createQueue = async (definition, ops) => {
  const options = Object.assign(definition.options, { redis: QUEUE.connection }, ops)
  console.log(`Creating queue: ${definition.name} with options: ${JSON.stringify(options)}`)
  const q = new Queue(definition.name, options)

  q.on('error', errorHandler)
  q.on('waiting', waitingHandler)
  q.on('active', activeHandler)
  q.on('completed', completedHandler)
  q.on('stalled', stalledHandler)

  queues[definition.name] = q
  return Promise.resolve(q)
}

const getQueue = definition => queues[definition.name]

export {
  getQueue, errorHandler, waitingHandler, activeHandler, completedHandler, stalledHandler
}

