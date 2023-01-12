import { APIRequests } from '../../../../services/api-requests.js'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, A24_SETT)
  return null
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  await checkApplication(request, h)

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)

  if (isCompleteOrConfirmed(tagState) && habitatSites.length !== 0) {
    return h.redirect(habitatURIs.CHECK_YOUR_ANSWERS.uri)
  }

  return undefined
}

export default pageRoute({
  page: habitatURIs.START.page,
  uri: habitatURIs.START.uri,
  completion: habitatURIs.NAME.uri,
  getData,
  checkData
})
