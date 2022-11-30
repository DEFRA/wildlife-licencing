import { APIRequests } from '../../../../services/api-requests.js'
import { getAccountCandidates, hasAccountCandidates } from '../common.js'
import { accountOperations, contactAccountOperations } from '../operations.js'

export const accountNamesCheckData = (accountRole, otherAccountRoles, urlBase) => async (request, h) => {
  // if no accounts available then redirect the is-organisation
  const { userId, applicationId } = await request.cache().getData()
  if (!await hasAccountCandidates(userId, applicationId, accountRole, otherAccountRoles)) {
    return h.redirect(urlBase.IS_ORGANISATION.uri)
  }
  return null
}

export const getAccountNamesData = (contactRole, accountRole, additionalAccountRoles) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return { contact, account, accounts: await getAccountCandidates(userId, applicationId, accountRole, additionalAccountRoles) }
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
    // Always go to the email page
    return baseUri.EMAIL.uri
  }
}
