
describe('The habitat work end page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-work-end page', () => {
    it('the habitat-work-end page forwards onto habitat-activities if there are no errors', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        })
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({ applicationId: '123abc' }),
            getPageData: () => ({})
          }
        }
      }
      const { completion } = await import('../habitat-work-end.js')
      expect(await completion(request)).toBe('/habitat-activities')
    })

    it('the habitat-work-end page forwards onto check-habitat-answers if no errors on return journey', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({}),
          getPageData: () => ({})
        })
      }
      const { completion } = await import('../habitat-work-end.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('if the user does not input a day - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '', 'habitat-work-end-month': '10', 'habitat-work-end-year': (new Date().getFullYear()) }
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => `11-11-${new Date().getFullYear()}`
              }
            }
          }
        })
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user does not input a month - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': '', 'habitat-work-end-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user does not input a year - it raises an error', async () => {
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
        const payload = { 'habitat-work-end-day': '1', 'habitat-work-end-month': 'string', 'habitat-work-end-year': (new Date().getFullYear()) }
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
        const payload = { 'habitat-work-end-day': 1, 'habitat-work-end-month': 12, 'habitat-work-end-year': new Date().getFullYear() + 1 }
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date has been chosen outside the licence period')
      }
    })

    it('you cant pass an end date before the start date', async () => {
      try {
        const payload = { 'habitat-work-end-day': '10', 'habitat-work-end-month': '10', 'habitat-work-end-year': '3021' }
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  habitatData: { workStart: '10-10-3022' }
                })
              }
            }
          }
        })
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the user has entered an end date before the start date')
      }
    })

    it('constructs the date correctly', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        }
      }))
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
          { workEnd: `7-10-${new Date().getFullYear()}` }
      })
    })
    it('sets the work end data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-work-end-day': 10,
              'habitat-work-end-month': 7,
              'habitat-work-end-year': new Date().getFullYear
            }
          })
        })
      }

      jest.doMock('../../common/get-habitat-by-id.js', () => ({
        getHabitatById: () => {}
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))
      jest.doMock('../../common/put-habitat-by-id.js', () => ({
        putHabitatById: () => {}
      }))

      const { setData } = await import('../habitat-work-end.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { workEnd: `7-10-${new Date().getFullYear}` }
      })
    })
    it('validator returns nothing if no error is thrown', async () => {
      const payload = {
        'habitat-work-end-day': '1',
        'habitat-work-end-month': '9',
        'habitat-work-end-year': new Date().getFullYear() + 1
      }
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
        return {
          cacheDirect: () => {
            return {
              getData: () => ({
                habitatData: { workStart: `11-11-${new Date().getFullYear()}` }
              })
            }
          }
        }
      })
      jest.doMock('../../common/date-validator.js', () => ({
        validateDates: () => ({})
      }))
      const { validator } = await import('../habitat-work-end.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })

  it('getData returns the correct object', async () => {
    const request = {
      cache: () => {
        return {
          getData: () => {
            return {
              habitatData: {
                workEnd: '10-10-3022'
              }
            }
          }
        }
      }
    }

    const { getData } = await import('../habitat-work-end.js')
    expect(await getData(request)).toStrictEqual({ day: '10', month: '10', year: '3022' })
  })
})
