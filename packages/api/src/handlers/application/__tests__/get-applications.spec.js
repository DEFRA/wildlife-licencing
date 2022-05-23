/*
 * Mock the hapi request object
 */
const path = 'applications'
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
let getApplication
let cache
const applicationJson = 'application/json'

describe('The getApplication handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplication = (await import('../get-applications.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns an array of applications and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applications = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplication({ }, { query: null, path }, h)
    expect(cache.restore).toHaveBeenCalledWith(path)
    expect(cache.save).toHaveBeenCalledWith(path, [{ foo: 'bar', ...tsR }])
    expect(models.applications.findAll).toHaveBeenCalledWith({ })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of applications and status 200 from the database with a query', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applications = {
      findAll: jest.fn(() => [{ dataValues: { foo: 'bar', ...ts } }])
    }
    await getApplication({ }, { query: { role: 'USER', userId: '6877f11b-3755-49bc-8a15-9070c756d1ad' }, path }, h)
    const qstr = `${path}?role=USER&userId=6877f11b-3755-49bc-8a15-9070c756d1ad`
    expect(cache.restore).toHaveBeenCalledWith(qstr)
    expect(cache.save).toHaveBeenCalledWith(qstr, [{ foo: 'bar', ...tsR }])
    expect(models.applications.findAll).toHaveBeenCalledWith({
      include: {
        attributes: [],
        where: {
          role: 'USER',
          userId: '6877f11b-3755-49bc-8a15-9070c756d1ad'
        }
      }
    })
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar', ...tsR }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an array of applications and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify([{ foo: 'bar' }]))
    await getApplication({ }, req, h)
    expect(cache.restore).toHaveBeenCalledWith(path)
    expect(h.response).toHaveBeenCalledWith([{ foo: 'bar' }])
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn()
    models.applications = { findAll: jest.fn(() => { throw new Error() }) }
    await expect(async () => {
      await getApplication({ }, req, h)
    }).rejects.toThrow()
  })
})
