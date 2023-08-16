jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the artificial sett grid reference functions', () => {
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
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              artificialSettFoundGridReference: 'RN123456'
            }))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-grid-reference.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettFoundGridReference: 'RN123456' })
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
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          }
        }
      }))

      const { getData } = await import('../artificial-sett-grid-reference.js')
      const result = await getData(request)
      expect(result).toEqual({ artificialSettFoundGridReference: undefined })
    })
  })

  describe('the setData function', () => {
    it('updates the artificialSettFoundGridReference flag correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'artificial-sett-grid-reference': 'NY395557'
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

      const { setData } = await import('../artificial-sett-grid-reference.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalled()
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the validator function', () => {
    it('should throw an error when the user does not enter an artificial Sett grid reference', async () => {
      try {
        const payload = { 'artificial-sett-grid-reference': '' }
        const { validator } = await import('../artificial-sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not entered a grid reference')
      }
    })

    it('should throw an error when the artificial Sett grid reference is wrong', async () => {
      try {
        const payload = { 'artificial-sett-grid-reference': 'N123456' }
        const { validator } = await import('../artificial-sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: The grid reference you have entered is not in the right format')
      }
    })

    it('should throw an when the user enters the artificial Sett grid reference does not exist', async () => {
      try {
        const payload = { 'artificial-sett-grid-reference': 'hh123456' }
        const { validator } = await import('../artificial-sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: The reference you have entered is not an existing grid reference')
      }
    })

    it('should not throw an error for a correct grid reference of the  artificial Sett', async () => {
      const payload = { 'artificial-sett-grid-reference': 'NY395557' }
      const { validator } = await import('../artificial-sett-grid-reference.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
