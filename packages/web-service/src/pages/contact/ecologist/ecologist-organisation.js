import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const getEcologistOrganisationData = request => getContactAccountData('ECOLOGIST', 'ECOLOGIST_ORGANIZATION')(request)
export const setEcologistOrganisationData = request => setContactAccountData('ECOLOGIST_ORGANIZATION')(request)

export const ecologistOrganisation = isOrganization(IS_ORGANIZATION,
  checkData,
  getEcologistOrganisationData,
  IS_ORGANIZATION,
  setEcologistOrganisationData)
