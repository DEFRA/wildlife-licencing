
describe('The habitat active entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-active-entrances page', () => {
    it('the habitat-active-entrances page forwards onto habitat-grid-ref page if theres no errors', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'in-progress'
              }
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
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/habitat-grid-ref')
    })
    it('the habitat-active-entrances page forwards onto check-habitat-answers with no errors on return journey', async () => {
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
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('sets the active entrance data correctly on primary journey', async () => {
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
        query: {
          id: ''
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {
              numberOfEntrances: 50
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 0
            }
          })
        })
      }
      const { setData } = await import('../habitat-active-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
        { numberOfActiveEntrances: 0, active: false, numberOfEntrances: 50 }
      })
    })
    it('sets the active entrance data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => {
              return [
                {
                  id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
                  name: 'the edge of the big field',
                  applicationId: 'd44db455-3fee-48eb-9100-f2ca7d490b4f',
                  settType: 100000002,
                  willReopen: true,
                  numberOfEntrances: 54,
                  numberOfActiveEntrances: 23,
                  gridReference: 'NY574735',
                  workStart: '11-03-2222',
                  workEnd: '11-30-3001',
                  methodIds: [100000010, 100000011],
                  speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
                  activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24'
                }
              ]
            }
          },
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
            habitatData: {
              numberOfEntrances: 10
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 5
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

      const { setData } = await import('../habitat-active-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { numberOfActiveEntrances: 5, active: true, numberOfEntrances: 10 }
      })
    })
    it('returns an error if more active entrances than entrances', async () => {
      try {
        const payload = { 'habitat-active-entrances': 13 }
        const context = {
          context: {
            query: {
            }
          }
        }
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
          return {
            cacheDirect: () => {
              return {
                getData: () => ({
                  habitatData: { numberOfEntrances: 3 }
                })
              }
            }
          }
        })
        const { validator } = await import('../habitat-active-entrances.js')
        expect(await validator(payload, context))
      } catch (e) {
        // eslint-disable-next-line
        expect(e.details[0].message).toBe("\"habitat-active-entrances\" must be less than 3")
      }
    })

    it('should not return an error if there are less active entrances than entrances', async () => {
      const payload = { 'habitat-active-entrances': 3 }
      const context = {
        context: {
          query: {
          }
        }
      }
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => {
        return {
          cacheDirect: () => {
            return {
              getData: () => ({
                habitatData: { numberOfEntrances: 13 }
              })
            }
          }
        }
      })
      const { validator } = await import('../habitat-active-entrances.js')
      expect(await validator(payload, context)).toBeUndefined()
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { numberOfActiveEntrances: 22 } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../habitat-active-entrances.js')
      expect(await getData(request)).toStrictEqual({ numberOfActiveEntrances: result.habitatData.numberOfActiveEntrances })
    })
  })
})
