import pageRoute from '../../routes/page-route.js'
import { habitatURIs } from '../../uris.js'

export default pageRoute(habitatURIs.START.page, habitatURIs.START.uri, null, null, null, null, null, { auth: false })
