jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Outcome functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the outcome as true', async () => {
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
              outcome: true
            }))
          }
        }
      }))

      const { getData } = await import('../outcome.js')
      const result = await getData(request)
      expect(result).toEqual({ outcome: true })
    })

    it('returns the outcome and outcomeReason as undefined', async () => {
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
            getLicenceReturn: jest.fn(() => ({}))
          }
        }
      }))

      const { getData } = await import('../outcome.js')
      const result = await getData(request)
      expect(result).toEqual({ outcome: undefined, outcomeReason: undefined })
    })

    it('returns outcomeReason', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f',
            licenceId: '2280-4ea5-ad72',
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
              outcome: false,
              outcomeReason: 'delay on development'
            }))
          }
        }
      }))

      const { getData } = await import('../outcome.js')
      expect(await getData(request)).toEqual({ outcome: false, outcomeReason: 'delay on development' })
    })
  })

  describe('the setData function', () => {
    it('updates the outcome flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'outcome-check': 'yes'
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
              completedWithinLicenceDates: true,
              nilReturn: true
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../outcome.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: true, completedWithinLicenceDates: true, outcome: true })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('updates the outcome flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'outcome-check': 'no'
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
              completedWithinLicenceDates: true,
              nilReturn: true
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../outcome.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: true, completedWithinLicenceDates: true, outcome: false })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error if an option is not selected', async () => {
      try {
        const payload = { 'outcome-check': '' }
        const { validator } = await import('../outcome.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not selected an option')
      }
    })

    it('should throw an error if the condition input is empty', async () => {
      try {
        const payload = { 'outcome-check': 'no', 'no-outcome': '' }
        const { validator } = await import('../outcome.js')
        expect(await validator(payload))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"no-outcome\" is not allowed to be empty")
      }
    })

    it('should not throws an error if an option is selected', async () => {
      const payload = { 'outcome-check': 'yes' }
      const { validator } = await import('../outcome.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
