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
  })
})
