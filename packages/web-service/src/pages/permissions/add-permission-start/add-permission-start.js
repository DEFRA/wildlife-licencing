import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'

export const completion = () => permissionsURIs.CONSENT_TYPE.uri

export default pageRoute({
  page: permissionsURIs.ADD_PERMISSION_START.page,
  uri: permissionsURIs.ADD_PERMISSION_START.uri,
  checkData: checkApplication,
  completion
})
