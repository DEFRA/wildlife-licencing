import { SEQUELIZE } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
import { applicationUpdate, UnRecoverableBatchError } from '@defra/wls-powerapps-lib'
import db from 'debug'

/**
 * Write the key information created from the batch response back into the tables
 * @param targetKeys
 * @returns {Promise<unknown[]>}
 */
export const postProcess = async targetKeys => {
  const debug = db('application-queue-processor:post-process')
  debug(`Post process batch response object: ${JSON.stringify(targetKeys, null, 4)}`)
  const MODEL_MAP = {
    applications: { sddsKey: 'sddsApplicationId' },
    sites: { sddsKey: 'sddsSiteId' },
    contacts: { sddsKey: 'sddsContactId' },
    accounts: { sddsKey: 'sddsAccountId' },
    habitatSites: { sddsKey: 'sddsHabitatSiteId' },
    previousLicences: { sddsKey: 'sddsPreviousLicenceId' }
  }

  try {
    for (const tk of targetKeys.filter(k => k.apiTableName)) {
      await models[tk.apiTableName].update({
        submitted: SEQUELIZE.getSequelize().fn('NOW'),
        [MODEL_MAP[tk.apiTableName].sddsKey]: tk.keys.sddsKey,
        updateStatus: 'P'
      }, {
        where: {
          id: tk.keys.apiKey
        }
      })
    }
  } catch (error) {
    console.error('Error writing response data to database', error)
    throw new Error(error)
  }
}

const doApplicant = async (applicationId, payload) => {
  const [applicationApplicantContact] = await models.applicationContacts.findAll({
    where: { applicationId, contactRole: 'APPLICANT' }
  })

  if (applicationApplicantContact) {
    const applicantContact = await models.contacts.findByPk(applicationApplicantContact.contactId)
    Object.assign(payload.application, {
      applicant: {
        data: applicantContact.contact,
        keys: {
          apiKey: applicantContact.id,
          sddsKey: applicantContact.sddsContactId
        }
      }
    })
  }
}

const doEcologist = async (applicationId, payload) => {
  const [applicationEcologistContact] = await models.applicationContacts.findAll({
    where: { applicationId, contactRole: 'ECOLOGIST' }
  })

  if (applicationEcologistContact) {
    const applicantContact = await models.contacts.findByPk(applicationEcologistContact.contactId)
    Object.assign(payload.application, {
      ecologist: {
        data: applicantContact.contact,
        keys: {
          apiKey: applicantContact.id,
          sddsKey: applicantContact.sddsContactId
        }
      }
    })
  }
}

const doPayer = async (applicationId, payload) => {
  const [applicationPayerContact] = await models.applicationContacts.findAll({
    where: { applicationId, contactRole: 'PAYER' }
  })

  if (applicationPayerContact) {
    const applicantContact = await models.contacts.findByPk(applicationPayerContact.contactId)
    Object.assign(payload.application, {
      payer: {
        data: applicantContact.contact,
        keys: {
          apiKey: applicantContact.id,
          sddsKey: applicantContact.sddsContactId
        }
      }
    })
  }
}

const doApplicantOrganisation = async (applicationId, payload) => {
  const [applicationApplicantAccount] = await models.applicationAccounts.findAll({
    where: { applicationId, accountRole: 'APPLICANT-ORGANISATION' }
  })

  if (applicationApplicantAccount) {
    const applicantAccount = await models.accounts.findByPk(applicationApplicantAccount.accountId)
    Object.assign(payload.application, {
      applicantOrganization: {
        data: applicantAccount.account,
        keys: {
          apiKey: applicantAccount.id,
          sddsKey: applicantAccount.sddsAccountId
        }
      }
    })
  }
}

const doEcologistOrganisation = async (applicationId, payload) => {
  const [applicationEcologistAccount] = await models.applicationAccounts.findAll({
    where: { applicationId, accountRole: 'ECOLOGIST-ORGANISATION' }
  })

  if (applicationEcologistAccount) {
    const applicantAccount = await models.accounts.findByPk(applicationEcologistAccount.accountId)
    Object.assign(payload.application, {
      ecologistOrganization: {
        data: applicantAccount.account,
        keys: {
          apiKey: applicantAccount.id,
          sddsKey: applicantAccount.sddsAccountId
        }
      }
    })
  }
}

const doPayerOrganisation = async (applicationId, payload) => {
  const [applicationPayerAccount] = await models.applicationAccounts.findAll({
    where: { applicationId, accountRole: 'PAYER-ORGANISATION' }
  })

  if (applicationPayerAccount) {
    const applicantAccount = await models.accounts.findByPk(applicationPayerAccount.accountId)
    Object.assign(payload.application, {
      payerOrganization: {
        data: applicantAccount.account,
        keys: {
          apiKey: applicantAccount.id,
          sddsKey: applicantAccount.sddsAccountId
        }
      }
    })
  }
}

const doSites = async (applicationId, payload) => {
  const applicationSites = await models.applicationSites.findAll({
    where: { applicationId }
  })

  if (applicationSites.length) {
    const sitesFound = await models.sites.findAll({
      where: { id: applicationSites.map(s => s.siteId) }
    })

    const sites = sitesFound.map(s => ({
      data: s.site,
      keys: {
        apiKey: s.id,
        sddsKey: s.sddsSiteId
      }
    }))

    Object.assign(payload.application, { sites })
  }
}

const doAuthorisedPeople = async (applicationId, payload) => {
  const applicationContacts = await models.applicationContacts.findAll({
    where: { applicationId, contactRole: 'AUTHORISED-PERSON' }
  })

  if (applicationContacts.length) {
    const contactsFound = await models.contacts.findAll({
      where: { id: applicationContacts.map(c => c.contactId) }
    })

    const authorisedPeople = contactsFound.map(c => ({
      data: c.contact,
      keys: {
        apiKey: c.id,
        sddsKey: c.sddsContactId
      }
    }))

    Object.assign(payload.application, { authorisedPeople })
  }
}

const doHabitatSites = async (applicationId, payload) => {
  const habitatSites = await models.habitatSites.findAll({
    where: { applicationId }
  })

  if (habitatSites.length) {
    const sites = habitatSites.map(s => ({
      data: s.habitatSite,
      keys: {
        apiKey: s.id,
        sddsKey: s.sddsHabitatSiteId
      }
    }))

    Object.assign(payload.application, { habitatSites: sites })
  }
}

const doPreviousLicences = async (applicationId, payload) => {
  const applicationPreviousLicences = await models.previousLicences.findAll({
    where: { applicationId }
  })

  if (applicationPreviousLicences.length) {
    const previousLicences = applicationPreviousLicences.map(pl => ({
      data: pl.licence,
      keys: {
        apiKey: pl.id,
        sddsKey: pl.sddsPreviousLicenceId
      }
    }))

    Object.assign(payload.application, { previousLicences })
  }
}

/**
 * The processor anticipates a structure where associated entities have their own nested structure under applications
 *
 * Merge the application, contacts, accounts, ecologist experience licence details and sites into a single API payload object
 * Read the keys object and add to each section
 *
 * The structure is nested a nested hierarchy with application as the top level and
 * the various relations within it. It transforms the data into the structure defined in the schema mappings of the
 * Power Apps lib.
 *
 * The keys are used to determine each requests method (POST, PATCH...).
 * The sdds keys originate in the response from the Power Platform ODATA query and are
 * written back into the database tables
 *
 * @param applicationId
 * @returns {Promise<{application: any}>}
 */
export const buildApiObject = async applicationId => {
  try {
    const debug = db('application-queue-processor:build-payload-object')
    const applicationResult = await models.applications.findByPk(applicationId)

    // Not found application - data corrupted
    if (!applicationResult) {
      return null
    }

    const payload = {
      application: {
        data: applicationResult.application,
        keys: {
          apiKey: applicationResult.id,
          sddsKey: applicationResult.sddsApplicationId
        }
      }
    }

    // Add the applicant details
    await doApplicant(applicationId, payload)

    // Add the ecologist details
    await doEcologist(applicationId, payload)

    // Add the payer details
    await doPayer(applicationId, payload)

    // Add the applicant organization details
    await doApplicantOrganisation(applicationId, payload)

    // Add the ecologist organization details
    await doEcologistOrganisation(applicationId, payload)

    // Add the payer organization details
    await doPayerOrganisation(applicationId, payload)

    // Add in the application sites
    await doSites(applicationId, payload)

    // Add in the authorised people
    await doAuthorisedPeople(applicationId, payload)

    // Add in the habitat sites (licensable actions)
    await doHabitatSites(applicationId, payload)

    // Add in the previous licences (ecologist-experience)
    await doPreviousLicences(applicationId, payload)

    debug(`Pre-transform payload object: ${JSON.stringify(payload, null, 4)}`)
    return payload
  } catch (error) {
    console.error('Error building source object and keys', error)
    throw new Error(error)
  }
}

/**
 * The job process will read the data from the Postgres database and submit it to Power Apps.
 * The application submission is atomic and idempotent.
 *
 * Recoverable exceptions from the PowerApp processes are FAILED - and so will be retried
 * UnRecoverable exceptions from the PowerApp processes are ENDED - and an error reported
 *
 * @param job - The job object from the queue
 */
export const applicationJobProcess = async job => {
  const { applicationId } = job.data
  try {
    const payload = await buildApiObject(applicationId)

    if (!payload) {
      console.error(`Cannot locate application: ${applicationId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the application and associated data in Power Apps
      const targetKeys = await applicationUpdate(payload)
      await postProcess(targetKeys)
    }
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`Application job fail for ${applicationId}`)
    }
  }
}
