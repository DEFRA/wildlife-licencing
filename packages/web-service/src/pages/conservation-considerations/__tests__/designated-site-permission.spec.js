jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the designated site permission functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the user permission flag from the designated site', async () => {
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
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { getData } = await import('../designated-site-permission.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })
  })

  describe('the setData function', () => {
    it('sets the permissionFromOwner flas', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: false
            }]),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
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
      const { setData } = await import('../designated-site-permission.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc',
        '344be97d-c928-4753-ae09-f8944ad9f228',
        {
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          designatedSiteType: 100000001,
          id: '344be97d-c928-4753-ae09-f8944ad9f228',
          permissionFromOwner: true
        })
    })
  })

  describe('the completion function', () => {
    it('if yes redirects to the owner permission details', async () => {
      const { completion } = await import('../designated-site-permission.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/details-of-permission')
    })

    it('if no redirects to the advice from natural england page', async () => {
      const { completion } = await import('../designated-site-permission.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/advice-from-natural-england')
    })
  })
})
