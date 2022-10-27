const encoded = '$argon2id$v=19$m=65536,t=3,p=4$wz5hrGPlM/7WF1LT42ocPA$tEdoPx7+k32UkHyI7hAIB6TEFwGaCVUaV0tiEHAA5bE'
jest.spyOn(console, 'error').mockImplementation(code => {})

describe('the authenticate user functions', () => {
  beforeEach(() => jest.resetModules())

  it('returns 200 if the user authenticates', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => ({
            password: encoded
          })
        }
      }
    }))

    const mockCode = jest.fn()
    const context = {
      request: {
        params: {
          userId: 'uid',
          password: 'Aa1!HHHH'
        }
      }
    }
    const h = {
      response: () => ({
        code: mockCode
      })
    }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(200)
  })

  it('returns 401 if the user does not authenticate', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => ({
            password: encoded
          })
        }
      }
    }))

    const mockCode = jest.fn()
    const context = {
      request: {
        params: {
          userId: 'uid',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const h = {
      response: () => ({
        code: mockCode
      })
    }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(401)
  })

  it('returns 401 if the user cannot authenticate', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => ({
          })
        }
      }
    }))

    const mockCode = jest.fn()
    const context = {
      request: {
        params: {
          userId: 'uid',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const h = {
      response: () => ({
        code: mockCode
      })
    }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(401)
  })

  it('returns 404 if the user not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => null
        }
      }
    }))

    const mockCode = jest.fn()
    const context = {
      request: {
        params: {
          userId: 'uid',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const h = {
      response: () => ({
        code: mockCode
      })
    }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(404)
  })

  it('throws with a database error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const context = {
      request: {
        params: {
          userId: 'uid',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await expect(() => authenticateUser(context, null, { })).rejects.toThrow()
  })
})
