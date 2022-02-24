describe('The application extract processor: write-application-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found, pending application with a timestamp older than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_APPLICATION = { foo: 'bar' }

    models.applications = {
      findOne: jest.fn(() => ({
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'P',
          updatedAt: Date.parse('01 Jan 2020 00:00:00 GMT'),
          application: TEST_APPLICATION
        }
      })),
      update: mockUpdate
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const keysArr = [
      {
        apiTable: 'applications',
        apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
        powerAppsTable: 'sdds_applications',
        powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
      }]

    const result = await writeApplicationObject({
      data: { application: TEST_APPLICATION },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      application: TEST_APPLICATION,
      updateStatus: 'U',
      targetKeys: keysArr
    }, {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('makes an update on a found, unlocked application (if data change)', async () => {
    const TEST_APPLICATION = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.applications = {
      findOne: jest.fn(() => ({
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'U',
          updatedAt: Date.now(),
          application: Object.assign({}, TEST_APPLICATION, { new: 'thing' })
        }
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'applications',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'sdds_applications',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeApplicationObject } = await import('../write-application-object.js')

    const result = await writeApplicationObject({
      data: { application: TEST_APPLICATION },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      application: TEST_APPLICATION,
      updateStatus: 'U',
      targetKeys: keysArr
    }, {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('does not make an update on a found, unlocked application (if no data change)', async () => {
    const TEST_APPLICATION = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.applications = {
      findOne: jest.fn(() => ({
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'U',
          updatedAt: Date.now(),
          application: TEST_APPLICATION
        }
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'applications',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'sdds_applications',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeApplicationObject } = await import('../write-application-object.js')

    const result = await writeApplicationObject({
      data: { application: TEST_APPLICATION },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 0 })
  })

  it('does not make an update on a found, pending application with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_APPLICATION = { foo: 'bar' }
    models.applications = {
      findOne: jest.fn(() => ({
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'P',
          updatedAt: Date.now(),
          application: Object.assign({}, TEST_APPLICATION, { new: 'thing' })
        }
      })),
      update: mockUpdate
    }
    const keysArr = [{
      apiTable: 'applications',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'sdds_applications',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const extractDate = new Date()
    extractDate.setSeconds(extractDate.getSeconds() - 2)

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { application: TEST_APPLICATION },
      keys: keysArr
    }, extractDate)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 1, update: 0, error: 0 })
  })

  it('makes an insert on a not-found application', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    const TEST_APPLICATION = { foo: 'bar' }

    models.applications = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }

    const keysArr = [{
      apiTable: 'applications',
      apiKey: null,
      powerAppsTable: 'sdds_applications',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { application: TEST_APPLICATION },
      keys: keysArr
    }, Date.now())

    const newKeysArray = [
      Object.assign({}, { apiKey: expect.any(String) }, keysArr[0])
    ]

    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      application: TEST_APPLICATION,
      updateStatus: 'U',
      targetKeys: newKeysArray,
      sddsApplicationId: '743da832-786d-ec11-8943-000d3a86e24e'
    })

    expect(result).toEqual({ insert: 1, pending: 0, update: 0, error: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')

    models.applications = {
      findOne: jest.fn(() => { throw new Error() })
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {}
    }, Date.now())

    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 1 })
  })
})
