import pageRoute from '../../routes/page-route.js'
import { habitatURIs } from '../../uris.js'

export default pageRoute(habitatURIs.ACTIVE.page, habitatURIs.ACTIVE.uri, null, null, null, null, null, { auth: false })
