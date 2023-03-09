import { APIRequests } from '../../../services/api-requests.js'
import { workActivityURIs } from '../../../uris.js'
import { boolFromYesNo, yesNoFromBool } from '../../common/common.js'
import { checkApplication } from '../../common/check-application.js'
import { yesNoPage } from '../../common/yes-no.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { tagStatus } from '../../../services/status-tags.js'

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

  const userInput = { exemptFromPayment: boolFromYesNo(request.payload['yes-no']) }

  // If the user changes their answer from yes/no on this page
  // We can't take them back to the CYA page
  // There's "new questions" they need to answer
  if (applicationData.exemptFromPayment && applicationData.exemptFromPayment !== boolFromYesNo(userInput.exemptFromPayment)) {
    // Can't call the API here, or
    // it'll immeadiately be reset by the below update() call
    const tag = applicationData.applicationTags.find(t => t.tag === SECTION_TASKS.WORK_ACTIVITY)
    tag.tagState = tagStatus.IN_PROGRESS
    delete applicationData.applicationCategory
    delete applicationData.paymentExemptReason
  }

  const newData = Object.assign(applicationData, userInput)
  await APIRequests.APPLICATION.update(applicationId, newData)
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  return { yesNo: yesNoFromBool(applicationData?.exemptFromPayment) }
}

export default yesNoPage({
  uri: workActivityURIs.PAYING_FOR_LICENCE.uri,
  page: workActivityURIs.PAYING_FOR_LICENCE.page,
  checkData: checkApplication,
  setData,
  getData,
  completion
})
