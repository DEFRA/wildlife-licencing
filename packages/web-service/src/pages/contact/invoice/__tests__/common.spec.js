describe('the common functions', () => {
  beforeEach(() => jest.resetModules())

  it('getData calls the APIs', async () => {
    const mockFn = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        CONTACT: {
          role: mockFn.mockReturnValueOnce({
            getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
          }).mockReturnValueOnce({
            getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', fullName: 'Keith' })
          }).mockReturnValueOnce(({
            getByApplicationId: () => ({ id: '8829ad54-bab7-4a78-8ca9-dcf722117a45' })
          }))
        },
        ACCOUNT: {
          role: jest.fn().mockReturnValueOnce({
            getByApplicationId: () => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c', address: { postcode: '123' } })
          })
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
    const { generateOutput } = await import('../common.js')
    await generateOutput(request)
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('purchaseOrderCompletion returns the user to CYA if the user has submitted a referenceOrPurchaseOrderNumber', async () => {
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
    const { purchaseOrderCompletion } = await import('../common.js')
    expect(await purchaseOrderCompletion(request)).toEqual('/invoice-payer-check-answers')
  })

  it('purchaseOrderCompletion returns the user to invoice-purchase-order if the user has not submitted a referenceOrPurchaseOrderNumber', async () => {
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
    const { purchaseOrderCompletion } = await import('../common.js')
    expect(await purchaseOrderCompletion(request)).toEqual('/enter-invoice-reference-purchase-order')
  })
})
