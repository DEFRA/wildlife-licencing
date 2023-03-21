import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

const doReturn = async (sddsReturnId, licenceId, data, counter, ts) => {
  const returnRec = await models.returns.findOne({
    where: { sdds_return_id: sddsReturnId }
  })

  if (returnRec) {
    if ((returnRec.updateStatus === 'P' && ts > returnRec.updatedAt) ||
      (returnRec.updateStatus === 'U' && hash(data.return) !== hash(returnRec.returnData))) {
      await models.returns.update({
        returnData: data.return,
        updateStatus: 'U'
      }, {
        where: {
          id: returnRec.id
        },
        returning: false
      })
      counter.update++
    }
  } else {
    // Create
    await models.returns.create({
      id: uuidv4(),
      licenceId: licenceId,
      updateStatus: 'U',
      returnData: data.return,
      sddsReturnId: sddsReturnId
    })
    counter.insert++
  }
}

export const writeReturnObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsReturnId = keys.find(k => k.apiTable === 'returns')?.powerAppsKey
    const licenceId = keys.find(k => k.apiTable === 'licences')?.powerAppsKey

    if (sddsReturnId && licenceId) {
      const licence = await models.licences.findOne({
        where: { id: licenceId }
      })
      if (licence) {
        await doReturn(sddsReturnId, licenceId, data, counter, ts)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating RETURNS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
