import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
const { USER } = contactURIs.ECOLOGIST

export const ecologistUser = yesNoPage(USER, checkData, () => {}, null, () => {})
