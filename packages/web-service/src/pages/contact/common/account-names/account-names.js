import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'

export const getAccountNamesData = (contactType, accountType) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
  return { account, accounts, contact }
}

export const setAccountNamesData = accountType => async request => {
  const { payload: { account } } = request
  const { applicationId } = await request.cache().getData()
  if (account !== 'new') {
    await APIRequests[accountType].assign(applicationId, account)
  } else {
    // A new contact cause any previous association to be removed
    await APIRequests[accountType].unAssign(applicationId)
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
    } else {
      return baseUri.EMAIL.uri
    }
  }
}
