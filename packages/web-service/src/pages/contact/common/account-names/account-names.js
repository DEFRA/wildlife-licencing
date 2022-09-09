import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { APPLICATIONS } from '../../../../uris.js'
import { accountsFilter, accountOperations } from '../common.js'

export const accountNamesCheckData = (contactType, accountType, urlBase) => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  // if no accounts available then redirect the is-organisation
  const accounts = await APIRequests[accountType].findByUser(journeyData.userId, DEFAULT_ROLE)
  const filteredAccounts = await accountsFilter(journeyData.applicationId, accounts)
  if (!filteredAccounts.length) {
    return h.redirect(urlBase.IS_ORGANISATION.uri)
  }
  return null
}

export const getAccountNamesData = (contactType, accountType) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
  return { account, accounts: await accountsFilter(applicationId, accounts), contact }
}

export const setAccountNamesData = (contactType, accountType) => async request => {
  const { payload: { account: accountId } } = request
  const { userId, applicationId } = await request.cache().getData()
  const accountOps = await accountOperations(accountType, applicationId, userId)
  if (accountId !== 'new') {
    await accountOps.assign(accountId)
  } else {
    await accountOps.unAssign()
  }
}

export const accountNamesCompletion = (accountType, baseUri) => async request => {
  const { payload: { account: accountId } } = await request.cache().getPageData()
  if (accountId === 'new') {
    await request.cache().clearPageData(baseUri.IS_ORGANISATION.page)
    return baseUri.IS_ORGANISATION.uri
  } else {
    // If the selected account is submitted return to check answers page, otherwise the address flow.
    const { applicationId } = await request.cache().getData()
    const account = await APIRequests[accountType].getByApplicationId(applicationId)
    if (account.submitted) {
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
