import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { SECTION_TASKS } from '../../../tasklist/general-sections.js'
import { habitatURIs } from '../../../../uris.js'
import { validateDates } from '../common/date-validator.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_END.uri
}

export const validator = async payload => {
  validateDates(payload, habitatURIs.WORK_START.page)

  return payload
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const day = pageData.payload[`${habitatURIs.WORK_START.page}-day`]
  const month = pageData.payload[`${habitatURIs.WORK_START.page}-month`]
  const year = pageData.payload[`${habitatURIs.WORK_START.page}-year`]
  const startDate = `${year.padStart(2, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { startDate })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { startDate })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const startDate = (await request.cache().getData())?.habitatData?.startDate || ''
  const [year, month, day] = startDate.split('-')
  return { year, month, day }
}

export default pageRoute({
  page: habitatURIs.WORK_START.page,
  uri: habitatURIs.WORK_START.uri,
  checkData: checkApplication,
  setData,
  getData,
  completion,
  validator
})
