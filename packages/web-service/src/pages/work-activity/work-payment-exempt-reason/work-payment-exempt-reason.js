import pageRoute from '../../../routes/page-route.js'
import { workActivityURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const {
  APPLICATION_CATEGORY: {
    REGISTERED_PLACES_OF_WORSHIP,
    SCHEDULED_MONUMENTS,
    LISTED_BUILDINGS,
    TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    OTHER
  }
} = PowerPlatformKeys

export const getData = async request => {
  return {
    REGISTERED_PLACES_OF_WORSHIP,
    SCHEDULED_MONUMENTS,
    LISTED_BUILDINGS,
    TRADITIONAL_FARM_BUILDINGS_IN_A_COUNTRYSIDE_STEWARDSHIP_AGREEMENT,
    HOUSEHOLDER_HOME_IMPROVEMENTS,
    OTHER
  }
}

export default pageRoute({
  uri: workActivityURIs.PAYMENT_EXEMPT_REASON.uri,
  page: workActivityURIs.PAYMENT_EXEMPT_REASON.page,
  completion: workActivityURIs.CHECK_YOUR_ANSWERS.uri
})
