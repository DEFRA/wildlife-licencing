import { contactURIs, ecologistExperienceURIs, eligibilityURIs, LOGIN, REGISTER, SIGN_OUT } from './uris.js'

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
        applicantName: contactURIs.APPLICANT.NAME.uri,
        ecologistName: contactURIs.ECOLOGIST.NAME.uri,
        applicantNames: contactURIs.APPLICANT.NAMES.uri,
        ecologistNames: contactURIs.ECOLOGIST.NAMES.uri,
        applicantOrganisations: contactURIs.APPLICANT.ORGANISATIONS.uri,
        ecologistOrganisations: contactURIs.ECOLOGIST.ORGANISATIONS.uri,
        applicantPostcode: contactURIs.APPLICANT.POSTCODE.uri,
        ecologistPostcode: contactURIs.ECOLOGIST.POSTCODE.uri,
        applicantAddress: contactURIs.APPLICANT.ADDRESS.uri,
        ecologistAddress: contactURIs.ECOLOGIST.ADDRESS.uri,
        applicantEmail: contactURIs.APPLICANT.EMAIL.uri,
        ecologistEmail: contactURIs.ECOLOGIST.EMAIL.uri,
        applicantIsOrganisation: contactURIs.APPLICANT.IS_ORGANISATION.uri,
        ecologistIsOrganisation: contactURIs.ECOLOGIST.IS_ORGANISATION.uri,
        previousLicence: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
        licenceDetails: ecologistExperienceURIs.LICENCE.uri,
        experienceDetails: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
        methodExperience: ecologistExperienceURIs.ENTER_METHODS.uri,
        classMitigation: ecologistExperienceURIs.CLASS_MITIGATION.uri,
        classMitigationDetails: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri
      },
      credentials: request.auth.credentials
    })
  }
  return h.continue
}
