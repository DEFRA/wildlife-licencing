import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests, tagStatus } from '../../../../services/api-requests.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'
import { checkApplication } from '../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'

const { METHOD_IDS: { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT } } = PowerPlatformKeys

const page = 'habitat-activities'

const {
  SPECIES: { BADGER },
  ACTIVITY_ID: { INTERFERE_WITH_BADGER_SETT }
} = PowerPlatformKeys

export const completion = async _request => habitatURIs.CHECK_YOUR_ANSWERS.uri

export const getData = async request => {
  const methodIds = (await request.cache().getData())?.habitatData?.methodIds || []
  return { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT, methodIds }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.SETTS)

  const activities = [].concat(pageData.payload[page])
  const methodIds = activities.map(method => parseInt(method))

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { methodIds })
    await putHabitatById(newSett)
  } else {
    const speciesId = BADGER
    const activityId = INTERFERE_WITH_BADGER_SETT
    Object.assign(journeyData.habitatData, { methodIds, speciesId, activityId })

    await APIRequests.HABITAT.create(journeyData.applicationId, journeyData.habitatData)
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.SETTS, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  }
  request.cache().setData(journeyData)
}

export const validator = async payload => {
  if (!payload[page]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no way of affecting the sett has been selected',
      path: [page],
      type: 'no-checkbox-selected',
      context: {
        label: page,
        value: 'Error',
        key: page
      }
    }], null)
  }
}

export default pageRoute({
  page: habitatURIs.ACTIVITIES.page,
  uri: habitatURIs.ACTIVITIES.uri,
  checkData: checkApplication,
  validator,
  completion,
  getData,
  setData
})
