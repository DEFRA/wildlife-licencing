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

describe('delete-section-handler', () => {
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
    const { deleteSectionHandler } = await import('../delete-section.js')
    await deleteSectionHandler('section-name')(context, request, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a status 204 and deletes section data', async () => {
    const mockQuery = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: jest.fn(),
          save: jest.fn()
        }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          QueryTypes: { UPDATE: 'UPDATE' },
          query: mockQuery
        })
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            dataValues: {
              application: { foo: 'bar' },
              targetKeys: null
            }
          }))
        }
      }
    }))
    const { deleteSectionHandler } = await import('../delete-section.js')
    await deleteSectionHandler('section-name')(context, request, h)
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE applications SET application = application::jsonb - 'section-name'" +
        ' WHERE id = ?',
      { replacements: ['1e470963-e8bf-41f5-9b0b-52d19c21cb78'], type: 'UPDATE' }
    )
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a status 204 and deletes section data and removes keys', async () => {
    const mockQuery = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: jest.fn(),
          save: jest.fn()
        }
      },
      SEQUELIZE: {
        getSequelize: () => ({
          QueryTypes: { UPDATE: 'UPDATE' },
          query: mockQuery
        })
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: jest.fn(() => ({
            dataValues: {
              application: { foo: 'bar' },
              targetKeys: { keys: 'key' }
            }
          }))
        }
      }
    }))
    const { deleteSectionHandler } = await import('../delete-section.js')
    await deleteSectionHandler('section-name', () => [{ old: 'key' }])(
      context,
      request,
      h
    )
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE applications SET application = application::jsonb - 'section-name' WHERE id = ?",
      { replacements: ['1e470963-e8bf-41f5-9b0b-52d19c21cb78'], type: 'UPDATE' }
    )
    expect(codeFunc).toHaveBeenCalledWith(204)
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
    const { deleteSectionHandler } = await import('../delete-section.js')
    await expect(async () => {
      await deleteSectionHandler('section-name')(context, request, h)
    }).rejects.toThrow()
  })
})
