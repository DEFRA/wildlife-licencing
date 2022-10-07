import { contactURIs } from '../../../uris.js'
import { postcodePage } from '../common/postcode/postcode-page.js'
import { APIRequests } from '../../../services/api-requests.js'
import { CONTACT_COMPLETE } from '../common/check-answers/check-answers.js'
import * as connectors from '@defra/wls-connectors-lib'
import { checkAuthorisedPeopleData, getAuthorisedPeopleData } from './common.js'

const { POSTCODE, ADDRESS_FORM, ADDRESS } = contactURIs.AUTHORISED_PEOPLE

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const postcode = request.payload.postcode
  await request.cache().clearPageData(ADDRESS.page)
  await request.cache().clearPageData(ADDRESS_FORM.page)

  try {
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE.AUTHORISED_PERSON)
    const { results } = await connectors.ADDRESS.lookup(postcode)
    if (results.length) {
      Object.assign(journeyData, { addressLookup: results })
    } else {
      // Remove previous
      delete journeyData.addressLookup
    }
  } catch (err) {
    delete journeyData.addressLookup
  } finally {
    await request.cache().setData(journeyData)
  }
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  return journeyData.addressLookup ? ADDRESS.uri : ADDRESS_FORM.uri
}

export const authorisedPersonPostcode = postcodePage({
  page: POSTCODE.page,
  uri: POSTCODE.uri,
  checkData: checkAuthorisedPeopleData,
  getData: getAuthorisedPeopleData(c => ({
    contactName: c.fullName,
    postcode: c?.address?.postcode,
    uri: { addressForm: `${ADDRESS_FORM.uri}?no-postcode=true` }
  })),
  setData: setData,
  completion: completion
})
