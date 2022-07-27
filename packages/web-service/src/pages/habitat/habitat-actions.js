import pageRoute from '../../routes/page-route.js'
import { habitatURIs } from '../../uris.js'

export default pageRoute(habitatURIs.ACTIONS.page, habitatURIs.ACTIONS.uri, null, null, null, null, null, { auth: false })
