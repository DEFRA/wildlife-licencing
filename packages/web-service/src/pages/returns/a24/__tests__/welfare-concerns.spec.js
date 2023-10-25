jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the welfare concerns functions', () => {
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
              welfareConcerns: 'yes',
              welfareConcernsDetails: 'other reason in place'
            }))
          }
        }
      }))

      const { getData } = await import('../welfare-concerns.js')
      const result = await getData(request)
      expect(result).toEqual({
        yesNo: 'yes',
        yesNoDetails: 'other reason in place'
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

      const { getData } = await import('../welfare-concerns.js')
      const result = await getData(request)
      expect(result).toEqual({
        yesNo: '-',
        yesNoDetails: undefined
      })
    })
  })

  describe('the setData function', () => {
    it('updates the welfareConcerns and welfareConcernsDetails flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'yes',
          'yes-conditional-input': 'other reason'
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

      const { setData } = await import('../welfare-concerns.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })

    it('updates the welfareConcerns flag correctly only', async () => {
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

      const { setData } = await import('../welfare-concerns.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error if an option is not selected', async () => {
      try {
        const payload = { 'yes-no': '' }
        const { validator } = await import('../welfare-concerns.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not selected an option')
      }
    })

    it('should throw an error if the condition input is empty', async () => {
      try {
        const payload = { 'yes-no': 'yes', 'yes-conditional-input': '' }
        const { validator } = await import('../welfare-concerns.js')
        expect(await validator(payload))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"yes-conditional-input\" is not allowed to be empty")
      }
    })

    it('should not throws an error if an option is selected', async () => {
      const payload = { 'yes-no': 'no' }
      const { validator } = await import('../welfare-concerns.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
