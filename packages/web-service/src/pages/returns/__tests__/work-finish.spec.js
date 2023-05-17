jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Work finish functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the validator function', () => {
    it('should throw an error if the end date is invalid', async () => {
      try {
        const payload = { 'work-finish-day': '122', 'work-finish-month': '', 'work-finish-year': '2999' }
        const { validator } = await import('../work-finish.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should throw an error if the end date is in future', async () => {
      try {
        const payload = { 'work-finish-day': '12', 'work-finish-month': '9', 'work-finish-year': '2999' }
        const { validator } = await import('../work-finish.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should not throw an error if the end date is valid and in the past', async () => {
      const { validator } = await import('../work-finish.js')
      const payload = { 'work-finish-day': '2', 'work-finish-month': '5', 'work-finish-year': '2020' }
      expect(await validator(payload)).toBeNull()
    })
  })

  describe('the getData function', () => {
    it('returns day, month and year of the end date', async () => {
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
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              endDate: '2022-08-10'
            }))
          }
        }
      }))

      const { getData } = await import('../work-finish.js')
      const result = await getData(request)
      expect(result).toEqual({ year: 2022, day: 10, month: 8 })
    })

    it('returns undefined when there is no end date of the licence return', async () => {
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
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              startDate: '2022-08-10'
            }))
          }
        }
      }))

      const { getData } = await import('../work-finish.js')
      const result = await getData(request)
      expect(result).toEqual({ year: undefined, day: undefined, month: undefined })
    })

    it('returns null when there is no returnId of the licence return', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {}
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          LICENCES: {
            findByApplicationId: jest.fn(() => ([{
              id: '2280-4ea5-ad72-AbdEF-4567'
            }]))
          },
          RETURNS: {
            getLicenceReturn: jest.fn(() => ({
              startDate: '2022-08-10'
            }))
          }
        }
      }))

      const { getData } = await import('../work-finish.js')
      const result = await getData(request)
      expect(result).toBeNull()
    })
  })

  describe('the setData function', () => {
    it('updates the end date of the licence return', async () => {
      const mockSetData = jest.fn()
      const request = {
        payload: {
          'work-finish-year': '2024',
          'work-finish-month': '9',
          'work-finish-day': '11'
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
              outcome: true,
              nilReturn: true
            })),
            updateLicenceReturn: mockUpdateLicenceReturn
          }
        }
      }))

      const { setData } = await import('../work-finish.js')
      await setData(request)
      expect(mockUpdateLicenceReturn).toHaveBeenCalledWith('ABC-567-GHU', '123456789', { nilReturn: true, outcome: true, endDate: new Date('2024-09-11T00:00:00.000Z') })
      expect(mockSetData).toHaveBeenCalled()
    })
  })
})
