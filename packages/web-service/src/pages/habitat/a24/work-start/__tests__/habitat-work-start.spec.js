
describe('The habitat work start page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-work-start page', () => {
    it('the habitat-work-start page forwards onto habitat-work-end on primary journey', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'inProgress' }
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
      const { completion } = await import('../habitat-work-start.js')
      expect(await completion(request)).toBe('/habitat-work-end')
    })

    it('the habitat-work-start page forwards onto check-habitat-answers on return journey', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
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
      const { completion } = await import('../habitat-work-start.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('throws an error if a date can not be parsed', async () => {
      try {
        const payload = { 'habitat-work-start-day': '12---', 'habitat-work-start-month': '5----', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date cant be parsed from this string')
      }
    })

    it('if the user doesnt input a day - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '', 'habitat-work-start-month': '10', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user doesnt input a monnth - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('if the user doesnt input a year - it raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '10', 'habitat-work-start-year': '' }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no date has been sent')
      }
    })

    it('a day choice thats too high raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '32', 'habitat-work-start-month': '10', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a day choice thats 0 raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '0', 'habitat-work-start-month': '10', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a day choice thats negative raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '-1', 'habitat-work-start-month': '10', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats greater than 12 raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '13', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats 0 raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '0', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('a month choice thats negative raises an error', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '-1', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a day', async () => {
      try {
        const payload = { 'habitat-work-start-day': 'aa', 'habitat-work-start-month': '1', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a month', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': 'aaatrye', 'habitat-work-start-year': (new Date().getFullYear()) }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a string as a year', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '1', 'habitat-work-start-year': 'zz' }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })

    it('you cant pass a past date', async () => {
      try {
        const payload = { 'habitat-work-start-day': new Date().getDate() - 1, 'habitat-work-start-month': new Date().getMonth(), 'habitat-work-start-year': new Date().getFullYear() }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date has been chosen from the past')
      }
    })

    it('you cant pass a date outside of the license season', async () => {
      try {
        const payload = { 'habitat-work-start-day': 1, 'habitat-work-start-month': 12, 'habitat-work-start-year': new Date().getFullYear() + 1 }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: a date has been chosen outside the licence period')
      }
    })

    it('you can pass a date in future license seasons', async () => {
      try {
        const payload = { 'habitat-work-start-day': 30, 'habitat-work-start-month': 11, 'habitat-work-start-year': new Date().getFullYear() + 10 }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload)).toBe(payload)
      } catch (e) {
        expect(e.message).toBe(undefined)
        expect(e.details[0].message).toBe(undefined)
      }
    })

    it('constructs the date correctly', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'inProgress' }
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
              'habitat-work-start-day': 10,
              'habitat-work-start-month': 7,
              'habitat-work-start-year': new Date().getFullYear
            }
          })
        })
      }
      const { setData } = await import('../habitat-work-start.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { workStart: `7-10-${new Date().getFullYear}` }
      })
    })

    it('sets the work start data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
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
              'habitat-work-start-day': 10,
              'habitat-work-start-month': 7,
              'habitat-work-start-year': new Date().getFullYear
            }
          })
        })
      }

      jest.doMock('../../common/get-habitat-by-id.js', () => ({
        getHabitatById: () => {}
      }))

      jest.doMock('../../common/put-habitat-by-id.js', () => ({
        putHabitatById: () => {}
      }))

      const { setData } = await import('../habitat-work-start.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { workStart: `7-10-${new Date().getFullYear}` }
      })
    })
  })

  it('getData returns the correct object', async () => {
    const request = {
      cache: () => {
        return {
          getData: () => {
            return {
              habitatData: {
                workStart: '10-10-3022'
              }
            }
          }
        }
      }
    }

    const { getData } = await import('../habitat-work-start.js')
    expect(await getData(request)).toStrictEqual({ day: '10', month: '10', year: '3022' })
  })
})
