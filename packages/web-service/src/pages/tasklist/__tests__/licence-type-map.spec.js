import {
  A24,
  licenceTypeMap,
  SECTION_TASKS,
  getProgress,
  decorateMap
} from '../licence-type-map.js'

describe('The licence type map', () => {
  beforeEach(() => jest.resetModules())

  it('the getTaskStatus function works as expected', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '8a3e8c32-0138-402c-8913-87e78ed44ebd' })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          getById: jest.fn(() => ({
            applicationTags: [{ tag: 'eligibility-check', tagState: 'in-progress' }]
          }))
        }
      }
    }))
    const { getTaskStatus } = await import('../licence-type-map.js')
    const taskStatus = await getTaskStatus(request)
    expect(taskStatus).toEqual(expect.objectContaining({ 'eligibility-check': { tag: 'eligibility-check', tagState: 'in-progress' } }))
  })

  it('the decorateMap function works as expected', async () => {
    const decoratedMap = await decorateMap(licenceTypeMap[A24], {
      'eligibility-check': { tagState: 'not-started' },
      setts: { tagState: 'not-started' },
      'ecologist-experience': { tagState: 'not-started' },
      'licence-holder': { tagState: 'not-started' },
      ecologist: { tagState: 'not-started' },
      'invoice-payer': { tagState: 'not-started' },
      'supporting-information': { tagState: 'not-started' }
    })
    const startCheck = decoratedMap.find(m => m.name === 'check-before-you-start')
    const eligibilityCheck = startCheck.tasks.find(t => t.name === SECTION_TASKS.ELIGIBILITY_CHECK)
    expect(eligibilityCheck).toEqual({
      enabled: true, name: 'eligibility-check', status: 'not-started', uri: '/landowner'
    })
  })

  it('the getProgress function works as expected', async () => {
    const progress = getProgress({ first: true, second: false })
    expect(progress).toEqual({ complete: 1, from: 2 })
  })

  describe('the applicant section', () => {
    const funcStatus = licenceTypeMap[A24].sections[1].tasks[0].status
    const funcUri = licenceTypeMap[A24].sections[1].tasks[0].uri

    it('status function will return completed if the applicant has completed the section task', async () => {
      const result = funcStatus(
        {
          'licence-holder': { tagState: 'complete' },
          'eligibility-check': { tagState: 'complete' }
        }
      )
      expect(result).toBe('complete')
    })

    it('status function will return not-started if the applicant has not completed the section task', async () => {
      const funcStatus = licenceTypeMap[A24].sections[1].tasks[0].status
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'licence-holder': { tagState: 'not-started' }
      })
      expect(result).toBe('not-started')
    })

    it('uri function will return the user-page if the applicant has not started the section task', async () => {
      const result = funcUri({
        'eligibility-check': { tagState: 'not-started' },
        'licence-holder': { tagState: 'not-started' }
      })
      expect(result).toBe('/applicant-user')
    })

    it('uri function will return the check-page if the applicant has not started the section task', async () => {
      const result = funcUri({ 'licence-holder': { tagState: 'complete' } })
      expect(result).toBe('/applicant-check-answers')
    })
  })

  describe('the ecologist section', () => {
    const funcStatus = licenceTypeMap[A24].sections[1].tasks[1].status
    const funcUri = licenceTypeMap[A24].sections[1].tasks[1].uri

    it('status function will return completed if the ecologist has completed the section task', async () => {
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        ecologist: { tagState: 'complete' }
      })
      expect(result).toBe('complete')
    })

    it('status function will return not-started if the ecologist has not completed the section task', async () => {
      const funcStatus = licenceTypeMap[A24].sections[1].tasks[1].status
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        ecologist: { tagState: 'not-started' }
      })
      expect(result).toBe('not-started')
    })

    it('uri function will return the user-page if the ecologist has not started the section task', async () => {
      const result = funcUri({
        'eligibility-check': { tagState: 'complete' },
        ecologist: { tagState: 'not-started' }
      })
      expect(result).toBe('/ecologist-user')
    })

    it('uri function will return the check-page if the ecologist has completed the section task', async () => {
      const result = funcUri({
        'eligibility-check': { tagState: 'complete' },
        ecologist: { tagState: 'complete' }
      })
      expect(result).toBe('/ecologist-check-answers')
    })
  })

  describe('the authorised-people section', () => {
    const funcStatus = licenceTypeMap[A24].sections[1].tasks[2].status

    it('status function will return completed if the authorised-people has completed the section task', async () => {
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'authorised-people': { tagState: 'complete' }
      })
      expect(result).toBe('complete')
    })

    it('status function will return not-started if the authorised-people has not completed the section task', async () => {
      const funcStatus = licenceTypeMap[A24].sections[1].tasks[2].status
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'authorised-people': { tagState: 'not-started' }
      })
      expect(result).toBe('not-started')
    })
  })

  describe('the sett section', () => {
    it('will return an object from the sett section tasks', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcEnabled = licenceTypeMap[A24].sections[2].tasks[3].enabled
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[3].status
      const funcUri = licenceTypeMap[A24].sections[2].tasks[3].uri
      expect(licenceTypeMap[A24].sections[2].tasks[3]).toEqual({ enabled: funcEnabled, status: funcStatus, name: 'setts', uri: funcUri })
    })

    it('will return complete if the user has completed the sett journey', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        }
      }))
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[3].status
      const result = funcStatus({
        'eligibility-check': { tagState: 'complete' },
        setts: { tagState: 'complete' }
      })
      expect(result).toEqual('complete')
    })
  })

  describe('the supporting information section', () => {
    it('should navigate the user to upload supporting information page when the status is not started', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcUri = licenceTypeMap[A24].sections[2].tasks[5].uri
      expect(funcUri({
        'eligibility-check': { tagState: 'complete' },
        'supporting-information': { tagState: 'not-started' }
      })).toEqual('/upload-supporting-information')
    })

    it('should navigate the user to check your supporting information page when the status is completed', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcUri = licenceTypeMap[A24].sections[2].tasks[5].uri
      expect(funcUri({
        'eligibility-check': { tagState: 'complete' },
        'supporting-information': { tagState: 'complete' }
      })).toEqual('/check-supporting-information')
    })

    it('should return an object from the supporting information section tasks', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcEnabled = licenceTypeMap[A24].sections[2].tasks[5].enabled
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[5].status
      const funcUri = licenceTypeMap[A24].sections[2].tasks[5].uri
      expect(licenceTypeMap[A24].sections[2].tasks[5]).toEqual({ enabled: funcEnabled, status: funcStatus, name: 'supporting-information', uri: funcUri })
    })

    it('should return completed if the user has completed the upload supporting information journey', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE: 'complete'
        }
      }))
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[5].status
      expect(funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'supporting-information': { tagState: 'complete' }
      })).toBe('complete')
    })

    it('should return cannot-start if the user has not completed the upload supporting information journey', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[5].status
      expect(funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'supporting-information': { tagState: 'cannot-start' }
      })).toBe('cannot-start')
    })
  })

  describe('the ecologist experience section', () => {
    it('should return completed if the user has completed the ecologist experience journey', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[4].status
      expect(funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'ecologist-experience': { tagState: 'cannot-start' }
      })).toBe('cannot-start')
    })

    it('should return cannot-start if the user has not completed the ecologist experience journey', async () => {
      const { licenceTypeMap } = await import('../licence-type-map.js')
      const { A24 } = await import('../licence-type-map.js')
      const funcStatus = licenceTypeMap[A24].sections[2].tasks[4].status
      expect(funcStatus({
        'eligibility-check': { tagState: 'complete' },
        'ecologist-experience': { tagState: 'complete' }
      })).toBe('complete')
    })
  })
})
