jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Why nil functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('getData', async () => {
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
              whyNil: 452120000,
              whyNilOther: 'the sett was not in active'
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
      const { getData } = await import('../why-nil.js')
      expect(await getData(request)).toStrictEqual({
        whyNil: 452120000,
        whyNilOther: 'the sett was not in active',
        THE_DEVELOPMENT_WORK_DID_NOT_HAPPEN: 452120000,
        THE_SETT_WAS_NOT_IN_ACTIVE_USE_BY_BADGERS: 452120001,
        OTHER: 452120002
      })
    })
  })

  describe('the setData function', () => {
    it('updates the why-nil flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'why-nil': '452120000',
          'other-reason': '452120000'
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

      const { setData } = await import('../why-nil.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, whyNil: '452120000' })
      expect(mockSetData).toHaveBeenCalled()
    })

    it('updates the why-nil and whyNilOther flag', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'why-nil': '452120002',
          'other-reason': 'development has not started'
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

      const { setData } = await import('../why-nil.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: false, whyNil: '452120002', whyNilOther: 'development has not started' })
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error if an option is not selected', async () => {
      try {
        const payload = { 'why-nil': '' }
        const { validator } = await import('../why-nil.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not selected an option')
      }
    })

    it('should throw an error if the condition input is empty', async () => {
      try {
        const payload = { 'why-nil': 'no', 'other-reason': '' }
        const { validator } = await import('../why-nil.js')
        expect(await validator(payload))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"other-reason\" is not allowed to be empty")
      }
    })

    it('should not throws an error if an option is selected', async () => {
      const payload = { 'why-nil': '452120000' }
      const { validator } = await import('../why-nil.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
