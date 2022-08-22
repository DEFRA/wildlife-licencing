import { contactURIs } from '../../../uris.js'
import { getUserData, setUserData, userCompletion } from '../common/user/user.js'
import { checkData } from '../common/common.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'

import { yesNoPage } from '../../common/yes-no.js'
const { USER } = contactURIs.APPLICANT

export const applicantUser = yesNoPage({
  page: USER.page,
  uri: USER.uri,
  checkData: checkData,
  getData: getUserData(ApiRequestEntities.APPLICANT),
  setData: setUserData(ApiRequestEntities.APPLICANT),
  completion: userCompletion(ApiRequestEntities.APPLICANT, contactURIs.APPLICANT)
})
