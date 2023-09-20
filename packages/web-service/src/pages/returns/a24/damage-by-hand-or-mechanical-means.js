import { ReturnsURIs } from '../../../uris.js'
import { allCompletion, checkLicence } from '../common-return-functions.js'
import { APIRequests } from '../../../services/api-requests.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { boolFromYesNo } from '../../common/common.js'

const { DAMAGE_BY_HAND_OR_MECHANICAL_MEANS } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let damageSett, damageSettDetails
  if (returnId) {
    const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    damageSett = licenceReturn?.damageByHandOrMechanicalMeans
    damageSettDetails = licenceReturn?.damageByHandOrMechanicalMeansDetails
  }
  return { damageSett, damageSettDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const damageByHandValue = boolFromYesNo(request.payload['yes-no'])
  let damageByHandOrMechanicalMeansDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    damageByHandOrMechanicalMeansDetails = request.payload['yes-conditional-input']
  } else {
    damageByHandOrMechanicalMeansDetails = request.payload['no-conditional-input']
  }

  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, damageByHandOrMechanicalMeans: damageByHandValue, damageByHandOrMechanicalMeansDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, damageByHandOrMechanicalMeans: damageByHandValue, damageByHandOrMechanicalMeansDetails }
  await request.cache().setData(journeyData)
}

export const damageByHandOrMechanicalMeans = yesNoConditionalPage({
  page: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.page,
  uri: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri,
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
