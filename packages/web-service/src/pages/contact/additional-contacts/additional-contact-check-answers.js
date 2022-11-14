import { APIRequests } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactURIs, TASKLIST } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { checkHasApplication } from '../common/common.js'
import { yesNoFromBool } from '../../common/common.js'

const { CHECK_ANSWERS } = contactURIs.ADDITIONAL_APPLICANT
export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const additionalApplicant = await APIRequests.CONTACT.role(ContactRoles.ADDITIONAL_APPLICANT).getByApplicationId(applicationId)
  const additionalEcologist = await APIRequests.CONTACT.role(ContactRoles.ADDITIONAL_ECOLOGIST).getByApplicationId(applicationId)

  return {
    applicant: additionalApplicant
      ? [
          { key: 'addAdditionalApplicant', value: yesNoFromBool(true) },
          { key: 'applicantIsUser', value: yesNoFromBool(additionalApplicant.userId) },
          { key: 'applicantName', value: additionalApplicant.fullName },
          { key: 'applicantEmail', value: additionalApplicant.contactDetails.email }
        ]
      : [
          { key: 'addAdditionalApplicant', value: yesNoFromBool(false) }
        ],
    ecologist: additionalEcologist
      ? [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(true) },
          { key: 'ecologistIsUser', value: yesNoFromBool(additionalEcologist.userId) },
          { key: 'ecologistName', value: additionalEcologist.fullName },
          { key: 'ecologistEmail', value: additionalEcologist.contactDetails.email }
        ]
      : [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(false) }
        ]
  }
}

export const additionalContactCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData,
  completion: TASKLIST.uri
})
