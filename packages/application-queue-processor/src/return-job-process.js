import { UnRecoverableBatchError, returnUpdate } from '@defra/wls-powerapps-lib'
import db from 'debug'
import { models } from '@defra/wls-database-model'
import { postProcess } from './common.js'

// These appear to be the only fields on the powerapps side are displayed regardless of the licence
// activities selected. They prevent proceeding due to them being mandatory.
// null values for boolean fields will be converted to "Not Applicable" (10000002)
const returnsFields = [
  {
    name: 'obstructionByOneWayGates',
    defaultValue: null
  },
  {
    name: 'obstructionByOneWayGatesDetails',
    defaultValue: 'N/A'
  },
  {
    name: 'obstructionBlockingOrProofing',
    defaultValue: null
  },
  {
    name: 'obstructionBlockingOrProofingDetails',
    defaultValue: 'N/A'
  },
  {
    name: 'damageByHandOrMechanicalMeans',
    defaultValue: null
  },
  {
    name: 'damageByHandOrMechanicalMeansDetails',
    defaultValue: 'N/A'
  },
  {
    name: 'destroyVacantSettByHandOrMechanicalMeans',
    defaultValue: null
  },
  {
    name: 'disturbBadgers',
    defaultValue: null
  },
  {
    name: 'artificialSett',
    defaultValue: null
  },
  {
    name: 'artificialSettDetails',
    defaultValue: 'N/A'
  },
  {
    name: 'artificialSettCreatedBeforeClosure',
    defaultValue: null
  },
  {
    name: 'artificialSettFoundEvidence',
    defaultValue: null
  },
  {
    name: 'artificialSettFoundGridReference',
    defaultValue: 'N/A'
  },
  {
    name: 'welfareConcerns',
    defaultValue: null
  },
  {
    name: 'welfareConcernsDetails',
    defaultValue: 'N/A'
  }
]

// Ensure all the fields are filled with a default value even if it does not exist (has not been
// answered by the user)
export const populateAllMissingFields = (returnsData) => {
  returnsFields.forEach(field => {
    if (!returnsData[field.name]) {
      returnsData[field.name] = field.defaultValue
    }
  })
  return returnsData
}

export const buildApiObject = async returnId => {
  const debug = db('return-queue-processor:post-process')

  const returnResult = await models.returns.findByPk(returnId)

  // Not found return - data corrupted
  if (!returnResult) {
    return null
  }

  const returnData = populateAllMissingFields(returnResult.returnData)

  const payload = {
    return: {
      data: {
        licenceId: returnResult.licenceId,
        ...returnData
      },
      keys: {
        apiKey: returnResult.id,
        sddsKey: returnResult.sddsReturnId
      }
    }
  }

  debug(`Pre-transform payload object: ${JSON.stringify(payload, null, 4)}`)
  return payload
}

export const returnJobProcess = async job => {
  const debug = db('return-queue-processor:resend-job-process')
  const { returnId } = job.data
  try {
    const payload = await buildApiObject(returnId)

    if (!payload) {
      console.error(`Cannot locate return: ${returnId} for job: ${JSON.stringify(job.data)}`)
    } else {
      // Update the returns and associated data in Power Apps
      const targetKeys = await returnUpdate(payload)
      await postProcess(targetKeys)
      debug(`Returned key object: ${JSON.stringify(targetKeys, null, 4)}`)
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
