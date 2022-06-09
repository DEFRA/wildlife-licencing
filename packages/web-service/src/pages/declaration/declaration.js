import pageRoute from '../../routes/page-route.js'
import { DECLARATION, SUBMISSION } from '../../uris.js'
import { ApplicationService } from '../../services/application.js'

export const setData = async request => ApplicationService.submitApplication(request)
export default pageRoute(DECLARATION.page, DECLARATION.uri,
  null, null, null, SUBMISSION.uri, setData)
