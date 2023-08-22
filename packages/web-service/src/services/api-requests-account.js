import { accountRoleIsSingular, AccountRoles } from '../pages/contact/common/contact-roles.js'
import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import { boomify } from '@hapi/boom'

import db from 'debug'
const debug = db('web-service:api-requests')

Object.freeze(AccountRoles)

const assignAccount = async (role, applicationId, accountId) => {
  const doPost = async () => {
    debug(`Assigning ${role} account ${accountId} to applicationId: ${applicationId}`)
    await API.post(`${apiUrls.APPLICATION_ACCOUNT}`, {
      accountId,
      applicationId,
      accountRole: role
    })
  }

  const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${role}`)
  if (applicationAccount) {
    // The relationship exists - do nothing
    return
  }

  if (accountRoleIsSingular(role)) {
    const [applicationAccount2] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&role=${role}`)
    if (applicationAccount2) {
      if (applicationAccount2.accountId !== accountId) {
        debug(`Reassigning ${role} contact ${accountId} to applicationId: ${applicationId}`)
        await API.put(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount2.id}`, {
          accountId,
          applicationId,
          accountRole: role
        })
      }
    } else {
      // No relationship for role - create
      await doPost()
    }
  } else {
    // Plural relationship -- always create once
    await doPost()
  }
}

const findAccountByUser = async (accountRole, userId) => {
  try {
    debug(`Finding ${accountRole}'s for userId: ${userId}`)
    return API.get(apiUrls.ACCOUNTS, `userId=${userId}&role=${accountRole}`)
  } catch (error) {
    console.error(`Finding ${accountRole}'s for userId: ${userId}`, error)
    boomify(error, { statusCode: 500 })
    throw error
  }
}

const getAccountsByApplicationId = async (accountRole, applicationId) => {
  try {
    const accounts = await API.get(apiUrls.ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
    return accountRoleIsSingular(accountRole) ? accounts[0] : accounts
  } catch (error) {
    console.error(`Error getting accounts by ${accountRole} for applicationId: ${applicationId}`, error)
    boomify(error, { statusCode: 500 })
    throw error
  }
}

const createAccount = async (accountRole, applicationId, payload) => {
  try {
    const account = await API.post(apiUrls.ACCOUNT, payload)
    // If we have an account assigned to the application, update it
    const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
    if (applicationAccount) {
      await API.put(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`, {
        accountId: account.id,
        applicationId: applicationId,
        accountRole: accountRole
      })
    } else {
      await API.post(apiUrls.APPLICATION_ACCOUNT, {
        accountId: account.id,
        applicationId: applicationId,
        accountRole: accountRole
      })
    }
    debug(`Created ${accountRole} ${account.id} for applicationId: ${applicationId}`)
    return account
  } catch (error) {
    console.error(`Error creating ${accountRole} for applicationId: ${applicationId}`, error)
    boomify(error, { statusCode: 500 })
    throw error
  }
}

const unAssignAccount = async (accountRole, applicationId, accountId) => {
  const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${accountRole}`)
  if (applicationAccount) {
    debug(`Un-assigning ${accountRole} account ${applicationAccount.accountId} from applicationId: ${applicationId}`)
    await API.delete(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`)
  }
}

/**
 * Un-assign a contact from the application and delete it, if it is mutable
 */
const unLinkAccount = async (accountRole, applicationId, accountId) => {
  try {
    const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${accountRole}`)
    if (applicationAccount) {
      debug(`Unlink ${accountRole} account ${applicationAccount.accountId} from applicationId: ${applicationId}`)
      await API.delete(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`)
      const applicationAccounts = await API.get(apiUrls.APPLICATION_ACCOUNTS, `accountId=${applicationAccount.accountId}`)
      if (!applicationAccounts.length) {
        await API.delete(`${apiUrls.ACCOUNT}/${applicationAccount.accountId}`)
      }
    }
  } catch (error) {
    console.error(`Error unlinking ${accountRole} from applicationId: ${applicationId}`, error)
    boomify(error, { statusCode: 500 })
    throw error
  }
}

export const ACCOUNT = {
  findAccountsByIDMOrganisation: async organisationId => {
    try {
      return API.get(`${apiUrls.ORGANISATION_ACCOUNTS}/${organisationId}`)
    } catch (error) {
      console.error(`Finding IDM accounts for organisationId: ${organisationId}`, error)
      boomify(error, { statusCode: 500 })
      throw error
    }
  },
  findAllAccountApplicationRolesByUser: async userId => apiRequestsWrapper(
    async () => {
      debug(`Get account-application-accounts by userId: ${userId}`)
      return API.get(`${apiUrls.APPLICATION_ACCOUNTS_ACCOUNTS}`, `userId=${userId}`)
    },
    `Error getting account-application-accounts by userId: ${userId}`,
    500
  ),
  getById: async accountId => apiRequestsWrapper(
    async () => {
      debug(`Get account by id: ${accountId}`)
      return API.get(`${apiUrls.ACCOUNT}/${accountId}`)
    },
    `Error getting account by id: ${accountId}`,
    500
  ),
  update: async (accountId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Updating the account for contactId: ${accountId}`)
      return API.put(`${apiUrls.ACCOUNT}/${accountId}`, payload)
    },
    `Error updating the contact for contactId: ${accountId}`,
    500
  ),
  destroy: async accountId => apiRequestsWrapper(
    async () => {
      debug(`Delete account by id: ${accountId}`)
      return API.delete(`${apiUrls.ACCOUNT}/${accountId}`)
    },
    `Error deleting account by id: ${accountId}`,
    500
  ),
  isImmutable: async (applicationId, accountId) => {
    const account = await API.get(`${apiUrls.ACCOUNT}/${accountId}`)
    if (account.submitted) {
      return true
    } else {
      const applicationAccounts = await API.get(apiUrls.APPLICATION_ACCOUNTS, `accountId=${accountId}`)
      if (!applicationAccounts.length) {
        return false
      } else {
        const rolesOnCurrent = new Set(applicationAccounts.filter(ac => ac.applicationId === applicationId).map(ac => ac.accountRole))
        return !!applicationAccounts.find(ac => ac.applicationId !== applicationId) || rolesOnCurrent.size > 1
      }
    }
  },
  role: accountRole => {
    if (!Object.values(AccountRoles).find(k => k === accountRole)) {
      throw new Error(`Unknown account role: ${accountRole}`)
    }
    return {
      getByApplicationId: async applicationId => getAccountsByApplicationId(accountRole, applicationId),
      findByUser: async userId => findAccountByUser(accountRole, userId),
      create: async (applicationId, accountType) => createAccount(accountRole, applicationId, accountType),
      assign: async (applicationId, accountId) => assignAccount(accountRole, applicationId, accountId),
      unAssign: async (applicationId, accountId) => unAssignAccount(accountRole, applicationId, accountId),
      unLink: async (applicationId, accountId) => unLinkAccount(accountRole, applicationId, accountId)
    }
  }
}
