import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

describe('The habitat types page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat types page', () => {
    it('the habitat types page forwards onto habitat-reopen page on primary journey', async () => {
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
      const { completion } = await import('../habitat-types.js')
      expect(await completion(request)).toBe('/habitat-reopen')
    })

    it('the habitat-types page forwards onto check-habitat-answers on return journey', async () => {
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
      const { completion } = await import('../habitat-types.js')
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
              'habitat-types': '100000011'
            }
          })
        })
      }
      const { setData } = await import('../habitat-types.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { settType: 100000011 }
      })
    })

    it('sets the type data correctly on return journey', async () => {
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
              'habitat-types': '100000011'
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

      const { setData } = await import('../habitat-types.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { settType: 100000011 }
      })
    })

    it('getData returns the settTypes', async () => {
      const result = { habitatData: { settType: 100000003 } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../habitat-types.js')
      expect(await getData(request)).toStrictEqual({ MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER, settType: result.habitatData.settType })
    })
  })
})
