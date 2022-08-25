import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { settDistruptionMethods } from '../../../utils/sett-disturb-methods.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'

const {
  SPECIES: { BADGER },
  ACTIVITY_ID: { INTERFERE_WITH_BADGER_SETT }
} = PowerPlatformKeys

export const completion = async _request => habitatURIs.CHECK_YOUR_ANSWERS.uri

export const getData = async _request => {
  return { settDistruptionMethods }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const habData = journeyData.habitatData
  const activities = [].concat(pageData.payload['habitat-activities'])
  const methodIds = activities.map(method => parseInt(method))
  const active = habData.numberOfEntrances > 0 && habData.numberOfActiveEntrances > 0

  Object.assign(journeyData.habitatData, { methodIds, active, speciesId: BADGER, activityId: INTERFERE_WITH_BADGER_SETT })
  await APIRequests.HABITAT.create(journeyData.habitatData.applicationId, journeyData.habitatData)
  request.cache().setData(journeyData)
}

export const validator = async payload => {
  if (!payload['habitat-activities']) {
    const activities = 'habitat-activities'

    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no way of affecting the sett has been selected',
      path: [activities],
      type: 'no-checkbox-selected',
      context: {
        label: activities,
        value: 'Error',
        key: activities
      }
    }], null)
  }
}

export default pageRoute({ page: habitatURIs.ACTIVITIES.page, uri: habitatURIs.ACTIVITIES.uri, validator, completion, getData, setData })
