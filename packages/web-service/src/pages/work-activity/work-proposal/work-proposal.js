import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { workActivityURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.WORK_ACTIVITY)

  const applicationData = await APIRequests.APPLICATION.getById(applicationId)
  return { proposalDescription: applicationData?.proposalDescription }
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.WORK_ACTIVITY)

  // If the user has come back to this page via the CYA page
  // Don't redirect them - they're just changing an answer
  // Same if they have an error. Don't redirect back to CYA page
  if (isCompleteOrConfirmed(tagState) && !request.info.referrer.includes(workActivityURIs.CHECK_YOUR_ANSWERS.uri) && !pageData.error) {
    return h.redirect(workActivityURIs.CHECK_YOUR_ANSWERS.uri)
  }

  return null
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const newData = Object.assign(applicationData, { proposalDescription: request.payload[workActivityURIs.WORK_PROPOSAL.page] })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData?.applicationId).get(SECTION_TASKS.WORK_ACTIVITY)
  if (isCompleteOrConfirmed(tagState)) {
    return workActivityURIs.CHECK_YOUR_ANSWERS.uri
  } else {
    return workActivityURIs.PAYING_FOR_LICENCE.uri
  }
}

export default pageRoute({
  page: workActivityURIs.WORK_PROPOSAL.page,
  uri: workActivityURIs.WORK_PROPOSAL.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
    // Which leads to a mismatch on the character count as
    // '\r\n'.length == 2
    // '\n'.length   == 1
    'work-proposal': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  completion,
  setData
})
