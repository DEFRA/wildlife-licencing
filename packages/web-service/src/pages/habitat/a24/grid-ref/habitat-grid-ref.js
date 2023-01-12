import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/general-sections.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { gridReferenceValidator } from '../../../common/grid-ref-validator.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

const habitatGridReference = 'habitat-grid-ref'
export const validator = payload => gridReferenceValidator(payload, habitatGridReference)

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_START.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)

  const gridReference = pageData.payload['habitat-grid-ref']

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { gridReference })
    await putHabitatById(newSett)
  }

  journeyData.habitatData = Object.assign(journeyData.habitatData, { gridReference })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const gridReference = (await request.cache().getData())?.habitatData?.gridReference
  return { gridReference }
}

export default pageRoute({
  page: habitatURIs.GRID_REF.page,
  uri: habitatURIs.GRID_REF.uri,
  checkData: checkApplication,
  validator,
  completion,
  getData,
  setData
})
