describe('The account extract processor: write-account-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found, pending account with a timestamp older than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_ACCOUNT = { foo: 'bar' }

    models.accounts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: Date.parse('01 Jan 2020 00:00:00 GMT'),
        account: TEST_ACCOUNT
      })),
      update: mockUpdate
    }

    const { writeAccountObject } = await import('../write-account-object.js')
    const keysArr = [
      {
        apiTable: 'accounts',
        apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
        powerAppsTable: 'accounts',
        powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
      }]

    const result = await writeAccountObject({
      data: { accounts: TEST_ACCOUNT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      account: TEST_ACCOUNT,
      updateStatus: 'U'
    }, {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('makes an update on a found, unlocked account (if data change)', async () => {
    const TEST_ACCOUNT = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.accounts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: Date.now(),
        account: Object.assign({}, TEST_ACCOUNT, { new: 'thing' })
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'accounts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'accounts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeAccountObject } = await import('../write-account-object.js')

    const result = await writeAccountObject({
      data: { accounts: TEST_ACCOUNT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      account: TEST_ACCOUNT,
      updateStatus: 'U'
    }, {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('does not make an update on a found, unlocked account (if no data change)', async () => {
    const TEST_ACCOUNT = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.accounts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: Date.now(),
        account: TEST_ACCOUNT
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'accounts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'accounts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeAccountObject } = await import('../write-account-object.js')

    const result = await writeAccountObject({
      data: { accounts: TEST_ACCOUNT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 0 })
  })

  it('does not make an update on a found, pending account with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_ACCOUNT = { foo: 'bar' }
    models.accounts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: Date.now(),
        application: Object.assign({}, TEST_ACCOUNT, { new: 'thing' })
      })),
      update: mockUpdate
    }
    const keysArr = [{
      apiTable: 'accounts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'accounts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const extractDate = new Date()
    extractDate.setSeconds(extractDate.getSeconds() - 2)

    const { writeAccountObject } = await import('../write-account-object.js')
    const result = await writeAccountObject({
      data: { accounts: TEST_ACCOUNT },
      keys: keysArr
    }, extractDate)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 1, update: 0, error: 0 })
  })

  it('makes an insert on a not-found account', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    const TEST_ACCOUNT = { foo: 'bar' }

    models.accounts = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }

    const keysArr = [{
      apiTable: 'accounts',
      apiKey: null,
      powerAppsTable: 'accounts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeAccountObject } = await import('../write-account-object.js')
    const result = await writeAccountObject({
      data: { accounts: TEST_ACCOUNT },
      keys: keysArr
    }, Date.now())

    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      account: TEST_ACCOUNT,
      updateStatus: 'U',
      sddsAccountId: '743da832-786d-ec11-8943-000d3a86e24e'
    })

    expect(result).toEqual({ insert: 1, pending: 0, update: 0, error: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')

    models.accounts = {
      findOne: jest.fn(() => { throw new Error() })
    }

    const { writeAccountObject } = await import('../write-account-object.js')
    const result = await writeAccountObject({
      data: { foo: 'bar' },
      keys: {}
    }, Date.now())

    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 1 })
  })
})
