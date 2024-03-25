import path from 'path'
import { compileTemplate } from '../../../../initialise-snapshot-tests.js'

describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  const testData = [
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
  ]

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
      expect(result).toEqual(testData)
    })
  })

  describe('the declaration-application page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../check-ecologist-answers.njk'))

      const renderedHtml = template.render({
        data: testData
      })

      expect(renderedHtml).toMatchSnapshot()
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

  describe('checkData function', () => {
    it('calls the tag get function', async () => {
      const mockGet = jest.fn()
      mockGet.mockImplementation(() => { return 'complete' })

      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: mockGet
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
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request)
      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet).toHaveBeenCalledWith('ecologist-experience')
    })

    it('redirects to the start of the journey if the journey isnt complete or confirmed', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => { 'in-progress' }
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
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/previous-licence')
    })

    it('returns null if the journey is complete or confirmed', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'complete'
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
      const { checkData } = await import('../check-ecologist-answers.js')
      expect(await checkData(request)).toBeNull()
    })
  })
})
