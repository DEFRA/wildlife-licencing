
describe('The class mitigation page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter class mitigation uri if the user answers yes', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'yes-no': 'yes'
            }
          })
        })
      }
      const { completion } = await import('../class-mitigation.js')
      expect(await completion(request)).toBe('/enter-class-mitigation-details')
    })
    it('returns the check ecologist answers uri if the user answers no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          })
        })
      }
      const { completion } = await import('../class-mitigation.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })
  describe('set data function', () => {
    it('does not call the api if user answers yes', async () => {
      const mockSet = jest.fn()
      const mockPut = jest.fn()
      const mockPost = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            create: mockPost,
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'yes-no': 'yes'
            }
          }),
          getData: () => ({
            ecologistExperience: {}
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        ecologistExperience: {
          classMitigation: true
        }
      })
      expect(mockPut).toHaveBeenCalledTimes(0)
      expect(mockPost).toHaveBeenCalledTimes(0)
    })
    it('calls a post if the user answers no on the primary journey', async () => {
      const mockSet = jest.fn()
      const mockPut = jest.fn()
      const mockPost = jest.fn()
      const mockAdd = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            create: mockPost,
            putExperienceById: mockPut
          },
          APPLICATION: {
            tags: () => ({
              add: mockAdd,
              has: () => false
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {}
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          classMitigation: false
        }
      })
      expect(mockPut).toHaveBeenCalledTimes(0)
      expect(mockPost).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        classMitigation: false
      })
      expect(mockAdd).toHaveBeenCalledTimes(1)
    })
    it('calls put if the user answers no on the return journey and deletes mitigation details', async () => {
      const mockSet = jest.fn()
      const mockPut = jest.fn()
      const mockPost = jest.fn()
      const mockAdd = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              add: mockAdd,
              has: () => true
            })
          },
          ECOLOGIST_EXPERIENCE: {
            create: mockPost,
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              classMitigationDetails: 'ZA1234'
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          classMitigation: false
        }
      })
      expect(mockPost).toHaveBeenCalledTimes(0)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        classMitigation: false
      })
      expect(mockAdd).toHaveBeenCalledTimes(0)
    })
  })
})
