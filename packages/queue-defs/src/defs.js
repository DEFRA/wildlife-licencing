export const queueDefinitions = {
  APPLICATION_QUEUE: {
    name: 'application-queue',
    options: {
      removeOnComplete: true,
      defaultJobOptions: {
        priority: 1,
        backoff: 'exponential'
      }
    }
  }
}
