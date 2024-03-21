jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Licensed Actions functions', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('the getData function', () => {
    it('returns the nilReturn as true', async () => {
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
            getLicenceReturn: jest.fn(() => ({
              nilReturn: true
            })),
            getLicenceActions: jest.fn(() => ([{
              methodIds: ['12345678', '987654321']
            }]))
          }
        }
      }))

      const { getData } = await import('../did-you-carry-out-licensed-actions.js')
      const result = await getData(request)
      expect(result).toEqual({
        yesNo: 'no',
        methodTypes: [
          '12345678',
          '987654321'
        ],
        activityTypes: {
          DAMAGE_A_SETT: '3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24',
          DESTROY_A_SETT: '290461e0-58ed-ec11-bb3c-000d3a0cee24',
          DISTURB_A_SETT: 'a78bd9ec-58ed-ec11-bb3c-000d3a0cee24',
          OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: '315af0cf-58ed-ec11-bb3c-000d3a0cee24',
          OBSTRUCT_SETT_WITH_GATES: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
        }
      })
    })

    it('returns the nilReturn as undefined', async () => {
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

      const { getData } = await import('../did-you-carry-out-licensed-actions.js')
      const result = await getData(request)
      expect(result).toEqual({
        yesNo: undefined,
        methodTypes: [
          '12345678',
          '987654321',
          '543217890'
        ],
        activityTypes: {
          DAMAGE_A_SETT: '3e7ce9d7-58ed-ec11-bb3c-000d3a0cee24',
          DESTROY_A_SETT: '290461e0-58ed-ec11-bb3c-000d3a0cee24',
          DISTURB_A_SETT: 'a78bd9ec-58ed-ec11-bb3c-000d3a0cee24',
          OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: '315af0cf-58ed-ec11-bb3c-000d3a0cee24',
          OBSTRUCT_SETT_WITH_GATES: 'f8a385c9-58ed-ec11-bb3c-000d3a0cee24'
        }
      })
    })
  })

  describe('the setData function', () => {
    it('updates the nilReturn flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'no'
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
              whyNil: 'development issues',
              completedWithinLicenceDates: true,
              whyNotCompletedWithinLicenceDates: 'delay',
              nilReturn: true
            })),
            getLicenceReturns: jest.fn(() => []),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../did-you-carry-out-licensed-actions.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { whyNil: 'development issues', nilReturn: true, completedWithinLicenceDates: true, whyNotCompletedWithinLicenceDates: 'delay' })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('stores the nilReturn flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'DEF-7420-NGVR',
            licenceNumber: '26a3e94f-7420-NGVR'
          }),
          setData: mockSetData
        })
      }

      const mockCreateLicenceReturn = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          RETURNS: {
            getLicenceReturns: jest.fn(() => []),
            createLicenceReturn: mockCreateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../did-you-carry-out-licensed-actions.js')
      await setData(request)
      expect(mockCreateLicenceReturn).toHaveBeenCalledWith('DEF-7420-NGVR', { returnReferenceNumber: '26a3e94f-7420-NGVR-ROA1', nilReturn: true })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('calls resetReturnDataPayload when the value for nilReturn has changed', async () => {
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
              nilReturn: true
            })),
            getLicenceReturns: jest.fn(() => []),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      jest.doMock('../common-return-functions.js', () => ({
        resetReturnDataPayload: jest.fn()
      }))

      const { setData } = await import('../did-you-carry-out-licensed-actions.js')
      const { resetReturnDataPayload } = await import('../common-return-functions.js')
      await setData(request)
      expect(resetReturnDataPayload).toHaveBeenCalled()
    })
  })
})
