jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Complete within dates functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns yesNo as true, start and end date', async () => {
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
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              completedWithinLicenceDates: true,
              outcome: false
            }))
          }
        }
      }))

      const { getData } = await import('../complete-within-dates')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes', endDate: '26 August 2022', startDate: '10 August 2022' })
    })

    it('returns yesNo as undefined, start and end date', async () => {
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
              outcome: false
            }))
          }
        }
      }))

      const { getData } = await import('../complete-within-dates')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: undefined, endDate: '26 August 2022', startDate: '10 August 2022' })
    })
  })

  describe('the setData function', () => {
    it('updates the completedWithinLicenceDates flag', async () => {
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
              outcome: true,
              nilReturn: true
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../complete-within-dates')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: true, outcome: true, completedWithinLicenceDates: true })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the completion function', () => {
    it('redirects to the work start page if the answer is no', async () => {
      const { completion } = await import('../complete-within-dates')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/work-start')
    })

    it('redirects to the another licence actions page if the answer is yes', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: { 'yes-no': 'yes' },
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

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceActions: jest.fn(() => ([{
              methodIds: ['12345678', '987654321']
            },
            {
              methodIds: ['12345678', '987654321', '543217890']
            }]))
          }
        }
      }))
      const { completion } = await import('../complete-within-dates')
      await completion(request)
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
