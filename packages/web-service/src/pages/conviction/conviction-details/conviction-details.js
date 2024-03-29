import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { convictionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

const convictionDetails = 'conviction-details'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(applicationId)

  return { detailsOfConvictions: application?.detailsOfConvictions }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const convictionDetailsText = await request?.payload[convictionDetails]?.trim()
  const application = await APIRequests.APPLICATION.getById(applicationId)
  const payload = { ...application, detailsOfConvictions: convictionDetailsText }

  await APIRequests.APPLICATION.update(applicationId, payload)
}
export const completion = () => convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri

export default pageRoute({
  page: convictionsURIs.CONVICTION_DETAILS.page,
  uri: convictionsURIs.CONVICTION_DETAILS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'conviction-details': Joi.string().trim().required().replace('\r\n', '\n').max(300)
  }).options({ abortEarly: false, allowUnknown: true }),
  completion,
  getData,
  setData
})
