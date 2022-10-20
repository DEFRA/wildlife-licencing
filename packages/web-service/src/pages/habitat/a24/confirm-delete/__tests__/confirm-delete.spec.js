
describe('The confirm delte page', () => {
  beforeEach(() => jest.resetModules())

  describe('confirm delete page', () => {
    it('the confirm-delete page forwards onto check-habitat-answers if you have at least 1 sett', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: ({
          HABITAT: {
            getHabitatsById: () => ['one sett']
          }
        })
      }))
      const request = {
        cache: () => {
          return {
            getData: () => ({ habitatData: { applicationId: '123abc' } })
          }
        }
      }
      const { completion } = await import('../confirm-delete.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('setData calls the connectors lib correctly if user selects confirm delete', async () => {
      const mockDelete = jest.fn()
      const request = {
        payload: {
          'confirm-delete': true
        },
        query: {
          id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c'
        },
        cache: () => ({
          getData: () => ({
            applicationId: 'dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af'
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            deleteSett: mockDelete,
            getHabitatsById: () => []
          }
        }
      }))
      const { setData } = await import('../confirm-delete.js')
      await setData(request)
      expect(mockDelete).toHaveBeenCalledWith('dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af', 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c')
    })

    it('setData resets the tags to be incomplete if the user deletes their final sett', async () => {
      const mockDelete = jest.fn()
      const mockTagDelete = jest.fn()
      const request = {
        payload: {
          'confirm-delete': true
        },
        query: {
          id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c'
        },
        cache: () => ({
          getData: () => ({
            applicationId: 'dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af'
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          inProgress: 'inProgress'
        },
        APIRequests: {
          HABITAT: {
            deleteSett: mockDelete,
            getHabitatsById: () => ['one sett']
          },
          APPLICATION: {
            tags: () => {
              return { remove: mockTagDelete }
            }
          }
        }
      }))
      const { setData } = await import('../confirm-delete.js')
      await setData(request)
      expect(mockDelete).toHaveBeenCalledWith('dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af', 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c')
      expect(mockTagDelete).toHaveBeenCalledWith('setts')
    })

    it('setData does not call API if user selects not to confirm delete', async () => {
      const mockDelete = jest.fn()
      const request = {
        payload: {
          'confirm-delete': false
        },
        query: {
          id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c'
        },
        cache: () => ({
          getData: () => ({
            habitatData: {
              applicationId: 'dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af'
            }
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            deleteSett: mockDelete,
            getHabitatsById: () => []
          }
        }
      }))
      const { setData } = await import('../confirm-delete.js')
      await setData(request)
      expect(mockDelete).toHaveBeenCalledTimes(0)
    })

    it('getData selects the correct habitat site', async () => {
      const request = {
        query: {
          id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c'
        },
        cache: () => ({
          getData: () => ({
            habitatData: {
              applicationId: 'dbf77d92-a6a6-4ec3-9f4b-da6f6bf2c0af'
            }
          })
        })
      }
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => ([
              {
                id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c'
              },
              {
                id: '8215767e-0095-4f08-af1c-50e03ca56804'
              }
            ])
          }
        }
      }))
      const { getData } = await import('../confirm-delete.js')
      expect(await getData(request)).toStrictEqual({ id: 'ff530373-a8f0-4c7e-a7cf-f97d533a8c7c' })
    })
  })
})
