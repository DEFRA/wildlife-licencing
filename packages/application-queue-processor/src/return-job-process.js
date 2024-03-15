import { UnRecoverableBatchError, returnUpdate } from '@defra/wls-powerapps-lib'
import db from 'debug'
import { models } from '@defra/wls-database-model'
import { postProcess } from './common.js'

export const buildApiObject = async returnId => {
  const debug = db('return-queue-processor:post-process')

  const returnResult = await models.returns.findByPk(returnId)

  // Not found return - data corrupted
  if (!returnResult) {
    return null
  }

  const payload = {
    return: {
      data: {
        licenceId: returnResult.licenceId,
        ...returnResult.returnData
      },
      keys: {
        apiKey: returnResult.id,
        sddsKey: returnResult.sddsReturnId
      }
    }
  }

  debug(`Pre-transform payload object: ${JSON.stringify(payload)}`)
  return payload
}

export const returnJobProcess = async job => {
  const debug = db('application-queue-processor:return-job-process')
  const { returnId } = job.data
  try {
    const payload = await buildApiObject(returnId)

    if (!payload) {
      console.error(`Cannot locate return: ${returnId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the returns and associated data in Power Apps
      const targetKeys = await returnUpdate(payload)
      await postProcess(targetKeys)
      debug(`Returned key object: ${JSON.stringify(targetKeys)}`)
    }
  } catch (error) {
    if (error instanceof UnRecoverableBatchError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`Return job fail for ${returnId}`)
    }
  }
}
