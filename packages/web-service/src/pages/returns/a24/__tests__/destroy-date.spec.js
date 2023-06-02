jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the destroy date functions', () => {
  beforeEach(() => jest.resetModules())
  const mockSetData = jest.fn()

  describe('the getData function', () => {
    it('returns day, month and year of the sett destroyDate', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: '920d53c110fc',
            returns: {
              id: '123456789',
              destroyDate: '2022-08-10'
            }
          })
        })
      }

      const { getData } = await import('../destroy-date.js')
      const result = await getData(request)
      expect(result).toEqual({ year: 2022, day: 10, month: 8 })
    })

    it('returns undefined when there is no sett destroyDate of the licence return', async () => {
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

      const { getData } = await import('../destroy-date.js')
      const result = await getData(request)
      expect(result).toEqual({ year: undefined, day: undefined, month: undefined })
    })
  })

  describe('the validator function', () => {
    it('should throw an error if the date is in future', async () => {
      try {
        const payload = { 'destroy-date-day': '12', 'destroy-date-month': '9', 'destroy-date-year': '2999' }
        const { validator } = await import('../destroy-date.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should throw an error if the date is invalid', async () => {
      try {
        const payload = { 'destroy-date-day': '122', 'destroy-date-month': '', 'destroy-date-year': '2999' }
        const { validator } = await import('../destroy-date.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('should not throw an error if the date is valid and in the past', async () => {
      const { validator } = await import('../destroy-date.js')
      const payload = { 'destroy-date-day': '2', 'destroy-date-month': '5', 'destroy-date-year': '2020' }
      expect(await validator(payload)).toEqual({ 'destroy-date-day': '2', 'destroy-date-month': '5', 'destroy-date-year': '2020' })
    })
  })

  describe('the setData function', () => {
    it('updates the destroyDate flag', async () => {
      const request = {
        payload: {
          'destroy-date-year': '2023',
          'destroy-date-month': '9',
          'destroy-date-day': '11'
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

      const { setData } = await import('../destroy-date.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  describe('the completion function', () => {
    it('redirects to the another licence actions page', async () => {
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789',
              methodTypes: ['12345678', '987654321'],
              methodTypesLength: 2,
              methodTypesNavigated: 1
            }
          }),
          setData: mockSetData
        })
      }
      const { completion } = await import('../destroy-date.js')
      await completion(request)
      expect(mockSetData).toHaveBeenCalled()
    })

    it('redirects to the artificial sett page', async () => {
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            licenceId: 'ABC-567-GHU',
            returns: {
              id: '123456789',
              methodTypes: ['12345678', '987654321'],
              methodTypesLength: 2,
              methodTypesNavigated: 0
            }
          }),
          setData: mockSetData
        })
      }
      const { completion } = await import('../destroy-date.js')
      expect(await completion(request)).toEqual('/a24/artificial-sett')
    })
  })
})
