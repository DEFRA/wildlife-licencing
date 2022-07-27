import pageRoute from '../../routes/page-route.js'
import { habitatURIs } from '../../uris.js'

export default pageRoute(habitatURIs.ENTRANCES.page, habitatURIs.ENTRANCES.uri, null, null, null, null, null, { auth: false })
