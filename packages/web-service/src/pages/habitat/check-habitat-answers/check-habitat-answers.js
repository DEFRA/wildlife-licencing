import pageRoute from '../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const typeProcessor = selectedType => settMap.filter(type => JSON.stringify(type.key) === selectedType)[0].value
const methodProcessor = selectedMethods => affectMap.filter(method => selectedMethods.includes(JSON.stringify(method.key))).map(method => '\n' + method.value)
const dateProcessor = (date) => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const month = dateObj.getMonth()
  const year = dateObj.getFullYear()
  return `${Number(day)} ${monthNames[month - 1]} ${year}`
}

const getData = async request => {
  const journeyData = await request.cache().getData()
  const habitatType = typeProcessor(journeyData.settType)
  const methodTypes = methodProcessor(journeyData.methodIds)
  const startDate = dateProcessor(journeyData.startDate)
  const endDate = dateProcessor(journeyData.endDate)
  const reopen = journeyData.willReopen ? 'Yes' : 'No'
  console.log(habitatType, methodTypes, startDate, endDate, reopen)
  const pageData = Object.assign(journeyData, { habitatType, reopen, methodTypes, startDate, endDate })
  console.log(pageData)
  return pageData
}

const validator = async payload => {
  return payload
}

export const completion = async _request => TASKLIST.uri

export default pageRoute({ page: habitatURIs.CHECK_YOUR_ANSWERS.page, uri: habitatURIs.CHECK_YOUR_ANSWERS.uri, getData, validator, completion })
