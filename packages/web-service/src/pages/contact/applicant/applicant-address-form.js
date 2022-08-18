import { checkData } from '../common/common.js'
import { addressFormPage } from '../common/address-form/address-form-page.js'
import { ApiRequestEntities } from '../../../services/api-requests.js'
import { contactURIs } from '../../../uris.js'
import { getAddressFormData, setAddressFormData } from '../common/address-form/address-form.js'

const { ADDRESS_FORM, CHECK_ANSWERS } = contactURIs.APPLICANT

export const applicantAddressForm = addressFormPage({
  page: ADDRESS_FORM.page,
  uri: ADDRESS_FORM.uri,
  checkData: checkData,
  getData: getAddressFormData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION),
  setData: setAddressFormData(ApiRequestEntities.APPLICANT, ApiRequestEntities.APPLICANT_ORGANISATION, contactURIs.APPLICANT),
  completion: CHECK_ANSWERS.uri
})
