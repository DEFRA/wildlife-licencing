import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { cacheDirect } from '../../../../session-cache/cache-decorator.js'

const page = 'habitat-entrances'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.ACTIVE_ENTRANCES.uri
}

const throwJoiError = (errorMessage, errorKey) => {
  throw new Joi.ValidationError('ValidationError', [{
    message: errorMessage,
    path: [page],
    type: errorKey,
    context: {
      label: page,
      value: page,
      key: page
    }
  }], null)
}

export const validator = async (payload, context) => {
  const journeyData = await cacheDirect(context).getData()
  const { context: { query: { id: settId } } } = context

  const habitatSites = await APIRequests.HABITAT.getHabitatsById(journeyData.applicationId)
  const currentHabitat = habitatSites.filter(obj => obj.id === settId)[0]

  const intInput = +payload[page]

  if (!/^\d*(\.\d+)?$/.test(payload[page])) {
    throwJoiError(
      'Unauthorized: input must be a number',
      'entrancesMustBeNumber'
    )
  } else if (!Number.isInteger(intInput)) {
    throwJoiError(
      'Unauthorized: input must be an integer',
      'entrancesMustBeInteger'
    )
  } else if (intInput >= 101) {
    throwJoiError(
      'Unauthorized: input must be equal, or less than 100',
      'entrancesMustBeLessThan100'
    )
  } else if (intInput <= 0) {
    throwJoiError(
      'Unauthorized: input must be greater than 0',
      'entrancesMustBeMoreThan1'
    )
  } else if (parseInt(currentHabitat.numberOfActiveEntrances) > intInput) {
    throwJoiError(
      'Unauthorized: total entrance holes must be greater than the amount of active entrance holes',
      'entrancesMustBeLessThanActiveHoles'
    )
  }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  const numberOfEntrances = parseInt(pageData.payload[page])

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { numberOfEntrances })
    await putHabitatById(newSett)
  }
  journeyData.habitatData = Object.assign(journeyData.habitatData, { numberOfEntrances })
  await request.cache().setData(journeyData)
}

export const getData = async request => {
  const numberOfEntrances = (await request.cache().getData())?.habitatData?.numberOfEntrances
  return { numberOfEntrances }
}

export default pageRoute({
  page: habitatURIs.ENTRANCES.page,
  uri: habitatURIs.ENTRANCES.uri,
  validator,
  checkData: checkApplication,
  completion,
  getData,
  setData
})
