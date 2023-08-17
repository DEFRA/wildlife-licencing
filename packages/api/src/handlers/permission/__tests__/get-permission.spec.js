/*
 * Mock the hapi request object
 */
const path = '/application/uuid/permission/uuid'
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
      applicationId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      permissionId: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let getPermission
let cache
const applicationJson = 'application/json'

describe('The getPermission handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getPermission = (await import('../get-permission.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 200 on successful fetch', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' }))
    }
    models.permissions = {
      findByPk: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    await getPermission(context, req, h)

    expect(cache.save).toHaveBeenCalledWith(
      '/application/uuid/permission/uuid',
      { id: 'bar', ...tsR }
    )
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 on successful fetch from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ id: 'bar', ...ts }))
    await getPermission(context, req, h)

    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on permission not found', async () => {
    models.applications = {
      findByPk: jest.fn(() => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' }))
    }
    models.permissions = {
      findByPk: jest.fn(async () => null)
    }
    cache.restore = jest.fn(() => null)
    await getPermission(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 404 on application not found', async () => {
    models.applications = {
      findByPk: jest.fn(() => null)
    }
    cache.restore = jest.fn(() => null)
    await getPermission(context, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    cache.restore = jest.fn(() => null)
    models.applications = {
      findByPk: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await getPermission(context, req, h)
    }).rejects.toThrow()
  })
})
