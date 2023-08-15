import db from 'debug'
import { getUserData } from '@defra/wls-defra-customer-lib'
import { models } from '@defra/wls-database-model'
const debug = db('application-queue-processor:user-details-job-process')

export const userDetailsJobProcess = async job => {
  try {
    const user = job.data.userId && await getUserData(job.data.userId)
    if (user) {
      debug(`Update user id: ${job.data.userId} ${JSON.stringify(user)}`)
      await models.users.update({ user }, {
        where: { id: job.data.userId },
        returning: false
      })
    }
  } catch (err) {
    console.error(`request user details job ${job.id} failed with unrecoverable error`, err)
    throw err
  }
}
