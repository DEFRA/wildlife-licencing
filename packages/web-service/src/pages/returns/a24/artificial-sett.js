import { ReturnsURIs } from '../../../uris.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { yesNoFromBool } from '../../common/common.js'
import Joi from 'joi'
import { allCompletion, checkLicence } from '../common-return-functions.js'

const { ARTIFICIAL_SETT } = ReturnsURIs.A24
const createArtificialSettRadio = 'create-artificial-sett-check'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  if (returnId) {
    const { artificialSett } = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
    return { yesNo: yesNoFromBool(artificialSett) }
  } else {
    return { yesNo: undefined }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const artificialSett = request?.payload[createArtificialSettRadio] === 'yes'
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, artificialSett }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, artificialSett }
  await request.cache().setData(journeyData)
}

export default pageRoute({
  page: ARTIFICIAL_SETT.page,
  uri: ARTIFICIAL_SETT.uri,
  validator: Joi.object({
    'create-artificial-sett-check': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkLicence,
  getData: getData,
  completion: allCompletion,
  setData: setData
})
