import pageRoute from '../../routes/page-route.js'
import { EMAIL_CONFIRMATION, APPLICATIONS } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { checkApplication } from '../common/check-application.js'

export default pageRoute({
  page: EMAIL_CONFIRMATION.page,
  uri: EMAIL_CONFIRMATION.uri,
  completion: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: checkApplication
})
