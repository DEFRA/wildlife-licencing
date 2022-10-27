describe('applicant check answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('applicant check answers page', () => {
    it('sets the tag in getData', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../common/user/user.js', () => {
        return {
          getUserData: () => {
            return () => { return 'inner-func' }
          },
          setUserData: () => {
            return () => { return 'inner-func' }
          },
          userCompletion: () => {
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
                set: tagSet,
                get: () => {
                  return 'not-started'
                }
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
      const { getData } = await import('../ecologist-user.js')
      await getData(request)
      expect(tagSet).toHaveBeenCalledTimes(1)
    })
  })
})
