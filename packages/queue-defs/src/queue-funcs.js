import { QUEUE } from '@defra/wls-connectors-lib'
import Queue from 'bull'
import db from 'debug'

const queues = {}

const errorHandler = error => console.error(error)
const failedHandler = job => console.error(`Job ${job.id} - ${JSON.stringify(job.data)} has failed`)
const waitingHandler = jobId => console.log(`Job ${jobId} is waiting...`)
const activeHandler = job => console.log(`Job ${job.id} - ${JSON.stringify(job.data)} is active ...`)
const completedHandler = job => console.log(`Job ${job.id} - ${JSON.stringify(job.data)} has completed`)
const stalledHandler = job => console.error(`Job ${job.id} - ${JSON.stringify(job.data)} has stalled`)

const debug = db('queue-defs:create')

export const createQueue = async (definition, ops) => {
  const msg = Object.assign({}, QUEUE.connection)
  if (msg.password) {
    msg.password = '***'
  }
  debug(`Queue connection for ${definition.name} + ${JSON.stringify(msg, null, 4)}`)
  const options = Object.assign(definition.options, { redis: QUEUE.connection }, ops)
  console.log(`Creating queue: ${definition.name} with options: ${JSON.stringify(options)}`)
  const q = new Queue(definition.name, options)

  q.clients.forEach((c, i) => debug(`Client ${i}: host: ${c.options.host} port: ${c.options.port} tls: ${c.options.tls}`))
  q.on('error', errorHandler)
  q.on('failed', failedHandler)
  q.on('waiting', waitingHandler)
  q.on('active', activeHandler)
  q.on('completed', completedHandler)
  q.on('stalled', stalledHandler)
  queues[definition.name] = q
  Object.values(queues).forEach((q, i) => debug(`Using ${i}: ${q.name} as ${ops?.type}`))

  return q
}

const getQueue = definition => queues[definition.name]

export {
  getQueue, errorHandler, waitingHandler, activeHandler, completedHandler, stalledHandler, failedHandler
}
