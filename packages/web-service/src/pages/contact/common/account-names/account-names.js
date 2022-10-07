import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { accountsFilter, accountOperations, checkHasContact, contactAccountOperations } from '../common.js'

export const accountNamesCheckData = (contactRole, accountRole, urlBase) => async (request, h) => {
  const ck = await checkHasContact(contactRole, urlBase)(request, h)
  if (ck) {
    return ck
  }

  // if no accounts available then redirect the is-organisation
  const { userId, applicationId } = await request.cache().getData()
  const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId, DEFAULT_ROLE)
  const filteredAccounts = await accountsFilter(applicationId, accounts)
  if (!filteredAccounts.length) {
    return h.redirect(urlBase.IS_ORGANISATION.uri)
  }
  return null
}

export const getAccountNamesData = (contactRole, accountRole) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId, DEFAULT_ROLE)
  return { contact, account, accounts: await accountsFilter(applicationId, accounts) }
}

export const setAccountNamesData = (contactRole, accountRole) => async request => {
  const { payload: { account: accountId } } = request
  const { userId, applicationId } = await request.cache().getData()
  const accountOps = accountOperations(accountRole, applicationId)
  if (accountId !== 'new') {
    // Assign an existing organisation
    await accountOps.assign(accountId)
    const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
    await contactAccountOps.setOrganisation(true)
  }
}

export const accountNamesCompletion = (accountRole, baseUri) => async request => {
  const { payload: { account: accountId } } = await request.cache().getPageData()
  if (accountId === 'new') {
    await request.cache().clearPageData(baseUri.IS_ORGANISATION.page)
    return baseUri.IS_ORGANISATION.uri
  } else {
    // If the selected account is submitted return to check answers page, otherwise the address flow.
    const { applicationId } = await request.cache().getData()
    const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
    if (await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
      return baseUri.CHECK_ANSWERS.uri
    } else if (!account.contactDetails) {
      return baseUri.EMAIL.uri
    } else if (!account.address) {
      return baseUri.POSTCODE.uri
    } else {
      return baseUri.CHECK_ANSWERS.uri
    }
  }
}
