import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
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

  try {
    const application = await models.applications.findAll({
      where: { sdds_application_id: keys.sdds_applications.eid }
    })

    // Update or insert a new applications
    if (application.length) {
      const a = application[0].dataValues
      if ((a.updateStatus === 'P' && ts > a.updatedAt) || a.updateStatus === 'U') {
        await models.applications.update({
          application: data,
          targetKeys: keys,
          updateStatus: 'U'
        }, {
          where: {
            id: a.id
          },
          returning: false
        })
        return { insert: 1, update: 0, pending: 0 }
      } else {
        return { insert: 0, update: 0, pending: 1 }
      }
    } else {
      // Create a new application and user
      await models.applications.create({
        id: uuidv4(),
        application: data,
        targetKeys: keys,
        updateStatus: 'U',
        sdds_application_id: keys.sdds_applications.eid
      })
      return { insert: 0, update: 1, pending: 0 }
    }
  } catch (error) {
    console.error('Error updating applications', error)
    return { insert: 0, update: 0, pending: 0 }
  }
}
