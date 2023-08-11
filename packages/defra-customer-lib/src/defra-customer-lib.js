import { DEFRA_CUSTOMER } from '@defra/wls-connectors-lib/src/power-apps.js'

const USER_QUERY = userId => 'contacts(' + userId + ')?$select=emailaddress1,fullname,telephone1,defra_uniquereference,defra_addrcorbuildingname,defra_addrcorbuildingnumber,defra_addrcorstreet,defra_addrcorlocality,defra_addrcortown,defra_addrcorcounty,defra_addrcorpostcode'

export const getUserData = async userId => DEFRA_CUSTOMER.fetch(USER_QUERY(userId))
