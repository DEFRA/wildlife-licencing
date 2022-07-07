import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const roles = {
  'APPLICANT-ORGANISATION': 'APPLICANT-ORGANISATION',
  'ECOLOGIST-ORGANISATION': 'ECOLOGIST-ORGANISATION'
}

export const writeApplicationAccountObject = async obj => {
  const { data } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  try {
    if (data.application.applicantOrganization || data.application.ecologistOrganization) {
      // Find the application record using the Power Apps keys
      const application = await models.applications.findOne({
        where: { sdds_application_id: data.application.id }
      })

      // If the applications is not (yet) in the database do nothing
      if (application) {
        if (data.application.applicantOrganization) {
          // Get the contact record
          const applicantOrganization = await models.accounts.findOne({
            where: { sdds_account_id: data.application.applicantOrganization.accountId }
          })

          if (applicantOrganization) {
            const applicationApplicantOrganization = await models.applicationAccounts.findOne({
              where: {
                applicationId: application.id,
                accountId: applicantOrganization.id,
                accountRole: roles['APPLICANT-ORGANISATION']
              }
            })
            if (!applicationApplicantOrganization) {
              await models.applicationAccounts.create({
                id: uuidv4(),
                applicationId: application.id,
                accountId: applicantOrganization.id,
                accountRole: roles['APPLICANT-ORGANISATION']
              })
              counter.insert++
            }
          }
        }

        if (data.application.ecologistOrganization) {
          const ecologistOrganization = await models.accounts.findOne({
            where: { sdds_account_id: data.application.ecologistOrganization.accountId }
          })

          if (ecologistOrganization) {
            const applicationEcologistOrganization = await models.applicationAccounts.findOne({
              where: {
                applicationId: application.id,
                contactId: ecologistOrganization.id,
                accountRole: roles['ECOLOGIST-ORGANISATION']
              }
            })
            if (!applicationEcologistOrganization) {
              await models.applicationAccounts.create({
                id: uuidv4(),
                applicationId: application.id,
                accountId: ecologistOrganization.id,
                accountRole: roles['ECOLOGIST-ORGANISATION']
              })
              counter.insert++
            }
          }
        }
      }
    }
    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-CONTACTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
