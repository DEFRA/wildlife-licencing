import { v4 as uuidv4 } from 'uuid'
import * as pkg from 'object-hash'
import { models } from '@defra/wls-database-model'
const hash = pkg.default

export const writeSiteObject = async (obj, ts) => {
  const { data, keys } = obj
  const counter = { insert: 0, update: 0, pending: 0, error: 0 }

  try {
    const baseKey = keys.find(k => k.apiTable === 'sites')
    baseKey.apiBasePath = 'application.sites'
    const site = await models.sites.findOne({
      where: { sdds_site_id: baseKey.powerAppsKey }
    })

    // Update or insert a new site
    if (site) {
      const s = site.dataValues
      baseKey.apiKey = s.id
      // (a) If pending and not changed since the start of the extract
      // (b) If updatable and with a material change in the payload
      if ((s.updateStatus === 'P' && ts > s.updatedAt) || (s.updateStatus === 'U' && hash(data.sites) !== hash(s.site))) {
        await models.sites.update({
          site: data.sites,
          targetKeys: (({ contentId, ...t }) => t)(keys[0]),
          updateStatus: 'U'
        }, {
          where: {
            id: s.id
          },
          returning: false
        })
        counter.update++
      } else if (s.updateStatus === 'P' || s.updateStatus === 'L') {
        counter.pending++
      }
    } else {
      // Create a new site
      baseKey.apiKey = uuidv4()
      await models.sites.create({
        id: baseKey.apiKey,
        site: data.sites,
        targetKeys: (({ contentId, ...t }) => t)(keys[0]),
        updateStatus: 'U',
        sddsSiteId: baseKey.powerAppsKey
      })
      counter.insert++
    }

    return counter
  } catch (error) {
    console.error('Error updating sites', error)
    return { insert: 0, update: 0, pending: 0, error: 1 }
  }
}
