describe('invoice-email page', () => {
  beforeEach(() => jest.resetModules())

  it('redirectJourney function returns the user to CYA if the user has submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: async () => {
            return { referenceOrPurchaseOrderNumber: '123abc' }
          }
        }
      }
    }))
    const { redirectJourney } = await import('../invoice-email.js')
    const applicationId = '123abc'
    const urlBase = { CHECK_ANSWERS: { uri: '/check-answers' } }
    expect(await redirectJourney(applicationId, urlBase)).toEqual('/check-answers')
  })

  it('redirectJourney function returns the user to invoice-purchase-order if the user has not submitted a referenceOrPurchaseOrderNumber', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {

            }
          }
        }
      }
    }))
    const { redirectJourney } = await import('../invoice-email.js')
    const applicationId = '123abc'
    const urlBase = { }
    expect(await redirectJourney(applicationId, urlBase)).toEqual('/invoice-purchase-order')
  })
})
