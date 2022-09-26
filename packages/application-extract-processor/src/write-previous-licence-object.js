import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

const doPreviousLicence = async (sddsPreviousLicenceId, ts, data, counter, application) => {
  const previousLicence = await models.previousLicences.findOne({
    where: { sdds_previous_licence_id: sddsPreviousLicenceId }
  })
  if (previousLicence) {
    if ((previousLicence.updateStatus === 'P' && ts > previousLicence.updatedAt) ||
      (previousLicence.updateStatus === 'U' && hash(data.licence) !== hash(previousLicence.licence))) {
      await models.previousLicences.update({
        licence: data.licence,
        updateStatus: 'U'
      }, {
        where: {
          id: previousLicence.id
        },
        returning: false
      })
      counter.update++
    }
  } else {
    // Create
    await models.previousLicences.create({
      id: uuidv4(),
      applicationId: application.id,
      updateStatus: 'U',
      licence: data.licence,
      sddsPreviousLicenceId
    })
    counter.insert++
  }
}

export const writePreviousLicenceObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsPreviousLicenceId = keys.find(k => k.apiTable === 'previousLicences').powerAppsKey
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications')?.powerAppsKey

    if (sddsApplicationId) {
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })

      if (application) {
        await doPreviousLicence(sddsPreviousLicenceId, ts, data, counter, application)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating PREVIOUS-LICENCES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
