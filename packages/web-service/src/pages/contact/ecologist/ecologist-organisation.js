import { isOrganisation } from '../common/is-organisation/is-organisation.js'
import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { getContactAccountData, setContactAccountData } from '../common/account/account.js'
const { IS_ORGANISATION } = contactURIs.ECOLOGIST

export const getEcologistOrganisationData = request => getContactAccountData('ECOLOGIST', 'ECOLOGIST_ORGANISATION')(request)
export const setEcologistOrganisationData = request => setContactAccountData('ECOLOGIST_ORGANISATION')(request)

export const ecologistOrganisation = isOrganisation({
  page: IS_ORGANISATION.page,
  uri: IS_ORGANISATION.uri,
  getData: getEcologistOrganisationData,
  completion: IS_ORGANISATION,
  setData: setEcologistOrganisationData,
  checkData
})
