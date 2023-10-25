jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the why no artificial sett functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('getData with return id', async () => {
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
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              noArtificialSettReason: '123456',
              noArtificialSettReasonDetails: 'other reason in place'
            }))
          }
        }
      }))

      const { getData } = await import('../why-no-artificial-sett.js')
      const result = await getData(request)
      expect(result).toEqual({
        noArtificialSettReason: '123456',
        noArtificialSettReasonDetails: 'other reason in place',
        itWasNotRequired: 452120000,
        itCouldNotBeMade: 452120001
      })
    })

    it('getData with no return id', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {}
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findActiveLicencesByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          }
        }
      }))

      const { getData } = await import('../why-no-artificial-sett.js')
      const result = await getData(request)
      expect(result).toEqual({
        noArtificialSettReason: undefined,
        noArtificialSettReasonDetails: undefined,
        itWasNotRequired: 452120000,
        itCouldNotBeMade: 452120001
      })
    })
  })

  describe('the setData function', () => {
    it('updates the noArtificialSettReason and noArtificialSettReasonDetails flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'why-no-artificial-sett-check': '452120001',
          'why-sett-not-made': 'other reason'
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

      const { setData } = await import('../why-no-artificial-sett.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, noArtificialSettReason: 452120001, noArtificialSettReasonDetails: 'other reason' })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error if an option is not selected', async () => {
      try {
        const payload = { 'why-no-artificial-sett-check': '' }
        const { validator } = await import('../why-no-artificial-sett.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not selected an option')
      }
    })

    it('should throw an error if the condition input is empty', async () => {
      try {
        const payload = { 'why-no-artificial-sett-check': '452120001', 'why-sett-not-made': '' }
        const { validator } = await import('../why-no-artificial-sett.js')
        expect(await validator(payload))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"why-sett-not-made\" is not allowed to be empty")
      }
    })

    it('should not throws an error if an option is selected', async () => {
      const payload = { 'why-no-artificial-sett-check': '452120000' }
      const { validator } = await import('../why-no-artificial-sett.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
