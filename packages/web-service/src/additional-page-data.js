import crypto from 'crypto'
import { contactURIs, ecologistExperienceURIs, eligibilityURIs, siteURIs, LOGIN, SIGN_OUT } from './uris.js'
import { version } from '../dirname.cjs'

export const additionalPageData = (request, h) => {
  const response = request.response
  if (request.method === 'get' && response.variety === 'view') {
    Object.assign(response.source.context, {
      _uri: {
        login: LOGIN.uri,
        signOut: SIGN_OUT.uri,

        // Eligibility
        landowner: eligibilityURIs.LANDOWNER.uri,
        landownerPermission: eligibilityURIs.LANDOWNER_PERMISSION.uri,
        consent: eligibilityURIs.CONSENT.uri,
        consentGranted: eligibilityURIs.CONSENT_GRANTED.uri,
        invoiceResponsible: contactURIs.INVOICE_PAYER.RESPONSIBLE.uri,

        // Applicant
        applicantUser: contactURIs.APPLICANT.USER.uri,
        applicantNames: contactURIs.APPLICANT.NAMES.uri,
        applicantIsOrganisation: contactURIs.APPLICANT.IS_ORGANISATION.uri,
        applicantOrganisations: contactURIs.APPLICANT.ORGANISATIONS.uri,
        applicantName: contactURIs.APPLICANT.NAME.uri,
        applicantEmail: contactURIs.APPLICANT.EMAIL.uri,
        applicantPostcode: contactURIs.APPLICANT.POSTCODE.uri,
        applicantAddress: contactURIs.APPLICANT.ADDRESS.uri,

        // Ecologist
        ecologistUser: contactURIs.ECOLOGIST.USER.uri,
        ecologistName: contactURIs.ECOLOGIST.NAME.uri,
        ecologistNames: contactURIs.ECOLOGIST.NAMES.uri,
        ecologistIsOrganisation: contactURIs.ECOLOGIST.IS_ORGANISATION.uri,
        ecologistOrganisations: contactURIs.ECOLOGIST.ORGANISATIONS.uri,
        ecologistPostcode: contactURIs.ECOLOGIST.POSTCODE.uri,
        ecologistAddress: contactURIs.ECOLOGIST.ADDRESS.uri,
        ecologistEmail: contactURIs.ECOLOGIST.EMAIL.uri,

        // Additional applicant
        additionalApplicantAdd: contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
        additionalApplicantUser: contactURIs.ADDITIONAL_APPLICANT.USER.uri,
        additionalApplicantNames: contactURIs.ADDITIONAL_APPLICANT.NAMES.uri,
        additionalApplicantEmail: contactURIs.ADDITIONAL_APPLICANT.EMAIL.uri,

        // Additional ecologist
        additionalEcologistAdd: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
        additionalEcologistUser: contactURIs.ADDITIONAL_ECOLOGIST.USER.uri,
        additionalEcologistNames: contactURIs.ADDITIONAL_ECOLOGIST.NAMES.uri,
        additionalEcologistEmail: contactURIs.ADDITIONAL_ECOLOGIST.EMAIL.uri,

        // Payer
        invoiceUser: contactURIs.INVOICE_PAYER.USER.uri,
        invoiceName: contactURIs.INVOICE_PAYER.NAME.uri,
        invoiceNames: contactURIs.INVOICE_PAYER.NAMES.uri,
        invoiceOrganisations: contactURIs.INVOICE_PAYER.ORGANISATIONS.uri,
        invoicePostcode: contactURIs.INVOICE_PAYER.POSTCODE.uri,
        invoiceAddress: contactURIs.INVOICE_PAYER.ADDRESS.uri,
        invoiceEmail: contactURIs.INVOICE_PAYER.EMAIL.uri,
        invoiceIsOrganisation: contactURIs.INVOICE_PAYER.IS_ORGANISATION.uri,

        // Site
        siteName: siteURIs.NAME.uri,
        siteGridReference: siteURIs.SITE_GRID_REF.uri,
        siteMap: siteURIs.UPLOAD_MAP.uri,
        siteMapTwo: siteURIs.UPLOAD_MAP_MITIGATIONS_DURING_DEVELOPMENT.uri,
        siteMapThree: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.uri,

        // Misc
        previousLicence: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
        licenceDetails: ecologistExperienceURIs.LICENCE.uri,
        experienceDetails: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
        methodExperience: ecologistExperienceURIs.ENTER_METHODS.uri,
        classMitigation: ecologistExperienceURIs.CLASS_MITIGATION.uri,
        classMitigationDetails: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
      },
      credentials: request.auth.credentials
    })

    // Add the version number in the test environments
    if (process.env.ALLOW_RESET) {
      Object.assign(response.source.context, { version })
    }

    // Generate the nonce
    const nonce = crypto.randomBytes(16).toString('base64')

    // Add the nonce to the template data
    Object.assign(response.source.context, { cspNonce: nonce })
    // Add additional headers
    const defaultSrc = '\'self\''
    const scriptSrc = `'self' unsafe-inline 'nonce-${nonce}'`
    const fontSrc = '\'self\' fonts.gstatic.com'
    const imageSrc = '\'self\''
    request.response.header('Content-Security-Policy', `default-src ${defaultSrc}; font-src ${fontSrc}; script-src ${scriptSrc}; img-src ${imageSrc}`)
  }

  return h.continue
}
