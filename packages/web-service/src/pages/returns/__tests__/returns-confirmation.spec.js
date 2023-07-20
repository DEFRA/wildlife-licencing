jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Confirmation functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the nilReturn flag and the return reference number', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72',
            returns: {
              returnReferenceNumber: '2022-500000-SPM-LIC-ROA8'
            }
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturns: jest.fn(() => ([{
              id: '123456',
              nilReturn: false,
              returnReferenceNumber: '2022-500000-SPM-LIC-ROA7'
            },
            {
              id: '12345678',
              nilReturn: true,
              returnReferenceNumber: '2022-500000-SPM-LIC-ROA8'
            }]))
          }
        }
      }))
      const { getData } = await import('../returns-confirmation.js')
      const result = await getData(request)
      expect(result).toEqual({
        nilReturn: true,
        returnReferenceNumber: '2022-500000-SPM-LIC-ROA8'
      })
    })
  })

  describe('the completion function', () => {
    it('should navigate to the applications page', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {
              id: '123456789'
            }
          }),
          setData: mockSetData
        })
      }
      const { completion } = await import('../returns-confirmation.js')
      const result = await completion(request)
      expect(mockSetData).toHaveBeenCalled()
      expect(result).toEqual('/applications')
    })
  })
})
