const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}
const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

describe('get-application-user-by-id-handler', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns the result from the cache', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
      }
    }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => JSON.stringify({
            userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
            applicationId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
            role: 'USER'
          }))
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const getApplicationUser = (await import('../get-application-user-by-id.js')).default
    await getApplicationUser(context, { }, h)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(h.response).toHaveBeenCalledWith({
      userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
      applicationId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
      role: 'USER'
    })
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns the result from the database', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          findByPk: jest.fn(() => ({
            dataValues: {
              userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
              applicationId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
              id: 'eb14153e-7425-4e4c-bcc4-acd8ee1933c3',
              role: 'USER',
              ...ts
            }
          }))
        }
      }
    }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null),
          save: mockSave
        }
      }
    }))
    const mockSave = jest.fn()
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const getApplicationUser = (await import('../get-application-user-by-id.js')).default
    await getApplicationUser(context, { }, h)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(h.response).toHaveBeenCalledWith({
      id: 'eb14153e-7425-4e4c-bcc4-acd8ee1933c3',
      userId: '1ee0737e-f97d-4f79-8225-81b6014ce37e',
      applicationId: 'bbe0a988-2efe-41d5-901d-cad600fef2fd',
      role: 'USER',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith('application/json')
    expect(mockSave).toHaveBeenCalledWith('/application-user/1ee0737e-f97d-4f79-8225-81b6014ce37e', expect.any(Object))
  })

  it('returns a status 404 if no application-user found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null)
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const getApplicationUser = (await import('../get-application-user-by-id.js')).default
    await getApplicationUser(context, { }, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('throws with any model error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: jest.fn(),
          restore: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationUsers: {
          findByPk: jest.fn(() => { throw new Error() })
        }
      }
    }))
    const context = { request: { params: { applicationUserId: '1ee0737e-f97d-4f79-8225-81b6014ce37e' } } }
    const getApplicationUser = (await import('../get-application-user-by-id.js')).default
    await expect(async () => {
      await getApplicationUser(context, { }, h)
    }).rejects.toThrow()
  })
})
