jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the damage by hand or mechanical means functions', () => {
  beforeEach(() => jest.resetModules())
  const mockSetData = jest.fn()

  describe('the getData function', () => {
    it('returns the damageByHandOrMechanicalMeans and details from the database to the frontend', async () => {
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
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              damageByHandOrMechanicalMeans: false,
              damageByHandOrMechanicalMeansDetails: 'delay'
            }))
          }
        }
      }))

      const { getData } = await import('../damage-by-hand-or-mechanical-means.js')
      expect(await getData(request)).toEqual({
        damageSett: false,
        damageSettDetails: 'delay'
      })
    })

    it('returns the damageByHandOrMechanicalMeans and details as undefined', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72'
          }),
          setData: mockSetData
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '123-AbEF-67'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({}))
          }
        }
      }))

      const { getData } = await import('../damage-by-hand-or-mechanical-means.js')
      expect(await getData(request)).toEqual({
        damageSett: undefined,
        damageSettDetails: undefined
      })
    })
  })

  describe('the setData function', () => {
    it('updates the damageByHandOrMechanicalMeans and details flag', async () => {
      const request = {
        payload: {
          'yes-no': 'no',
          'no-conditional-input': 'delay on the development'
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

      const { setData } = await import('../damage-by-hand-or-mechanical-means.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
