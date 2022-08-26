import { APIRequests } from '../../../../services/api-requests.js'

const prt = a => {
  if (a === undefined) {
    return '-'
  } else {
    return a ? 'yes' : 'no'
  }
}

const addressLine = c => [
  c.address.subBuildingName,
  c.address.buildingNumber,
  c.address.street,
  c.address.town,
  c.address.postcode
].filter(a => a).join(', ')

export const getCheckAnswersData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  // The check-answers macro requires an array of k, v pair objects
  return {
    hasAccount: !!account,
    immutableAccount: !!(account && account.submitted),
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
