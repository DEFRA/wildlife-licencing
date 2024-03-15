import Joi from 'joi'
import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { getHabitatById } from '../common/get-habitat-by-id.js'
import { putHabitatById } from '../common/put-habitat-by-id.js'
import { APIRequests } from '../../../../services/api-requests.js'
import { checkApplication } from '../../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../../common/tag-functions.js'
import { A24_SETT } from '../../../tasklist/a24-badger-licence.js'

const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)

  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.REOPEN.uri
}

export const getData = async request => {
  const settType = (await request.cache().getData())?.habitatData?.settType
  return { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER, settType }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const settType = parseInt(pageData.payload['habitat-types'])

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await getHabitatById(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { settType })
    await putHabitatById(newSett)
  }

  Object.assign(journeyData.habitatData, { settType })
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: habitatURIs.TYPES.page,
  uri: habitatURIs.TYPES.uri,
  validator: Joi.object({
    'habitat-types': Joi.any().valid(
      MAIN_NO_ALTERNATIVE_SETT.toString(),
      ANNEXE.toString(),
      SUBSIDIARY.toString(),
      OUTLIER.toString()
    ).required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  completion,
  getData,
  setData
})
