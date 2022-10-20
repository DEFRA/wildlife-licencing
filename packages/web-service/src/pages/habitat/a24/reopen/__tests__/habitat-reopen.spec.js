describe('The habitat reopen page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat reopen page', () => {
    it('the habitat reopen page forwards onto habitat-entrances page on primary journey', async () => {
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
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion(request)).toBe('/habitat-entrances')
    })

    it('the habitat-reopen page forwards onto check-habitat-answers on return journey', async () => {
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
          getData: () => ({})
        })
      }
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('sets the reopen data correctly', async () => {
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
              'habitat-reopen': true
            }
          })
        })
      }
      const { setData } = await import('../habitat-reopen.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { willReopen: true }
      })
    })

    it('sets the reopen data correctly on return journey', async () => {
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
              'habitat-reopen': true
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

      const { setData } = await import('../habitat-reopen.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { willReopen: true }
      })
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { willReopen: true } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../habitat-reopen.js')
      expect(await getData(request)).toStrictEqual({ willReopen: result.habitatData.willReopen })
    })
  })
})
