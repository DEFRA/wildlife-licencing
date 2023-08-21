const encoded =
  '$argon2id$v=19$m=65536,t=3,p=4$wz5hrGPlM/7WF1LT42ocPA$tEdoPx7+k32UkHyI7hAIB6TEFwGaCVUaV0tiEHAA5bE'
jest.spyOn(console, 'error').mockImplementation(code => {})

describe('the authenticate user functions', () => {
  beforeEach(() => jest.resetModules())

  it('returns true if the user authenticates', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findAll: () => [{ password: encoded }]
        }
      }
    }))

    const context = {
      request: {
        params: {
          username: 'a@email.com',
          password: 'Aa1!HHHH'
        }
      }
    }

    const mockCode = jest.fn()
    const mockType = jest.fn().mockReturnValue({ code: mockCode })
    const mockResponse = jest.fn().mockReturnValue({ type: mockType })
    const h = { response: mockResponse }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockResponse).toHaveBeenCalledWith({ result: true })
  })

  it('returns false if the user does not authenticate', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findAll: () => [{ password: encoded }]
        }
      }
    }))

    const context = {
      request: {
        params: {
          username: 'a@email.com',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const mockCode = jest.fn()
    const mockType = jest.fn().mockReturnValue({ code: mockCode })
    const mockResponse = jest.fn().mockReturnValue({ type: mockType })
    const h = { response: mockResponse }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockResponse).toHaveBeenCalledWith({ result: false })
  })

  it('returns false if the user does not exist', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findAll: () => []
        }
      }
    }))

    const context = {
      request: {
        params: {
          username: 'a@email.com',
          password: 'Aa1!HHHHd'
        }
      }
    }
    const mockCode = jest.fn()
    const mockType = jest.fn().mockReturnValue({ code: mockCode })
    const mockResponse = jest.fn().mockReturnValue({ type: mockType })
    const h = { response: mockResponse }
    const authenticateUser = (await import('../authenticate-user.js')).default
    await authenticateUser(context, null, h)
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockResponse).toHaveBeenCalledWith({ result: false })
  })

  it('throws with a database error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        users: {
          findByPk: () => {
            throw new Error()
          }
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
    await expect(() => authenticateUser(context, null, {})).rejects.toThrow()
  })
})
