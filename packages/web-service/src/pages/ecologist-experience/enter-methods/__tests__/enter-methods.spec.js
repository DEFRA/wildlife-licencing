describe('The enter methods page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the class mitigation uri on primary journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'inProgress'
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
      const { completion } = await import('../enter-methods.js')
      expect(await completion(request)).toBe('/class-mitigation')
    })

    it('returns the check ecologist answers uri on return journey', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
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
      const { completion } = await import('../enter-methods.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('the set data function', () => {
    it('writes the method experience to the api', async () => {
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
          'enter-methods': 'experience'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }

      const { setData } = await import('../enter-methods.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { methodExperience: 'experience' })
    })
  })

  describe('the get data function', () => {
    it('is included in the page route export', async () => {
      const h = {
        view: (view, pageData) => pageData
      }
      const request = {
        payload: {
          'enter-methods': 'experience'
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
            getExperienceById: jest.fn(() => ({ methodExperience: 'hello world' }))
          }
        }
      }))
      const pageRoute = await import('../enter-methods.js')
      expect(await pageRoute.default[0].handler(request, h)).toEqual({
        backlink: {
          enabled: true,
          value: 'javascript: window.history.go(-1)'
        },
        data: 'hello world'
      })
    })
  })
})
