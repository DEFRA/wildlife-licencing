jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the details of permission functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the permissions details from the designated site', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              detailsOfPermission: 'STRING'
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { getData } = await import('../details-of-permission.js')
      const result = await getData(request)
      expect(result).toEqual({ 'permission-details': 'STRING' })
    })
  })

  describe('the setData function', () => {
    it('sets the permissions details', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001
            }]),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: { 'permission-details': 'STRING' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { setData } = await import('../details-of-permission.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc',
        '344be97d-c928-4753-ae09-f8944ad9f228',
        {
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          designatedSiteType: 100000001,
          detailsOfPermission: 'STRING',
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        })
    })
  })
})
