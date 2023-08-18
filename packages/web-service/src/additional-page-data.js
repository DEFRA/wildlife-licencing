import crypto from 'crypto'

import {
  contactURIs,
  ecologistExperienceURIs,
  eligibilityURIs,
  convictionsURIs,
  siteURIs,
  workActivityURIs,
  SIGN_OUT,
  SPECIES,
  APPLICATION_SUMMARY,
  TASKLIST,
  conservationConsiderationURIs,
  APPLICATION_LICENCE,
  APPLICATIONS,
  COOKIE_INFO,
  SIGN_IN
} from './uris.js'

import { version } from '../dirname.cjs'
import { APIRequests } from './services/api-requests.js'
import { DEFRA_ID } from '@defra/wls-connectors-lib'

export const addCookiePrefs = async (request, h) => {
  const response = request.response
  if (request.method === 'get' && response.variety === 'view') {
    // If signed in get the cookie preferences from the user
    const journeyData = await request.cache().getData() || {}
    if (journeyData.userId) {
      const user = await APIRequests.USER.getById(journeyData.userId)
      Object.assign(response.source.context, { cookiePrefs: user?.cookiePrefs })
    } else if (journeyData.cookies) {
      Object.assign(response.source.context, { cookiePrefs: journeyData.cookies })
    }
  }

  return h.continue
}

export const additionalPageData = async (request, h) => {
  const response = request.response
  if (request.method === 'get' && response.variety === 'view') {
    Object.assign(response.source.context, {
      _uri: {
        idm: {
          signIn: SIGN_IN.uri,
          signOut: SIGN_OUT.uri,
          management: DEFRA_ID.getManagement()
        },

        applicationSummary: APPLICATION_SUMMARY.uri,
        applicationLicence: APPLICATION_LICENCE.uri,
        taskList: TASKLIST.uri,
        applications: APPLICATIONS.uri,

        // Cookie info
        cookieInfo: COOKIE_INFO.uri,

        // Species
        species: SPECIES.uri,

        // Eligibility
        landowner: eligibilityURIs.LANDOWNER.uri,
        landownerPermission: eligibilityURIs.LANDOWNER_PERMISSION.uri,
        consent: eligibilityURIs.CONSENT.uri,
        consentGranted: eligibilityURIs.CONSENT_GRANTED.uri,
        invoiceResponsible: contactURIs.INVOICE_PAYER.RESPONSIBLE.uri,
        purchaseOrderReference: contactURIs.INVOICE_PAYER.PURCHASE_ORDER.uri,

        // Applicant
        applicantIsOrganisation: contactURIs.APPLICANT.IS_ORGANISATION.uri,
        applicantName: contactURIs.APPLICANT.NAME.uri,
        applicantEmail: contactURIs.APPLICANT.EMAIL.uri,
        applicantPostcode: contactURIs.APPLICANT.POSTCODE.uri,
        applicantAddress: contactURIs.APPLICANT.ADDRESS.uri,

        // Ecologist
        ecologistName: contactURIs.ECOLOGIST.NAME.uri,
        ecologistIsOrganisation: contactURIs.ECOLOGIST.IS_ORGANISATION.uri,
        ecologistPostcode: contactURIs.ECOLOGIST.POSTCODE.uri,
        ecologistAddress: contactURIs.ECOLOGIST.ADDRESS.uri,
        ecologistEmail: contactURIs.ECOLOGIST.EMAIL.uri,

        // Additional applicant
        additionalApplicantAdd: contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
        additionalApplicantName: contactURIs.ADDITIONAL_APPLICANT.NAME.uri,
        additionalApplicantEmail: contactURIs.ADDITIONAL_APPLICANT.EMAIL.uri,

        // Additional ecologist
        additionalEcologistAdd: contactURIs.ADDITIONAL_ECOLOGIST.ADD.uri,
        additionalEcologistName: contactURIs.ADDITIONAL_ECOLOGIST.NAME.uri,
        additionalEcologistEmail: contactURIs.ADDITIONAL_ECOLOGIST.EMAIL.uri,

        // Payer
        invoiceName: contactURIs.INVOICE_PAYER.NAME.uri,
        invoicePostcode: contactURIs.INVOICE_PAYER.POSTCODE.uri,
        invoiceAddress: contactURIs.INVOICE_PAYER.ADDRESS.uri,
        invoiceEmail: contactURIs.INVOICE_PAYER.EMAIL.uri,
        invoiceIsOrganisation: contactURIs.INVOICE_PAYER.IS_ORGANISATION.uri,

        // Site
        siteName: siteURIs.NAME.uri,
        siteAddress: siteURIs.SITE_GOT_POSTCODE.uri,
        siteGridReference: siteURIs.SITE_GRID_REF.uri,
        siteMap: siteURIs.UPLOAD_MAP.uri,
        siteMapTwo: siteURIs.UPLOAD_MAP_MITIGATIONS_DURING_DEVELOPMENT.uri,
        siteMapThree: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.uri,

        // Work activity
        workProposal: workActivityURIs.WORK_PROPOSAL.uri,
        workPayment: workActivityURIs.PAYING_FOR_LICENCE.uri,
        workPaymentExemptReason: workActivityURIs.PAYMENT_EXEMPT_REASON.uri,
        workCategory: workActivityURIs.WORK_CATEGORY.uri,

        // Conviction
        isAnyConviction: convictionsURIs.ANY_CONVICTIONS.uri,
        convictionDetails: convictionsURIs.CONVICTION_DETAILS.uri,

        // Conservation considerations
        onOrNextToDesignatedSite: conservationConsiderationURIs.DESIGNATED_SITE.uri,
        designatedSiteName: conservationConsiderationURIs.DESIGNATED_SITE_NAME.uri,
        designatedSiteOwnerPermission: conservationConsiderationURIs.OWNER_PERMISSION.uri,
        designatedSitePermissionDetails: conservationConsiderationURIs.OWNER_PERMISSION_DETAILS.uri,
        designatedSiteActivityAdvice: conservationConsiderationURIs.ACTIVITY_ADVICE.uri,
        designatedSiteNEAdvice: conservationConsiderationURIs.NE_ADVICE.uri,
        designatedSiteProximity: conservationConsiderationURIs.DESIGNATED_SITE_PROXIMITY.uri,
        designatedSiteRemove: conservationConsiderationURIs.DESIGNATED_SITE_REMOVE.uri,

        // Misc
        previousLicence: ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
        licenceDetails: ecologistExperienceURIs.LICENCE.uri,
        experienceDetails: ecologistExperienceURIs.ENTER_EXPERIENCE.uri,
        methodExperience: ecologistExperienceURIs.ENTER_METHODS.uri,
        classMitigation: ecologistExperienceURIs.CLASS_MITIGATION.uri,
        classMitigationDetails: ecologistExperienceURIs.ENTER_CLASS_MITIGATION.uri,

        magic: {
          ds: 'https://magic.defra.gov.uk/MagicMap.aspx?chosenLayers=sssiPIndex,sssiIndex,backdropDIndex,backdropIndex,europeIndex,vmlBWIndex,25kBWIndex,50kBWIndex,250kBWIndex,miniscaleBWIndex,baseIndex&box=-187122:5095:1034155:705095&useDefaultbackgroundMapping=false'
        }
      },
      credentials: request.auth.credentials
    })

    // Add the version number in the test environments
    if (process.env.ALLOW_RESET) {
      Object.assign(response.source.context, { version })
    }

    // Add the GTM tag
    if (process.env.MANAGER_TAG) {
      Object.assign(response.source.context, { gtm: process.env.MANAGER_TAG })
    }

    // Add the user details if authenticated
    const authorization = await request.cache().getAuthData()
    if (authorization) {
      Object.assign(response.source.context, {
        user: {
          name: `${authorization.firstName} ${authorization.lastName}`
        }
      })
    }

    // Generate the nonce
    const nonce = crypto.randomBytes(16).toString('base64')

    // Add the nonce to the template data
    Object.assign(response.source.context, { cspNonce: nonce })
    // Add additional headers
    const defaultSrc = '\'self\' https://region1.google-analytics.com https://www.googletagmanager.com'
    const scriptSrc = `'self' 'nonce-${nonce}' https://www.googletagmanager.com`
    const fontSrc = '\'self\' fonts.gstatic.com'
    const imageSrc = '\'self\''
    request.response.header('Content-Security-Policy', `default-src ${defaultSrc}; font-src ${fontSrc}; script-src ${scriptSrc}; img-src ${imageSrc};`)
  }

  return h.continue
}
