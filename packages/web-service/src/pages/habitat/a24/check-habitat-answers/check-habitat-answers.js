import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../../uris.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { checkApplication } from '../common/check-application.js'

const {
  METHOD_IDS: { OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT }
} = PowerPlatformKeys

const addSett = 'additional-sett'
const activityTypes = {
  OBSTRUCT_SETT_WITH_GATES,
  OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
  DAMAGE_A_SETT,
  DESTROY_A_SETT,
  DISTURB_A_SETT
}

export const dateProcessor = date => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  return `${Number(day)} ${dateObj.toLocaleString('default', { month: 'long' })} ${year}`
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const redirectUrl = await checkApplication(request)

  if (redirectUrl) {
    return redirectUrl
  }

  // Ensure if a user just deleted their only sett, we take them back to /tasklist
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)

  // Ensure the object is populated with the correct (and enough) keys
  if (Object.keys(journeyData?.habitatData || {}).length < 13 || habitatSites.length === 0) {
    return h.redirect(TASKLIST.uri)
  }
  return undefined
}

export const getData = async request => {
  const journeyData = await request.cache().getData()

  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
  const data = {
    pageData: []
  }
  for (const habitat of habitatSites) {
    const habitatType = habitat.settType
    const methodTypes = habitat.methodIds
    const workStart = dateProcessor(habitat.workStart)
    const workEnd = dateProcessor(habitat.workEnd)
    const reopen = habitat.willReopen ? 'Yes' : 'No'
    const habitatData = Object.assign(habitat, { habitatType, reopen, methodTypes, workStart, workEnd, activityTypes })
    data.pageData.push(habitatData)
  }
  data.confirmDelete = habitatURIs.CONFIRM_DELETE.uri
  return data
}

export const validator = async payload => {
  if (!payload[addSett]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: Option for additional sett has not been chosen',
      path: [addSett],
      type: 'no-choice-made',
      context: {
        label: addSett,
        value: 'Error',
        key: addSett
      }
    }], null)
  }
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  if (pageData.payload[addSett] === 'yes') {
    await APIRequests.APPLICATION.tags(journeyData.applicationId).remove(SECTION_TASKS.SETTS)
    return habitatURIs.NAME.uri
  }
  return TASKLIST.uri
}
export default pageRoute({
  page: habitatURIs.CHECK_YOUR_ANSWERS.page,
  uri: habitatURIs.CHECK_YOUR_ANSWERS.uri,
  getData,
  validator,
  completion,
  checkData
})
