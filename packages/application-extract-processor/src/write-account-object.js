import { v4 as uuidv4 } from 'uuid'
import * as pkg from 'object-hash'
import { models } from '@defra/wls-database-model'
const hash = pkg.default

export const writeAccountObject = async (obj, ts) => {
  const { data, keys } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  if (Object.keys(data).length === 0) {
    return { insert: 0, update: 0, pending: 0, error: 0 }
  }

  try {
    const baseKey = keys.find(k => k.apiTable === 'accounts')
    const account = await models.accounts.findOne({
      where: { sdds_account_id: baseKey.powerAppsKey }
    })

    // Update or insert a new account
    if (account) {
      // (a) If pending and not changed since the start of the extract
      // (b) If updatable and with a material change in the payload
      if ((account.updateStatus === 'P' && ts > account.updatedAt) || (account.updateStatus === 'U' && hash(data.accounts) !== hash(account.account))) {
        await models.accounts.update({
          account: data.accounts,
          updateStatus: 'U'
        }, {
          where: {
            id: account.id
          },
          returning: false
        })
        counter.update++
      } else if (account.updateStatus === 'P' || account.updateStatus === 'L') {
        counter.pending++
      }
    } else {
      // Create a new site
      baseKey.apiKey = uuidv4()
      await models.accounts.create({
        id: baseKey.apiKey,
        account: data.accounts,
        updateStatus: 'U',
        sddsAccountId: baseKey.powerAppsKey
      })
      counter.insert++
    }

    return counter
  } catch (error) {
    console.error('Error updating accounts', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
