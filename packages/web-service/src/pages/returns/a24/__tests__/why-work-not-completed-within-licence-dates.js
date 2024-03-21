jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the why-not-completes-within-dates functions', () => {
  beforeEach(() => jest.resetModules())
  const mockSetData = jest.fn()

  describe('the getData function', () => {
    it('returns the whyNotCompletedWithinLicenceDates from the database', async () => {
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
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              whyNotCompletedWithinLicenceDates: '22/01/2023'
            }))
          }
        }
      }))

      const { getData } = await import('../why-work-not-completed-within-licence-dates.js')
      expect(await getData(request)).toEqual({
        whyNotCompletedWithinLicenceDates: '22/01/2023',
        endDate: '26 August 2022',
        startDate: '10 August 2022'
      })
    })

    it('returns the whyNotCompletedWithinLicenceDates as undefined', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72'
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567',
              endDate: '2022-08-26',
              startDate: '2022-08-10'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({}))
          }
        }
      }))

      const { getData } = await import('../why-work-not-completed-within-licence-dates.js')
      expect(await getData(request)).toEqual({
        whyNotCompletedWithinLicenceDates: undefined,
        endDate: '26 August 2022',
        startDate: '10 August 2022'
      })
    })
  })

  describe('the setData function', () => {
    it('updates the whyNotCompletedWithinLicenceDates flag', async () => {
      const request = {
        payload: {
          'work-not-completed': 'delay on the development'
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
              completedWithinLicenceDates: true,
              nilReturn: true
            })),
            getLicenceReturns: jest.fn(() => []),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../why-work-not-completed-within-licence-dates.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the completion function', () => {
    it('redirects to the another licence actions page', async () => {
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789',
              methodTypes: ['12345678', '987654321'],
              methodTypesLength: 2,
              methodTypesNavigated: 1
            }
          }),
          setData: mockSetData
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceActions: jest.fn(() => ([{
              methodIds: ['3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24']
            }]))
          }
        }
      }))
      const { completion } = await import('../why-work-not-completed-within-licence-dates.js')
      const result = await completion(request)
      expect(result).toEqual('/a24/damage-by-hand-or-mechanical-means')
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
