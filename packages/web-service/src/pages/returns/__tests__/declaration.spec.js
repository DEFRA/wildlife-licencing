jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Declaration functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the completion function', () => {
    it('should queue the returns for submission', async () => {
      const mockQueueReturnForSubmission = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {
              id: '123456789'
            }
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            queueReturnForSubmission: mockQueueReturnForSubmission
          }
        }
      }))
      const { completion } = await import('../returns-declaration.js')
      const result = await completion(request)
      expect(mockQueueReturnForSubmission).toHaveBeenCalled()
      expect(result).toEqual('/returns-confirmation')
    })
  })
})
