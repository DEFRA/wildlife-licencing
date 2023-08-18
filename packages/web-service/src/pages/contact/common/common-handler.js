import { APIRequests } from '../../../services/api-requests.js'
import { TASKLIST } from '../../../uris.js'

/**
 * Throw back to the tasklist contact exists for the role. Call from only the point
 * where a contact must exist.
 * @param contactRole
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasContact = (contactRole, page = TASKLIST) => async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)

  if (!contact) {
    return h.redirect(page.uri)
  }

  return null
}

/**
 * Checks that if an account is assigned, it is complete
 * @param accountRole
 * @param urlBase
 * @returns {(function(*, *): Promise<void>)|*}
 */
export const checkAccountComplete = (accountRole, urlBase) => async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    if (!account?.contactDetails?.email) {
      return h.redirect(urlBase.EMAIL.uri)
    }
    if (!account.address) {
      return h.redirect(urlBase.POSTCODE.uri)
    }
  }

  return null
}

/**
 * In the address choose there must be a lookup result
 * @param contactRole
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasAddress = urlBase => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.addressLookup) {
    return h.redirect(urlBase.POSTCODE.uri)
  }

  return null
}

// export const redirectJourney = (_applicationId, urlBase) => urlBase.CHECK_ANSWERS.uri
