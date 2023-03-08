import { tagStatus } from '../../../services/status-tags.js'

describe('the checkData function', () => {
  beforeEach(() => jest.resetModules())

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
    it('resets the cache data if a parameter id is specified', async () => {
      const mockSetData = jest.fn()
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
        params: { id: '344be97d-c928-4753-ae09-f8944ad9f228' },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
        })
      }
      const { getCurrentSite } = await import('../common.js')
      const result = await getCurrentSite(request)
      expect(result).toEqual({
        id: '344be97d-c928-4753-ae09-f8944ad9f228',
        designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
        designatedSiteType: 100000001
      })
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
        designatedSite: {
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        }
      })
    })

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

    it('creates the cache data if no parameter id is specified', async () => {
      const mockSetData = jest.fn()
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
          setData: mockSetData,
          getData: () => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
        })
      }
      const { getCurrentSite } = await import('../common.js')
      const result = await getCurrentSite(request)
      expect(result).toEqual({
        id: '344be97d-c928-4753-ae09-f8944ad9f228',
        designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
        designatedSiteType: 100000001
      })
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
        designatedSite: {
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        }
      })
    })
  })

  describe('the completionOrCheck function', () => {
    it('calls the requested function if the status is IN-PROGRESS', async () => {
      const mockFunction = jest.fn().mockReturnValue('/this')
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => tagStatus.IN_PROGRESS
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
        })
      }
      const { completionOrCheck } = await import('../common.js')
      const result = await completionOrCheck(mockFunction)(request)
      expect(result).toEqual('/this')
      expect(mockFunction).toHaveBeenCalled()
    })

    it('returns the check page if the status is COMPLETE', async () => {
      const mockFunction = jest.fn().mockReturnValue('/this')
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => tagStatus.COMPLETE_NOT_CONFIRMED
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7' })
        })
      }
      const { completionOrCheck } = await import('../common.js')
      const result = await completionOrCheck(mockFunction)(request)
      expect(result).toEqual('/designated-site-check-answers')
      expect(mockFunction).not.toHaveBeenCalled()
    })
  })
})
