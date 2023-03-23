describe('The work-licence-cost page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-licence-cost page', () => {
    it('the completion function sets the tag status', async () => {
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

    it('the completion function returns the CYA uri', async () => {
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
            tags: () => {
              return { set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-licence-cost.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })
  })
})
