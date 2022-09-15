import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../../uris.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
const {
  METHOD_IDS: { OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT },
  SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER }
} = PowerPlatformKeys

const addSett = 'additional-sett'
const settDisruptionMethods = [
  {
    value: OBSTRUCT_SETT_WITH_GATES,
    text: 'Obstructing sett entrances by means of one-way badger gates'
  },
  {
    value: OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    text: 'Obstructing access to sett entrances by blocking or proofing'
  },
  {
    value: DAMAGE_A_SETT,
    text: 'Damaging a sett by hand and mechanical means'
  },
  {
    value: DESTROY_A_SETT,
    text: 'Destruction of the vacant sett by hand and mechanical means'
  },
  {
    value: DISTURB_A_SETT,
    text: 'Disturbance of badgers'
  }
]

const settTypes = [
  {
    value: MAIN_NO_ALTERNATIVE_SETT,
    text: 'Main'
  },
  {
    value: ANNEXE,
    text: 'Annexe'
  },
  {
    value: SUBSIDIARY,
    text: 'Subsidiary'
  },
  {
    value: OUTLIER,
    text: 'Outlier'
  }
]

const typeProcessor = selectedType => settTypes.filter(type => type.value === selectedType)[0].text
const methodProcessor = selectedMethods => settDisruptionMethods.filter(method => selectedMethods.includes(method.value)).map(method => '\n' + method.text)
export const dateProcessor = date => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  return `${Number(day)} ${dateObj.toLocaleString('default', { month: 'long' })} ${year}`
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()

  // Ensure if a user just deleted their only sett, we take them back to /tasklist
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.habitatData.applicationId)

  // Ensure the object is populated with the correct (and enough) keys
  if (Object.keys(journeyData.habitatData).length < 13 || habitatSites.length === 0) {
    return h.redirect(TASKLIST.uri)
  }
  return undefined
}

export const getData = async request => {
  const journeyData = await request.cache().getData()

  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.habitatData.applicationId)
  const data = {
    pageData: []
  }
  for (const habitat of habitatSites) {
    const habitatType = typeProcessor(habitat.settType)
    const methodTypes = methodProcessor(habitat.methodIds)
    const workStart = dateProcessor(habitat.workStart)
    const workEnd = dateProcessor(habitat.workEnd)
    const reopen = habitat.willReopen ? 'Yes' : 'No'
    const habitatData = Object.assign(habitat, { habitatType, reopen, methodTypes, workStart, workEnd })
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
