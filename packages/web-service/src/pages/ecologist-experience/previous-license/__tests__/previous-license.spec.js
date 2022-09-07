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
              'yes-no': 'yes'
            }
          })
        })
      }
      const { completion } = await import('../previous-license.js')
      expect(await completion(request)).toBe('/enter-license-details')
    })
    it('returns the check ecologist details uri on the return journey if user selects no', async () => {
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
              'yes-no': 'no'
            }
          })
        })
      }
      const { completion } = await import('../previous-license.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
    it('returns the enter experience uri on the primary journey if user selects no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
            }
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          })
        })
      }
      const { completion } = await import('../previous-license.js')
      expect(await completion(request)).toBe('/enter-experience')
    })
  })
  describe('the check data function', () => {
    it('performs a get request and redirects to check ecologist answers if a record is found on primary journey', async () => {
      const mockGet = jest.fn(() => ({
        previousLicense: true
      }))
      const mockRedirect = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: mockGet
          }
        }
      }))
      const h = {
        redirect: mockRedirect
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { checkData } = await import('../previous-license.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/check-ecologist-answers')
      expect(mockGet).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc')
    })
    it('performs a get request and returns undefined if no record is found', async () => {
      const mockGet = jest.fn()
      const mockRedirect = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: mockGet
          }
        }
      }))
      const h = {
        redirect: mockRedirect
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { checkData } = await import('../previous-license.js')
      expect(await checkData(request, h)).toBe(undefined)
      expect(mockRedirect).toHaveBeenCalledTimes(0)
      expect(mockGet).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc')
    })
    it('performs a get request and returns undefined on return journey', async () => {
      const mockGet = jest.fn(() => ({
        previousLicense: true
      }))
      const mockRedirect = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: mockGet
          }
        }
      }))
      const h = {
        redirect: mockRedirect
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              complete: true
            }
          })
        })
      }
      const { checkData } = await import('../previous-license.js')
      expect(await checkData(request, h)).toBe(undefined)
      expect(mockRedirect).toHaveBeenCalledTimes(0)
      expect(mockGet).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc')
    })
  })
  describe('the set data function', () => {
    it('sets ecologist experience data as an empty object and adds previous license data if it doesn\'t previously exist', async () => {
      const mockSet = jest.fn()
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
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'yes'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../previous-license.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledTimes(0)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          previousLicense: true
        }
      })
    })
    it('deletes the license details if the user selects no', async () => {
      const mockSet = jest.fn()
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
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              licenseDetails: ['AZ1234']
            }
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../previous-license.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledTimes(0)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          previousLicense: false
        }
      })
    })
    it('puts the data on the return journey if user selects no', async () => {
      const mockSet = jest.fn()
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
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              licenseDetails: ['AZ1234'],
              complete: true
            }
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../previous-license.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledTimes(1)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          previousLicense: false,
          complete: true
        }
      })
    })
  })
})
