import pageRoute from '../../../routes/page-route.js'
import { habitatURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SETT_TYPE: { MAIN_NO_OTHER_SETT, MAIN_WITH_OTHER_SETTS, ANNEXE_OR_SUBSIDIARY, OUTLIER, ALL_SET_TYPES, OTHER } } = PowerPlatformKeys

export const completion = async _request => habitatURIs.ACTIVE.uri

const getData = () => {
  return {
    MAIN_NO_OTHER_SETT,
    MAIN_WITH_OTHER_SETTS,
    ANNEXE_OR_SUBSIDIARY,
    OUTLIER,
    ALL_SET_TYPES,
    OTHER
  }
}

export default pageRoute({ page: habitatURIs.TYPES.page, uri: habitatURIs.TYPES.uri, completion, getData })
