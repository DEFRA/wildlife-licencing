describe('tag-functions', () => {
  beforeEach(() => jest.resetModules())

  describe('ensuring the first screen in a flow, moves from NOT_STARTED to IN_PROGRESS', () => {
    it('if the current state is NOT_STARTED, we then move the status to IN_PROGRESS', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          IN_PROGRESS: 'in-progress',
          CANNOT_START: 'cannot-start'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'not-started',
                set: mockSet
              }
            }
          }
        }
      }))
      const { moveTagInProgress } = await import('../tag-functions.js')
      await moveTagInProgress('123qwe', 'KEY')
      expect(mockSet).toHaveBeenCalledWith({ tag: 'KEY', tagState: 'in-progress' })
    })

    it('if the current state is different from NOT_STARTED, it wont call anything', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          IN_PROGRESS: 'in-progress',
          CANNOT_START: 'cannot-start'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'in-progress',
                set: mockSet
              }
            }
          }
        }
      }))
      const { moveTagInProgress } = await import('../tag-functions.js')
      await moveTagInProgress('123qwe', 'KEY')
      expect(mockSet).not.toHaveBeenCalled()
    })
  })
  describe('determining whether a flow is complete', () => {
    it('tests whether we can determine `cannot-start` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isComplete } = await import('../tag-functions.js')
      expect(isComplete(tagStatus.CANNOT_START)).toBe(false)
    })

    it('tests whether we can determine `not-started` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isComplete } = await import('../tag-functions.js')
      expect(isComplete(tagStatus.NOT_STARTED)).toBe(false)
    })

    it('tests whether we can determine `in-progress` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isComplete } = await import('../tag-functions.js')
      expect(isComplete(tagStatus.IN_PROGRESS)).toBe(false)
    })

    it('tests whether we can determine `complete` is considered complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isComplete } = await import('../tag-functions.js')
      expect(isComplete(tagStatus.COMPLETE)).toBe(true)
    })
  })

  describe('determining whether a flow is complete or confirmed', () => {
    it('tests whether we can determine `cannot-start` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isCompleteOrConfirmed } = await import('../tag-functions.js')
      expect(isCompleteOrConfirmed(tagStatus.CANNOT_START)).toBe(false)
    })

    it('tests whether we can determine `not-started` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isCompleteOrConfirmed } = await import('../tag-functions.js')
      expect(isCompleteOrConfirmed(tagStatus.NOT_STARTED)).toBe(false)
    })

    it('tests whether we can determine `in-progress` is considered not complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isCompleteOrConfirmed } = await import('../tag-functions.js')
      expect(isCompleteOrConfirmed(tagStatus.IN_PROGRESS)).toBe(false)
    })

    it('tests whether we can determine `complete-not-confirmed` is considered complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isCompleteOrConfirmed } = await import('../tag-functions.js')
      expect(isCompleteOrConfirmed(tagStatus.COMPLETE_NOT_CONFIRMED)).toBe(true)
    })

    it('tests whether we can determine `complete` is considered complete', async () => {
      const { tagStatus } = await import('../../../services/api-requests.js')
      const { isCompleteOrConfirmed } = await import('../tag-functions.js')
      expect(isCompleteOrConfirmed(tagStatus.COMPLETE)).toBe(true)
    })
  })
})
