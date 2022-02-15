import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'

export const writeSiteObject = async (obj, ts) => {
  const { data, keys } = obj
  try {
    const baseKey = keys.find(k => k.apiTable === 'sites')

    const site = await models.sites.findOne({
      where: { sdds_site_id: baseKey.powerAppsKey }
    })

    // Update or insert a new site
    if (site) {
      const s = site.dataValues
      baseKey.apiKey = s.id
      if ((s.updateStatus === 'P' && ts > s.updatedAt) || s.updateStatus === 'U') {
        await models.sites.update({
          site: data.sites,
          targetKeys: keys,
          updateStatus: 'U'
        }, {
          where: {
            id: s.id
          },
          returning: false
        })
        return { insert: 0, update: 1, pending: 0, error: 0 }
      } else {
        return { insert: 0, update: 0, pending: 1, error: 0 }
      }
    } else {
      // Create a new site
      baseKey.apiKey = uuidv4()
      await models.sites.create({
        id: baseKey.apiKey,
        site: data.sites,
        targetKeys: keys,
        updateStatus: 'U',
        sddsSiteId: baseKey.powerAppsKey
      })
      return { insert: 1, update: 0, pending: 0, error: 0 }
    }
  } catch (error) {
    console.error('Error updating sites', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
