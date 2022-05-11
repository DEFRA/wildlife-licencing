import { contactURIs } from '../../../uris.js'
import { checkData, getUserData } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
const { USER, NAMES } = contactURIs.APPLICANT

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  return pageData.payload['yes-no'] === 'yes' ? USER.uri : NAMES.uri
}

export const applicantUser = yesNoPage(USER, checkData, getUserData, completion, null)
