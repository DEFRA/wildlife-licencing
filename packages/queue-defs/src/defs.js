export const fastThenSlow = function (attemptsMade, err) {
  console.log(`Retry attempt ${attemptsMade} with error err: ${err}`)
  if (attemptsMade < 200) { // TODO: Revert this change
    // Every 20 seconds for the first 2 minutes
    return 20 * 1000
  } else if (attemptsMade < 6 + 12) {
    // Every five minutes for the next hour
    return 5 * 60 * 1000
  } else {
    // Hourly thereafter
    return 60 * 60 * 1000
  }
}

export const queueDefinitions = {
  APPLICATION_QUEUE: {
    name: 'application-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  },
  RETURN_QUEUE: {
    name: 'return-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  },
  LICENCE_RESEND_QUEUE: {
    name: 'licence-resend-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  },
  APPLICATION_FILE_QUEUE: {
    name: 'application-file-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  },
  RETURN_FILE_QUEUE: {
    name: 'return-file-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  },
  FEEDBACK_QUEUE: {
    name: 'feedback-queue',
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        priority: 1,
        attempts: 200,
        timeout: 30000,
        backoff: {
          type: 'fastThenSlow'
        }
      },
      settings: {
        backoffStrategies: {
          fastThenSlow
        }
      }
    }
  }
}
