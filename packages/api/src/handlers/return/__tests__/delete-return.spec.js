jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f'
const req = {
  path
}

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
      licenceId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
      returnId: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
    }
  }
}

describe('The deleteReturn handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 204 on a successful delete', async () => {
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))

    const mockDestroy = jest.fn(() => 1)
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        returns: {
          destroy: mockDestroy
        }
      }
    }))

    const deleteReturn = (await import('../delete-return.js')).default
    await deleteReturn(context, req, h)
    expect(mockDelete).toHaveBeenCalledWith('/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f')
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on nothing deleted', async () => {
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))

    const mockDestroy = jest.fn(() => 0)
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
        },
        returns: {
          destroy: mockDestroy
        }
      }
    }))

    const deleteReturn = (await import('../delete-return.js')).default
    await deleteReturn(context, req, h)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 404 on licence not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => null
        }
      }
    }))
    const deleteReturn = (await import('../delete-return.js')).default
    await deleteReturn(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const deleteReturn = (await import('../delete-return.js')).default
    await expect(async () => {
      await deleteReturn(context, req, h)
    }).rejects.toThrow()
  })
})
