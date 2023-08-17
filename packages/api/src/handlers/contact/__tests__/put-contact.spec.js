/*
 * Mock the hapi request object
 */
const path = 'contact/uuid'
const req = {
  path,
  payload: {
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions'
  }
}

const req2 = {
  path,
  payload: {
    userId: 'user-id',
    cloneOf: 'clone-id',
    proposalDescription: 'a proposal',
    detailsOfConvictions: 'convictions'
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = {
  request: {
    params: {
      contactId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
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
let putContact
let cache
const applicationJson = 'application/json'

describe('The putContact handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putContact = (await import('../put-contact.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => [
        {
          dataValues: {
            id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
            ...ts
          }
        },
        true
      ])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putContact(context, req, h)
    expect(models.contacts.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        updateStatus: 'L',
        contact: (({ ...l }) => l)(req.payload)
      },
      where: {
        id: context.request.params.contactId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.contactId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.contactId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 201 on successful create with clone and UserId', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => [
        {
          dataValues: {
            id: '1e470963-e8bf-41f5-9b0b-52d19c21cb78',
            ...ts
          }
        },
        true
      ])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putContact(context, req2, h)
    expect(models.contacts.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        updateStatus: 'L',
        contact: expect.any(Object),
        userId: 'user-id',
        cloneOf: 'clone-id'
      },
      where: {
        id: context.request.params.contactId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.contactId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.contactId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => [{}, false]),
      update: jest.fn(async () => [
        1,
        [
          {
            dataValues: {
              id: context.request.params.contactId,
              ...ts
            }
          }
        ]
      ])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putContact(context, req, h)
    expect(models.contacts.update).toHaveBeenCalledWith(
      {
        updateStatus: 'L',
        contact: (({ ...l }) => l)(req.payload),
        userId: null
      },
      { returning: true, where: { id: context.request.params.contactId } }
    )
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.contactId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.contactId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 200 with an existing key with clone and UserId', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => [{}, false]),
      update: jest.fn(async () => [
        1,
        [
          {
            dataValues: {
              id: context.request.params.contactId,
              ...ts
            }
          }
        ]
      ])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putContact(context, req2, h)
    expect(models.contacts.update).toHaveBeenCalledWith(
      {
        updateStatus: 'L',
        contact: expect.any(Object),
        userId: 'user-id',
        cloneOf: 'clone-id'
      },
      { returning: true, where: { id: context.request.params.contactId } }
    )
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.contactId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.contactId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws with an insert query error', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await putContact(context, req, h)
    }).rejects.toThrow()
  })

  it('throws with an update query error', async () => {
    models.contacts = {
      findOrCreate: jest.fn(async () => [{}, false]),
      update: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await putContact(context, req, h)
    }).rejects.toThrow()
  })
})
