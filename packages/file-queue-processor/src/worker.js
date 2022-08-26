import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { fileJobProcess } from './file-job-process.js'

export const worker = async () => {
  const fileQueue = getQueue(queueDefinitions.FILE_QUEUE)

  // Handle shutdown gracefully
  process.on('SIGTERM', async () => {
    console.info('SIGTERM signal received. Completing current job before shutting down...')
    await fileQueue.pause()
    process.exit(1)
  })

  process.on('SIGINT', async () => {
    console.info('SIGINT signal received. Completing current job before shutting down...')
    await fileQueue.pause()
    process.exit(1)
  })

  fileQueue.process(fileJobProcess)
  if (fileQueue.isPaused()) {
    console.log('Un-pausing application queue')
    await fileQueue.resume()
  }

  console.log('File queue processor started')
}
