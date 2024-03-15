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
  const msg = Object.assign({}, QUEUE.connection, QUEUE.connection.password && { password: '***' })
  debug(`Queue connection for ${definition.name} + ${JSON.stringify(msg)}`)
  const options = Object.assign(definition.options, { redis: QUEUE.connection }, ops)
  console.log(`Creating queue: ${definition.name} with options: ${JSON.stringify(Object.assign({}, options, { redis: undefined }))}`)
  const queue = new Queue(definition.name, options)

  queue.clients.forEach((c, i) => debug(`Client ${i}: host: ${c.options.host} port: ${c.options.port} tls: ${c.options.tls}`))
  queue.on('error', errorHandler)
  queue.on('failed', failedHandler)
  queue.on('waiting', waitingHandler)
  queue.on('active', activeHandler)
  queue.on('completed', completedHandler)
  queue.on('stalled', stalledHandler)
  queues[definition.name] = queue
  Object.values(queues).forEach((q, i) => debug(`Using ${i}: ${q.name} as ${ops?.type}`))

  return queue
}

const getQueue = definition => queues[definition.name]

export {
  getQueue, errorHandler, waitingHandler, activeHandler, completedHandler, stalledHandler, failedHandler
}
