import { APIRequests } from '../../../services/api-requests.js'
import { workActivityURIs } from '../../../uris.js'
import { boolFromYesNo } from '../../common/common.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData?.applicationId).get(SECTION_TASKS.WORK_ACTIVITY)
  if (isCompleteOrConfirmed(tagState)) {
    return workActivityURIs.CHECK_YOUR_ANSWERS.uri
  } else {
    if (boolFromYesNo(request.payload['yes-no'])) {
      return workActivityURIs.PAYMENT_EXEMPT_REASON.uri
    } else {
      return workActivityURIs.WORK_CATEGORY.uri
    }
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  const newData = Object.assign(applicationData, { exemptFromPayment: boolFromYesNo(request.payload['yes-no']) })
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export default yesNoPage({
  uri: workActivityURIs.PAYING_FOR_LICENCE.uri,
  page: workActivityURIs.PAYING_FOR_LICENCE.page,
  checkData: checkApplication,
  setData,
  completion
})
