describe('The contact extract processor: write-contact-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found, pending contact with a timestamp older than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_CONTACT = { foo: 'bar' }

    models.contacts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: Date.parse('01 Jan 2020 00:00:00 GMT'),
        contact: TEST_CONTACT
      })),
      update: mockUpdate
    }

    const { writeContactObject } = await import('../write-contact-object.js')
    const keysArr = [
      {
        apiTable: 'contacts',
        apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
        powerAppsTable: 'contacts',
        powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
      }]

    const result = await writeContactObject({
      data: { contacts: TEST_CONTACT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      contact: TEST_CONTACT,
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
    const TEST_CONTACT = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.contacts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: Date.now(),
        contact: Object.assign({}, TEST_CONTACT, { new: 'thing' })
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'contacts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'contacts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeContactObject } = await import('../write-contact-object.js')

    const result = await writeContactObject({
      data: { contacts: TEST_CONTACT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).toHaveBeenCalledWith({
      contact: TEST_CONTACT,
      updateStatus: 'U'
    }, {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('does not make an update on a found, unlocked contact (if no data change)', async () => {
    const TEST_CONTACT = { foo: 'bar' }
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.contacts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'U',
        updatedAt: Date.now(),
        contact: TEST_CONTACT
      })),
      update: mockUpdate
    }

    const keysArr = [{
      apiTable: 'contacts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'contacts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeContactObject } = await import('../write-contact-object.js')

    const result = await writeContactObject({
      data: { contacts: TEST_CONTACT },
      keys: keysArr
    }, Date.now())

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 0 })
  })

  it('does not make an update on a found, pending contact with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()
    const TEST_CONTACT = { foo: 'bar' }
    models.contacts = {
      findOne: jest.fn(() => ({
        id: '9487013e-abf5-4f42-95fa-15ad404570a1',
        updateStatus: 'P',
        updatedAt: Date.now(),
        application: Object.assign({}, TEST_CONTACT, { new: 'thing' })
      })),
      update: mockUpdate
    }
    const keysArr = [{
      apiTable: 'contacts',
      apiKey: '070d5df6-00c8-4080-91fc-284887a4b3b9',
      powerAppsTable: 'contacts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const extractDate = new Date()
    extractDate.setSeconds(extractDate.getSeconds() - 2)

    const { writeContactObject } = await import('../write-contact-object.js')
    const result = await writeContactObject({
      data: { contacts: TEST_CONTACT },
      keys: keysArr
    }, extractDate)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 1, update: 0, error: 0 })
  })

  it('makes an insert on a not-found contact', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()
    const TEST_CONTACT = { foo: 'bar' }

    models.contacts = {
      findOne: jest.fn(() => null),
      create: mockCreate
    }

    const keysArr = [{
      apiTable: 'contacts',
      apiKey: null,
      powerAppsTable: 'contacts',
      powerAppsKey: '743da832-786d-ec11-8943-000d3a86e24e'
    }]

    const { writeContactObject } = await import('../write-contact-object.js')
    const result = await writeContactObject({
      data: { contacts: TEST_CONTACT },
      keys: keysArr
    }, Date.now())

    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      contact: TEST_CONTACT,
      updateStatus: 'U',
      sddsContactId: '743da832-786d-ec11-8943-000d3a86e24e'
    })

    expect(result).toEqual({ insert: 1, pending: 0, update: 0, error: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')

    models.contacts = {
      findOne: jest.fn(() => { throw new Error() })
    }

    const { writeContactObject } = await import('../write-contact-object.js')
    const result = await writeContactObject({
      data: { foo: 'bar' },
      keys: {}
    }, Date.now())

    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 1 })
  })
})
