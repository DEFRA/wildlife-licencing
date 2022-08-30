import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { settTypes } from '../../../utils/sett-type.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { changeHandler, putData } from '../../../utils/editTools.js'

const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (journeyData.complete) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return habitatURIs.REOPEN.uri
}

export const getData = () => {
  return { settTypes }
}

export const setData = async request => {
  const pageData = await request.cache().getPageData()
  const journeyData = await request.cache().getData()

  const settType = parseInt(pageData.payload['habitat-types'])

  if (journeyData.complete) {
    Object.assign(journeyData, { redirectId: request.query.id })
    const newSett = await changeHandler(journeyData, journeyData.redirectId)
    Object.assign(journeyData.habitatData, { settType })
    await putData(newSett)
  }

  Object.assign(journeyData.habitatData, { settType })
  request.cache().setData(journeyData)
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
  completion,
  getData,
  setData
})
