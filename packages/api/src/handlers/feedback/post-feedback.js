import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'

export default async (context, req, h) => {
  try {
    const userId = req.payload.userId

    delete req.payload.userId

    const { dataValues } = await models.returns.create({
      id: uuidv4(),
      userId: userId,
      feedbackData: req.payload
    })

    return h.response(dataValues)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into `feedbacks` table', err)
    throw new Error(err.message)
  }
}
