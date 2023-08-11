import db from 'debug'
import { getUserData } from '@defra/wls-defra-customer-lib'

export const userDetailsJobProcess = async job => {
  const debug = db('application-queue-processor:user-details-job-process')
  try {
    const user = await getUserData(job.data.userId)
    console.log(user)
  } catch (err) {
    console.log(err)
    throw err
  }
}
