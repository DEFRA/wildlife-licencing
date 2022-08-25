import pageRoute from '../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { settTypes } from '../../../utils/sett-type.js'
import { settDistruptionMethods } from '../../../utils/sett-disturb-methods.js'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const typeProcessor = selectedType => settTypes.filter(type => type.value === selectedType)[0].text
const methodProcessor = selectedMethods => settDistruptionMethods.filter(method => selectedMethods.includes(method.value)).map(method => '\n' + method.text)
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
