import { UnRecoverableBatchError, licenceResend } from '@defra/wls-powerapps-lib'
import db from 'debug'
import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'

const { Sequelize } = pkg
const Op = Sequelize.Op

/**
 * For the applicant, if there exists an applicant organisation, send that, else send the applicant
 * For the ecologist, if there exists an ecologist organisation, send that else send the ecologist * @param applicationId
 * @returns {Promise<null|*{}>}
 */
export const buildApiObject = async applicationId => {
  const debug = db('licence-resend-queue-processor:build-payload-object')

  const applicationResult = await models.applications.findByPk(applicationId)
  // Not found application - data corrupted
  if (!applicationResult) {
    return null
  }

  const applicationContacts = await models.applicationContacts.findAll({
    where: { applicationId }
  })

  const applicationAccounts = await models.applicationAccounts.findAll({
    where: { applicationId }
  })

  const contacts = await models.contacts.findAll({
    where: {
      id: {
        [Op.in]: applicationContacts.map(c => c.contactId)
      }
    }
  })

  const accounts = await models.accounts.findAll({
    where: {
      id: {
        [Op.in]: applicationAccounts.map(c => c.accountId)
      }
    }
  })

  const contactRoles = contacts.map(c => ({ ...c, contactRole: applicationContacts.find(ac => ac.contactId === c.id).contactRole, isUser: c.userId !== null }))
  const accountRoles = accounts.map(a => ({ ...a, accountRole: applicationAccounts.find(aa => aa.accountId === a.id).accountRole }))

  const payload = {
    emailLicence: []
  }

  const applicantAccount = accountRoles.find(ar => ar.accountRole === 'APPLICANT-ORGANISATION')
  const applicantContact = contactRoles.find(cr => cr.contactRole === 'APPLICANT')
  const ecologistAccount = accountRoles.find(ar => ar.accountRole === 'ECOLOGIST-ORGANISATION')
  const ecologistContact = contactRoles.find(cr => cr.contactRole === 'ECOLOGIST')
  const contactIds = [] // Track the contact, to make sure only added once

  if (applicantAccount) {
    payload.emailLicence.push({
      data: {
        sddsApplicationId: applicationResult.sddsApplicationId,
        sddsAccountId: applicantAccount.sddsAccountId
      },
      keys: {
        apiKey: applicationResult.id
      }
    })
  } else if (applicantContact) {
    contactIds.push(applicantContact.id)
    payload.emailLicence.push({
      data: {
        sddsApplicationId: applicationResult.sddsApplicationId,
        sddsContactId: applicantContact.sddsContactId
      },
      keys: {
        apiKey: applicationResult.id
      }
    })
  }

  if (ecologistAccount) {
    payload.emailLicence.push({
      data: {
        sddsApplicationId: applicationResult.sddsApplicationId,
        sddsAccountId: ecologistAccount.sddsAccountId
      },
      keys: {
        apiKey: applicationResult.id
      }
    })
  } else if (ecologistContact) {
    contactIds.push(ecologistContact.id)
    payload.emailLicence.push({
      data: {
        sddsApplicationId: applicationResult.sddsApplicationId,
        sddsContactId: ecologistContact.sddsContactId
      },
      keys: {
        apiKey: applicationResult.id
      }
    })
  }

  // Which roles, if any is the user on
  const contactRolesAreUser = contactRoles.filter(cr => cr.isUser)
  for (const userContact of contactRolesAreUser) {
    if (['ADDITIONAL-APPLICANT', 'ADDITIONAL-ECOLOGIST', 'PAYER'].includes(userContact.contactRole)) {
      // Add only the contact, if the contact is not also the primary
      if (!contactIds.find(ids => userContact.id === ids)) {
        contactIds.push(userContact.id)
        payload.emailLicence.push({
          data: {
            sddsApplicationId: applicationResult.sddsApplicationId,
            sddsContactId: userContact.sddsContactId
          },
          keys: {
            apiKey: applicationResult.id
          }
        })
      }
    }
  }

  debug(`Pre-transform payload object: ${JSON.stringify(payload, null, 4)}`)
  return payload
}

export const licenceResendJobProcess = async job => {
  const debug = db('licence-resend-queue-processor:resend-job-process')
  const { applicationId } = job.data
  try {
    const payload = await buildApiObject(applicationId)

    if (!payload) {
      console.error(`Cannot locate application: ${applicationId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the application and associated data in Power Apps
      const targetKeys = await licenceResend(payload)
      debug(`Returned key object: ${JSON.stringify(targetKeys, null, 4)}`)
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
