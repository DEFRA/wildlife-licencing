import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const doApplicant = async (applicationId, sddsContactId, counter) => {
  const applicant = await models.contacts.findOne({
    where: { sdds_contact_id: sddsContactId }
  })

  if (applicant) {
    const applicationEcologist = await models.applicationContacts.findOne({
      where: {
        applicationId: applicationId,
        contactId: applicant.id,
        contactRole: 'APPLICANT'
      }
    })
    if (!applicationEcologist) {
      await models.applicationContacts.create({
        id: uuidv4(),
        applicationId: applicationId,
        contactId: applicant.id,
        contactRole: 'APPLICANT'
      })
      counter.insert++
    }
  }
}

const doEcologist = async (applicationId, sddsContactId, counter) => {
  const ecologist = await models.contacts.findOne({
    where: { sdds_contact_id: sddsContactId }
  })

  if (ecologist) {
    const applicationEcologist = await models.applicationContacts.findOne({
      where: {
        applicationId: applicationId,
        contactId: ecologist.id,
        contactRole: 'ECOLOGIST'
      }
    })
    if (!applicationEcologist) {
      await models.applicationContacts.create({
        id: uuidv4(),
        applicationId: applicationId,
        contactId: ecologist.id,
        contactRole: 'ECOLOGIST'
      })
      counter.insert++
    }
  }
}

const process = async (application, sddsApplicantContactId, counter, sddsEcologistContactId) => {
  if (sddsApplicantContactId) {
    await doApplicant(application.id, sddsApplicantContactId, counter)
  }
  if (sddsEcologistContactId) {
    await doEcologist(application.id, sddsEcologistContactId, counter)
  }
}

const doAuthorisedPerson = async (application, sddsContactId, counter) => {
  const authorisedPerson = await models.contacts.findOne({
    where: { sdds_contact_id: sddsContactId }
  })

  if (authorisedPerson) {
    const applicationAuthorisedPerson = await models.applicationContacts.findOne({
      where: {
        applicationId: application.id,
        contactId: authorisedPerson.id,
        contactRole: 'AUTHORISED-PERSON'
      }
    })
    if (!applicationAuthorisedPerson) {
      await models.applicationContacts.create({
        id: uuidv4(),
        applicationId: application.id,
        contactId: authorisedPerson.id,
        contactRole: 'AUTHORISED-PERSON'
      })
      counter.insert++
    }
  }
}

export const writeApplicationContactObject = async ({ _data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  const sddsApplicationId = keys.find(k => k.apiBasePath === 'application')?.powerAppsKey
  const sddsApplicantContactId = keys.find(k => k.apiBasePath === 'application.applicant')?.powerAppsKey
  const sddsEcologistContactId = keys.find(k => k.apiBasePath === 'application.ecologist')?.powerAppsKey
  const sddsAuthorisedPeopleIds = keys.filter(k => k.apiBasePath === 'application.authorisedPeople').map(a => a?.powerAppsKey)

  try {
    // Find the application record using the Power Apps keys
    const application = await models.applications.findOne({
      where: { sdds_application_id: sddsApplicationId }
    })

    if (application) {
      if (sddsApplicantContactId || sddsEcologistContactId) {
        // If the applications is not (yet) in the database do nothing
        await process(application, sddsApplicantContactId, counter, sddsEcologistContactId)
      }

      if (sddsAuthorisedPeopleIds.length) {
        await Promise.all(sddsAuthorisedPeopleIds.map(async ap => await doAuthorisedPerson(application, ap, counter)))
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-CONTACTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
