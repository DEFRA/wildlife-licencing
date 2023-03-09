describe('permissions page handler', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissions: () => {
            return [
              {
                id: '12345',
                type: 452120004,
                referenceNumber: 'ref-123',
                planningType: 'planningType',
                planningTypeOtherDescription: 'planningTypeOtherDescription',
                authority: '5d64da5a-4276-ed11-81ad-0022481b5bf5'
              }
            ]
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

    const { getData } = await import('../check-permissions-answers/check-permissions-answers.js')
    expect(await getData(request)).toStrictEqual({
      pageData: [
        {
          authority: 'Bromsgrove District Council',
          changePermissionUrl: '/consent-type',
          id: '12345',
          planningType: undefined,
          planningTypeOtherDescription: 'planningTypeOtherDescription',
          referenceNumber: 'ref-123',
          removePermissionUrl: '/consent-remove',
          type: 'Mineral consent'
        }
      ]
    })
  })

  it('should redirect user to consent type when user selects yes option to add another permission', async () => {
    const mockSetData = jest.fn()
    const request = {
      payload: {
        'add-another-permission': 'yes'
      },
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        },
        setData: mockSetData
      })
    }
    const { completion } = await import('../check-permissions-answers/check-permissions-answers.js')
    expect(await completion(request)).toBe('/consent-type')
    expect(mockSetData).toHaveBeenCalled()
  })
  it('should redirect user to the conditions-reserved-matters when the user does not want to add another permission', async () => {
    const request = {
      payload: {
        'add-another-permission': 'no'
      },
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }
    const { completion } = await import('../check-permissions-answers/check-permissions-answers.js')
    expect(await completion(request)).toBe('/conditions-reserved-matters')
  })
})
