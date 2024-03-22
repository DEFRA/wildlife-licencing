import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { APPLICATION_CATEGORY: { BARN_CONVERSION }, PAYMENT_EXEMPT_REASON: { PRESERVING_PUBLIC_HEALTH_AND_SAFETY } } = PowerPlatformKeys

describe('The check-work-answers', () => {
  beforeEach(() => jest.resetModules())

  it('completion should return the user to the task list page, and set the tag as complete', async () => {
    const mockSet = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: mockSet }
          }
        }
      }
    }))
    const { completion } = await import('../check-work-answers.js')
    expect(await completion(request)).toEqual('/tasklist')
    expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'complete' })
  })

  it('checkData should return null when tag status is `complete`', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              get: () => 'complete'
            }
          }
        }
      }
    }))
    const { checkData } = await import('../check-work-answers.js')
    expect(await checkData(request)).toBeNull()
  })

  it('checkData should return null when tag status is `confirmed-not-complete`', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              get: () => 'complete-not-confirmed'
            }
          }
        }
      }
    }))
    const { checkData } = await import('../check-work-answers.js')
    expect(await checkData(request)).toBeNull()
  })

  it('checkData redirects to work-proposal uri if the user hasnt finished the flow', async () => {
    const mockRedirect = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    const h = {
      redirect: mockRedirect
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              get: () => 'in-progress'
            }
          }
        }
      }
    }))
    const { checkData } = await import('../check-work-answers.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/development-description')
  })

  it('getData returns correctly when the `OTHER` radio option is selected', async () => {
    const workTag = { tag: 'work-activity', tagState: 'complete-not-confirmed' }
    const OTHER = 452120007
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {
              exemptFromPayment: true,
              applicationTags: [workTag],
              proposalDescription: 'proposalDescription',
              applicationCategory: BARN_CONVERSION,
              paymentExemptReason: OTHER,
              paymentExemptReasonExplanation: 'I wont be paying because its a place of worship'
            }
          }
        }
      }
    }))
    const { getData } = await import('../check-work-answers.js')
    expect(await getData(request)).toEqual([
      { key: 'workProposal', value: 'proposalDescription' },
      { key: 'workPayment', value: 'yes' },
      { key: 'workPaymentExemptCategory', value: 'I wont be paying because its a place of worship' },
      { key: 'workCategory', value: 'Barn conversion' }
    ])
  })

  it('getData returns correctly when any radio except `OTHER` is selected', async () => {
    const workTag = { tag: 'work-activity', tagState: 'complete-not-confirmed' }
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {
              exemptFromPayment: true,
              applicationTags: [workTag],
              proposalDescription: 'proposalDescription',
              applicationCategory: BARN_CONVERSION,
              paymentExemptReason: PRESERVING_PUBLIC_HEALTH_AND_SAFETY
            }
          }
        }
      }
    }))
    const { getData } = await import('../check-work-answers.js')
    expect(await getData(request)).toEqual([
      { key: 'workProposal', value: 'proposalDescription' },
      { key: 'workPayment', value: 'yes' },
      { key: 'workPaymentExemptCategory', value: 'Preserving public health and safety' },
      { key: 'workCategory', value: 'Barn conversion' }
    ])
  })
})
