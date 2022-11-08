import { APIRequests, tagStatus } from '../../../../services/api-requests.js'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { checkApplication } from '../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-is-complete-or-confirmed.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.SETTS, tagState: tagStatus.IN_PROGRESS })
  return habitatURIs.NAME.uri
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const redirectUrl = await checkApplication(request)

  if (redirectUrl) {
    return redirectUrl
  }

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)

  if (isCompleteOrConfirmed(tagState) && habitatSites.length !== 0) {
    return h.redirect(habitatURIs.CHECK_YOUR_ANSWERS.uri)
  }

  return undefined
}

export default pageRoute({
  page: habitatURIs.START.page,
  uri: habitatURIs.START.uri,
  completion,
  checkData
})
