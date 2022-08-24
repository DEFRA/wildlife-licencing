import pageRoute from '../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'
const {
  SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER },
  METHOD_IDS: { OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT }
} = PowerPlatformKeys
const settMap = [
  {
    key: MAIN_NO_ALTERNATIVE_SETT,
    value: 'Main'
  },
  {
    key: ANNEXE,
    value: 'Annexe'
  },
  {
    key: SUBSIDIARY,
    value: 'Subsidiary'
  },
  {
    key: OUTLIER,
    value: 'Outlier'
  }
]
const affectMap = [
  {
    key: OBSTRUCT_SETT_WITH_GATES,
    value: 'Obstructing sett entrances by means of one-way badger gates'
  },
  {
    key: OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    value: 'Obstructing access to sett entrances by blocking or proofing'
  },
  {
    key: DAMAGE_A_SETT,
    value: 'Damaging a sett by hand and mechanical means'
  },
  {
    key: DISTURB_A_SETT,
    value: 'Destruction of the vacant sett by hand and mechanical means'
  },
  {
    key: DESTROY_A_SETT,
    value: 'Disturbance of badgers'
  }
]

const typeProcessor = selectedType => settMap.filter(type => type.key === selectedType)[0].value
const methodProcessor = selectedMethods => affectMap.filter(method => selectedMethods.includes(method.key)).map(method => '\n' + method.value)
export const dateProcessor = date => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  return `${Number(day)} ${dateObj.toLocaleString('default', { month: 'long' })} ${year}`
}

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.habitatData.applicationId)
  const pageData = []
  for (const habitat of habitatSites) {
    const habitatType = typeProcessor(habitat.settType)
    const methodTypes = methodProcessor(habitat.methodIds)
    const workStart = dateProcessor(habitat.workStart)
    const workEnd = dateProcessor(habitat.workEnd)
    const reopen = habitat.willReopen ? 'Yes' : 'No'
    const habitatData = Object.assign(habitat, { habitatType, reopen, methodTypes, workStart, workEnd })
    pageData.push(habitatData)
  }
  return pageData
}

export const validator = async payload => payload

export const completion = async _request => TASKLIST.uri

export default pageRoute({ page: habitatURIs.CHECK_YOUR_ANSWERS.page, uri: habitatURIs.CHECK_YOUR_ANSWERS.uri, getData, validator, completion })
