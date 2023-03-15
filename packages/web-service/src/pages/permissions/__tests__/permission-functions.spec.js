describe('permission-functions', () => {
  beforeEach(() => jest.resetModules())

  it('getPermissionType', async () => {
    const { getPermissionType } = await import('../common/permission-functions.js')
    expect(await getPermissionType(452120004)).toStrictEqual('Mineral consent')
    expect(await getPermissionType()).toBeUndefined()
  })

  it('getPermissionPlanningType', async () => {
    const { getPermissionPlanningType } = await import('../common/permission-functions.js')
    expect(await getPermissionPlanningType(452120002)).toStrictEqual('Hybrid')
    expect(await getPermissionPlanningType()).toBeUndefined()
  })

  it('getPermissionReason', async () => {
    const { getPermissionReason } = await import('../common/permission-functions.js')
    expect(await getPermissionReason(452120001)).toStrictEqual('Health and safety')
    expect(await getPermissionReason()).toBeUndefined()
  })

  it('getAuthorityName', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
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

    const { getAuthorityName } = await import('../common/permission-functions.js')
    expect(await getAuthorityName('5d64da5a-4276-ed11-81ad-0022481b5bf5')).toBe('Bromsgrove District Council')
  })

  it('getCheckYourAnswersData with complete permission data', async () => {
    const { getCheckYourAnswersData } = await import('../common/permission-functions.js')
    expect(await getCheckYourAnswersData(
      [
        {
          id: '12345',
          type: 452120000,
          referenceNumber: 'ref-123',
          planningType: 'planningType',
          planningTypeOtherDescription: 'planningTypeOtherDescription',
          authority: '5d64da5a-4276-ed11-81ad-0022481b5bf5'
        }
      ]
    )).toStrictEqual({
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
      ]
    })
  })

  it('getCheckYourAnswersData with incomplete permission data', async () => {
    const { getCheckYourAnswersData } = await import('../common/permission-functions.js')
    expect(await getCheckYourAnswersData(
      [
        {
          id: '12345',
          type: 123
        }
      ]
    )).toStrictEqual({
      pageData: []
    })
  })

  it('validateConditionalInput', async () => {
    const { validateConditionalInput } = await import('../common/permission-functions.js')
    expect(await validateConditionalInput(452120003, '', '452120003')).toBeTruthy()
    expect(await validateConditionalInput(452120003, 'description', '452120002')).toBeFalsy()
    expect(await validateConditionalInput(452120002, '', '452120003')).toBeFalsy()
    expect(await validateConditionalInput(452120003, 'description', '452120003')).toBeTruthy()
  })
})
