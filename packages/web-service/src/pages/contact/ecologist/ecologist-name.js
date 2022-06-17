import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData, getEcologistData, setEcologistData } from '../common/common.js'
const { NAME, IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const ecologistName = contactNamePage(NAME, checkData, getEcologistData, IS_ORGANIZATION.uri, setEcologistData)
