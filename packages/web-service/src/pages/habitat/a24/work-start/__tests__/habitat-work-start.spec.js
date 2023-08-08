
describe('The habitat work start page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion', () => {
    it('the habitat-work-start page forwards onto habitat-work-end on primary journey', async () => {
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
      const { completion } = await import('../habitat-work-start.js')
      expect(await completion(request)).toBe('/habitat-work-end')
    })

    it('the habitat-work-start page forwards onto check-habitat-answers on return journey', async () => {
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
      const { completion } = await import('../habitat-work-start.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })
  })

  describe('validator', () => {
    it('you cant pass a date in the past', async () => {
      try {
        const payload = { 'habitat-work-start-day': '11', 'habitat-work-start-month': '11', 'habitat-work-start-year': '2022' }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error')
      }
    })

    it('you cant pass a date outside of the licence season', async () => {
      try {
        const payload = { 'habitat-work-start-day': '1', 'habitat-work-start-month': '12', 'habitat-work-start-year': (new Date().getFullYear() + 1).toString() }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBeNull()
      }
    })

    it('start date must be before end date', async () => {
      try {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  habitatData: { endDate: new Date('2022-07-10T00:00:00.000Z') }
                })
              }
            }
          }
        })
        const payload = { 'habitat-work-start-day': '07', 'habitat-work-start-month': '07', 'habitat-work-start-year': (new Date().getFullYear() + 1).toString() }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBeNull()
      }
    })

    it('start date and end date must not form a duration greater than the maximum allowed', async () => {
      try {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  habitatData: { endDate: new Date('2025-07-10T00:00:00.000Z') }
                })
              }
            }
          }
        })
        const payload = { 'habitat-work-start-day': '07', 'habitat-work-start-month': '07', 'habitat-work-start-year': (new Date().getFullYear() + 1).toString() }
        const { validator } = await import('../habitat-work-start.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        // expect(e.details[0].message).toBeNull()
      }
    })

    it('constructs the date correctly (stores an ISO 8601)', async () => {
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
        payload: {
          'habitat-work-start-day': '10',
          'habitat-work-start-month': '7',
          'habitat-work-start-year': '2015'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          })
        })
      }
      const { setData } = await import('../habitat-work-start.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { startDate: new Date('2015-07-10T00:00:00.000Z') }
      })
    })

    it('sets the work start data correctly on return journey', async () => {
      const mockSetData = jest.fn()
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
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        payload: {
          'habitat-work-start-day': '10',
          'habitat-work-start-month': '7',
          'habitat-work-start-year': '2015'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
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
          { startDate: new Date('2015-07-10T00:00:00.000Z') }
      })
    })
  })

  describe('getDate', () => {
    it('getData returns the start date', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            habitatData: {
              startDate: new Date('3022-10-11T00:00:00.000Z')
            }
          })
        })
      }

      const { getData } = await import('../habitat-work-start.js')
      expect(await getData(request)).toStrictEqual({ day: 11, month: 10, year: 3022 })
    })

    it('getData returns the null if no start date exists', async () => {
      const request = {
        cache: () => ({ getData: () => ({}) })
      }

      const { getData } = await import('../habitat-work-start.js')
      expect(await getData(request)).toBeNull()
    })
  })
})
