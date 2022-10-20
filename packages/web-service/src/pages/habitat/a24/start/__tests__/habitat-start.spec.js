describe('The habitat start page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat start page', () => {
    it('the habitat start page forwards onto habitat-name page', async () => {
      const { completion } = await import('../habitat-start.js')
      expect(await completion()).toBe('/habitat-name')
    })

    it('the checkData returns undefined if the journey isnt complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          complete: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'inProgress' }
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
          complete: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
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
  })
})
