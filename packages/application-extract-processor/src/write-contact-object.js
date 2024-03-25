import { v4 as uuidv4 } from 'uuid'
import * as pkg from 'object-hash'
import { models } from '@defra/wls-database-model'
import { addressProcess } from './common.js'
const hash = pkg.default

export const writeContactObject = async (obj, ts) => {
  const { data, keys } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  // Operate on the address if present
  addressProcess(data.contacts?.address)

  try {
    const baseKey = keys.find(k => k.apiTable === 'contacts')
    const contact = await models.contacts.findOne({
      where: { sdds_contact_id: baseKey.powerAppsKey }
    })

    // Update or insert a new contact
    if (contact) {
      // (a) If pending and not changed since the start of the extract
      // (b) If updatable and with a material change in the payload
      if ((contact.updateStatus === 'P' && ts > contact.updatedAt) || (contact.updateStatus === 'U' && hash(data.contacts) !== hash(contact.contact))) {
        await models.contacts.update({
          contact: data.contacts,
          updateStatus: 'U'
        }, {
          where: {
            id: contact.id
          },
          returning: false
        })
        counter.update++
      } else if (contact.updateStatus === 'P' || contact.updateStatus === 'L') {
        counter.pending++
      }
    } else {
      // Create a new contact
      baseKey.apiKey = uuidv4()
      await models.contacts.create({
        id: baseKey.apiKey,
        contact: data.contacts,
        updateStatus: 'U',
        sddsContactId: baseKey.powerAppsKey
      })
      counter.insert++
    }

    return counter
  } catch (error) {
    console.error('Error updating CONTACTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
