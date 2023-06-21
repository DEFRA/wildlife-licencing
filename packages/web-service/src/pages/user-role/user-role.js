import pageRoute from '../../routes/page-route.js'
import { USER_ROLE } from '../../uris.js'

export default pageRoute({
  page: USER_ROLE.page,
  uri: USER_ROLE.uri,
  options: { auth: { mode: 'optional' } }
})
