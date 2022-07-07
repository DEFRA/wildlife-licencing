import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const doApplicant = async (data, application, counter) => {
  if (data.application.applicant) {
    // Get the contact record
    const applicant = await models.contacts.findOne({
      where: { sdds_contact_id: data.application.applicant.contactId }
    })

    if (applicant) {
      const applicationApplicant = await models.applicationContacts.findOne({
        where: {
          applicationId: application.id,
          contactId: applicant.id,
          contactRole: 'APPLICANT'
        }
      })
      if (!applicationApplicant) {
        await models.applicationContacts.create({
          id: uuidv4(),
          applicationId: application.id,
          contactId: applicant.id,
          contactRole: 'APPLICANT'
        })
        counter.insert++
      }
    }
  }
}

const doEcologist = async (data, application, counter) => {
  if (data.application.ecologist) {
    const ecologist = await models.contacts.findOne({
      where: { sdds_contact_id: data.application.ecologist.contactId }
    })

    if (ecologist) {
      const applicationEcologist = await models.applicationContacts.findOne({
        where: {
          applicationId: application.id,
          contactId: ecologist.id,
          contactRole: 'ECOLOGIST'
        }
      })
      if (!applicationEcologist) {
        await models.applicationContacts.create({
          id: uuidv4(),
          applicationId: application.id,
          contactId: ecologist.id,
          contactRole: 'ECOLOGIST'
        })
        counter.insert++
      }
    }
  }
}

export const writeApplicationContactObject = async obj => {
  const { data } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  try {
    if (data.application.applicant || data.application.ecologist) {
      // Find the application record using the Power Apps keys
      const application = await models.applications.findOne({
        where: { sdds_application_id: data.application.id }
      })

      // If the applications is not (yet) in the database do nothing
      if (application) {
        await doApplicant(data, application, counter)
        await doEcologist(data, application, counter)
      }
    }
    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-CONTACTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
