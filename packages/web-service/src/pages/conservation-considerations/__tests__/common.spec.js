describe('the checkData function', () => {
  beforeEach(() => jest.resetModules())

  it('if there is no SSSI site redirect to the first page', async () => {
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
    const { checkSSSIData } = await import('../common.js')
    const h = { redirect: jest.fn() }
    await checkSSSIData(request, h)
    expect(h.redirect).toHaveBeenCalledWith('/on-or-next-to-sssi')
  })

  it('if there is an SSSI site return null', async () => {
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
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        })
      })
    }
    const { checkSSSIData } = await import('../common.js')
    const h = { redirect: jest.fn() }
    const result = await checkSSSIData(request, h)
    expect(result).toBeNull()
  })
})
