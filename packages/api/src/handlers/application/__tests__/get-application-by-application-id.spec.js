/*
 * Mock the hapi request object
 */
const path = '/user/uuid/application/uuid'
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
let cache
const applicationJson = 'application/json'
describe('The getApplicationByApplicationId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    cache = (await import('../../../services/cache.js')).cache
  })

  it('returns an application and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    const getApplication = (await import('../application.js')).getApplicationByApplicationId()
    await getApplication(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an application and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.applications = { findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } })) }
    const getApplication = (await import('../application.js')).getApplicationByApplicationId()
    await getApplication(context, req, h)
    expect(models.applications.findByPk).toHaveBeenCalledWith(context.request.params.applicationId)
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on not found', async () => {
    cache.restore = jest.fn(() => null)
    models.applications = { findByPk: jest.fn(() => null) }
    const getApplication = (await import('../application.js')).getApplicationByApplicationId()
    await getApplication(context, req, h)
    expect(models.applications.findByPk).toHaveBeenCalledWith(context.request.params.applicationId)
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn(() => null)
    models.applications = { findByPk: jest.fn(() => { throw new Error() }) }
    const getApplication = (await import('../application.js')).getApplicationByApplicationId()
    await expect(async () => {
      await getApplication(context, req, h)
    }).rejects.toThrow()
  })
})
