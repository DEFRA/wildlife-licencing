import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)

  if (complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.GRID_REF.uri
}

const validation = Joi.object({
  'habitat-active-entrances': Joi.number().integer().required().max(100)
}).options({ abortEarly: false, allowUnknown: true })

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  const { habitatData } = journeyData
  const { numberOfEntrances } = habitatData
  const habitatActiveEntrances = 'habitat-active-entrances'
  const numberOfActiveEntrances = payload[habitatActiveEntrances]

  Joi.assert({ 'habitat-active-entrances': numberOfActiveEntrances }, validation)

  if (numberOfActiveEntrances > numberOfEntrances) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: the user has entered more active holes than total holes',
      path: [habitatActiveEntrances],
      type: 'tooManyActiveHoles',
      context: {
        label: habitatActiveEntrances,
        value: 'Error',
        key: habitatActiveEntrances
      }
    }], null)
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()

  const habitatActiveEntrances = 'habitat-active-entrances'
  const numberOfActiveEntrances = pageData.payload[habitatActiveEntrances]
  const active = journeyData.habitatData.numberOfEntrances > 0 && pageData.payload[habitatActiveEntrances] > 0

  const complete = await APIRequests.APPLICATION.tags(journeyData.applicationId).has(SECTION_TASKS.SETTS)

  if (complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfActiveEntrances, active })
  request.cache().setData(journeyData)
}

export const getData = async request => {
  const numberOfActiveEntrances = (await request.cache().getData())?.habitatData?.numberOfActiveEntrances
  return { numberOfActiveEntrances }
}

export default pageRoute({
  page: habitatURIs.ACTIVE_ENTRANCES.page,
  uri: habitatURIs.ACTIVE_ENTRANCES.uri,
  validator,
  completion,
  getData,
  setData
})
