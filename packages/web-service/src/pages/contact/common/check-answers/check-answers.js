import { APIRequests } from '../../../../services/api-requests.js'

export const CONTACT_COMPLETE = {
  APPLICANT: 'applicant-contact-complete',
  ECOLOGIST: 'ecologist-contact-complete'
}

const prt = a => {
  if (a === undefined) {
    return '-'
  } else {
    return a ? 'yes' : 'no'
  }
}

const addressLine1 = c => [
  c.address.subBuildingName,
  c.address.buildingName,
  c.address.buildingNumber,
  c.address.street,
  c.address.addressLine1
].filter(a => a).join(', ')

const addressLine = c => [
  addressLine1(c),
  c.address.locality,
  c.address.dependentLocality,
  c.address.addressLine2,
  c.address.town,
  c.address.county,
  c.address.postcode
].filter(a => a).join('<br>')

export const getCheckAnswersData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  // The check-answers macro requires an array of k, v pair objects
  await APIRequests.APPLICATION.tags(applicationId).add(CONTACT_COMPLETE[contactType])
  return {
    hasAccount: !!account,
    checkYourAnswers: [
      { key: 'contactIsUser', value: prt(contact.userId) },
      { key: 'whoIsTheLicenceFor', value: contact.fullName },
      { key: 'contactIsOrganisation', value: prt(!!account) },
      (account && { key: 'applicantOrganisations', value: account.name }),
      { key: 'address', value: addressLine(account || contact) },
      { key: 'email', value: account?.contactDetails?.email || contact?.contactDetails?.email }
    ].filter(a => a) // Remove null values
  }
}
