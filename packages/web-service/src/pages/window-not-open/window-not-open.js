import pageRoute from '../../routes/page-route.js'
import { eligibilityURIs, WINDOW_NOT_OPEN } from '../../uris.js'

export const windowNotOpen = pageRoute({
  page: WINDOW_NOT_OPEN.page,
  uri: WINDOW_NOT_OPEN.uri,
  completion: eligibilityURIs.LANDOWNER.uri,
  options: { auth: { mode: 'optional' } }
})
