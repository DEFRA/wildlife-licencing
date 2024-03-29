describe('The habitat entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-entrances page', () => {
    it('the habitat-entrances page forwards onto habitat-active-entrances page on primary journey', async () => {
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
            getData: () => ({ applicationId: '123abc' })
          }
        }
      }
      const { completion } = await import('../habitat-entrances.js')
      expect(await completion(request)).toBe('/habitat-active-entrances')
    })

    it('the habitat-entrances page forwards onto check-habitat-answers with no errors on return journey', async () => {
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
      const { completion } = await import('../habitat-entrances.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('sets the entrance data correctly on primary journey', async () => {
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
              'habitat-entrances': 99
            }
          })
        })
      }
      const { setData } = await import('../habitat-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { numberOfEntrances: 99 }
      })
    })

    it('sets the active entrance data correctly on return journey', async () => {
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
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-entrances': 5
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

      const { setData } = await import('../habitat-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { numberOfEntrances: 5 }
      })
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { numberOfEntrances: 22 } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../habitat-entrances.js')
      expect(await getData(request)).toStrictEqual({ numberOfEntrances: result.habitatData.numberOfEntrances })
    })

    describe('the validator function will throw an eror for ...', () => {
      it('a string input', async () => {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
          cacheDirect: () => ({
            getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
          })
        }))
        jest.doMock('../../../../../services/api-requests.js', () => ({
          APIRequests: ({
            HABITAT: {
              getHabitatsById: () => {
                return [
                  {
                    id: 'abc-123'
                  }
                ]
              }
            }
          })
        }))
        const payload = {
          'habitat-entrances': 'ab'
        }
        const context = {
          context: {
            query: {
              id: 'abc-123'
            }
          }
        }
        const { validator } = await import('../habitat-entrances.js')
        try {
          await validator(payload, context)
        } catch (e) {
          // eslint-disable-next-line
          expect(e.details[0].message).toBe('"habitat-entrances\" must be a number')
        }
      })
      it('a decimal input', async () => {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
          cacheDirect: () => ({
            getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
          })
        }))
        jest.doMock('../../../../../services/api-requests.js', () => ({
          APIRequests: ({
            HABITAT: {
              getHabitatsById: () => {
                return [
                  {
                    id: 'abc-123'
                  }
                ]
              }
            }
          })
        }))
        const payload = {
          'habitat-entrances': '1.4'
        }
        const context = {
          context: {
            query: {
              id: 'abc-123'
            }
          }
        }
        const { validator } = await import('../habitat-entrances.js')
        try {
          await validator(payload, context)
        } catch (e) {
          // eslint-disable-next-line
          expect(e.details[0].message).toBe('\"habitat-entrances\" must be an integer')
        }
      })
      it('an input greater than 100', async () => {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
          cacheDirect: () => ({
            getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
          })
        }))
        jest.doMock('../../../../../services/api-requests.js', () => ({
          APIRequests: ({
            HABITAT: {
              getHabitatsById: () => {
                return [
                  {
                    id: 'abc-123'
                  }
                ]
              }
            }
          })
        }))
        const payload = {
          'habitat-entrances': '101'
        }
        const context = {
          context: {
            query: {
              id: 'abc-123'
            }
          }
        }
        const { validator } = await import('../habitat-entrances.js')
        try {
          await validator(payload, context)
        } catch (e) {
          // eslint-disable-next-line
          expect(e.details[0].message).toBe('"habitat-entrances\" must be less than or equal to 100')
        }
      })
      it('a zero input', async () => {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
          cacheDirect: () => ({
            getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
          })
        }))
        jest.doMock('../../../../../services/api-requests.js', () => ({
          APIRequests: ({
            HABITAT: {
              getHabitatsById: () => {
                return [
                  {
                    id: 'abc-123'
                  }
                ]
              }
            }
          })
        }))
        const payload = {
          'habitat-entrances': '0'
        }
        const context = {
          context: {
            query: {
              id: 'abc-123'
            }
          }
        }
        const { validator } = await import('../habitat-entrances.js')
        try {
          await validator(payload, context)
        } catch (e) {
          // eslint-disable-next-line
          expect(e.details[0].message).toBe("\"habitat-entrances\" must be greater than or equal to 1")
        }
      })
      it('an input where the total entrances is less than the amount of active entrances', async () => {
        jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
          cacheDirect: () => ({
            getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
          })
        }))
        jest.doMock('../../../../../services/api-requests.js', () => ({
          APIRequests: ({
            HABITAT: {
              getHabitatsById: () => {
                return [
                  {
                    id: 'abc-123',
                    numberOfActiveEntrances: 90
                  }
                ]
              }
            }
          })
        }))
        const payload = {
          'habitat-entrances': '10'
        }
        const context = {
          context: {
            query: {
              id: 'abc-123'
            }
          }
        }
        const { validator } = await import('../habitat-entrances.js')
        try {
          await validator(payload, context)
        } catch (e) {
          // eslint-disable-next-line
          expect(e.details[0].message).toBe('"habitat-entrances\" must be greater than 89')
        }
      })
    })

    it('the validator will return undefined, if no errors are thrown', async () => {
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
        cacheDirect: () => ({
          getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
        })
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: ({
          HABITAT: {
            getHabitatsById: () => {
              return [
                {
                  id: 'abcdefg-123'
                }
              ]
            }
          }
        })
      }))
      const payload = {
        'habitat-entrances': '10'
      }
      const context = {
        context: {
          query: {
            id: 'abc-123'
          }
        }
      }
      const { validator } = await import('../habitat-entrances.js')
      expect(await validator(payload, context)).toBe(undefined)
    })

    it('the validator function can retrieve the number of entrances from the api', async () => {
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
        cacheDirect: () => ({
          getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
        })
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: ({
          HABITAT: {
            getHabitatsById: () => {
              return [
                {
                  id: 'abc-123',
                  numberOfEntrances: 11
                }
              ]
            }
          }
        })
      }))
      const payload = {
        'habitat-entrances': 22
      }
      const context = {
        context: {
          query: {
            id: 'abc-123'
          }
        }
      }
      const { validator } = await import('../habitat-entrances.js')
      expect(await validator(payload, context)).toBe(undefined)
    })

    it('if the user is going through the flow for the first time, it tests validates against 0', async () => {
      jest.doMock('../../../../../session-cache/cache-decorator.js', () => ({
        cacheDirect: () => ({
          getData: () => ({ userId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94' })
        })
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: ({
          HABITAT: {
            getHabitatsById: () => {
              return [
                {
                  id: 'abc-123',
                  numberOfEntrances: 11
                }
              ]
            }
          }
        })
      }))
      const payload = {
        'habitat-entrances': 22
      }
      const context = {
        context: {
          query: {
          }
        }
      }
      const { validator } = await import('../habitat-entrances.js')
      expect(await validator(payload, context)).toBe(undefined)
    })
  })
})
