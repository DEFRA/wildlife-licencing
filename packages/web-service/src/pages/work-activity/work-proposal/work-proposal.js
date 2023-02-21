import Joi from 'joi'
import { APIRequests } from '../../../services/api-requests.js'
import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.WORK_ACTIVITY)
  return null
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.WORK_ACTIVITY)

  if (isCompleteOrConfirmed(tagState)) {
    return h.redirect(workActivityURIs.CHECK_YOUR_ANSWERS.uri)
  }

  return null
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const newData = Object.assign(applicationData, { proposalDescription: pageData.payload[workActivityURIs.WORK_PROPOSAL.page] })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export default pageRoute({
  page: workActivityURIs.WORK_PROPOSAL.page,
  uri: workActivityURIs.WORK_PROPOSAL.uri,
  completion: workActivityURIs.PAYING_FOR_LICENCE.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    // JS post message here sends line breaks with \r\n (CRLF) but the Gov.uk prototypes counts newlines as \n
    // Which leads to a mismatch on the character count as
    // '\r\n'.length == 2
    // '\n'.length   == 1
    'work-proposal': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData
})
