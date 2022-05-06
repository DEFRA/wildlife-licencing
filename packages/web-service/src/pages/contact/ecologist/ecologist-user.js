import { contactURIs } from '../../../uris.js'
import { checkData, getUserData } from '../common/common.js'
import { yesNoPage } from '../../common/yes-no.js'
const { USER, NAME } = contactURIs.ECOLOGIST

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  return pageData.payload['yes-no'] === 'yes' ? USER.uri : NAME.uri
}

export const ecologistUser = yesNoPage(USER, checkData, getUserData, completion)
