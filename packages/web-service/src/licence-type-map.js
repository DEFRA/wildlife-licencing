import { eligibilityURIs } from './uris.js'
const { LANDOWNER_PERMISSION } = eligibilityURIs

export const ELIGIBILITY_CHECK = 'eligibility-check'
export const LICENCE_HOLDER = 'licence-holder'
export const ECOLOGIST = 'ecologist'
export const WORK_ACTIVITY = 'work-activity'
export const PERMISSIONS = 'permissions'
export const SITES = 'sites'
export const SETTS = 'setts'
export const SEND_APPLICATION = 'send-application'

const search = (required, completed) => required.every(t => completed.find(c => c === t))

export const licenceTypeMap = {
  'A24 badger': {
    sections: [
      {
        name: 'check-before-you-start',
        tasks: [
          {
            name: ELIGIBILITY_CHECK,
            uri: LANDOWNER_PERMISSION,
            enabled: signedIn => !signedIn
          }
        ]
      },
      {
        name: 'contact-details',
        tasks: [
          {
            name: LICENCE_HOLDER,
            uri: '/',
            enabled: (signedIn, completed) => signedIn && search([ELIGIBILITY_CHECK], completed)
          },
          {
            name: ECOLOGIST,
            uri: '/',
            enabled: (signedIn, completed) => signedIn &&
              search([ELIGIBILITY_CHECK, LICENCE_HOLDER], completed)
          }
        ]
      },
      {
        name: 'planned-work-activity',
        tasks: [
          {
            name: WORK_ACTIVITY,
            uri: '/',
            enabled: (signedIn, completed) => signedIn &&
              search([ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST], completed)
          },
          {
            name: PERMISSIONS,
            uri: '/',
            enabled: (signedIn, completed) => signedIn &&
              search([ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY], completed)
          },
          {
            name: SITES,
            uri: '/',
            enabled: (signedIn, completed) => signedIn &&
              search([ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS], completed)
          },
          {
            name: SETTS,
            uri: '/',
            enabled: (signedIn, completed) => signedIn &&
              search([ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST,
                WORK_ACTIVITY, PERMISSIONS, SITES], completed)
          }
        ]
      },
      {
        name: 'apply',
        tasks: [
          {
            name: SEND_APPLICATION,
            uri: '/',
            enabled: (signedIn, completed) => signedIn && search([ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST,
              WORK_ACTIVITY, PERMISSIONS, SITES, SETTS], completed)
          }
        ]
      }
    ]
  }
}
