
describe('The habitat work end page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-work-end page', () => {
    it('returns true if date is a number', async () => {
      const date = '11-07-2022'
      const notDate = 'badgers'
      const { isDate } = await import('../../../../utils/is-date.js')
      expect(isDate(date)).toBe(true)
      expect(isDate(notDate)).toBe(false)
    })

    it('the habitat-work-end page forwards onto habitat-activities if there are no errors', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return {}
            }
          }
        }
      }
      const { completion } = await import('../habitat-work-end.js')
      expect(await completion(request)).toBe('/habitat-activities')
    })

    it('the habitat-work-end page stays on the habitat-work-end page if there are errors', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return { error: 'there were problems with user input' }
            }
          }
        }
      }
      const { completion } = await import('../habitat-work-end.js')
      expect(await completion(request)).toBe('/habitat-work-end')
    })

    it('if the user doesnt input a day - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '', 'habitat-work-end-month': '10', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user doesnt input a monnth - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user doesnt input a year - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '10', 'habitat-work-end-year': '' }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('a day choice thats too high raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '32', 'habitat-work-end-month': '10', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a day choice thats 0 raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '0', 'habitat-work-end-month': '10', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('throws an error if a date can not be parsed', async () => {
      try {
        const payload = { 'habitat-work-end-day': '12---', 'habitat-work-end-month': '5----', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date cant be parsed from this string')
      }
    })

    it('a day choice thats negative raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '-1', 'habitat-work-end-month': '10', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats greater than 12 raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '13', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats 0 raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '0', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats negative raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '-1', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a day', async () => {
      try {
        const payload = { 'habitat-work-end-day': 'aa', 'habitat-work-end-month': '1', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a month', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': 'aaatrye', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a year', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '1', 'habitat-work-end-year': 'zz' }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a past date', async () => {
      try {
        const payload = { 'habitat-work-end-day': new Date().getDate() - 1, 'habitat-work-end-month': new Date().getMonth(), 'habitat-work-end-year': new Date().getFullYear() }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date has been chosen from the past')
      }
    })

    it('you cant pass a date outside of the license season', async () => {
      try {
        const payload = { 'habitat-work-end-day': 31, 'habitat-work-end-month': 11, 'habitat-work-end-year': new Date().getFullYear() }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date has been chosen outside the licence period')
      }
    })

    it('you cant pass an end date before the start date', async () => {
      const setPgData = jest.fn()
      const joiError = {
        error: {
          'habitat-work-end': 'endDateBeforeStart'
        },
        payload: undefined
      }

      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return {
                payload: {
                  'habitat-work-end-day': '10',
                  'habitat-work-end-month': '10',
                  'habitat-work-end-year': '3021'
                }
              }
            },
            getData: () => {
              return {
                habitatData: {
                  workStart: '10-10-3022'
                }
              }
            },
            setPageData: setPgData
          }
        }
      }

      const { setData } = await import('../habitat-work-end.js')
      await setData(request)
      expect(setPgData).toHaveBeenCalledWith(joiError)
    })

    it('constructs the date correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-work-end-day': 10,
              'habitat-work-end-month': 7,
              'habitat-work-end-year': new Date().getFullYear()
            }
          })
        })
      }
      const { setData } = await import('../habitat-work-end.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { workEnd: '7-10-2022' }
      })
    })
  })
})
