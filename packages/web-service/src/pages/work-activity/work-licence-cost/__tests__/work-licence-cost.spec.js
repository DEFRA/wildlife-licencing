describe('The work-licence-cost page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-licence-cost page', () => {
    it('the completion function sets the tag status, if the journey is all complete', async () => {
      const mockSet = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return {}
            },
            tags: () => {
              return { set: mockSet }
            }
          }
        }
      }))
      const { completion } = await import('../work-licence-cost.js')
      await completion(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'complete-not-confirmed' })
    })

    it('the completion function returns the CYA uri, if the journey is all complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return {}
            },
            tags: () => {
              return { set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-licence-cost.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })

    it('the completion function returns the WORK_PROPOSAL uri, if part of the journey is skipped', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            getById: () => {
              return {
                exemptFromPayment: true,
                paymentExemptReason: undefined
              }
            },
            tags: () => {
              return { set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-licence-cost.js')
      expect(await completion(request)).toEqual('/development-description')
    })
  })
})
