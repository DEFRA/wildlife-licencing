describe('permissions page handler', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ELIGIBILITY: {
          getById: () => {
            return { permissionsRequired: true }
          }
        },
        PERMISSION: {
          getPermissions: () => {
            return [
              {
                id: '12345',
                type: 452120000,
                referenceNumber: 'ref-123',
                planningType: 'planningType',
                planningTypeOtherDescription: 'planningTypeOtherDescription',
                authority: '5d64da5a-4276-ed11-81ad-0022481b5bf5'
              }
            ]
          },
          getPermissionDetailsById: () => {
            return {
              id: '12345',
              noPermissionReason: 452120001
            }
          }
        },
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        },
        OTHER: {
          authorities: () => {
            return [
              {
                id: '5d64da5a-4276-ed11-81ad-0022481b5bf5',
                createdAt: '2023-02-13T10:20:09.534Z',
                updatedAt: '2023-02-22T18:45:08.550Z',
                name: 'Bromsgrove District Council'
              },
              {
                id: '6964da5a-4276-ed11-81ad-0022481b5bf5',
                createdAt: '2023-02-13T10:20:09.550Z',
                updatedAt: '2023-02-22T18:45:08.587Z',
                name: 'Calderdale Metropolitan Borough Council'
              }
            ]
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../check-your-answers/check-your-answers.js')
    expect(await getData(request)).toStrictEqual({
      eligibility: {
        permissionsRequired: true
      },
      pageData: [
        {
          authority: 'Bromsgrove District Council',
          changePermissionUrl: '/consent-type',
          id: '12345',
          planningType: undefined,
          planningTypeOtherDescription: 'planningTypeOtherDescription',
          referenceNumber: 'ref-123',
          removePermissionUrl: '/consent-remove',
          type: 'Planning permission'
        }
      ],
      permissionDetails: {
        id: '12345',
        noPermissionReason: 'Health and safety'
      }
    })
  })

  it('should redirect user to the task list page when tag state is complete', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { set: jest.fn() }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../check-your-answers/check-your-answers.js')
    expect(await completion(request)).toBe('/tasklist')
  })
})
