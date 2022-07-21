import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const roles = {
  'APPLICANT-ORGANISATION': 'APPLICANT-ORGANISATION',
  'ECOLOGIST-ORGANISATION': 'ECOLOGIST-ORGANISATION'
}

const doApplicantOrganisation = async (applicationId, sddsAccountId, counter) => {
  const applicantOrganisation = await models.accounts.findOne({
    where: { sdds_account_id: sddsAccountId }
  })

  if (applicantOrganisation) {
    const applicationApplicantOrganisation = await models.applicationAccounts.findOne({
      where: {
        applicationId: applicationId,
        accountId: applicantOrganisation.id,
        accountRole: roles['APPLICANT-ORGANISATION']
      }
    })
    if (!applicationApplicantOrganisation) {
      await models.applicationAccounts.create({
        id: uuidv4(),
        applicationId: applicationId,
        accountId: applicantOrganisation.id,
        accountRole: roles['APPLICANT-ORGANISATION']
      })
      counter.insert++
    }
  }
}

const doEcologistOrganisation = async (applicationId, sddsAccountId, counter) => {
  const ecologistOrganisation = await models.accounts.findOne({
    where: { sdds_account_id: sddsAccountId }
  })

  if (ecologistOrganisation) {
    const applicationApplicantOrganisation = await models.applicationAccounts.findOne({
      where: {
        applicationId: applicationId,
        accountId: ecologistOrganisation.id,
        accountRole: roles['ECOLOGIST-ORGANISATION']
      }
    })
    if (!applicationApplicantOrganisation) {
      await models.applicationAccounts.create({
        id: uuidv4(),
        applicationId: applicationId,
        accountId: ecologistOrganisation.id,
        accountRole: roles['ECOLOGIST-ORGANISATION']
      })
      counter.insert++
    }
  }
}

export const writeApplicationAccountObject = async ({ _data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  const sddsApplicationId = keys.find(k => k.apiBasePath === 'application')?.powerAppsKey
  const sddsApplicantAccountId = keys.find(k => k.apiBasePath === 'application.applicantOrganization')?.powerAppsKey
  const sddsEcologistAccountId = keys.find(k => k.apiBasePath === 'application.ecologistOrganization')?.powerAppsKey

  try {
    if (sddsApplicantAccountId || sddsEcologistAccountId) {
      // Find the application record using the Power Apps keys
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })

      // If the applications is not (yet) in the database do nothing
      if (application) {
        await doApplicantOrganisation(application.id, sddsApplicantAccountId, counter)
        await doEcologistOrganisation(application.id, sddsEcologistAccountId, counter)
      }
    }
    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-ACCOUNTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
