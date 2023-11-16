import { UnRecoverableBatchError, feedbackUpdate } from '@defra/wls-powerapps-lib'
import db from 'debug'
import { models } from '@defra/wls-database-model'
import { postProcess } from './common.js'

export const buildApiObject = async feedbackId => {
  const debug = db('feedback-queue-processor:post-process')

  const feedbackRecord = await models.feedbacks.findByPk(feedbackId)

  if (!feedbackRecord) {
    return null
  }

  const payload = {
    feedback: {
      data: {
        feedbackId: feedbackRecord.id,
        ...feedbackRecord.feedbackData
      }
    }
  }

  debug(`Pre-transform payload object: ${JSON.stringify(payload, null, 4)}`)
  return payload
}

export const feedbackJobProcess = async job => {
  const debug = db('feedback-queue-processor:resend-job-process')
  const { feedbackId } = job.data
  try {
    const payload = await buildApiObject(feedbackId)

    console.log('payload', payload)

    if (!payload) {
      console.error(`Cannot locate feedback: ${feedbackId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the returns and associated data in Power Apps
      const targetKeys = await feedbackUpdate(payload)
      await postProcess(targetKeys)
      debug(`Returned key object: ${JSON.stringify(targetKeys, null, 4)}`)
    }
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`Feedback job fail for ${feedbackId}`)
    }
  }
}
