/*
 * Mock the hapi request object
 */

const path = 'user/uuid/sites'
const req = { path }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6'
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
let getSitesByUserId
let cache
const applicationJson = 'application/json'

describe('The getSitesByUserId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getSitesByUserId = (await import('../get-sites-by-user-id.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns an array of sites and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.users = { findByPk: jest.fn(async () => ({ foo: 'bar' })) }
    models.sites = { findAll: jest.fn(() => ([{ dataValues: { foo: 'bar', ...ts } }])) }
    await getSitesByUserId(context, req, h)
    expect(cache.restore).toHaveBeenCalledWith(path)
    expect(cache.save).toHaveBeenCalledWith(path, [{ foo: 'bar', ...tsR }])
    expect(models.sites.findAll).toHaveBeenCalledWith({ where: { userId: context.request.params.userId } })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of sites and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify([{ foo: 'bar' }]))
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    await getSitesByUserId(context, req, h)
    expect(cache.restore).toHaveBeenCalledWith(path)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on user not found', async () => {
    models.users = { findByPk: jest.fn(async () => null) }
    await getSitesByUserId(context, req, h)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn()
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { foo: 'bar' } })) }
    models.sites = { findByPk: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getSitesByUserId(context, req, h)
    }).rejects.toThrow()
  })
})
