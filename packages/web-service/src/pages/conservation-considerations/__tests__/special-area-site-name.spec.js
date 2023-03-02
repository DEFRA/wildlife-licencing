jest.spyOn(console, 'error').mockImplementation(() => null)

const mapData = [
  [
    'Ribble Estuary',
    {
      sites: [
        {
          id: '8fb171b3-55a9-ed11-aad1-0022481b53bf',
          siteType: 100000000
        },
        {
          id: '65748a3f-5ca9-ed11-aad1-0022481b53bf',
          siteType: 100000006
        },
        {
          id: '9c321e6f-5ba9-ed11-aad1-0022481b5cc7',
          siteType: 100000001
        }
      ]
    }
  ],
  [
    'Buckingham Thick Copse',
    {
      sites: [
        {
          id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
          siteType: 100000000
        }
      ]
    }
  ]
]

describe('the special area site name functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('get site names data', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSitesNameMap: () => new Map(mapData)
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
      const { getData } = await import('../special-area-site-name.js')
      const result = await getData(request)
      expect(result).toEqual({
        sites: [
          {
            id: '',
            siteName: 'Buckingham Thick Copse'
          },
          {
            id: '',
            siteName: 'Ribble Estuary'
          }
        ]
      })
    })
  })

  describe('the setData function', () => {
    it('saves the name and id into the cache where there is only one site type', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSitesNameMap: () => new Map(mapData)
          }
        }
      }))
      const request = {
        payload: { 'site-name': 'Buckingham Thick Copse' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../special-area-site-name.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        specialSite: {
          id: '91b171b3-55a9-ed11-aad1-0022481b53bf',
          siteName: 'Buckingham Thick Copse'
        }
      })
    })

    it('saves the name into the cache where there is more then one site type', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSitesNameMap: () => new Map(mapData)
          }
        }
      }))
      const request = {
        payload: { 'site-name': 'Ribble Estuary' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../special-area-site-name.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        specialSite: {
          siteName: 'Ribble Estuary'
        }
      })
    })
  })

  describe('the completion function', () => {
    it('redirects to the site type selector if there is more than one site type', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSitesNameMap: () => new Map(mapData)
          }
        }
      }))
      const request = {
        payload: { 'site-name': 'Ribble Estuary' }
      }
      const { completion } = await import('../special-area-site-name.js')
      const result = await completion(request)
      expect(result).toEqual('/special-area-type')
    })

    it('redirects to the special area effect if there is only one site type', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSitesNameMap: () => new Map(mapData)
          }
        }
      }))
      const request = {
        payload: { 'site-name': 'Buckingham Thick Copse' }
      }
      const { completion } = await import('../special-area-site-name.js')
      const result = await completion(request)
      expect(result).toEqual('/special-area-effect')
    })
  })
})
