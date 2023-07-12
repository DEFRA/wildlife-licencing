import { Backlink } from '../../handlers/backlink.js'
import pageRoute from '../../routes/page-route.js'
import { APIRequests } from '../../services/api-requests.js'
import { ReturnsURIs } from '../../uris.js'
import { timestampFormatter } from '../common/common.js'
import { checkLicence, getNilReturnReason } from './common-return-functions.js'

const { CHECK_YOUR_ANSWERS, DECLARATION } = ReturnsURIs

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licences = await APIRequests.LICENCES.findByApplicationId(journeyData?.applicationId)
  const startDate = timestampFormatter(licences[0]?.startDate)
  const endDate = timestampFormatter(licences[0]?.endDate)
  const returnData = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const nilReturnReason = getNilReturnReason(returnData?.whyNil)
  const destroyDate = timestampFormatter(returnData?.destroyDate)
  const uploads = await APIRequests.FILE_UPLOAD.RETURN.getUploadedFiles(returnId)
  const uploadedFiles = uploads?.filter(upload => (upload.filetype === 'METHOD-STATEMENT')).map(upload => ({
    ...upload,
    uploadedDate: timestampFormatter(upload.createdAt)
  }))
  const data = { ...returnData, startDate, endDate, whyNil: nilReturnReason, destroyDate }
  return { ...data, uploadedFiles }
}

export default pageRoute({
  page: CHECK_YOUR_ANSWERS.page,
  uri: CHECK_YOUR_ANSWERS.uri,
  checkData: checkLicence,
  completion: DECLARATION.uri,
  backlink: Backlink.NO_BACKLINK,
  getData: getData
})
