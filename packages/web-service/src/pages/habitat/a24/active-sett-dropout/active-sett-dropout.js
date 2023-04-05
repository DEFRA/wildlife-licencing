import pageRoute from '../../../../routes/page-route.js'
import { habitatURIs } from '../../../../uris.js'
import { checkApplication } from '../../../common/check-application.js'

export default pageRoute({
  page: habitatURIs.ACTIVE_SETT_DROPOUT.page,
  uri: habitatURIs.ACTIVE_SETT_DROPOUT.uri,
  checkData: checkApplication
})
