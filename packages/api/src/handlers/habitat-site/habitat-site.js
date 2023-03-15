import postHabitatSite from './post-habitat-site.js'
import getHabitatSiteByHabitatSiteId from './get-habitat-site.js'
import getHabitatSitesByApplicationId from './get-habitat-sites-by-application-id.js'
import getHabitatSitesByLicenceId from './get-habitat-sites-by-licence-id.js'
import putHabitatSite from './put-habitat-site.js'
import deleteHabitatSite from './delete-habitat-site.js'

// The habitat-sites for licence are only generated in SDDS so only a 'get' operation is implemented
export {
  postHabitatSite,
  getHabitatSiteByHabitatSiteId,
  getHabitatSitesByApplicationId,
  getHabitatSitesByLicenceId,
  putHabitatSite,
  deleteHabitatSite
}
