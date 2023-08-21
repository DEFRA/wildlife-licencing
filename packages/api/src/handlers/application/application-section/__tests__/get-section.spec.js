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
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
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
    const mockRestore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
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
    const { getSectionHandler } = await import('../get-section.js')
    await getSectionHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
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
    const { getSectionHandler } = await import('../get-section.js')
    await getSectionHandler('section-name')(context, request, h)
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
          findByPk: jest.fn(() => ({
            dataValues: {
              application: {
                'section-name': { foo: 'bar' }
              }
            }
          }))
        }
      }
    }))
    const { getSectionHandler } = await import('../get-section.js')
    await getSectionHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('path', { foo: 'bar' })
  })

  it('returns a status 200 with no section data', async () => {
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
          findByPk: jest.fn(() => ({
            dataValues: {
              application: {}
            }
          }))
        }
      }
    }))
    const { getSectionHandler } = await import('../get-section.js')
    await getSectionHandler('section-name')(context, request, h)
    expect(h.response).toHaveBeenCalledWith({})
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).not.toHaveBeenCalledWith()
  })

  it('returns a status 200 with augmented key data', async () => {
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
          findByPk: jest.fn(() => ({
            dataValues: {
              application: {},
              targetKeys: { foo: 'bar' }
            }
          }))
        }
      }
    }))
    const { getSectionHandler } = await import('../get-section.js')
    await getSectionHandler('section-name', a => a)(context, request, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).not.toHaveBeenCalledWith({ foo: 'bar' })
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
          findByPk: jest.fn(() => {
            throw new Error()
          })
        }
      }
    }))
    const { getSectionHandler } = await import('../get-section.js')
    await expect(async () => {
      await getSectionHandler('section-name')(context, request, h)
    }).rejects.toThrow()
  })
})
