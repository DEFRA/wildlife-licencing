import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { applicationJobProcess } from './application-job-process.js'

export const worker = async () => {
  const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.')
  })

  process.on('SIGINT', () => {
    console.info('SIGINT signal received.')
  })

  applicationQueue.on('completed', function (job, result) {
    console.log('Completed' + job.id)
  })

  applicationQueue.process(applicationJobProcess)
}
