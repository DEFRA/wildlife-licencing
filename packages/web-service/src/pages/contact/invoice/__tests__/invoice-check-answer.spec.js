describe('applicant check answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('applicant check answers page', () => {
    it('sets the tag in getData', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../common/check-answers/check-answers.js', () => {
        return {
          getCheckAnswersData: () => {
            return () => { return 'inner-func' }
          }
        }
      })
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'abe123'
              }
            }
          }
        }
      }
      const { getData } = await import('../invoice-check-answers.js')
      await getData(request)
      expect(tagSet).toHaveBeenCalledTimes(1)
    })

    it('sets the tag in completion', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'abe123'
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-check-answers.js')
      await completion(request)
      expect(tagSet).toHaveBeenCalledTimes(1)
    })

    it('returns TASKLIST.uri', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'abe123'
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-check-answers.js')
      expect(await completion(request)).toBe('/tasklist')
      expect(tagSet).toHaveBeenCalledTimes(1)
    })
  })
})
