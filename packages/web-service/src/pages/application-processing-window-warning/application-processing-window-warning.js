import pageRoute from '../../routes/page-route.js'
import { APPLICATION_PROCESSING_WINDOW_WARNING, USER_ROLE } from '../../uris.js'

export const windowNotOpen = pageRoute({
  page: APPLICATION_PROCESSING_WINDOW_WARNING.page,
  uri: APPLICATION_PROCESSING_WINDOW_WARNING.uri,
  completion: USER_ROLE.uri,
  options: { auth: { mode: 'optional' } }
})
