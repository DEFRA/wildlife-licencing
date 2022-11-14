describe('The habitat start page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat start page', () => {
    it('the checkData returns undefined if the journey isnt complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress', set: jest.fn() }
            }
          },
          HABITAT: {
            getHabitatsById: () => []
          }
        }
      }))
      const { checkData } = await import('../habitat-start.js')
      expect(await checkData(request)).toBe(undefined)
    })

    it('will return the application uri if the user has not got an application id', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { checkData } = await import('../habitat-start.js')
      expect(await checkData(request)).toBe('/applications')
    })

    it('the checkData returns the user to the tasklist if the journey is complete', async () => {
      const mockRedirect = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const h = {
        redirect: mockRedirect
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete', set: jest.fn() }
            }
          },
          HABITAT: {
            getHabitatsById: () => ['one sett']
          }
        }
      }))
      const { checkData } = await import('../habitat-start.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/check-habitat-answers')
    })

    it('getData sets the tag', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
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
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94'
          }))
        })
      }
      const { getData } = await import('../habitat-start.js')
      expect(await getData(request)).toBe(null)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'setts', tagState: 'in-progress' })
    })
  })
})
