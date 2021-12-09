import { QUEUE_DB, QUEUE_HOST, QUEUE_PORT } from '../constants.js'
import { QUEUE } from '@defra/wls-connectors-lib'

const queueConnectionOptions = {
  host: QUEUE_HOST,
  port: QUEUE_PORT,
  database: QUEUE_DB,
  blah: 'd'
}

let queues

const initialiseQueues = async () => {
  queues = await QUEUE({
    host: QUEUE_HOST,
    port: QUEUE_PORT,
    database: QUEUE_DB,
    blah: 'd'
  }).createQueues(
    [
      {
        name: 'submit-application',
        options: {
          bar: 'foo'
        }
      }
    ])
}

export { queues, initialiseQueues }
