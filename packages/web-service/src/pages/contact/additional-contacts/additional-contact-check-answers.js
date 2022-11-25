import { APIRequests, tagStatus } from '../../../services/api-requests.js'
import { ContactRoles } from '../common/contact-roles.js'
import { contactURIs, TASKLIST } from '../../../uris.js'
import { checkAnswersPage } from '../../common/check-answers.js'
import { canBeUser, checkHasApplication } from '../common/common.js'
import { yesNoFromBool } from '../../common/common.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'

const { CHECK_ANSWERS } = contactURIs.ADDITIONAL_APPLICANT

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ADDITIONAL_CONTACTS, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  const additionalApplicant = await APIRequests.CONTACT.role(ContactRoles.ADDITIONAL_APPLICANT).getByApplicationId(applicationId)
  const additionalEcologist = await APIRequests.CONTACT.role(ContactRoles.ADDITIONAL_ECOLOGIST).getByApplicationId(applicationId)

  // These flags are to help keep track of the page sequence
  Object.assign(journeyData, {
    additionalContact: {
      [ContactRoles.ADDITIONAL_APPLICANT]: !!additionalApplicant,
      [ContactRoles.ADDITIONAL_ECOLOGIST]: !!additionalEcologist
    }
  })

  await request.cache().setData(journeyData)

  return {
    applicant: additionalApplicant
      ? [
          { key: 'addAdditionalApplicant', value: yesNoFromBool(true) },
          (await canBeUser(request, [ContactRoles.APPLICANT]) && { key: 'applicantIsUser', value: yesNoFromBool(additionalApplicant.userId) }),
          { key: 'applicantName', value: additionalApplicant.fullName },
          { key: 'applicantEmail', value: additionalApplicant.contactDetails.email }
        ].filter(a => a)
      : [
          { key: 'addAdditionalApplicant', value: yesNoFromBool(false) }
        ],
    ecologist: additionalEcologist
      ? [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(true) },
          (await canBeUser(request, [ContactRoles.ECOLOGIST]) && { key: 'ecologistIsUser', value: yesNoFromBool(additionalEcologist.userId) }),
          { key: 'ecologistName', value: additionalEcologist.fullName },
          { key: 'ecologistEmail', value: additionalEcologist.contactDetails.email }
        ].filter(a => a)
      : [
          { key: 'addAdditionalEcologist', value: yesNoFromBool(false) }
        ]
  }
}

export const setData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ADDITIONAL_CONTACTS, tagState: tagStatus.COMPLETE })
}

export const additionalContactCheckAnswers = checkAnswersPage({
  checkData: checkHasApplication,
  page: CHECK_ANSWERS.page,
  uri: CHECK_ANSWERS.uri,
  getData: getData,
  setData: setData,
  completion: TASKLIST.uri
})
