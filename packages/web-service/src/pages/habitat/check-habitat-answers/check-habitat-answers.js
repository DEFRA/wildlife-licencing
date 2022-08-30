import pageRoute from '../../../routes/page-route.js'
import { habitatURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { settTypes } from '../../../utils/sett-type.js'
import { settDistruptionMethods } from '../../../utils/sett-disturb-methods.js'
import Joi from 'joi'
const addSett = 'additional-sett'

const typeProcessor = selectedType => settTypes.filter(type => type.value === selectedType)[0].text
const methodProcessor = selectedMethods => settDistruptionMethods.filter(method => selectedMethods.includes(method.value)).map(method => '\n' + method.text)
export const dateProcessor = date => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  return `${Number(day)} ${dateObj.toLocaleString('default', { month: 'long' })} ${year}`
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  console.log(journeyData.habitatData)
  if (Object.keys(journeyData.habitatData).length !== 13) h.redirect(TASKLIST.uri)
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
    delete journeyData.complete
    request.cache().setData(journeyData)
    return habitatURIs.NAME.uri
  }
  return TASKLIST.uri
}
export default pageRoute({ page: habitatURIs.CHECK_YOUR_ANSWERS.page, uri: habitatURIs.CHECK_YOUR_ANSWERS.uri, getData, validator, completion, checkData })
