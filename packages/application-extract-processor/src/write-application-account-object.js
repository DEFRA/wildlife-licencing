import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

const doAccount = accountRole => async (applicationId, sddsAccountId, counter) => {
  const accounts = await models.accounts.findOne({
    where: { sdds_account_id: sddsAccountId }
  })

  if (accounts) {
    const applicationAccounts = await models.applicationAccounts.findOne({
      where: {
        applicationId: applicationId,
        accountId: accounts.id,
        accountRole: accountRole
      }
    })
    if (!applicationAccounts) {
      await models.applicationAccounts.create({
        id: uuidv4(),
        applicationId: applicationId,
        accountId: accounts.id,
        accountRole: accountRole
      })
      counter.insert++
    }
  }
}

const doApplicantOrganisation = doAccount('APPLICANT-ORGANISATION')
const doEcologistOrganisation = doAccount('ECOLOGIST-ORGANISATION')
const doPayerOrganisation = doAccount('PAYER-ORGANISATION')

export const writeApplicationAccountObject = async ({ _data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  const sddsApplicationId = keys.find(k => k.apiBasePath === 'application')?.powerAppsKey
  const sddsApplicantAccountId = keys.find(k => k.apiBasePath === 'application.applicantOrganization')?.powerAppsKey
  const sddsEcologistAccountId = keys.find(k => k.apiBasePath === 'application.ecologistOrganization')?.powerAppsKey
  const sddsPayerAccountId = keys.find(k => k.apiBasePath === 'application.payerOrganization')?.powerAppsKey

  try {
    const application = await models.applications.findOne({
      where: { sdds_application_id: sddsApplicationId }
    })

    if (application) {
      if (sddsApplicantAccountId) {
        await doApplicantOrganisation(application.id, sddsApplicantAccountId, counter)
      }
      if (sddsEcologistAccountId) {
        await doEcologistOrganisation(application.id, sddsEcologistAccountId, counter)
      }
      if (sddsPayerAccountId) {
        await doPayerOrganisation(application.id, sddsPayerAccountId, counter)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating APPLICATION-ACCOUNTS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
