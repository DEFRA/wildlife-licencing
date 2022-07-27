import pageRoute from '../../routes/page-route.js'
import { habitatURIs } from '../../uris.js'

export default pageRoute(habitatURIs.TYPES.page, habitatURIs.TYPES.uri, null, null, null, null, null, { auth: false })