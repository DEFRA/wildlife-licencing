describe('The application extract processor: write-object', () => {
  beforeEach(() => jest.resetModules())

  it('makes an update on a found, pending application with a timestamp older than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.applications = {
      findAll: jest.fn(() => ([{
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'P',
          updatedAt: Date.parse('01 Jan 2020 00:00:00 GMT')
        }
      }])),
      update: mockUpdate
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    }, Date.now())
    expect(mockUpdate).toHaveBeenCalledWith({
      application: { foo: 'bar' },
      updateStatus: 'U',
      targetKeys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    },
    {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('makes an update on a found, unlocked application', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.applications = {
      findAll: jest.fn(() => ([{
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'U',
          updatedAt: Date.now()
        }
      }])),
      update: mockUpdate
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    }, Date.now())
    expect(mockUpdate).toHaveBeenCalledWith({
      application: { foo: 'bar' },
      updateStatus: 'U',
      targetKeys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    },
    {
      returning: false,
      where: {
        id: '9487013e-abf5-4f42-95fa-15ad404570a1'
      }
    })

    expect(result).toEqual({ insert: 0, pending: 0, update: 1, error: 0 })
  })

  it('does not make an update on a found, pending application with a timestamp newer than the extract', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockUpdate = jest.fn()

    models.applications = {
      findAll: jest.fn(() => ([{
        dataValues: {
          id: '9487013e-abf5-4f42-95fa-15ad404570a1',
          updateStatus: 'P',
          updatedAt: Date.now()
        }
      }])),
      update: mockUpdate
    }

    const extractDate = new Date()
    extractDate.setSeconds(extractDate.getSeconds() - 2)

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    }, extractDate)
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ insert: 0, pending: 1, update: 0, error: 0 })
  })

  it('makes an insert on a not-found application', async () => {
    const { models } = await import('@defra/wls-database-model')
    const mockCreate = jest.fn()

    models.applications = {
      findAll: jest.fn(() => ([])),
      create: mockCreate
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    }, Date.now())
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      application: { foo: 'bar' },
      updateStatus: 'U',
      targetKeys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      },
      sdds_application_id: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
    })

    expect(result).toEqual({ insert: 1, pending: 0, update: 0, error: 0 })
  })

  it('records an error on an exception', async () => {
    const { models } = await import('@defra/wls-database-model')

    models.applications = {
      findAll: jest.fn(() => { throw new Error() })
    }

    const { writeApplicationObject } = await import('../write-application-object.js')
    const result = await writeApplicationObject({
      data: { foo: 'bar' },
      keys: {
        sdds_applications: {
          eid: 'e0eb1ba9-0cc2-4bf1-92a9-68ec1d7c2626'
        }
      }
    }, Date.now())

    expect(result).toEqual({ insert: 0, pending: 0, update: 0, error: 1 })
  })
})
