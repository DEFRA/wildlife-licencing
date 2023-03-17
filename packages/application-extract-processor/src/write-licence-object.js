import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

// Licences, being generated on sdds simply use the sdds key as the primary (api) key
async function doLicence (licenceId, applicationId, data, counter) {
  if (applicationId) {
    const licence = await models.licences.findOne({
      where: { id: licenceId }
    })

    // Update or insert a new licence
    if (licence) {
      if (hash(data.licence) !== hash(licence.licence)) {
        await models.licences.update({
          licence: data.licence,
          applicationId: applicationId
        }, {
          where: { id: licence.id },
          returning: false
        })
        counter.update++
      }
    } else {
      await models.licences.create({
        id: licenceId,
        licence: data.licence,
        applicationId: applicationId
      })
      counter.insert++
    }
  }
}

export const writeLicenceObject = async ({ data, keys }) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications')?.powerAppsKey

    if (sddsApplicationId) {
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })
      if (application) {
        const licenceId = keys.find(k => k.apiTable === 'licences').powerAppsKey
        await doLicence(licenceId, application.id, data, counter)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating LICENCES', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
