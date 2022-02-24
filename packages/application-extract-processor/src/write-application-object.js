import { v4 as uuidv4 } from 'uuid'
import * as pkg from 'object-hash'
import { models } from '@defra/wls-database-model'
const hash = pkg.default
/**
 * (1) if an application has un-submitted user entered data it will have an update-status code of 'L' locked - indicating
 * that the user has altered the data. This prevents the extract update from overwriting any changes.
 * The updated_at timestamp will be in advance of the submitted timestamp if the submitted timestamp is set.
 *
 * (2) On submission the update status is set to 'P' pending, indicating that the extract process can consider updating
 * the application.
 * If the timestamp at the start of the extract (ts) is in advance of the update_at timestamp the data may be updated. and
 * in this case then the update status is set to 'U' - unlocked, allowing this and subsequent extracts to overwrite the data.
 *
 * If the timestamp at the start of the extract is behind the updated-at timestamp it indicates that an extract may be running
 * at the time of submission. In this case the data will not be updated.
 *
 * Any update via the API will reset the locked status 'L'
 * @param obj- The transformed object
 * @param ts - The timestamp at the start of the extract
 * @returns - A count object
 */
export const writeApplicationObject = async (obj, ts) => {
  const { data, keys } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  try {
    const baseKey = keys.find(k => k.apiTable === 'applications')

    const application = await models.applications.findOne({
      where: { sdds_application_id: baseKey.powerAppsKey }
    })

    // Update or insert a new applications
    if (application) {
      const a = application.dataValues
      baseKey.apiKey = a.id
      // Only update
      // (a) If pending and not changed since the start of the extract
      // (b) If updatable and with a material change in the payload
      if ((a.updateStatus === 'P' && ts > a.updatedAt) || (a.updateStatus === 'U' && hash(data.application) !== hash(a.application))) {
        await models.applications.update({
          application: data.application,
          targetKeys: keys.map(k => (({ contentId, ...t }) => t)(k)),
          updateStatus: 'U'
        }, {
          where: {
            id: a.id
          },
          returning: false
        })
        counter.update++
      } else if (a.updateStatus === 'P' || a.updateStatus === 'L') {
        counter.pending++
      }
    } else {
      // Create a new application and user
      baseKey.apiKey = uuidv4()
      await models.applications.create({
        id: baseKey.apiKey,
        application: data.application,
        targetKeys: keys.map(k => (({ contentId, ...t }) => t)(k)),
        updateStatus: 'U',
        sddsApplicationId: baseKey.powerAppsKey
      })
      counter.insert++
    }

    return counter
  } catch (error) {
    console.error('Error updating applications', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
