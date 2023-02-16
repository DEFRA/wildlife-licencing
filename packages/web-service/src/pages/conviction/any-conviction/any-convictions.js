import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { convictionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

const convictionsRadio = 'convictions-check'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()

  await moveTagInProgress(applicationId, SECTION_TASKS.DECLARE_CONVICTIONS)

  const application = await APIRequests.APPLICATION.getById(applicationId)
  let yesNo
  if (application?.isRelatedConviction) {
    yesNo = true
  } else if (application?.isRelatedConviction !== undefined && !application?.isRelatedConviction) {
    yesNo = false
  }
  return { yesNo }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.payload[convictionsRadio]
  const application = await APIRequests.APPLICATION.getById(applicationId)
  let isRelatedConviction = false
  if (pageData === 'yes') {
    isRelatedConviction = true
  }
  const payload = { ...application, isRelatedConviction }
  await APIRequests.APPLICATION.update(applicationId, payload)
}

export const completion = async request => {
  const pageData = await request.payload[convictionsRadio]
  if (pageData === 'no') {
    return convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri
  }
  return convictionsURIs.CONVICTION_DETAILS.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.DECLARE_CONVICTIONS)

  // Need to ensure the user is not coming to this page via changing an answer, from CYA page, or else we'll redirect
  if (isCompleteOrConfirmed(tagState) && !request.headers.referer.includes(convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri)) {
    return h.redirect(convictionsURIs.CHECK_CONVICTIONS_ANSWERS.uri)
  }
}

export default pageRoute({
  page: convictionsURIs.ANY_CONVICTIONS.page,
  uri: convictionsURIs.ANY_CONVICTIONS.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    'convictions-check': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
