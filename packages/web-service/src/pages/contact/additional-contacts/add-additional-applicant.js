import { yesNoPage } from '../../common/yes-no.js'
import { checkHasApplication } from '../common/common.js'
import { contactURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'

const isSignedInUserApplicant = async request => {
  const { userId, applicationId } = await request.cache().getData()
  const applicant = await APIRequests.CONTACT.role(ContactRoles.APPLICANT).getByApplicationId(applicationId)
  return applicant.userId === userId
}

const addAdditionalApplicantCompletion = async request => {
  const pageData = await request.cache().getPageData()
  if (pageData.payload['yes-no'] === 'yes') {
    if (await isSignedInUserApplicant(request)) {
      return contactURIs.ADDITIONAL_APPLICANT.NAME.uri
    } else {
      return contactURIs.ADDITIONAL_APPLICANT.USER.uri
    }
  }

  return contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri
}

export const addAdditionalApplicant = yesNoPage({
  page: contactURIs.ADDITIONAL_APPLICANT.ADD.page,
  uri: contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
  checkData: checkHasApplication,
  completion: addAdditionalApplicantCompletion
})
