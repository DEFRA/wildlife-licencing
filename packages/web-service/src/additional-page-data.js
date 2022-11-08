import { contactURIs, ecologistExperienceURIs, eligibilityURIs, LOGIN, REGISTER, SIGN_OUT, siteURIs } from './uris.js'

export const additionalPageData = (request, h) => {
  const response = request.response
  if (request.method === 'get' && response.variety === 'view') {
    Object.assign(response.source.context, {
      _uri: {
        login: LOGIN.uri,
        signOut: SIGN_OUT.uri,
        register: REGISTER.uri,
        landowner: eligibilityURIs.LANDOWNER.uri,
        landownerPermission: eligibilityURIs.LANDOWNER_PERMISSION.uri,
        consent: eligibilityURIs.CONSENT.uri,
        consentGranted: eligibilityURIs.CONSENT_GRANTED.uri,
        applicantUser: contactURIs.APPLICANT.USER.uri,
        ecologistUser: contactURIs.ECOLOGIST.USER.uri,
        invoiceUser: contactURIs.INVOICE_PAYER.USER.uri,
        applicantName: contactURIs.APPLICANT.NAME.uri,
        ecologistName: contactURIs.ECOLOGIST.NAME.uri,
        invoiceName: contactURIs.INVOICE_PAYER.NAME.uri,
        applicantNames: contactURIs.APPLICANT.NAMES.uri,
        ecologistNames: contactURIs.ECOLOGIST.NAMES.uri,
        invoiceNames: contactURIs.INVOICE_PAYER.NAMES.uri,
        applicantOrganisations: contactURIs.APPLICANT.ORGANISATIONS.uri,
        ecologistOrganisations: contactURIs.ECOLOGIST.ORGANISATIONS.uri,
        invoiceOrganisations: contactURIs.INVOICE_PAYER.ORGANISATIONS.uri,
        applicantPostcode: contactURIs.APPLICANT.POSTCODE.uri,
        ecologistPostcode: contactURIs.ECOLOGIST.POSTCODE.uri,
        invoicePostcode: contactURIs.INVOICE_PAYER.POSTCODE.uri,
        applicantAddress: contactURIs.APPLICANT.ADDRESS.uri,
        ecologistAddress: contactURIs.ECOLOGIST.ADDRESS.uri,
        invoiceAddress: contactURIs.INVOICE_PAYER.ADDRESS.uri,
        applicantEmail: contactURIs.APPLICANT.EMAIL.uri,
        ecologistEmail: contactURIs.ECOLOGIST.EMAIL.uri,
        invoiceEmail: contactURIs.INVOICE_PAYER.EMAIL.uri,
        applicantIsOrganisation: contactURIs.APPLICANT.IS_ORGANISATION.uri,
        ecologistIsOrganisation: contactURIs.ECOLOGIST.IS_ORGANISATION.uri,
        invoiceIsOrganisation: contactURIs.INVOICE_PAYER.IS_ORGANISATION.uri,
        previousLicence: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
        licenceDetails: ecologistExperienceURIs.LICENCE.uri,
        experienceDetails: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
        methodExperience: ecologistExperienceURIs.ENTER_METHODS.uri,
        classMitigation: ecologistExperienceURIs.CLASS_MITIGATION.uri,
        classMitigationDetails: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri,
        siteName: siteURIs.NAME.uri,
        siteGridReference: siteURIs.SITE_GRID_REF.uri,
        siteMap: siteURIs.UPLOAD_MAP.uri,
        siteMapTwo: siteURIs.UPLOAD_MAP_2.uri,
        siteMapThree: siteURIs.UPLOAD_MAP_3.uri
      },
      credentials: request.auth.credentials
    })
  }
  return h.continue
}
