
describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter license details uri if user selects yes', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {}
          }),
          getPageData: () => ({
            payload: {
              license: 'yes'
            }
          })
        })
      }
      const { completion } = await import('../license.js')
      expect(await completion(request)).toBe('/enter-license-details')
    })
    it('returns the enter experience uri on primary journey if user selects no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {}
          }),
          getPageData: () => ({
            payload: {
              license: 'no'
            }
          })
        })
      }
      const { completion } = await import('../license.js')
      expect(await completion(request)).toBe('/enter-experience')
    })
    it('returns the check ecologist answers uri on return journey if user selects no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              complete: true
            }
          }),
          getPageData: () => ({
            payload: {
              license: 'no'
            }
          })
        })
      }
      const { completion } = await import('../license.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })
  describe('the get data function', () => {
    it('returns license details if they exists', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              licenseDetails: ['AZ1234', 'ZA4321']
            }
          })
        })
      }
      const { getData } = await import('../license.js')
      expect(await getData(request)).toStrictEqual(['AZ1234', 'ZA4321'])
    })
    it('returns undefined if license details don\'t exist', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
            }
          })
        })
      }
      const { getData } = await import('../license.js')
      expect(await getData(request)).toBe(undefined)
    })
  })
  describe('the set data function', () => {
    it('calls put on the return journey if user inputs no', async () => {
      const mockPut = jest.fn()
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              license: 'no'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              complete: true,
              licenseDetails: [],
              previousLicense: true
            }
          }),
          setData: mockSet
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const { setData } = await import('../license.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          complete: true,
          licenseDetails: [],
          previousLicense: false
        }
      })
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        complete: true,
        licenseDetails: [],
        previousLicense: false
      })
    })
    it('does not call put on the primary journey', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              license: 'no'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              licenseDetails: ['AZ1234'],
              previousLicense: true
            }
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const { setData } = await import('../license.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledTimes(0)
    })
    it('does not call put on the return journey if user selects yes', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              license: 'yes'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              complete: true
            }
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          }
        }
      }))
      const { setData } = await import('../license.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledTimes(0)
    })
  })
})
