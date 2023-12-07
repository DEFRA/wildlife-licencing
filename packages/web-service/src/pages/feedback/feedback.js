import { Backlink } from '../../handlers/backlink.js'
import pageRoute from '../../routes/page-route.js'
import { APIRequests } from '../../services/api-requests.js'
import { FEEDBACK, FEEDBACK_SENT } from '../../uris.js'
import Joi from 'joi'

export const validator = async payload => {
  Joi.assert(
    payload,
    Joi.object({
      'nps-satisfaction': Joi.any().required(),
      withHint: Joi.string().trim().min(0).max(4000)
    }).options({ abortEarly: false, allowUnknown: true })
  )
}

export const setData = async request => {
  const rating = request.payload['nps-satisfaction']
  const howCanWeImproveThisService = request.payload.withHint
  const userId = request.auth.credentials.user

  await APIRequests.FEEDBACK.createFeedback({
    userId,
    rating,
    howCanWeImproveThisService
  })
}

export default pageRoute({
  page: FEEDBACK.page,
  uri: FEEDBACK.uri,
  completion: FEEDBACK_SENT.uri,
  validator,
  setData,
  backlink: Backlink.NO_BACKLINK
})
