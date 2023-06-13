import { ReturnsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { yesNoFromBool } from '../../common/common.js'
import Joi from 'joi'

const { ARTIFICIAL_SETT, WHY_NO_ARTIFICIAL_SETT, ARTIFICIAL_SETT_DETAILS } = ReturnsURIs.A24
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

export const completion = async request => request?.payload[createArtificialSettRadio] === 'yes' ? ARTIFICIAL_SETT_DETAILS.uri : WHY_NO_ARTIFICIAL_SETT.uri

export default pageRoute({
  page: ARTIFICIAL_SETT.page,
  uri: ARTIFICIAL_SETT.uri,
  validator: Joi.object({
    'create-artificial-sett-check': Joi.any()
      .valid('yes', 'no')
      .required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  getData: getData,
  completion: completion,
  setData: setData
})
