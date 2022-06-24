import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const getEcologistCompanyData = request => getContactAccountData('ECOLOGIST', 'ECOLOGIST_ORGANIZATION')(request)
export const setEcologistCompanyData = request => setContactAccountData('ECOLOGIST_ORGANIZATION')(request)

export const ecologistCompany = isOrganization(IS_ORGANIZATION,
  checkData,
  getEcologistCompanyData,
  IS_ORGANIZATION,
  setEcologistCompanyData)
