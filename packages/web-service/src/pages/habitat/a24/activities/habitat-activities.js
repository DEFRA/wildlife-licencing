import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../../services/api-requests.js'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { tagStatus } from '../../../../services/status-tags.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

const { METHOD_IDS: { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT } } = PowerPlatformKeys

const {
  SPECIES: { BADGER },
  SPECIES_SUBJECT: { BADGER: BADGER_SUBJECT },
  ACTIVITY_ID: { INTERFERE_WITH_BADGER_SETT }
} = PowerPlatformKeys

export const completion = async _request => habitatURIs.CHECK_YOUR_ANSWERS.uri

export const getData = async request => {
  const journeyData = await request.cache().getData()
  let methodIds = journeyData?.habitatData?.methodIds

  if (!methodIds) {
    const habitatSite = await APIRequests.HABITAT.getHabitatBySettId(journeyData.applicationId, request.query.id)
    methodIds = habitatSite.methodIds
  }

  return { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT, methodIds }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  const methodIds = [].concat(pageData.payload[habitatURIs.ACTIVITIES.page])

  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { methodIds })
    await putHabitatById(newSett)
  } else {
    const speciesId = BADGER
    const activityId = INTERFERE_WITH_BADGER_SETT
    const speciesSubjectId = BADGER_SUBJECT
    Object.assign(journeyData.habitatData, { methodIds, speciesId, speciesSubjectId, activityId })

    await APIRequests.HABITAT.create(journeyData.applicationId, journeyData.habitatData)
    await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: A24_SETT, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  }
  await request.cache().setData(journeyData)
}

export const validator = async payload => {
  if (!payload[habitatURIs.ACTIVITIES.page]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: no way of affecting the sett has been selected',
      path: [habitatURIs.ACTIVITIES.page],
      type: 'no-checkbox-selected',
      context: {
        label: habitatURIs.ACTIVITIES.page,
        value: 'Error',
        key: habitatURIs.ACTIVITIES.page
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
