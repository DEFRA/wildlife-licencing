describe('The enter class mitigation details page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the check ecologist answers uri', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {}
      }))
      const { completion } = await import('../enter-class-mitigation-details.js')
      expect(await completion()).toBe('/check-ecologist-answers')
    })
  })
  describe('setData function', () => {
    it('calls a post on the primary journey', async () => {
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
              has: () => false,
              add: mockAdd
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-class-mitigation-details': 'ZA1234'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              classMitigation: false
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../enter-class-mitigation-details.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          classMitigation: false,
          classMitigationDetails: 'ZA1234'
        }
      })
      expect(mockPut).toHaveBeenCalledTimes(0)
      expect(mockPost).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        classMitigation: false,
        classMitigationDetails: 'ZA1234'
      })
      expect(mockAdd).toHaveBeenCalledTimes(1)
    })
    it('calls put on the return journey', async () => {
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
              has: () => true,
              add: () => mockAdd
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-class-mitigation-details': 'ZA1234'
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
      const { setData } = await import('../enter-class-mitigation-details.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          classMitigationDetails: 'ZA1234'
        }
      })
      expect(mockPost).toHaveBeenCalledTimes(0)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', {
        classMitigationDetails: 'ZA1234'
      })
      expect(mockAdd).toHaveBeenCalledTimes(0)
    })
  })
  describe('getData function', () => {
    it('returns the mitigation details', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            ecologistExperience: {
              classMitigationDetails: 'AZ1234'
            }
          })
        })
      }
      const { getData } = await import('../enter-class-mitigation-details.js')
      expect(await getData(request)).toBe('AZ1234')
    })
  })
})
