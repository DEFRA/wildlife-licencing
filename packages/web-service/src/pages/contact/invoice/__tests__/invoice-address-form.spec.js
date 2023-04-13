describe('invoice-address page', () => {
  beforeEach(() => jest.resetModules())

  it('completion returns the user to CYA if the user has submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {
              referenceOrPurchaseOrderNumber: '123abc'
            }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '68855554-59ed-ec11-bb3c-000d3a0cee24' })
      })
    }
    const { completion } = await import('../invoice-address-form.js')
    expect(await completion(request)).toEqual('/invoice-check-answers')
  })

  it('completion returns the user to invoice-purchase-order if the user has not submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {}
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '68855554-59ed-ec11-bb3c-000d3a0cee24' })
      })
    }
    const { completion } = await import('../invoice-address-form.js')
    expect(await completion(request)).toEqual('/invoice-purchase-order')
  })
})
