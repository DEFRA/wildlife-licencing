import { ReturnsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { yesNoConditionalPage } from '../../common/yes-no-conditional.js'
import { boolFromYesNo } from '../../common/common.js'
import { allCompletion, checkLicence } from '../common-return-functions.js'

const { DESTROY_VACANT_SETT } = ReturnsURIs.A24

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licences = await APIRequests.LICENCES.findActiveLicencesByApplicationId(journeyData?.applicationId)
  let destroyVacantSett, destroyVacantSettDetails
  if (returnId) {
    const { destroyVacantSettByHandOrMechanicalMeans, destroyVacantSettByHandOrMechanicalMeansDetails } = await APIRequests.RETURNS.getLicenceReturn(licences[0]?.id, returnId)
    destroyVacantSett = destroyVacantSettByHandOrMechanicalMeans
    destroyVacantSettDetails = destroyVacantSettByHandOrMechanicalMeansDetails
  }
  return { destroyVacantSett, destroyVacantSettDetails }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const destroyVacantSettByHandOrMechanicalMeans = boolFromYesNo(request.payload['yes-no'])
  let destroyVacantSettByHandOrMechanicalMeansDetails
  if (boolFromYesNo(request.payload['yes-no'])) {
    destroyVacantSettByHandOrMechanicalMeansDetails = request.payload['yes-conditional-input']
  } else {
    destroyVacantSettByHandOrMechanicalMeansDetails = request.payload['no-conditional-input']
  }
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, destroyVacantSettByHandOrMechanicalMeans, destroyVacantSettByHandOrMechanicalMeansDetails }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, destroyVacantSettByHandOrMechanicalMeans, destroyVacantSettByHandOrMechanicalMeansDetails }
  await request.cache().setData(journeyData)
}

export const destroyVacantSettPage = yesNoConditionalPage({
  page: DESTROY_VACANT_SETT.page,
  uri: DESTROY_VACANT_SETT.uri,
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
