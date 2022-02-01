import { models } from '@defra/wls-database-model'
import postSite from './post-site.js'
import putSite from './put-site.js'
import getSitesByUserId from './get-sites-by-user-id.js'
import { prepareResponse } from './site-proc.js'
import deleteSite from './delete-site.js'
import getEntityByEntityId from '../common/get-entity-by-entity-id.js'

const getSiteBySiteId = () => getEntityByEntityId(
  models.sites,
  r => r.params.siteId,
  prepareResponse)

export {
  getSitesByUserId,
  getSiteBySiteId,
  postSite,
  putSite,
  deleteSite
}
