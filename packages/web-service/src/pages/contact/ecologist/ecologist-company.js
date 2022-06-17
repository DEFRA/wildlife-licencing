import { isOrganization } from '../common/is-organization/is-organization.js'
import { contactURIs } from '../../../uris.js'
import { getEcologistOrganizationData, setEcologistOrganizationData, checkData } from '../common/common.js'
const { IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const ecologistCompany = isOrganization(IS_ORGANIZATION,
  checkData,
  getEcologistOrganizationData,
  IS_ORGANIZATION,
  setEcologistOrganizationData)
