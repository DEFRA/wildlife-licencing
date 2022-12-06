import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { habitatURIs } from '../../../../uris.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { gridReferenceFormatRegex, gridReferenceValidRegex } from '../../../common/common.js'

const habitatGridReference = 'habitat-grid-ref'
export const validator = async payload => {
  if (!payload[habitatGridReference]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: You have not entered a grid reference',
      path: [habitatGridReference],
      type: 'no-grid-reference',
      context: {
        label: habitatGridReference,
        value: 'Error',
        key: habitatGridReference
      }
    }], null)
  }

  if (payload[habitatGridReference] && !payload[habitatGridReference].match(gridReferenceFormatRegex)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The grid reference you have entered is not in the right format',
      path: [habitatGridReference],
      type: 'grid-reference-wrong-format',
      context: {
        label: habitatGridReference,
        value: 'Error',
        key: habitatGridReference
      }
    }], null)
  }

  if (payload[habitatGridReference] && !payload[habitatGridReference].match(gridReferenceValidRegex)) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: The reference you have entered is not an existing grid reference',
      path: [habitatGridReference],
      type: 'grid-reference-do-not-exist',
      context: {
        label: habitatGridReference,
        value: 'Error',
        key: habitatGridReference
      }
    }], null)
  }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.WORK_START.uri
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

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
