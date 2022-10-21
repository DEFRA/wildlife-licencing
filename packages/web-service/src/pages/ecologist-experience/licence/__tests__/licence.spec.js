
describe('The licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter licence details uri if user selects yes', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
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
          }),
          getPageData: () => ({
            payload: {
              licence: 'yes'
            }
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/enter-licence-details')
    })

    it('returns the enter experience uri on primary journey if user selects no', async () => {
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
          }),
          getPageData: () => ({
            payload: {
              licence: 'no'
            }
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/enter-experience')
    })

    it('returns the check ecologist answers uri on return journey if user selects no', async () => {
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
          }),
          getPageData: () => ({
            payload: {
              licence: 'no'
            }
          })
        })
      }
      const { completion } = await import('../licence.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('the get data function', () => {
    it('returns licence details if they exists', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => (['A1234']))
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
      const { getData } = await import('../licence.js')
      expect(await getData(request)).toStrictEqual(['A1234'])
    })
  })
})
