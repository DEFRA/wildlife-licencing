import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const willReopen = pageData.payload['habitat-reopen']
  const journeyData = await request.cache().getData()
  journeyData.habitatData = Object.assign(journeyData.habitatData, { willReopen })
  request.cache().setData(journeyData)
}

export const completion = async _request => habitatURIs.ENTRANCES.uri

export default pageRoute({
  page: habitatURIs.REOPEN.page,
  uri: habitatURIs.REOPEN.uri,
  validator: Joi.object({
    'habitat-reopen': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  setData
})
