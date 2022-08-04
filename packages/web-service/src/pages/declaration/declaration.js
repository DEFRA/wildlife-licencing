import pageRoute from '../../routes/page-route.js'
import { DECLARATION, SUBMISSION } from '../../uris.js'
import { ApplicationService } from '../../services/application.js'
import { checkApplication } from '../common/check-application.js'

export const setData = async request => ApplicationService.submitApplication(request)
export default pageRoute({
  page: DECLARATION.page,
  uri: DECLARATION.uri,
  completion: SUBMISSION.uri,
  checkData: checkApplication,
  setData
})
