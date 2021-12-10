import { QUEUE } from '@defra/wls-connectors-lib'
import Queue from 'bull'

const queues = {}

export const createQueue = async definition => {
  const options = Object.assign(definition.options, { redis: QUEUE.connection })
  console.log(`Creating queue: ${definition.name} with options: ${JSON.stringify(options)}`)
  queues[definition.name] = new Queue(definition.name, options)
  return Promise.resolve()
}

export const getQueue = definition => queues[definition.name]
