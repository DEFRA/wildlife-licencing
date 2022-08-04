import pageRoute from '../../routes/page-route.js'
import { SUBMISSION } from '../../uris.js'
import { checkApplication } from '../common/check-application.js'

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  checkData: checkApplication
})
