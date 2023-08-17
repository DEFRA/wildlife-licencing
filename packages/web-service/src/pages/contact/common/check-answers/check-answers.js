import { APIRequests } from '../../../../services/api-requests.js'
import { yesNoFromBool } from '../../../common/common.js'
import { addressLine } from '../../../service/address.js'

export const CONTACT_COMPLETE = {
  APPLICANT: 'applicant-contact-complete',
  ECOLOGIST: 'ecologist-contact-complete',
  AUTHORISED_PERSON: 'authorised-person-contact-complete',
  PAYER: 'invoice-payer-complete'
}

export const getCheckAnswersData = (contactRole, _conflictingRoles, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  // The check-answers macro requires an array of k, v pair objects
  return {
    hasAccount: !!account,
    checkYourAnswers: [
      { key: 'whoIsTheLicenceFor', value: contact.fullName },
      { key: 'contactIsOrganisation', value: yesNoFromBool(!!account) },
      (account && { key: 'contactOrganisations', value: account.name }),
      { key: 'address', value: addressLine(account || contact) },
      { key: 'email', value: account?.contactDetails?.email || contact?.contactDetails?.email }
    ].filter(a => a) // Remove null values
  }
}
