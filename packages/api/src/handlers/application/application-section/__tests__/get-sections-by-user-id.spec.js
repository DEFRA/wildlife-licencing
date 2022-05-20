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

describe('get-section-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns a response from the cache with a status 200', async () => {
    const mockRestore = jest.fn(() => JSON.stringify([{ foo: 'bar' }]))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: mockRestore
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
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await getSectionsByUserIdHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns a status 404 if no applications found', async () => {
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
          findAll: jest.fn(() => [])
        }
      }
    }))
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await getSectionsByUserIdHandler('section-name')(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a status 200 with the section data', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(),
          save: mockSave
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [{
            dataValues: {
              application: {
                'section-name': { foo: 'bar' }
              },
              targetKeys: null
            }
          }])
        }
      }
    }))
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await getSectionsByUserIdHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', [{ foo: 'bar' }])
  })

  it('returns a status 200 with the section data with target keys', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(),
          save: mockSave
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [{
            dataValues: {
              application: {
                'section-name': { foo: 'bar' }
              },
              targetKeys: [
                { foo: 'bar' }
              ]
            }
          }])
        }
      }
    }))
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await getSectionsByUserIdHandler('section-name', () => ({ key: 'data' }))(context, request, h)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', key: 'data' }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', [{ foo: 'bar', key: 'data' }])
  })

  it('returns a status 404 with no section data', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(),
          save: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findAll: jest.fn(() => [{
            dataValues: {
              application: {}
            }
          }])
        }
      }
    }))
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await getSectionsByUserIdHandler('section-name')(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
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
          findAll: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const { getSectionsByUserIdHandler } = await import('../get-sections-by-user-id.js')
    await expect(async () => {
      await getSectionsByUserIdHandler('section-name')(context, request, h)
    }).rejects.toThrow()
  })
})
