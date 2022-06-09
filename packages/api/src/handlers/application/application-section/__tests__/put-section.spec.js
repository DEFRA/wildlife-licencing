/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      userId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77'
    }
  }
}

const request = {
  path: 'path'
}

describe('put-section-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns a status 404 if no application found', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn()
        }
      }
    }))
    const { putSectionHandler } = await import('../put-section.js')
    await putSectionHandler('section-name')(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 200 response on a successful update, with a key function', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          delete: jest.fn()
        }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          fn: jest.fn(),
          col: jest.fn()
        })
      }
    }))

    const mockUpdate = jest.fn(() => [null, [
      {
        dataValues: {
          application: {
            'section-name': { foo: 'bar' }
          }
        }
      }
    ]])

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            dataValues: {
              application: { foo: 'bar' }
            }
          })),
          update: mockUpdate
        }
      }
    }))

    const mockSddsRemoveKeyFunction = jest.fn()
    const { putSectionHandler } = await import('../put-section.js')
    await putSectionHandler('section-name', () => '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064', mockSddsRemoveKeyFunction, a => ({ a: a[1].powerAppsKey }))(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', a: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', { a: '2ffae0ad-9d61-4b7c-b4d0-73ce828d9064', foo: 'bar' })
    expect(mockSddsRemoveKeyFunction).toHaveBeenCalledWith(request)
  })

  it('returns a 200 response on a successful update, with a key function, existing key', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          delete: jest.fn()
        }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          fn: jest.fn(),
          col: jest.fn()
        })
      }
    }))

    const mockUpdate = jest.fn(() => [null, [
      {
        dataValues: {
          application: {
            'section-name': { foo: 'bar' }
          }
        }
      }
    ]])

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            dataValues: {
              application: { foo: 'bar' },
              targetKeys: [{ apiBasePath: 'application.section-name', powerAppsKey: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' }]
            }
          })),
          update: mockUpdate
        }
      }
    }))

    const mockSddsRemoveKeyFunction = jest.fn()
    const { putSectionHandler } = await import('../put-section.js')
    await putSectionHandler('section-name', () => 'c9f70b15-15d5-ec11-a7b5-0022481a8a39', mockSddsRemoveKeyFunction, () => ({ a: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' }))(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', a: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', { a: 'c9f70b15-15d5-ec11-a7b5-0022481a8a39', foo: 'bar' })
    expect(mockSddsRemoveKeyFunction).toHaveBeenCalledWith(request)
  })

  it('returns a 200 response on a successful update, without a key function', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave,
          delete: jest.fn()
        }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          fn: jest.fn(),
          col: jest.fn()
        })
      }
    }))

    const mockUpdate = jest.fn(() => [null, [
      {
        dataValues: {
          application: {
            'section-name': { foo: 'bar' }
          }
        }
      }
    ]])

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            dataValues: {
              application: { foo: 'bar' },
              targetKeys: []
            }
          })),
          update: mockUpdate
        }
      }
    }))
    const { putSectionHandler } = await import('../put-section.js')
    const mockRemove = jest.fn()
    await putSectionHandler('section-name', null, null, null, mockRemove)(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', { foo: 'bar' })
    expect(mockRemove).toHaveBeenCalledWith([])
  })

  it('throws on a database error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { putSectionHandler } = await import('../put-section.js')
    await expect(async () => {
      await putSectionHandler('section-name')(context, request, h)
    }).rejects.toThrow()
  })
})
