import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData } from '../common/common.js'
import { getContactData, setContactData } from '../common/contact-name/contact-name.js'

const { NAME, IS_ORGANISATION } = contactURIs.ECOLOGIST

export const getEcologistData = request => getContactData('ECOLOGIST')(request)
export const setEcologistData = request => setContactData('ECOLOGIST')(request)

export const ecologistName = contactNamePage({
  page: NAME.page,
  uri: NAME.uri,
  checkData,
  getData: getEcologistData,
  completion: IS_ORGANISATION.uri,
  setData: setEcologistData
})
