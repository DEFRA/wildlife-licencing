/*
 * Mock the hapi request object
 */
const path = 'user-user-role/uuid'
const req = {
  path,
  payload: {
    userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
    userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
  }
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
      userUserRoleId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
    }
  }
}

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

jest.mock('@defra/wls-database-model')

let models
let putUserUserRole
let cache
const applicationJson = 'application/json'

describe('The putUserUserRole handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putUserUserRole = (await import('../put-user-user-role.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.userUserRoles = {
      findOrCreate: jest.fn(async () => [{
        dataValues: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
          userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
          ...ts
        }
      }, true])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putUserUserRole(context, req, h)
    expect(models.userUserRoles.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
        userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
      },
      where: {
        id: context.request.params.userUserRoleId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.userUserRoleId,
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.userUserRoleId,
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.userUserRoles = {
      findOrCreate: jest.fn(async () => ([{
        dataValues: {
          userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
          userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
          ...ts
        }
      }, false]))
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putUserUserRole(context, req, h)
    expect(models.userUserRoles.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
        userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
        userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
      },
      where: {
        id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      userId: '6829ad54-bab7-4a78-8ca9-dcf722117a45',
      userRoleId: '739f4e35-9e06-4585-b52a-c4144d94f7f7',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(202)
  })

  it('throws with an query error', async () => {
    models.userUserRoles = { findOrCreate: jest.fn(async () => { throw new Error() }) }
    await expect(async () => {
      await putUserUserRole(context, req, h)
    }).rejects.toThrow()
  })
})
