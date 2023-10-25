jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Why not Completes within dates functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns whyNotCompletedWithinLicenceDates, start and end date', async () => {
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
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              whyNotCompletedWithinLicenceDates: 'delay',
              outcome: false
            }))
          }
        }
      }))

      const { getData } = await import('../a24/why-not-completes-within-dates.js')
      const result = await getData(request)
      expect(result).toEqual({ whyNotCompletedWithinLicenceDates: 'delay', endDate: '26 August 2022', startDate: '10 August 2022' })
    })

    it('returns whyNotCompletedWithinLicenceDates as undefined, start and end date', async () => {
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
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              outcome: false
            }))
          }
        }
      }))

      const { getData } = await import('../a24/why-not-completes-within-dates.js')
      const result = await getData(request)
      expect(result).toEqual({ whyNotCompletedWithinLicenceDates: undefined, endDate: '26 August 2022', startDate: '10 August 2022' })
    })
  })

  describe('the setData function', () => {
    it('updates the whyNotCompletedWithinLicenceDates flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'work-not-completed': 'development delay'
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
              outcome: true,
              nilReturn: true
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../a24/why-not-completes-within-dates.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: true, outcome: true, whyNotCompletedWithinLicenceDates: 'development delay' })
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
