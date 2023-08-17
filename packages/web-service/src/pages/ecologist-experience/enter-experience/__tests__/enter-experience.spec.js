
describe('The enter experience page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter methods page if required', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({

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

    it('returns the class mitigation page if class mitigation is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              methodExperience: 'method'
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
      expect(await completion(request)).toBe('/class-mitigation')
    })

    it('returns the check page if class mitigation is set, and sets the tag', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: mockSet
              }
            }
          },
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              methodExperience: 'method',
              classMitigation: true
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
      expect(mockSet).toHaveBeenCalledWith({ tag: 'ecologist-experience', tagState: 'complete-not-confirmed' })
    })
  })

  describe('the set data function', () => {
    it('stores the experience details', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
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
        info: { referrer: '' },
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
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {}
          },
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
