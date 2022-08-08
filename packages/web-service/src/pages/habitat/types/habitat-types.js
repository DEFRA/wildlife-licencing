import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

export const completion = async _request => habitatURIs.ACTIVE.uri

const getData = () => {
  return {
    MAIN_NO_ALTERNATIVE_SETT,
    ANNEXE,
    SUBSIDIARY,
    OUTLIER
  }
}

export default pageRoute({ page: habitatURIs.TYPES.page, uri: habitatURIs.TYPES.uri, completion, getData })
