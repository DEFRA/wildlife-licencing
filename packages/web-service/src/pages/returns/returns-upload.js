import { ReturnsURIs } from '../../uris.js'
import { yesNoPage } from '../common/yes-no.js'
import { checkLicence } from './common-return-functions.js'

const { UPLOAD, UPLOAD_FILE, CHECK_YOUR_ANSWERS } = ReturnsURIs

export const completion = request => request?.payload['yes-no'] === 'yes' ? UPLOAD_FILE.uri : CHECK_YOUR_ANSWERS.uri

export const returnUpload = yesNoPage({
  page: UPLOAD.page,
  uri: UPLOAD.uri,
  checkData: checkLicence,
  completion: completion
})
