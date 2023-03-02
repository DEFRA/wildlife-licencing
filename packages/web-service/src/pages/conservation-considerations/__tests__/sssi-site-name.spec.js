jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the SSSI site name functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the set of SSSI sites where none is already selected', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSites: jest.fn(() => [
              {
                id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              },
              {
                id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Buckingham Thick Copse',
                siteType: 100000000
              },
              {
                id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'South London Downs',
                siteType: 100000001
              }
            ]),
            get: jest.fn(() => [])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { getData } = await import('../sssi-site-name.js')
      const result = await getData(request)
      expect(result).toEqual({
        sites: [
          {
            id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'Ribble Estuary'
          },
          {
            id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'South London Downs'
          }
        ]
      })
    })

    it('returns the set of SSSI sites where one is already selected', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSites: jest.fn(() => [
              {
                id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              },
              {
                id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Buckingham Thick Copse',
                siteType: 100000000
              },
              {
                id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'South London Downs',
                siteType: 100000001
              }
            ]),
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { getData } = await import('../sssi-site-name.js')
      const result = await getData(request)
      expect(result).toEqual({
        sites: [
          {
            id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'Ribble Estuary',
            selected: false
          },
          {
            id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'South London Downs',
            selected: true
          }
        ]
      })
    })
  })

  describe('the setData function', () => {
    it('creates an SSSI site if none exists', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => []),
            create: mockCreate,
            getDesignatedSites: jest.fn(() => [
              {
                id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              },
              {
                id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Buckingham Thick Copse',
                siteType: 100000000
              },
              {
                id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'South London Downs',
                siteType: 100000001
              }
            ])
          }
        }
      }))

      const request = {
        payload: { 'site-name': 'South London Downs' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../sssi-site-name.js')
      await setData(request)
      expect(mockCreate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf' })
    })

    it('updates a SSSI site if it exists', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001
            }]),
            getDesignatedSites: jest.fn(() => [
              {
                id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              },
              {
                id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Buckingham Thick Copse',
                siteType: 100000000
              },
              {
                id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'South London Downs',
                siteType: 100000001
              }
            ]),
            update: mockUpdate
          }
        }
      }))

      const request = {
        payload: { 'site-name': 'South London Downs' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../sssi-site-name.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', '344be97d-c928-4753-ae09-f8944ad9f228', { designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf' })
    })

    it('does nothing if a SSSI site if it exists with the same id', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001
            }]),
            getDesignatedSites: jest.fn(() => [
              {
                id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              },
              {
                id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'Buckingham Thick Copse',
                siteType: 100000000
              },
              {
                id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
                siteName: 'South London Downs',
                siteType: 100000001
              }
            ]),
            update: mockUpdate
          }
        }
      }))

      const request = {
        payload: { 'site-name': 'South London Downs' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../sssi-site-name.js')
      await setData(request)
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
