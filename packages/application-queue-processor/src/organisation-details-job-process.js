import db from 'debug'
import { getOrganisationData } from '@defra/wls-defra-customer-lib'
import { models } from '@defra/wls-database-model'
const debug = db('application-queue-processor:organisation-details-job-process')

export const organisationDetailsJobProcess = async job => {
  try {
    const organisation = job.data.organisationId && await getOrganisationData(job.data.organisationId)
    if (organisation) {
      debug(`Update organisation id: ${job.data.organisationId} ${JSON.stringify(organisation)}`)
      await models.organisations.update({ organisation }, {
        where: { id: job.data.organisationId },
        returning: false
      })
    }
  } catch (err) {
    console.error(`request organisation details job ${job.id} failed with unrecoverable error`, err)
    throw err
  }
}
