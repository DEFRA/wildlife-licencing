jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = 'user-role/uuid/'
const req = {
  path
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
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

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      roleId: '2bf9a873-45b2-48a5-a9b4-ca07766804ae'
    }
  }
}

const applicationJson = 'application/json'

describe('The getUserRole handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 200 on successful fetch from the cache', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => JSON.stringify({
            id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
            name: 'ROLE-A'
          })
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({}))
    const getUserRole = (await import('../get-user-role-by-id.js')).default
    await getUserRole(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      name: 'ROLE-A'
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 on successful fetch', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null,
          save: mockSave
        }
      }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        userRoles: {
          findByPk: () => ({
            dataValues: {
              id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
              name: 'ROLE-B',
              ...ts
            }
          })
        }
      }
    }))

    const getUserRole = (await import('../get-user-role-by-id.js')).default
    await getUserRole(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      id: '2bf9a873-45b2-48a5-a9b4-ca07766804ae',
      name: 'ROLE-B',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith('user-role/uuid/', expect.objectContaining({ name: 'ROLE-B' }))
  })

  it('returns a 404 on role not found (no return)', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: () => null
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        userRoles: {
          findByPk: () => null
        }
      }
    }))
    const getUserRoleById = (await import('../get-user-role-by-id.js')).default
    await getUserRoleById(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an query error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const getUserRole = (await import('../get-user-role-by-id.js')).default
    await expect(async () => {
      await getUserRole(context, req, h)
    }).rejects.toThrow()
  })
})
