const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

describe('delete-application-user-by-id-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns status 204 on a successful delete', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          destroy: jest.fn(() => 1)
        }
      }
    }))
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const deleteApplicationUser = (await import('../delete-application-user-by-id.js')).default
    await deleteApplicationUser(context, { }, h)
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns status 404 on a unsuccessful delete', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          destroy: jest.fn(() => 0)
        }
      }
    }))
    const mockDelete = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: mockDelete
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const deleteApplicationUser = (await import('../delete-application-user-by-id.js')).default
    await deleteApplicationUser(context, { }, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with any model error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          delete: jest.fn()
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          destroy: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const deleteApplicationUser = (await import('../delete-application-user-by-id.js')).default
    await expect(async () => {
      await deleteApplicationUser(context, { }, h)
    }).rejects.toThrow()
  })
})
