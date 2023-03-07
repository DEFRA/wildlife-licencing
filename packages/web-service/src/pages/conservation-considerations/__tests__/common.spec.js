import { getFilteredDesignatedSites } from '../common.js'

describe('the checkData function', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkSiteData function', () => {
    it('if there is no designated site redirect to the tasklist page', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
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
      const { checkSiteData } = await import('../common.js')
      const h = { redirect: jest.fn() }
      await checkSiteData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('if there is a site return null', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
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
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { checkSiteData } = await import('../common.js')
      const h = { redirect: jest.fn() }
      const result = await checkSiteData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('the getFilteredDesignatedSites function', () => {
    it('returns a list of the sites combining the site-type into the name', async () => {
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
            ])
          }
        }
      }))
      const { getFilteredDesignatedSites } = await import('../common.js')
      const result = await getFilteredDesignatedSites()
      expect(result).toEqual([
        {
          id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
          siteName: 'Ribble Estuary SSSI'
        },
        {
          id: '93b171b3-55a9-ed11-aad1-0022481b53bf',
          siteName: 'South London Downs SSSI'
        }
      ])
    })
  })

  describe('the getCurrentSite function', () => {
    it('returns the current site if one is set in the cache', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
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
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { getCurrentSite } = await import('../common.js')
      const result = await getCurrentSite(request)
      expect(result).toEqual({
        id: '344be97d-c928-4753-ae09-f8944ad9f228',
        designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
        designatedSiteType: 100000001
      })
    })
  })
})
