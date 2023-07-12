jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Confirmation functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the nilReturn flag and the return reference number', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72'
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: () => {
              return {
                id: '123456'
              }
            }
          },
          RETURNS: {
            getLicenceReturns: jest.fn(() => ([{
              id: '123456',
              nilReturn: false,
              returnReferenceNumber: '2022-500000-SPM-LIC-ROA7'
            },
            {
              id: '12345678',
              nilReturn: true,
              returnReferenceNumber: '2023-500000-SPM-LIC-ROA8'
            }])),
            getLicenceReturn: jest.fn(() => ({
              nilReturn: true,
              returnReferenceNumber: '2023-500000-SPM-LIC-ROA8'
            }))
          }
        }
      }))
      const { getData } = await import('../returns-confirmation.js')
      const result = await getData(request)
      expect(result).toEqual({
        nilReturn: true,
        returnReferenceNumber: '2023-500000-SPM-LIC-ROA8'
      })
    })
  })
})
