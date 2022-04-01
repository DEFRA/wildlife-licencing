import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'

export const tasklist = pageRoute(TASKLIST.page, TASKLIST.uri, null,
  null, null, null, null)
