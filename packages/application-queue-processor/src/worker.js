import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { applicationJobProcess } from './application-job-process.js'

export const worker = async () => {
  const applicationQueue = getQueue(queueDefinitions.APPLICATION_QUEUE)

  // Handle shutdown gracefully
  process.on('SIGTERM', async () => {
    console.info('SIGTERM signal received. Completing current job before shutting down...')
    await applicationQueue.pause()
    process.exit(1)
  })

  process.on('SIGINT', async () => {
    console.info('SIGINT signal received. Completing current job before shutting down...')
    await applicationQueue.pause()
    process.exit(1)
  })

  applicationQueue.process(applicationJobProcess)
  if (applicationQueue.isPaused()) {
    console.log('Un-pausing application queue')
    await applicationQueue.resume()
  }

  console.log('Application queue processor started')
}
