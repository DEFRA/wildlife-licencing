describe('The habitat grid ref page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-grid-ref page', () => {
    it('the habitat-grid-ref page forwards onto habitat-work-start on primary journey', async () => {
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
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const { completion } = await import('../habitat-grid-ref.js')
      expect(await completion(request)).toBe('/habitat-work-start')
    })

    it('the habitat-grid-ref page forwards onto check-habitat-answers on return journey', async () => {
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
          getData: () => ({})
        })
      }
      const { completion } = await import('../habitat-grid-ref.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('sets the grid ref data correctly on primary journey', async () => {
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
              'habitat-grid-ref': 'NY123456'
            }
          })
        })
      }
      const { setData } = await import('../habitat-grid-ref.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { gridReference: 'NY123456' }
      })
    })

    it('sets the grid ref data correctly on return journey', async () => {
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
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-grid-ref': 'NY123456'
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

      const { setData } = await import('../habitat-grid-ref.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { gridReference: 'NY123456' }
      })
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { gridReference: 'NY395557' } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../habitat-grid-ref.js')
      expect(await getData(request)).toStrictEqual({ gridReference: result.habitatData.gridReference })
    })
  })
})
