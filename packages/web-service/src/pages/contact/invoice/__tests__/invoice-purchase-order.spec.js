describe('invoice check answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('getData calls APPLICATION endpoint and returns the data if theres data', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { referenceOrPurchaseOrderNumber: '123abc' }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
              }
            }
          }
        }
      }
      const { getData } = await import('../invoice-purchase-order.js')
      expect(await getData(request)).toEqual({ purchaseOrder: '123abc' })
    })
  })

  it('getData calls APPLICATION endpoint and returns an empty string if theres no data', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { referenceOrPurchaseOrderNumber: undefined }
          }
        }
      }
    }))
    const request = {
      cache: () => {
        return {
          getData: () => {
            return {
              applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
            }
          }
        }
      }
    }
    const { getData } = await import('../invoice-purchase-order.js')
    expect(await getData(request)).toEqual({ purchaseOrder: '' })
  })

  it('setData hits the API endpoint with the new data', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092' }
          },
          update: mockUpdate
        }
      }
    }))
    const request = {
      cache: () => {
        return {
          getData: () => {
            return {
              applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
            }
          },
          getPageData: () => {
            return {
              payload: {
                'purchase-order': 'badger-hole-kent-gridref123'
              }
            }
          }
        }
      }
    }
    const { setData } = await import('../invoice-purchase-order.js')
    await setData(request)
    expect(mockUpdate).toHaveBeenCalledWith('f789913d-a095-4150-8aaf-7addd38d3092', {
      referenceOrPurchaseOrderNumber: 'badger-hole-kent-gridref123',
      applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
    })
  })
})
