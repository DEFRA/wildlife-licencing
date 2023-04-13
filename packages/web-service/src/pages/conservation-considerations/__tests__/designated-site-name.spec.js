jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the SSSI site name functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the set of designated sites where none is already selected', async () => {
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
      const { getData } = await import('../designated-site-name.js')
      const result = await getData(request)
      expect(result).toEqual({
        sites: [
          {
            id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'Ribble Estuary SSSI'
          },
          {
            id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'South London Downs SSSI'
          }
        ]
      })
    })

    it('returns the set of designated sites sites where one is already selected', async () => {
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
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf'
            }
          })
        })
      }
      const { getData } = await import('../designated-site-name.js')
      const result = await getData(request)
      expect(result).toEqual({
        sites: [
          {
            id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'Ribble Estuary SSSI',
            selected: false
          },
          {
            id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
            siteName: 'South London Downs SSSI',
            selected: true
          }
        ]
      })
    })
  })

  describe('the setData function', () => {
    it('creates an application-site site if none exists', async () => {
      const mockCreate = jest.fn().mockReturnValue({ id: '97496a5a-75cc-4f68-ad57-06f2882c7b9a' })
      const mockSetData = jest.fn()
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
        payload: { 'site-id': '93b171b3-55a9-ed11-aad1-0022481b53bf' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: null
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../designated-site-name.js')
      await setData(request)
      expect(mockCreate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf' })
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        designatedSite: {
          designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
          id: '97496a5a-75cc-4f68-ad57-06f2882c7b9a'
        }
      })
    })

    it('updates an application-site if it exists', async () => {
      const mockSetData = jest.fn()
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
        payload: { 'site-id': '93b171b3-55a9-ed11-aad1-0022481b53bf' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: '91b171b3-55a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../designated-site-name.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', '344be97d-c928-4753-ae09-f8944ad9f228', expect.objectContaining({ designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf' }))
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        designatedSite: {
          designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        }
      })
    })

    it('does nothing if an application-site with the current designated site', async () => {
      const mockSetData = jest.fn()
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
        payload: { 'site-id': '93b171b3-55a9-ed11-aad1-0022481b53bf' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../designated-site-name.js')
      await setData(request)
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockSetData).not.toHaveBeenCalled()
    })
  })
})
