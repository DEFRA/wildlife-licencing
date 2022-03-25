/*
 * Mock the hapi request object
 */
const path = '/user/uuid/site/uuid'
const req = { path }

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn(() => ({ response: 'toolkit' }))
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6',
      applicationId: '1bfe075b-377e-472b-b160-a6a454648e23'
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
let getSite
let cache
const applicationJson = 'application/json'
describe('The getSiteBySiteId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache

    getSite = (await import('../get-site-by-site-id.js')).default
  })

  it('returns a site and status 200 from the cache', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    await getSite(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a site and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.sites = { findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } })) }
    await getSite(context, req, h)
    expect(models.sites.findByPk).toHaveBeenCalledWith(context.request.params.siteId)
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on site not found', async () => {
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    cache.restore = jest.fn(() => null)
    models.sites = { findByPk: jest.fn(() => null) }
    await getSite(context, req, h)
    expect(models.sites.findByPk).toHaveBeenCalledWith(context.request.params.siteId)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a status 404 on user not found', async () => {
    models.users = { findByPk: jest.fn(async () => null) }
    cache.restore = jest.fn(() => null)
    await getSite(context, req, h)
    expect(models.sites.findByPk).toHaveBeenCalledWith(context.request.params.siteId)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.sites = { findByPk: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getSite(context, req, h)
    }).rejects.toThrow()
  })
})
