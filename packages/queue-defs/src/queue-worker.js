import { getQueue } from './queue-funcs.js'

export const queueWorker = async (queue, jobProcess) => {
  const queueInstance = getQueue(queue)

  // Handle shutdown gracefully
  process.on('SIGTERM', async () => {
    console.info('SIGTERM signal received. Completing current job before shutting down...')
    await queueInstance.close()
    process.exit(1)
  })

  process.on('SIGINT', async () => {
    console.info('SIGINT signal received. Completing current job before shutting down...')
    await queueInstance.close()
    process.exit(1)
  })

  queueInstance.process(jobProcess)
  if (await queueInstance.isPaused()) {
    console.log(`Un-pausing ${queue.name} queue`)
    await queueInstance.resume()
  }

  console.log(`${queue.name} queue processor started`)
}
