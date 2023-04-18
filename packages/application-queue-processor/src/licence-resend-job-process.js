import { UnRecoverableBatchError, licenceResend } from '@defra/wls-powerapps-lib'
import db from 'debug'
import { models } from '@defra/wls-database-model'

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

  const payload = {
    emailLicence: []
  }

  payload.emailLicence.push({
    data: {
      sddsApplicationId: applicationResult.sddsApplicationId
    },
    keys: {
      apiKey: applicationResult.id
    }
  })

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
