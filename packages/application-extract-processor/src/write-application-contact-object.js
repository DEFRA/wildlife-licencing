import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const doContact = role => async (applicationId, sddsContactId, counter) => {
  const contact = await models.contacts.findOne({
    where: { sdds_contact_id: sddsContactId }
  })

  if (contact) {
    const applicationContact = await models.applicationContacts.findOne({
      where: {
        applicationId: applicationId,
        contactId: contact.id,
        contactRole: role
      }
    })
    if (!applicationContact) {
      await models.applicationContacts.create({
        id: uuidv4(),
        applicationId: applicationId,
        contactId: contact.id,
        contactRole: role
      })
      counter.insert++
    }
  }
}

const doEcologist = doContact('ECOLOGIST')
const doApplicant = doContact('APPLICANT')
const doPayer = doContact('PAYER')
const doAuthorisedPerson = doContact('AUTHORISED-PERSON')

export const writeApplicationContactObject = async ({ _data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  const sddsApplicationId = keys.find(k => k.apiBasePath === 'application')?.powerAppsKey
  const sddsApplicantContactId = keys.find(k => k.apiBasePath === 'application.applicant')?.powerAppsKey
  const sddsEcologistContactId = keys.find(k => k.apiBasePath === 'application.ecologist')?.powerAppsKey
  const sddsPayerContactId = keys.find(k => k.apiBasePath === 'application.payer')?.powerAppsKey
  const sddsAuthorisedPeopleIds = keys.filter(k => k.apiBasePath === 'application.authorisedPeople').map(a => a?.powerAppsKey)

  try {
    // Find the application record using the Power Apps keys
    const application = await models.applications.findOne({
      where: { sdds_application_id: sddsApplicationId }
    })

    if (application) {
      if (sddsApplicantContactId) {
        await doApplicant(application.id, sddsApplicantContactId, counter)
      }

      if (sddsEcologistContactId) {
        await doEcologist(application.id, sddsEcologistContactId, counter)
      }

      if (sddsPayerContactId) {
        await doPayer(application.id, sddsPayerContactId, counter)
      }

      if (sddsAuthorisedPeopleIds.length) {
        await Promise.all(sddsAuthorisedPeopleIds.map(async ap => doAuthorisedPerson(application.id, ap, counter)))
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-CONTACTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
