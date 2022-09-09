
describe('The enter experience page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter methods uri on primary journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              has: () => false
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {}
          })
        })
      }
      const { completion } = await import('../enter-experience.js')
      expect(await completion(request)).toBe('/enter-methods')
    })
    it('returns the check ecologist answers uri on return journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          }
        }
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
      const { completion } = await import('../enter-experience.js')
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
          },
          APPLICATION: {
            tags: () => ({
              has: () => true
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-experience': 'I have lots of badger experience.'
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
      const { setData } = await import('../enter-experience.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          experienceDetails: 'I have lots of badger experience.',
          complete: true
        }
      })
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        complete: true,
        experienceDetails: 'I have lots of badger experience.'
      })
    })
    it('does not call put on the primary journey', async () => {
      const mockSet = jest.fn()
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut
          },
          APPLICATION: {
            tags: () => ({
              has: () => false
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-experience': 'I have lots of badger experience.'
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
      const { setData } = await import('../enter-experience.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          experienceDetails: 'I have lots of badger experience.'
        }
      })
      expect(mockPut).toHaveBeenCalledTimes(0)
    })
  })
  describe('getData function', () => {
    it('returns the experience details', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              experienceDetails: 'I have all the experience'
            }
          })
        })
      }
      const { getData } = await import('../enter-experience.js')
      expect(await getData(request)).toBe('I have all the experience')
    })
  })
})
