export const queueDefinitions = {
  // Will retry for 36 hours on failure
  APPLICATION_QUEUE: {
    name: 'application-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 18,
        retryProcessDelay: 10000,
        timeout: 30000,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    }
  }
}
