import {
  eligibilityURIs,
  contactURIs,
  DECLARATION,
  FILE_UPLOADS,
  habitatURIs,
  ecologistExperienceURIs,
  siteURIs
} from '../../uris.js'
import { APIRequests, tagStatus } from '../../services/api-requests.js'
import { isComplete, isCompleteOrConfirmed } from '../common/tag-functions.js'

const { LANDOWNER, ELIGIBILITY_CHECK } = eligibilityURIs

// Placeholder - the badger mitigation licence
export const A24 = 'A24 Badger'

// The set of tasks for all licence types
export const SECTION_TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  LICENCE_HOLDER: 'licence-holder',
  ECOLOGIST: 'ecologist',
  AUTHORISED_PEOPLE: 'authorised-people',
  ADDITIONAL_CONTACTS: 'additional-contacts',
  INVOICE_PAYER: 'invoice-payer',
  WORK_ACTIVITY: 'work-activity',
  PERMISSIONS: 'permissions',
  SITES: 'sites',
  SETTS: 'setts',
  ECOLOGIST_EXPERIENCE: 'ecologist-experience',
  SUPPORTING_INFORMATION: 'supporting-information',
  SUBMIT: 'send-application'
}

// Return a progress object containing the number of completed tasks of total tasks )
export const getProgress = status => ({
  complete: Object.values(status).filter(s => s).length,
  from: Object.keys(status).length
})

export const getTaskStatus = async request => {
  const journeyData = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)
  const applicationTags = application.applicationTags || []
  return {
    [SECTION_TASKS.ELIGIBILITY_CHECK]: (applicationTags.find(t => t.tag === SECTION_TASKS.ELIGIBILITY_CHECK) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.LICENCE_HOLDER]: (applicationTags.find(t => t.tag === SECTION_TASKS.LICENCE_HOLDER) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.ECOLOGIST]: (applicationTags.find(t => t.tag === SECTION_TASKS.ECOLOGIST) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.AUTHORISED_PEOPLE]: (applicationTags.find(t => t.tag === SECTION_TASKS.AUTHORISED_PEOPLE) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.ADDITIONAL_CONTACTS]: (applicationTags.find(t => t.tag === SECTION_TASKS.ADDITIONAL_CONTACTS) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.INVOICE_PAYER]: (applicationTags.find(t => t.tag === SECTION_TASKS.INVOICE_PAYER) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.ECOLOGIST_EXPERIENCE]: (applicationTags.find(t => t.tag === SECTION_TASKS.ECOLOGIST_EXPERIENCE) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.WORK_ACTIVITY]: { tagState: tagStatus.NOT_STARTED },
    [SECTION_TASKS.PERMISSIONS]: { tagState: tagStatus.NOT_STARTED },
    [SECTION_TASKS.SITES]: (applicationTags.find(t => t.tag === SECTION_TASKS.SITES) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.SETTS]: (applicationTags.find(t => t.tag === SECTION_TASKS.SETTS) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.SUPPORTING_INFORMATION]: (applicationTags.find(t => t.tag === SECTION_TASKS.SUPPORTING_INFORMATION) || { tagState: tagStatus.NOT_STARTED }),
    [SECTION_TASKS.SUBMIT]: { tagState: tagStatus.NOT_STARTED }
  }
}

// A function to take the static map for a given licence type and decorate it using the current cache state
export const decorateMap = (currentLicenceTypeMap, taskStatus) => currentLicenceTypeMap.sections.map(s => ({
  ...s,
  tasks: s.tasks.map(t => ({
    ...t,
    ...(typeof t.uri === 'function' && {
      uri: t.uri(taskStatus)
    }),
    ...(typeof t.status === 'function' && {
      status: t.status(taskStatus)
    }),
    ...(typeof t.enabled === 'function' && {
      enabled: t.enabled(taskStatus)
    })
  }))
}))

const getState = (status, sectionTaskKey) => {
  if (!eligibilityCompleted(status)) {
    return tagStatus.CANNOT_START
  }
  return status[sectionTaskKey].tagState
}

// This essentially does the same job as the `getState` function
// But it also checks other features are complete too
// E.g. 'Add invoice details' depends upon 3 other flows being complete
const getStateDependsUpon = (status, sectionTaskKey, dependUpon) => {
  if (!eligibilityCompleted(status)) {
    return tagStatus.CANNOT_START
  }

  for (let i = 0; i < dependUpon.length; i++) {
    const key = dependUpon[i]
    if (!isComplete(status[key].tagState)) {
      return tagStatus.CANNOT_START
    }
  }

  return status[sectionTaskKey].tagState
}

const eligibilityCompleted = status => isComplete(status[SECTION_TASKS.ELIGIBILITY_CHECK].tagState)

// A map of the sections and tasks by licence type
export const licenceTypeMap = {
  [A24]: {
    sections: [
      {
        name: 'check-before-you-start', // The name of a section, referred on in the template
        tasks: [ // The set of tasks in this section
          {
            name: SECTION_TASKS.ELIGIBILITY_CHECK, // The name of the task within a section, referred to in the template
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.ELIGIBILITY_CHECK].tagState) ? ELIGIBILITY_CHECK.uri : LANDOWNER.uri,
            status: status => status[SECTION_TASKS.ELIGIBILITY_CHECK].tagState,
            enabled: status => !eligibilityCompleted(status)
          }
        ]
      },
      {
        name: 'contact-details',
        tasks: [
          {
            name: SECTION_TASKS.LICENCE_HOLDER,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.LICENCE_HOLDER].tagState) ? contactURIs.APPLICANT.CHECK_ANSWERS.uri : contactURIs.APPLICANT.USER.uri,
            status: status => getState(status, SECTION_TASKS.LICENCE_HOLDER),
            enabled: status => eligibilityCompleted(status)
          },

          {
            name: SECTION_TASKS.ECOLOGIST,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.ECOLOGIST].tagState) ? contactURIs.ECOLOGIST.CHECK_ANSWERS.uri : contactURIs.ECOLOGIST.USER.uri,
            status: status => getState(status, SECTION_TASKS.ECOLOGIST),
            enabled: status => eligibilityCompleted(status)
          },

          {
            name: SECTION_TASKS.ADDITIONAL_CONTACTS,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.ADDITIONAL_CONTACTS].tagState)
              ? contactURIs.ADDITIONAL_APPLICANT.CHECK_ANSWERS.uri
              : contactURIs.ADDITIONAL_APPLICANT.ADD.uri,
            status: status => getStateDependsUpon(
              status,
              SECTION_TASKS.ADDITIONAL_CONTACTS,
              [
                SECTION_TASKS.LICENCE_HOLDER,
                SECTION_TASKS.ECOLOGIST
              ]
            ),
            enabled: status => {
              const currState = getStateDependsUpon(
                status,
                SECTION_TASKS.ADDITIONAL_CONTACTS,
                [
                  SECTION_TASKS.LICENCE_HOLDER,
                  SECTION_TASKS.ECOLOGIST
                ]
              )

              return currState !== tagStatus.CANNOT_START
            }
          },

          {
            name: SECTION_TASKS.INVOICE_PAYER,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.INVOICE_PAYER].tagState)
              ? contactURIs.INVOICE_PAYER.CHECK_ANSWERS.uri
              : contactURIs.INVOICE_PAYER.RESPONSIBLE.uri,
            status: status => getStateDependsUpon(
              status,
              SECTION_TASKS.INVOICE_PAYER,
              [
                SECTION_TASKS.LICENCE_HOLDER,
                SECTION_TASKS.ECOLOGIST
              ]
            ),
            enabled: status => {
              const currState = getStateDependsUpon(
                status,
                SECTION_TASKS.INVOICE_PAYER,
                [
                  SECTION_TASKS.LICENCE_HOLDER,
                  SECTION_TASKS.ECOLOGIST
                ]
              )

              return currState !== tagStatus.CANNOT_START
            }
          },

          {
            name: SECTION_TASKS.AUTHORISED_PEOPLE,
            uri: contactURIs.AUTHORISED_PEOPLE.ADD.uri,
            status: status => getState(status, SECTION_TASKS.AUTHORISED_PEOPLE),
            enabled: status => eligibilityCompleted(status)
          }
        ]
      },
      {
        name: 'planned-work-activity',
        tasks: [
          {
            name: SECTION_TASKS.WORK_ACTIVITY,
            uri: '/',
            status: () => tagStatus.CANNOT_START
          },
          {
            name: SECTION_TASKS.PERMISSIONS,
            uri: '/',
            status: () => tagStatus.CANNOT_START
          },
          {
            name: SECTION_TASKS.SITES,
            uri: siteURIs.NAME.uri,
            status: status => getState(status, SECTION_TASKS.SITES),
            enabled: status => eligibilityCompleted(status)
          },
          {
            name: SECTION_TASKS.SETTS,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.SETTS].tagState) ? habitatURIs.CHECK_YOUR_ANSWERS.uri : habitatURIs.START.uri,
            status: status => getState(status, SECTION_TASKS.SETTS),
            enabled: status => eligibilityCompleted(status)
          },
          {
            name: SECTION_TASKS.ECOLOGIST_EXPERIENCE,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.ECOLOGIST_EXPERIENCE].tagState)
              ? ecologistExperienceURIs.CHECK_YOUR_ANSWERS.uri
              : ecologistExperienceURIs.PREVIOUS_LICENCE.uri,
            status: status => getState(status, SECTION_TASKS.ECOLOGIST_EXPERIENCE),
            enabled: status => eligibilityCompleted(status)
          },
          {
            name: SECTION_TASKS.SUPPORTING_INFORMATION,
            uri: status => isCompleteOrConfirmed(status[SECTION_TASKS.SUPPORTING_INFORMATION].tagState)
              ? FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri
              : FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri,
            status: status => getState(status, SECTION_TASKS.SUPPORTING_INFORMATION),
            enabled: status => eligibilityCompleted(status)
          }
        ]
      },
      {
        name: 'apply',
        tasks: [
          {
            name: SECTION_TASKS.SUBMIT,
            uri: DECLARATION.uri,
            status: tagStatus.NOT_STARTED,
            enabled: status => eligibilityCompleted(status)
          }
        ]
      }
    ]
  }
}
