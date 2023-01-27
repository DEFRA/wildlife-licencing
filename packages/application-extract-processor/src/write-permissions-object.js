import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import * as pkg from 'object-hash'
const hash = pkg.default

const doPermission = async (sddsPermissionsId, ts, data, counter, application) => {
  const permission = await models.permissions.findOne({
    where: { sdds_permissions_id: sddsPermissionsId }
  })

  if (permission) {
    if ((permission.updateStatus === 'P' && ts > permission.updatedAt) ||
      (permission.updateStatus === 'U' && hash(data.permissions) !== hash(permission.permission))) {
      await models.permissions.update({
        permission: data.permissions,
        updateStatus: 'U'
      }, {
        where: {
          id: permission.id
        },
        returning: false
      })
      counter.update++
    }
  } else {
    // Create
    await models.permissions.create({
      id: uuidv4(),
      applicationId: application.id,
      updateStatus: 'U',
      permission: data.permissions,
      sddsPermissionsId: sddsPermissionsId
    })
    counter.insert++
  }
}

export const writePermissionsObject = async ({ data, keys }, ts) => {
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }
  try {
    const sddsPlanningConsentId = keys.find(k => k.apiTable === 'permissions').powerAppsKey
    const sddsApplicationId = keys.find(k => k.apiTable === 'applications')?.powerAppsKey

    // Look for the application, and permission
    if (sddsApplicationId && sddsPlanningConsentId) {
      const application = await models.applications.findOne({
        where: { sdds_application_id: sddsApplicationId }
      })

      if (application) {
        // Create or update the habitable sites
        await doPermission(sddsPlanningConsentId, ts, data, counter, application)
      }
    }

    return counter
  } catch (error) {
    console.error('Error updating PERMISSIONS', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
