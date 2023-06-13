jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the licence conditions functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('getData with return id', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: () => {
              return {
                id: '123456'
              }
            }
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              licenceConditions: true,
              licenceConditionsDetails: 'some conditions are not met'
            }))
          }
        }
      }))
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
      const { getData } = await import('../licence-conditions.js')
      expect(await getData(request)).toStrictEqual({
        licenceConditions: true,
        licenceConditionsDetails: 'some conditions are not met'
      })
    })

    it('getData with out return id', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: () => {
              return {
                id: '123456'
              }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {}
          })
        })
      }
      const { getData } = await import('../licence-conditions.js')
      expect(await getData(request)).toStrictEqual({
        licenceConditions: undefined,
        licenceConditionsDetails: undefined
      })
    })
  })

  describe('the setData function', () => {
    it('updates the licenceConditions flag', async () => {
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

      const { setData } = await import('../licence-conditions.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })

    it('updates the licenceConditions and licenceConditionsDetails flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'yes-no': 'no',
          'no-conditional-input': 'conditions not met'
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
              nilReturn: false,
              whyNil: '452120002',
              whyNilOther: 'development has not started'
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../licence-conditions.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error if an option is not selected', async () => {
      try {
        const payload = { 'yes-no': '' }
        const { validator } = await import('../licence-conditions.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not selected an option')
      }
    })

    it('should throw an error if the condition input is empty', async () => {
      try {
        const payload = { 'yes-no': 'no', 'no-conditional-input': '' }
        const { validator } = await import('../licence-conditions.js')
        expect(await validator(payload))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"no-conditional-input\" is not allowed to be empty")
      }
    })

    it('should not throws an error if an option is selected', async () => {
      const payload = { 'yes-no': '452120000' }
      const { validator } = await import('../licence-conditions.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
