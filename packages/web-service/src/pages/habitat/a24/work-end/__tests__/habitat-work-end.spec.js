const Joi = require('joi')
describe('The habitat work end page', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('checkData returns null if the startDate is set', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            habitatData: {
              startDate: new Date('3022-10-11T00:00:00.000Z')
            }
          })
        })
      }

      const { checkHasStart } = await import('../habitat-work-end.js')
      expect(await checkHasStart(request)).toBeNull()
    })

    it('checkData to redirect to the start date page if the startDate is not set', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            habitatData: {}
          })
        })
      }
      const h = { redirect: jest.fn() }
      const { checkHasStart } = await import('../habitat-work-end.js')
      await checkHasStart(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/habitat-work-start')
    })
  })

  describe('completed function', () => {
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
  })

  describe('the validator function', () => {
    it('if the user does not input a day - it raises an error', async () => {
      const payload = {
        'habitat-work-end-day': '',
        'habitat-work-end-month': '10',
        'habitat-work-end-year': (new Date().getFullYear())
      }
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

      let error
      try {
        await validator(payload)
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('ValidationError')
      expect(error.details[0].type).toBe('noDateSent')
    })

    it('if the user does not input a month - it raises an error', async () => {
      const payload = {
        'habitat-work-end-day': '1',
        'habitat-work-end-month': '',
        'habitat-work-end-year': (new Date().getFullYear())
      }
      const { validator } = await import('../habitat-work-end.js')

      let error
      try {
        await validator(payload)
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('ValidationError')
      expect(error.details[0].type).toBe('noDateSent')
    })

    it('you cant pass a date in the past', async () => {
      const payload = {
        'habitat-work-end-day': '11',
        'habitat-work-end-month': '11',
        'habitat-work-end-year': (new Date().getFullYear() - 1).toString()
      }
      const { validator } = await import('../habitat-work-end.js')

      let error
      try {
        await validator(payload)
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('ValidationError')
      expect(error.details[0].type).toBe('dateHasPassed')
    })

    it('you cant pass a date outside of the licence season', async () => {
      const payload = {
        'habitat-work-end-day': '1',
        'habitat-work-end-month': '12',
        'habitat-work-end-year': (new Date().getFullYear() + 1).toString()
      }
      const { validator } = await import('../habitat-work-end.js')

      let error
      try {
        await validator(payload)
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('ValidationError')
      expect(error.details[0].type).toBe('outsideLicence')
    })

    it('you cant pass an end date before the start date', async () => {
      try {
        const payload = {
          'habitat-work-end-day': '10',
          'habitat-work-end-month': '10',
          'habitat-work-end-year': '3021'
        }
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  habitatData: { startDate: new Date('3022-10-11T00:00:00.000Z') }
                })
              }
            }
          }
        })
        const { validator } = await import('../habitat-work-end.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].type).toBe('endDateBeforeStart')
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
          'habitat-work-end-day': '10',
          'habitat-work-end-month': '7',
          'habitat-work-end-year': '2015'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          })
        })
      }
      const { setData } = await import('../habitat-work-end.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { endDate: new Date('2015-07-10T00:00:00.000Z') }
      })
    })

    it('sets the work end data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        payload: {
          'habitat-work-end-day': '10',
          'habitat-work-end-month': '7',
          'habitat-work-end-year': '2015'
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
          { endDate: new Date('2015-07-10T00:00:00.000Z') }
      })
    })

    it('validator returns nothing if no error is thrown', async () => {
      const nw = new Date()
      nw.setFullYear(nw.getFullYear() + 1)
      const payload = {
        'habitat-work-end-day': '1',
        'habitat-work-end-month': '9',
        'habitat-work-end-year': nw.getFullYear().toString()
      }
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
        return {
          cacheDirect: () => {
            return {
              getData: () => ({
                habitatData: { startDate: new Date(nw.getFullYear().toString() + '-07-10T00:00:00.000Z') }
              })
            }
          }
        }
      })
      const { validator } = await import('../habitat-work-end.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })

  describe('the getData function', () => {
    it('getData returns the correct object', async () => {
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                habitatData: {
                  endDate: new Date('3022-10-11T00:00:00.000Z')
                }
              }
            }
          }
        }
      }

      const { getData } = await import('../habitat-work-end.js')
      expect(await getData(request)).toStrictEqual({ day: 11, month: 10, year: 3022 })
    })
  })
})
