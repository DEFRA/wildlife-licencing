describe('invoice-email page', () => {
  beforeEach(() => jest.resetModules())

  it('redirectJourney function returns the user to check page if the user has submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ACCOUNT: { role: () => ({ getByApplicationId: () => null }) },
        CONTACT: { role: () => ({ getByApplicationId: () => ({ address: {} }) }) },
        APPLICATION: {
          getById: async () => ({ referenceOrPurchaseOrderNumber: 'Ref123' })
        }
      }
    }))
    const { redirectJourney } = await import('../invoice-email.js')
    const request = {
      cache: () => ({ getData: () => ({ applicationId: '9b0133b9-d140-42d8-ab61-10c095e55dd3' }) })
    }
    expect(await redirectJourney(request)).toEqual('/invoice-check-answers')
  })

  it('redirectJourney function returns the user to invoice-purchase-order if the user has not submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => ({})
        }
      }
    }))
    const request = {
      cache: () => ({ getData: () => ({ applicationId: '9b0133b9-d140-42d8-ab61-10c095e55dd3' }) })
    }
    const { redirectJourney } = await import('../invoice-email.js')
    expect(await redirectJourney(request)).toEqual('/invoice-purchase-order')
  })
})
