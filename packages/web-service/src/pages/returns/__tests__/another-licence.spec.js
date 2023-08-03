jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Another Licence functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns yesNo as true', async () => {
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
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              needAnotherLicence: true
            }))
          }
        }
      }))

      const { getData } = await import('../another-licence.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })

    it('returns yesNo as undefined', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {}
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: false
            }))
          }
        }
      }))

      const { getData } = await import('../another-licence.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: undefined })
    })
  })

  describe('the setData function', () => {
    it('updates the needAnotherLicence flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'yes'
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
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              nilReturn: false
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../another-licence.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, needAnotherLicence: true })
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
