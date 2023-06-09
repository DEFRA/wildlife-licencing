jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the artificial sett details functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns artificialSettDetails from the database', async () => {
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
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              artificialSettDetails: 'evidence will be uploaded'
            }))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-details.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettDetails: 'evidence will be uploaded' })
    })

    it('returns artificialSettDetails as undefined if there is no returnId', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc'
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-details.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettDetails: undefined })
    })
  })

  describe('the setData function', () => {
    it('updates the artificialSettDetails flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'describe-artificial-sett': 'evidence found'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789'
            }
          }),
          setData: mockSetData
        })
      }

      const mockUpdateLicenceReturn = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: false
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../artificial-sett-details.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, artificialSettDetails: 'evidence found' })
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
