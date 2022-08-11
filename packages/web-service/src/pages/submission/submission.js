import pageRoute from '../../routes/page-route.js'
import { SUBMISSION, APPLICATIONS } from '../../uris.js'

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  completion: APPLICATIONS.uri
})
