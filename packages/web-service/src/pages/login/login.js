import pageRoute from '../../routes/page-route.js'
import { LOGIN, APPLICATIONS } from '../../uris.js'

export const postData = async (_request, _h) => APPLICATIONS.uri

export default pageRoute(LOGIN.page, LOGIN.uri, null, postData, () => null)
