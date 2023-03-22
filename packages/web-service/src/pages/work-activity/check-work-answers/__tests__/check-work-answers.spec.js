import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { APPLICATION_CATEGORY: { BARN_CONVERSION }, PAYMENT_EXEMPT_REASON: { PRESERVING_PUBLIC_HEALTH_AND_SAFETY } } = PowerPlatformKeys

describe('The check-work-answers', () => {
  beforeEach(() => jest.resetModules())

  it('should returns the user to the task list page when no application data is found', async () => {
    const mockSet = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress',
        NOT_STARTED: 'not-started'
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

  it('should redirect to the task list page when no application data is found', async () => {
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
          getById: () => {
            return {
              exemptFromPayment: false,
              proposalDescription: undefined,
              applicationCategory: 452120001
            }
          }
        }
      }
    }))
    const { checkData } = await import('../check-work-answers.js')
    await checkData(request, h)
    expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
  })

  it('should return null when application no data is found', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '123abc-deft4-tgH456' })
      })
    }
    const h = {
      redirect: jest.fn()
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return {
              exemptFromPayment: true,
              proposalDescription: 'proposalDescription',
              applicationCategory: 452120001
            }
          }
        }
      }
    }))
    const { checkData } = await import('../check-work-answers.js')
    expect(await checkData(request, h)).toBeNull()
  })

  it('getData returns correctly when the `OTHER` option is selected', async () => {
    const mockSet = jest.fn()
    const workTag = { tag: 'work-activity', tagState: 'complete-not-confirmed' }
    const OTHER = 452120007
    const request = {
      payload: {
        'yes-no': 'no'
      },
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress',
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: mockSet }
          },
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
    expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'complete-not-confirmed' })
  })

  it('getData returns correctly when any radio except `OTHER` is selected', async () => {
    const mockSet = jest.fn()
    const workTag = { tag: 'work-activity', tagState: 'complete-not-confirmed' }
    const request = {
      payload: {
        'yes-no': 'no'
      },
      cache: () => ({
        getData: () => ({ applicationId: '123abc' })
      })
    }
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'in-progress',
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: mockSet }
          },
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
    expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'complete-not-confirmed' })
  })
})
