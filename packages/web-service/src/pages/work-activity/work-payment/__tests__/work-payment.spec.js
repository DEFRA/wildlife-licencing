describe('The work-payment page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-payment page', () => {
    it('getData can return yes from the applicationData', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { exemptFromPayment: true }
            }
          }
        }
      }))
      const { getData } = await import('../work-payment.js')
      expect(await getData(request)).toEqual({ yesNo: 'yes' })
    })

    it('getData can return no from the applicationData', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return { exemptFromPayment: false }
            }
          }
        }
      }))
      const { getData } = await import('../work-payment.js')
      expect(await getData(request)).toEqual({ yesNo: 'no' })
    })

    it('the completion function returns the user to the CYA page if on the return journey', async () => {
      const request = {
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
              return { get: () => 'complete', set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-payment.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })

    it('the completion function returns the work-payment-exempt-reason url on the primary journey, if the user needs to pay for their licence', async () => {
      const request = {
        payload: {
          'yes-no': 'yes'
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
              return { get: () => 'in-progress', set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-payment.js')
      expect(await completion(request)).toEqual('/work-payment-exempt-reason')
    })

    it('the completion function returns the work-category url on the primary journey, if the user doesnt need to pay for their licence', async () => {
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
              return { get: () => 'in-progress', set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-payment.js')
      expect(await completion(request)).toEqual('/work-category')
    })

    it('setData hits the api with the user input, on the primary journey', async () => {
      const mockUpdate = jest.fn()
      const request = {
        payload: {
          'yes-no': 'yes'
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
            getById: () => {
              return { example: 'just ensuring what we pull from the api is preserved' }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-payment.js')
      expect(await setData(request)).toEqual(undefined)
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          example: 'just ensuring what we pull from the api is preserved',
          exemptFromPayment: true
        }
      )
    })

    it('setData hits the api with the user input, on the return journey - and resets the applicationData', async () => {
      const mockUpdate = jest.fn()
      const workTag = { tag: 'work-activity', tagState: 'complete' }
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
            getById: () => {
              return {
                exemptFromPayment: true,
                applicationTags: [workTag],
                example: 'just ensuring what we pull from the api is preserved',
                paymentExemptReason: 100000001,
                paymentExemptReasonExplanation: 'I wont be paying because its a place of worship'
              }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-payment.js')
      expect(await setData(request)).toEqual(undefined)
      expect(workTag.tagState).toBe('in-progress')
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          applicationTags: [workTag],
          example: 'just ensuring what we pull from the api is preserved',
          exemptFromPayment: false
        }
      )
    })
  })
})
