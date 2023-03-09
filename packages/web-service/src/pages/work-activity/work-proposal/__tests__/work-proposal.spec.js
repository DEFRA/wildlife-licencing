describe('The work-proposal page', () => {
  beforeEach(() => jest.resetModules())

  describe('work-proposal page', () => {
    it('getData moves the tag status in-progress', async () => {
      const mockSet = jest.fn()
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
            getById: () => {
              return {}
            },
            tags: () => {
              return { get: () => 'not-started', set: mockSet }
            }
          }
        }
      }))
      const { getData } = await import('../work-proposal.js')
      await getData(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'work-activity', tagState: 'in-progress' })
    })

    it('getData returns the proposal description', async () => {
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
            getById: () => {
              return { proposalDescription: 'the proposal of the work' }
            },
            tags: () => {
              return { get: () => 'not-started', set: jest.fn() }
            }
          }
        }
      }))
      const { getData } = await import('../work-proposal.js')
      expect(await getData(request)).toEqual({ proposalDescription: 'the proposal of the work' })
    })

    it('checkData redirects to CYA if the journeys complete', async () => {
      const mockRedirect = jest.fn()
      const request = {
        info: {
          referrer: 'https://www.defra.com/tasklist'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const h = {
        redirect: mockRedirect
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
      const { checkData } = await import('../work-proposal.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/check-work-answers')
    })

    it('checkData returns null if the journeys not-complete', async () => {
      const request = {
        info: {
          referrer: 'https://www.defra.com/tasklist'
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
      const { checkData } = await import('../work-proposal.js')
      expect(await checkData(request)).toEqual(null)
    })

    it('checkData doesnt redirect to CYA if the user came from the CYA page', async () => {
      const mockRedirect = jest.fn()
      const request = {
        info: {
          referrer: 'https://www.defra.com/check-work-answers'
        },
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const h = {
        redirect: mockRedirect
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
      const { checkData } = await import('../work-proposal.js')
      expect(await checkData(request, h)).toEqual(null)
      expect(mockRedirect).not.toHaveBeenCalled()
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
      const { completion } = await import('../work-proposal.js')
      expect(await completion(request)).toEqual('/check-work-answers')
    })

    it('the completion function returns the work-payment url on the primary journey', async () => {
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
              return { get: () => 'in-progress', set: jest.fn() }
            }
          }
        }
      }))
      const { completion } = await import('../work-proposal.js')
      expect(await completion(request)).toEqual('/work-payment')
    })

    it('setData hits the api with the user input', async () => {
      const mockUpdate = jest.fn()
      const request = {
        payload: {
          'work-proposal': 'Work proposal: badger removal for new road'
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
              return { example: 'just some data to check is being ran' }
            },
            update: mockUpdate
          }
        }
      }))
      const { setData } = await import('../work-proposal.js')
      expect(await setData(request)).toEqual(undefined)
      expect(mockUpdate).toHaveBeenCalledWith(
        '123abc',
        {
          example: 'just some data to check is being ran',
          proposalDescription: 'Work proposal: badger removal for new road'
        }
      )
    })
  })
})
