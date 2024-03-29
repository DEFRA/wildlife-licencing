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
        query: { id: '344be97d-c928-4753-ae09-f8944ad9f228' },
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
  })

  describe('the allCompletion function', () => {
    it('returns owner permission page if necessary', async () => {
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
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/designated-site-permission')
    })

    it('returns owner permission details page if necessary', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/details-of-permission')
    })

    it('returns natural england advice page if necessary', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true,
              detailsOfPermission: 'DETAILS'
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/advice-from-natural-england')
    })

    it('returns natural england advice details page if necessary', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true,
              detailsOfPermission: 'DETAILS',
              adviceFromNaturalEngland: true
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/ne-activity-advice')
    })

    it('returns proximity page if necessary', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true,
              detailsOfPermission: 'DETAILS',
              adviceFromNaturalEngland: true,
              adviceFromWho: 'WHO',
              adviceDescription: 'DESC'
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/designated-site-proximity')
    })

    it('returns check page page all completed', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true,
              detailsOfPermission: 'DETAILS',
              adviceFromNaturalEngland: true,
              adviceFromWho: 'WHO',
              adviceDescription: 'DESC',
              onSiteOrCloseToSite: 100000001
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
            designatedSite: {
              designatedSiteId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { allCompletion } = await import('../common.js')
      const result = await allCompletion(request)
      expect(result).toEqual('/designated-site-check-answers')
    })
  })

  describe('the checkDesignatedSite function', () => {
    it('returns null if there is no site to remove', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSites: jest.fn(() => [
              {
                id: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              }
            ]),
            get: jest.fn(() => [])
          }
        }
      }))
      const request = {
        query: { id: '344be97d-c928-4753-ae09-f8944ad9f228' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: jest.fn()
        })
      }
      const { checkDesignatedSite } = await import('../common.js')
      const h = { redirect: jest.fn((uri) => uri) }

      const result = await checkDesignatedSite(request, h)

      expect(result).toEqual('/designated-site-check-answers')
    })

    it('returns the check page if there is a site to remove', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSites: jest.fn(() => [
              {
                id: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              }
            ]),
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf'
            }])
          }
        }
      }))
      const request = {
        query: { id: '344be97d-c928-4753-ae09-f8944ad9f228' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: jest.fn()
        })
      }
      const { checkDesignatedSite } = await import('../common.js')
      const h = { redirect: jest.fn() }

      const result = await checkDesignatedSite(request, h)

      expect(result).toEqual(null)
    })
  })
})
