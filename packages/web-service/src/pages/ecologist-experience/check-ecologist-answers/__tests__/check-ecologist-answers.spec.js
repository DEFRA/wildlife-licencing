describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('get data function', () => {
    it('gets the experience data from the database', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => ['D333']),
            getExperienceById: jest.fn(() => ({
              licenceDetails: [
                'D333'
              ],
              previousLicence: true,
              methodExperience: 'methods',
              experienceDetails: 'experience',
              classMitigation: true,
              classMitigationDetails: 'AX123'
            }))
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
      const { getData } = await import('../check-ecologist-answers.js')
      const result = await getData(request)
      expect(result).toEqual([
        {
          key: 'previousLicence',
          value: 'yes'
        },
        {
          key: 'licenceDetails',
          value: 'D333'
        },
        {
          key: 'experienceDetails',
          value: 'experience'
        },
        {
          key: 'methodExperience',
          value: 'methods'
        },
        {
          key: 'classMitigation',
          value: 'yes'
        },
        {
          key: 'classMitigationDetails',
          value: 'AX123'
        }
      ])
    })
    it('gets the experience data from the database - no previous, no class', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => []),
            getExperienceById: jest.fn(() => ({
              previousLicence: false,
              methodExperience: 'methods',
              experienceDetails: 'experience',
              classMitigation: false
            }))
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
      const { getData } = await import('../check-ecologist-answers.js')
      const result = await getData(request)
      expect(result).toEqual([
        {
          key: 'previousLicence',
          value: 'no'
        },
        {
          key: 'experienceDetails',
          value: 'experience'
        },
        {
          key: 'methodExperience',
          value: 'methods'
        },
        {
          key: 'classMitigation',
          value: 'no'
        }
      ])
    })
  })

  describe('completion function', () => {
    it('returns the tasklist uri', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return { applicationId: 'abe123' }
            }
          }
        }
      }
      const { completion } = await import('../check-ecologist-answers.js')
      expect(await completion(request)).toBe('/tasklist')
    })
  })
})
