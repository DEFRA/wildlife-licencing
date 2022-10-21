
describe('The enter experience page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter methods uri on primary journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress'
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
      const { completion } = await import('../enter-experience.js')
      expect(await completion(request)).toBe('/enter-methods')
    })

    it('returns the check ecologist answers uri on return journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'complete'
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
      const { completion } = await import('../enter-experience.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('the set data function', () => {
    it('stores the experience details', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({})),
            putExperienceById: mockPut
          }
        }
      }))
      const request = {
        payload: {
          'enter-experience': 'experience'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }

      const { setData } = await import('../enter-experience.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { experienceDetails: 'experience' })
    })
  })

  describe('the get data function', () => {
    it('is included in the page route export', async () => {
      const h = {
        view: (view, pageData) => pageData
      }
      const request = {
        payload: {
          'enter-experience': 'experience'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          getPageData: () => {}
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ experienceDetails: 'hello people' }))
          }
        }
      }))
      const pageRoute = await import('../enter-experience.js')
      expect(await pageRoute.default[0].handler(request, h)).toEqual({
        data: 'hello people',
        backlink: {
          enabled: true,
          value: 'javascript: window.history.go(-1)'
        }
      })
    })
  })
})
