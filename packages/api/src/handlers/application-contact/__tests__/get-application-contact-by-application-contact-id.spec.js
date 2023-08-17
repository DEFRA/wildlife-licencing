/*
 * Mock the hapi request object
 */
const path = '/application-contacts/uuid'
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
      applicationContactId: '1bfe075b-377e-472b-b160-a6a454648e23'
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
let getApplicationContactByApplicationContactId
let cache
const applicationJson = 'application/json'
describe('The getApplicationContactByApplicationContactId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache

    getApplicationContactByApplicationContactId = (
      await import('../get-application-contact-by-application-contact-id.js')
    ).default
  })

  it('returns an application-contact and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    await getApplicationContactByApplicationContactId(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns an application-contact and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.applicationContacts = {
      findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } }))
    }
    await getApplicationContactByApplicationContactId(context, req, h)
    expect(models.applicationContacts.findByPk).toHaveBeenCalledWith(
      context.request.params.applicationContactId
    )
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on application-contact not found', async () => {
    cache.restore = jest.fn(() => null)
    models.applicationContacts = { findByPk: jest.fn(() => null) }
    await getApplicationContactByApplicationContactId(context, req, h)
    expect(models.applicationContacts.findByPk).toHaveBeenCalledWith(
      context.request.params.applicationContactId
    )
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on a query error', async () => {
    cache.restore = jest.fn(() => null)
    models.applicationContacts = {
      findByPk: jest.fn(() => {
        throw new Error()
      })
    }
    await expect(async () => {
      await getApplicationContactByApplicationContactId(context, req, h)
    }).rejects.toThrow()
  })
})
