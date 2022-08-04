import { UnRecoverableBatchError } from '@defra/wls-powerapps-lib'

export const fileJobProcess = async job => {
  try {
    const { applicationId } = job.data
    console.log(applicationId)
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error('Job fail for retry')
    }
  }
}
