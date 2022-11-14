import { yesNoPage } from '../../common/yes-no.js'
import { checkHasApplication } from '../common/common.js'
import { contactURIs } from '../../../uris.js'

export const addAdditionalEcologist = yesNoPage({
  page: contactURIs.ADDITIONAL_ECOLOGIST.ADD.page,
  uri: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
  checkData: checkHasApplication,
  completion: () => ({})
})
