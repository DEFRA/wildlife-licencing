jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the one way gates functions', () => {
  beforeEach(() => jest.resetModules())
  const mockSetData = jest.fn()

  describe('the getData function', () => {
    it('returns the obstructionByOneWayGates and details from the database', async () => {
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
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              obstructionByOneWayGates: true,
              obstructionByOneWayGatesDetails: 'development issues'
            }))
          }
        }
      }))

      const { getData } = await import('../one-way-gates.js')
      expect(await getData(request)).toEqual({
        oneWayGatesYesOrNo: true,
        oneWayGatesDetails: 'development issues'
      })
    })

    it('returns the obstructionByOneWayGates and details as undefined', async () => {
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
            findByApplicationId: jest.fn(() => ([{
              id: '123-AbEF-67'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({}))
          }
        }
      }))

      const { getData } = await import('../one-way-gates.js')
      expect(await getData(request)).toEqual({
        oneWayGatesYesOrNo: undefined,
        oneWayGatesDetails: undefined
      })
    })
  })

  describe('the setData function', () => {
    it('updates the obstructionByOneWayGates and details flag', async () => {
      const request = {
        payload: {
          'yes-no': 'yes',
          'yes-conditional-input': 'delay on the development'
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

      const { setData } = await import('../one-way-gates.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
