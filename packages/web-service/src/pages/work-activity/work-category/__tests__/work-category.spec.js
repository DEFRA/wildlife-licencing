describe('The work-category page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-category page', () => {
    it('the getData handler returns the keys for the nunjucks file', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { applicationCategory: 100000001 }
            }
          }
        }
      }))
      const { getData } = await import('../work-category.js')
      expect(await getData(request)).toEqual(
        {
          BARN_CONVERSION: 100000004,
          COMMERCIAL: 100000019,
          COMMUNICATIONS: 100000017,
          ENERGY_GENERATION__ENERGY_SUPPLY: 100000016,
          FLOOD_AND_COASTAL_DEFENCES: 100000007,
          HOUSING__NON_HOUSEHOLDER: 100000001,
          INDUSTRIAL__MANUFACTURING: 100000003,
          MINERAL_EXTRACTION__QUARRYING: 100000005,
          NATIONALLY_SIGNIFICANT_INFRASTRUCTURE_PROJECTS: 100000018,
          PUBLIC_BUILDINGS_AND_LAND: 100000008,
          TOURISM__LEISURE: 100000010,
          TRANSPORT__HIGHWAYS: 100000012,
          WASTE_MANAGEMENT: 100000014,
          WATER_SUPPLY_AND_TREATMENT__WATER_ENVIRONMENT: 100000015,
          applicationCategory: 100000001
        }
      )
    })

    it('the completion handler returns check-work-answers url on return journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))
      const { completion } = await import('../work-category.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })

    it('the completion handler returns work-licence-cost url on primary journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        }
      }))
      const { completion } = await import('../work-category.js')
      expect(await completion(request)).toEqual('/work-licence-cost')
    })

    it('the setData handler hits the api with the user input', async () => {
      const mockUpdate = jest.fn()
      const request = {
        payload: {
          'work-category': '101'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { example: 'ensuring we pass along data' }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-category.js')
      expect(await setData(request)).toBe(undefined)
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          applicationCategory: 101,
          example: 'ensuring we pass along data'
        }
      )
    })
  })
})
