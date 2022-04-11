import {
  licenceTypeMap,
  ELIGIBILITY_CHECK,
  LICENCE_HOLDER,
  ECOLOGIST,
  WORK_ACTIVITY,
  PERMISSIONS, SITES, SETTS, SEND_APPLICATION
} from '../licence-type-map.js'

describe('The licence type map', () => {
  describe('for the A24 Badger licence', () => {
    const a24 = licenceTypeMap['A24 Badger']
    it('the eligibility check', () => {
      const startCheck = a24.sections.find(m => m.name === 'check-before-you-start')
      const eligibilityCheck = startCheck.tasks.find(t => t.name === ELIGIBILITY_CHECK)
      expect(eligibilityCheck.enabled(false)).toBeTruthy()
      expect(eligibilityCheck.enabled(true)).toBeFalsy()
    })
    it('the licence holder', () => {
      const contactDetails = a24.sections.find(m => m.name === 'contact-details')
      const licenceHolder = contactDetails.tasks.find(t => t.name === LICENCE_HOLDER)
      expect(licenceHolder.enabled(true, [ELIGIBILITY_CHECK])).toBeTruthy()
      expect(licenceHolder.enabled(true, [])).toBeFalsy()
    })
    it('the ecologist', () => {
      const contactDetails = a24.sections.find(m => m.name === 'contact-details')
      const ecologist = contactDetails.tasks.find(t => t.name === ECOLOGIST)
      expect(ecologist.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER])).toBeTruthy()
      expect(ecologist.enabled(true, [ELIGIBILITY_CHECK])).toBeFalsy()
    })
    it('work activity', () => {
      const plannedWorkActivity = a24.sections.find(m => m.name === 'planned-work-activity')
      const workActivity = plannedWorkActivity.tasks.find(t => t.name === WORK_ACTIVITY)
      expect(workActivity.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST])).toBeTruthy()
      expect(workActivity.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER])).toBeFalsy()
    })
    it('permissions-details', () => {
      const plannedWorkActivity = a24.sections.find(m => m.name === 'planned-work-activity')
      const permissionsDetails = plannedWorkActivity.tasks.find(t => t.name === PERMISSIONS)
      expect(permissionsDetails.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY])).toBeTruthy()
      expect(permissionsDetails.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST])).toBeFalsy()
    })
    it('sites', () => {
      const plannedWorkActivity = a24.sections.find(m => m.name === 'planned-work-activity')
      const sites = plannedWorkActivity.tasks.find(t => t.name === SITES)
      expect(sites.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS])).toBeTruthy()
      expect(sites.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY])).toBeFalsy()
    })
    it('setts', () => {
      const plannedWorkActivity = a24.sections.find(m => m.name === 'planned-work-activity')
      const setts = plannedWorkActivity.tasks.find(t => t.name === SETTS)
      expect(setts.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS, SITES])).toBeTruthy()
      expect(setts.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS])).toBeFalsy()
    })
    it('apply', () => {
      const apply = a24.sections.find(m => m.name === 'apply')
      const sendApplication = apply.tasks.find(t => t.name === SEND_APPLICATION)
      expect(sendApplication.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS, SITES, SETTS])).toBeTruthy()
      expect(sendApplication.enabled(true, [ELIGIBILITY_CHECK, LICENCE_HOLDER, ECOLOGIST, WORK_ACTIVITY, PERMISSIONS, SITES])).toBeFalsy()
    })
  })
})
