import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { ReturnsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { checkLicence } from '../common-return-functions.js'

const { WHY_NO_ARTIFICIAL_SETT } = ReturnsURIs.A24
const { LICENCE_CONDITIONS } = ReturnsURIs
const { WHY_DIDNT_YOU_CREATE_AN_ARTIFICIAL_SETT: { IT_WAS_NOT_REQUIRED_BY_THE_LICENCE, IT_COULD_NOT_BE_MADE } } = PowerPlatformKeys

const whyNoArtificialSettRadio = 'why-no-artificial-sett-check'
const whySettNotMadeText = 'why-sett-not-made'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let noArtificialSettReason, noArtificialSettReasonDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    noArtificialSettReason = licenceReturn?.noArtificialSettReason
    noArtificialSettReasonDetails = licenceReturn?.noArtificialSettReasonDetails
  }
  const itWasNotRequired = IT_WAS_NOT_REQUIRED_BY_THE_LICENCE.toString()
  const itCouldNotBeMade = IT_COULD_NOT_BE_MADE.toString()
  return { noArtificialSettReason, noArtificialSettReasonDetails, itWasNotRequired, itCouldNotBeMade }
}

export const validator = async payload => {
  if (!payload[whyNoArtificialSettRadio]) {
    Joi.assert(payload, Joi.object({
      'why-no-artificial-sett-check': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (IT_COULD_NOT_BE_MADE === parseInt(payload[whyNoArtificialSettRadio])) {
    Joi.assert(payload, Joi.object({
      'why-sett-not-made': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const noArtificialSettReason = parseInt(request.payload[whyNoArtificialSettRadio])
  const noArtificialSettReasonDetails = request.payload[whySettNotMadeText]
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  let payload = { ...licenceReturn, noArtificialSettReason }
  if (noArtificialSettReason === IT_COULD_NOT_BE_MADE) {
    payload = { ...payload, noArtificialSettReasonDetails }
  }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, noArtificialSettReason, noArtificialSettReasonDetails }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: WHY_NO_ARTIFICIAL_SETT.page,
  uri: WHY_NO_ARTIFICIAL_SETT.uri,
  completion: LICENCE_CONDITIONS.uri,
  checkData: checkLicence,
  getData: getData,
  setData: setData,
  validator: validator
})
