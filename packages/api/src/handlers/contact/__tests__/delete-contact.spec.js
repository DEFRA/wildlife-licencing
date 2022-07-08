/*
 * Mock the hapi request object
 */
const path = 'contact/uuid'
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
      contactId: '1bfe075b-377e-472b-b160-a6a454648e23'
    }
  }
}

jest.mock('@defra/wls-database-model')

let models
let deleteContact
let cache

describe('The deleteApplication handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
    deleteContact = (await import('../delete-contact.js')).default
  })

  it('returns a 204 on successful delete', async () => {
    cache.delete = jest.fn()
    models.applicationContacts = { findAll: jest.fn(() => []) }
    models.contacts = { destroy: jest.fn(() => 1) }
    await deleteContact(context, req, h)
    expect(models.contacts.destroy).toHaveBeenCalledWith({ where: { id: context.request.params.contactId } })
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on id not found', async () => {
    cache.delete = jest.fn()
    models.applicationContacts = { findAll: jest.fn(() => []) }
    models.contacts = { destroy: jest.fn(() => 0) }
    await deleteContact(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns a 409 conflict if has application-contact', async () => {
    cache.delete = jest.fn()
    models.applicationContacts = { findAll: jest.fn(() => [{}]) }
    await deleteContact(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(409)
  })

  it('returns a 500 with an unexpected database error', async () => {
    cache.delete = jest.fn()
    models.applicationContacts = { findAll: jest.fn(() => []) }
    models.contacts = { destroy: jest.fn(() => { throw Error() }) }
    await expect(async () => {
      await deleteContact(context, req, h)
    }).rejects.toThrow()
  })
})
