import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { checkApplication } from '../../../common/check-application.js'

export const completion = async _request => habitatURIs.TYPES.uri

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const name = pageData.payload['habitat-name']
  const journeyData = await request.cache().getData()
  const applicationId = journeyData.applicationId
  journeyData.habitatData = Object.assign(journeyData.habitatData || {}, { name, applicationId })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const name = (await request.cache().getData())?.habitatData?.name
  return { name }
}

export default pageRoute({
  page: habitatURIs.NAME.page,
  uri: habitatURIs.NAME.uri,
  validator: Joi.object({
    'habitat-name': Joi.string().trim().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion,
  getData,
  setData
})
