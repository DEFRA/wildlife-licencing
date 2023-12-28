import pageRoute from '../../routes/page-route.js'
import { WINDOW_NOT_OPEN, USER_ROLE } from '../../uris.js'

export const windowNotOpen = pageRoute({
  page: WINDOW_NOT_OPEN.page,
  uri: WINDOW_NOT_OPEN.uri,
  completion: USER_ROLE.uri,
  options: { auth: { mode: 'optional' } }
})
