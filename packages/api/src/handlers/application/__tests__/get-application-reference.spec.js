/*
 * Mock the hapi request object
 */

const path = 'applications/get-reference?applicationType=A24%20badger'
const req = {
  path,
  query: {
    applicationType: 'A24 badger'
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

jest.mock('@defra/wls-database-model')

let models
let getApplicationReference
let cache
const applicationJson = 'application/json'
const today = new Date()
const year = today.getFullYear()

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

describe('The getApplicationReference handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    getApplicationReference = (await import('../get-application-reference.js')).default
    cache = (await import('../../../services/cache.js')).cache
  })

  it('returns a new reference and status 200 where type is found in cache', async () => {
    cache.restore = jest.fn(() => JSON.stringify([
      {
        id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
        createdAt: '2022-02-21T14:15:19.822Z',
        updatedAt: '2022-02-28T09:01:52.301Z',
        name: 'A24 badger',
        refNoSuffix: 'EPS-MIT'
      }
    ]))
    models.getApplicationRef = jest.fn(() => [{
      nextval: '501100'
    }])
    await getApplicationReference({}, req, h)
    expect(h.response).toHaveBeenCalledWith({
      ref: `${year}-501100-EPS-MIT`
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a new reference and status 200 where type is found in database', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applicationTypes = {
      findAll: jest.fn(() => [
        {
          dataValues: {
            id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
            json: {
              name: 'A24 badger',
              refNoSuffix: 'EPS-MIT'
            },
            ...ts
          }
        }])
    }
    models.getApplicationRef = jest.fn(() => [{
      nextval: '501101'
    }])
    await getApplicationReference({}, req, h)
    expect(h.response).toHaveBeenCalledWith({
      ref: `${year}-501101-EPS-MIT`
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(cache.save).toHaveBeenCalledWith('application/types', [expect.objectContaining({ refNoSuffix: 'EPS-MIT' })])
  })

  it('returns 404 not found if no reference data loaded', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applicationTypes = {
      findAll: jest.fn(() => [])
    }
    models.getApplicationRef = jest.fn(() => [{
      nextval: '501101'
    }])
    await getApplicationReference({}, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
    expect(cache.save).not.toHaveBeenCalled()
  })

  it('returns 404 not found if application-type has no suffix', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applicationTypes = {
      findAll: jest.fn(() => [
        {
          dataValues: {
            id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
            json: {
              name: 'A24 badger'
            },
            ...ts
          }
        }])
    }
    await getApplicationReference({}, req, h)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns 500 server error if database access error', async () => {
    cache.restore = jest.fn(() => null)
    cache.save = jest.fn()
    models.applicationTypes = {
      findAll: jest.fn(() => { throw new Error('') })
    }
    await expect(async () => {
      await getApplicationReference({}, req, h)
    }).rejects.toThrow()
  })
})
