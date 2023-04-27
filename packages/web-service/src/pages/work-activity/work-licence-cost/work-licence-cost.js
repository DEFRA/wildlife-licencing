import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { tagStatus } from '../../../services/status-tags.js'
import { workActivityURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const applicationData = await APIRequests.APPLICATION.getById(applicationId)

  // The users can get to CYA, change their 'work-payment-exempt-reason.js' answer
  // Which sets their flow to be 'in-progress' and then via the back button navigate to this page
  // And click "Continue" to complete the journey
  // We just need a small check to ensure they have completed everything necessary
  if (applicationData?.exemptFromPayment === true && !applicationData?.paymentExemptReason) {
    return workActivityURIs.WORK_PROPOSAL.uri
  } else {
    const journeyData = await request.cache().getData()
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
    return workActivityURIs.CHECK_YOUR_ANSWERS.uri
  }
}

export default pageRoute({
  uri: workActivityURIs.LICENCE_COST.uri,
  page: workActivityURIs.LICENCE_COST.page,
  completion
})
