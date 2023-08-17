/*
 * Mock the hapi request object
 */
const path = 'account/uuid'
const req = {
  path,
  payload: {
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
      accountId: '1e470963-e8bf-41f5-9b0b-52d19c21cb78'
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
let putAccount
let cache
const applicationJson = 'application/json'

describe('The putAccount handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    putAccount = (await import('../put-account.js')).default
    const REDIS = (await import('@defra/wls-connectors-lib')).REDIS
    cache = REDIS.cache
  })

  it('returns a 201 on successful create', async () => {
    models.accounts = {
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
    await putAccount(context, req, h)
    expect(models.accounts.findOrCreate).toHaveBeenCalledWith({
      defaults: {
        id: expect.any(String),
        updateStatus: 'L',
        account: (({ ...l }) => l)(req.payload)
      },
      where: {
        id: context.request.params.accountId
      }
    })
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.accountId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.accountId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 200 with an existing key', async () => {
    models.accounts = {
      findOrCreate: jest.fn(async () => [{}, false]),
      update: jest.fn(async () => [
        1,
        [
          {
            dataValues: {
              id: context.request.params.accountId,
              ...ts
            }
          }
        ]
      ])
    }
    cache.save = jest.fn()
    cache.delete = jest.fn()
    await putAccount(context, req, h)
    expect(models.accounts.update).toHaveBeenCalledWith(
      {
        updateStatus: 'L',
        account: (({ ...l }) => l)(req.payload)
      },
      { returning: true, where: { id: context.request.params.accountId } }
    )
    expect(cache.save).toHaveBeenCalledWith(path, {
      id: context.request.params.accountId,
      ...tsR
    })
    expect(h.response).toHaveBeenCalledWith({
      id: context.request.params.accountId,
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('throws with an insert query error', async () => {
    models.accounts = {
      findOrCreate: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await putAccount(context, req, h)
    }).rejects.toThrow()
  })

  it('throws with an update query error', async () => {
    models.accounts = {
      findOrCreate: jest.fn(async () => [{}, false]),
      update: jest.fn(async () => {
        throw new Error()
      })
    }
    await expect(async () => {
      await putAccount(context, req, h)
    }).rejects.toThrow()
  })
})
