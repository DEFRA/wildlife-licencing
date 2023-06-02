import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { getNextPage } from '../common-return-functions.js'
import { APIRequests } from '../../../services/api-requests.js'
import { isYes } from '../../common/yes-no.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'

const { DAMAGE_BY_HAND_OR_MECHANICAL_MEANS, ARTIFICIAL_SETT } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  let damageSett, damageSettDetails
  if (returnId) {
    const { damageByHandOrMechanicalMeans, damageByHandOrMechanicalMeansDetails } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    damageSett = damageByHandOrMechanicalMeans
    damageSettDetails = damageByHandOrMechanicalMeansDetails
  }
  return { damageSett, damageSettDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const damageByHandOrMechanicalMeans = isYes(request)
  let damageByHandOrMechanicalMeansDetails
  if (isYes(request)) {
    damageByHandOrMechanicalMeansDetails = request.payload['yes-conditional-input']
  } else {
    damageByHandOrMechanicalMeansDetails = request.payload['no-conditional-input']
  }

  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, damageByHandOrMechanicalMeans, damageByHandOrMechanicalMeansDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, damageByHandOrMechanicalMeans, damageByHandOrMechanicalMeansDetails }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { methodTypes, methodTypesLength, methodTypesNavigated } = journeyData?.returns
  if (methodTypesNavigated <= 0) {
    return ARTIFICIAL_SETT.uri
  } else {
    journeyData.returns = {
      ...journeyData.returns,
      methodTypesNavigated: methodTypesNavigated - 1
    }
    await request.cache().setData(journeyData)
  }
  return getNextPage(methodTypes[methodTypesLength - methodTypesNavigated])
}

export const damageByHandOrMechanicalMeans = yesNoConditionalPage({
  page: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.page,
  uri: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri,
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
