import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

export default pageRoute({
  uri: workActivityURIs.CHECK_YOUR_ANSWERS.uri,
  page: workActivityURIs.CHECK_YOUR_ANSWERS.page,
  checkData: checkApplication
})
