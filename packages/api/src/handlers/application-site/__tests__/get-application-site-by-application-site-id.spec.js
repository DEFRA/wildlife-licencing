/*
 * Mock the hapi request object
 */
const path = '/user/uuid/application-sites/uuid'
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
      userId: 'aac6b84d-0407-4f45-bb7e-ec855228fae6',
      applicationSiteId: '1bfe075b-377e-472b-b160-a6a454648e23'
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
let getApplicationSiteByApplicationSiteId
let cache
const applicationJson = 'application/json'
describe('The getApplicationByApplicationId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache

    getApplicationSiteByApplicationSiteId = (await import('../get-application-site-by-application-site-id.js')).default
  })

  it('returns an application-site and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    await getApplicationSiteByApplicationSiteId(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an application-site and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applicationSites = { findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } })) }
    await getApplicationSiteByApplicationSiteId(context, req, h)
    expect(models.applicationSites.findByPk).toHaveBeenCalledWith(context.request.params.applicationSiteId)
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on application-site not found', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applicationSites = { findByPk: jest.fn(() => null) }
    await getApplicationSiteByApplicationSiteId(context, req, h)
    expect(models.applicationSites.findByPk).toHaveBeenCalledWith(context.request.params.applicationSiteId)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a status 404 on user not found', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => null) }
    await getApplicationSiteByApplicationSiteId(context, req, h)
    expect(models.applicationSites.findByPk).toHaveBeenCalledWith(context.request.params.applicationSiteId)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn(() => null)
    models.users = { findByPk: jest.fn(async () => ({ dataValues: { id: 'bar' } })) }
    models.applicationSites = { findByPk: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getApplicationSiteByApplicationSiteId(context, req, h)
    }).rejects.toThrow()
  })
})
