import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import db from 'debug'
import { getQueue, queueDefinitions } from '@defra/wls-queue-defs'
import { getSddsRatingValue } from './common.js'
const debug = db('api:submission')

export default async (context, req, h) => {
  try {
    const userId = req.payload.userId

    delete req.payload.userId

    const feedbackData = req.payload

    feedbackData.sddsRating = getSddsRatingValue(req.payload.rating)

    const { dataValues } = await models.feedbacks.create({
      id: uuidv4(),
      userId: userId,
      feedbackData
    })

    debug(`Received submission for feedbackId: ${dataValues.id}`)
    const feedbackQueue = getQueue(queueDefinitions.FEEDBACK_QUEUE)
    const feedbackJob = await feedbackQueue.add({ feedbackId: dataValues.id })
    debug(`Queued feedback ${dataValues.id} - job: ${feedbackJob.id}`)

    return h.response(dataValues)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into `feedbacks` table', err)
    throw new Error(err.message)
  }
}
