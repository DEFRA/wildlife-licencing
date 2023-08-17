/*
 * Mock the hapi request object
 */
const path = '/contact/uuid'
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
let getContact
let cache
const applicationJson = 'application/json'
describe('The getContactByContactId handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache

    getContact = (await import('../get-contact-by-contact-id.js')).default
  })

  it('returns a contact and status 200 from the cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify({ foo: 'bar' }))
    await getContact(context, req, h)
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar' })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a contact and status 200 from the database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn(() => null)
    models.contacts = {
      findByPk: jest.fn(() => ({ dataValues: { foo: 'bar', ...ts } }))
    }
    await getContact(context, req, h)
    expect(models.contacts.findByPk).toHaveBeenCalledWith(
      context.request.params.contactId
    )
    expect(cache.save).toHaveBeenCalledWith(path, { foo: 'bar', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ foo: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a status 404 on contact not found', async () => {
    cache.restore = jest.fn(() => null)
    models.contacts = { findByPk: jest.fn(() => null) }
    await getContact(context, req, h)
    expect(models.contacts.findByPk).toHaveBeenCalledWith(
      context.request.params.contactId
    )
    expect(h.response).toHaveBeenCalled()
    expect(codeFunc).toHaveBeenCalledWith(404)
  })
})
