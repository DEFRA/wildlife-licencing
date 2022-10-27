describe('The enter class mitigation details page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the check ecologist answers uri', async () => {
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
      const { completion } = await import('../enter-class-mitigation-details.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('getData function', () => {
    it('returns the class-mitigation details', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ classMitigationDetails: 'CL-MIT' }))
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
        })
      }
      const { getData } = await import('../enter-class-mitigation-details.js')
      expect(await getData(request)).toBe('CL-MIT')
    })
  })

  describe('setData function', () => {
    it('writes class-mitigation details to the api', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ })),
            putExperienceById: mockPut
          },
          APPLICATION: {
            tags: () => ({
              set: () => jest.fn()
            })
          }
        }
      }))
      const request = {
        payload: {
          'enter-class-mitigation-details': 'CL-MIT'
        },
        cache: () => ({
          getData: () => ({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
        })
      }
      const { setData } = await import('../enter-class-mitigation-details.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { classMitigationDetails: 'CL-MIT' })
    })
  })
})
