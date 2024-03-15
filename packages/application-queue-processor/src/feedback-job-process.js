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
      },
      keys: {
        apiKey: feedbackRecord.id,
        sddsKey: feedbackRecord.sddsFeedbackId
      }
    }
  }

  debug(`Pre-transform payload object: ${JSON.stringify(payload)}`)
  return payload
}

export const feedbackJobProcess = async job => {
  const debug = db('feedback-queue-processor:resend-job-process')
  const { feedbackId } = job.data
  try {
    const payload = await buildApiObject(feedbackId)

    if (!payload) {
      console.error(`Cannot locate feedback: ${feedbackId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the feedback and associated data in Power Apps
      const targetKeys = await feedbackUpdate(payload)
      await postProcess(targetKeys)
      debug(`Returned key object: ${JSON.stringify(targetKeys)}`)
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
