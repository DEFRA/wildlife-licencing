
describe('The licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter licence details page if user selects yes', async () => {
      const request = {
        payload: {
          licence: 'yes'
        }
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/enter-licence-details')
    })

    it('returns the experience details page if user selects no and details are required', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
            })
          }
        }
      }))
      const request = {
        payload: {
          licence: 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/enter-experience')
    })

    it('returns the methods page if user selects no and methods are required', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details'
            })
          }
        }
      }))
      const request = {
        payload: {
          licence: 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/enter-methods')
    })

    it('returns the mitigation page if user selects no and class mitigation is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details',
              methodExperience: 'method'
            })
          }
        }
      }))
      const request = {
        payload: {
          licence: 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/class-mitigation')
    })

    it('returns the check page if user selects no and class mitigation is set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: () => {}
            })
          },
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details',
              methodExperience: 'method',
              classMitigation: false
            })
          }
        }
      }))
      const request = {
        payload: {
          licence: 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('the get data function', () => {
    it('returns licence details and removed flag if they exists', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => (['A1234'])),
            getExperienceById: () => ({
              previousLicencesAllRemoved: false
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { getData } = await import('../licence.js')
      expect(await getData(request)).toStrictEqual({ allRemoved: false, previousLicences: ['A1234'] })
    })
  })
})
