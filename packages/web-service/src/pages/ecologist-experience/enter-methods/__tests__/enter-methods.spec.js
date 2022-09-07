describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the class mitigation uri on primary journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {}
          })
        })
      }
      const { completion } = await import('../enter-methods.js')
      expect(await completion(request)).toBe('/class-mitigation')
    })
    it('returns the check ecologist answers uri on return journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              complete: true
            }
          })
        })
      }
      const { completion } = await import('../enter-methods.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })
  describe('the set data function', () => {
    it('calls put on the return journey', async () => {
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
          getPageData: () => ({
            payload: {
              'enter-methods': 'I have all the badger methods.'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              complete: true
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
      const { setData } = await import('../enter-methods.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          methodExperience: 'I have all the badger methods.',
          complete: true
        }
      })
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        complete: true,
        methodExperience: 'I have all the badger methods.'
      })
    })
    it('does not call put on the primary journey', async () => {
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
          getPageData: () => ({
            payload: {
              'enter-methods': 'I have all the badger methods.'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
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
      const { setData } = await import('../enter-methods.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          methodExperience: 'I have all the badger methods.'
        }
      })
      expect(mockPut).toHaveBeenCalledTimes(0)
    })
  })
})
