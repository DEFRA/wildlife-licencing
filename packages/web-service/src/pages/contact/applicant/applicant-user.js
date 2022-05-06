import { contactURIs } from '../../../uris.js'
import { checkData } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
const { USER } = contactURIs.APPLICANT

export const applicantUser = yesNoPage(USER, checkData, () => {}, null, null)
