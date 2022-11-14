describe('ensuring the first screen in a flow, moves from NOT_STARTED to IN_PROGRESS', () => {
  it('if the current state is NOT_STARTED, we then move the status to IN_PROGRESS', async () => {
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        IN_PROGRESS: 'in-progress'
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
    const { moveTagInProgress } = await import('../move-tag-status-in-progress.js')
    await moveTagInProgress('123qwe', 'KEY')
    expect(mockSet).toHaveBeenCalledWith({ tag: 'KEY', tagState: 'in-progress' })
  })

  it('if the current state is different from NOT_STARTED, it wont call anything', async () => {
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        IN_PROGRESS: 'in-progress'
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
    const { moveTagInProgress } = await import('../move-tag-status-in-progress.js')
    await moveTagInProgress('123qwe', 'KEY')
    expect(mockSet).not.toHaveBeenCalled()
  })
})
