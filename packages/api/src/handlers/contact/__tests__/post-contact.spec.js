/*
 * Mock the hapi request object
 */
const path = 'contact'
const req = {
  path,
  payload: {
    fullName: 'Frank Sinatra',
    address: {
      houseNumber: 'The fields',
      addrline1: 'Winscombe',
      county: 'Somerset',
      postcode: 'bs25 2ZZ'
    }
  }
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
const context = { request: {} }

jest.mock('@defra/wls-database-model')

let models
let postContact
let cache
const applicationJson = 'application/json'

describe('The postContact handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    postContact = (await import('../post-contact.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.contacts = {
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn(() => null)
    await postContact(context, req, h)
    expect(models.contacts.create).toHaveBeenCalledWith({
      id: expect.any(String),
      updateStatus: 'L',
      contact: (({ ...l }) => l)(req.payload)
    })
    expect(cache.save).toHaveBeenCalledWith('/contact/bar', {
      id: 'bar',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 201 on successful create with clone and user', async () => {
    models.contacts = {
      create: jest.fn(async () => ({ dataValues: { id: 'bar', ...ts } }))
    }
    cache.save = jest.fn(() => null)
    Object.assign(req.payload, {
      cloneOf: 'clone-id',
      userId: 'user-id'
    })
    await postContact(
      context,
      Object.assign(req, {
        cloneOf: 'clone-id',
        userId: 'user-id'
      }),
      h
    )
    expect(models.contacts.create).toHaveBeenCalledWith({
      id: expect.any(String),
      updateStatus: 'L',
      cloneOf: 'clone-id',
      userId: 'user-id',
      contact: expect.any(Object)
    })
    expect(cache.save).toHaveBeenCalledWith('/contact/bar', {
      id: 'bar',
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({ id: 'bar', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('throws with an insert error', async () => {
    cache.save = jest.fn(() => null)
    models.contacts = {
      create: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await postContact(context, req, h)
    }).rejects.toThrow()
  })
})
