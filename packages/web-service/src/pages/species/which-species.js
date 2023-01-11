import pageRoute from '../../routes/page-route.js'
import { SPECIES } from '../../uris.js'

export default pageRoute({
  page: SPECIES.page,
  uri: SPECIES.uri,
  options: { auth: { mode: 'optional' } }
})
