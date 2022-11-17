describe('the declaration-application handler function', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('returns null with un-submitted application', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      jest.doMock('../../common/count-complete-sections.js', () => ({
        countCompleteSections: () => { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
      }))
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                getAll: () => []
              }
            },
            getById: jest.fn(() => ({
              userSubmission: false
            }))
          }
        }
      }))
      const h = { redirect: () => {} }
      const { checkData } = await import('../declaration.js')
      const result = await checkData(request, h)
      expect(result).toBeNull()
    })

    it('returns a redirect to the applications page with a submitted application', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          }))
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              userSubmission: true
            }))
          }
        }
      }))
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../declaration.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('returns a redirect to the applications page with no selected application', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../declaration.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
  })

  describe('the setData function', () => {
    it('correctly calls the API and submits the journey data', async () => {
      const mockGetData = jest.fn(() => ({
        userId: 'afda812d-c4df-4182-9978-19e6641c4a6e',
        applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
      }))

      const request = {
        cache: () => ({
          getData: mockGetData
        })
      }
      const mockSubmit = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            submit: mockSubmit
          }
        }
      }))

      const { setData } = await import('../declaration.js')
      await setData(request)

      expect(mockGetData).toHaveBeenCalledTimes(1)
      expect(mockSubmit).toHaveBeenCalledWith('35a6c59e-0faf-438b-b4d5-6967d8d075cb')
    })
  })
})
