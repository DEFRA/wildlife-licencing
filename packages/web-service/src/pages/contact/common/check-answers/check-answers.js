import { APIRequests, tagStatus } from '../../../../services/api-requests.js'
import { yesNoFromBool } from '../../../common/common.js'

export const CONTACT_COMPLETE = {
  APPLICANT: 'applicant-contact-complete',
  ECOLOGIST: 'ecologist-contact-complete',
  AUTHORISED_PERSON: 'authorised-person-contact-complete'
}

export const addressLine1 = c => [
  c.address.subBuildingName,
  c.address.buildingName,
  c.address.buildingNumber,
  c.address.street,
  c.address.addressLine1
].filter(a => a).join(', ')

export const addressLine = c => [
  addressLine1(c),
  c.address.locality,
  c.address.dependentLocality,
  c.address.addressLine2,
  c.address.town,
  c.address.county,
  c.address.postcode
].filter(a => a).join('<br>')

export const getCheckAnswersData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  // The check-answers macro requires an array of k, v pair objects
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: CONTACT_COMPLETE[contactRole], tagState: tagStatus.COMPLETE })
  return {
    hasAccount: !!account,
    checkYourAnswers: [
      { key: 'contactIsUser', value: yesNoFromBool(contact.userId) },
      { key: 'whoIsTheLicenceFor', value: contact.fullName },
      { key: 'contactIsOrganisation', value: yesNoFromBool(!!account) },
      (account && { key: 'contactOrganisations', value: account.name }),
      { key: 'address', value: addressLine(account || contact) },
      { key: 'email', value: account?.contactDetails?.email || contact?.contactDetails?.email }
    ].filter(a => a) // Remove null values
  }
}
