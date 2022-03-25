const path = 'user/uuid'
const req = { path }
const applicationJson = 'application/json'
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

const resp = [{
  id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
  name: 'MIT BAT A045',
  description: 'movements of bats',
  ...tsR
}]

describe('The reference data handlers', () => {
  beforeEach(() => jest.resetModules())

  it('returns application types from the database', async () => {
    const mockFindAll = jest.fn(() => [{
      dataValues: {
        id: '00171fc3-a556-ec11-8f8f-000d3a0ce11e',
        json: {
          name: 'MIT BAT A045',
          description: 'movements of bats'
        },
        ...ts
      }
    }])

    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(),
          save: mockSave
        }
      }
    }))

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applicationTypes: {
          findAll: mockFindAll
        }
      }
    }))

    const { getApplicationTypes } = await import('../reference-data.js')
    await getApplicationTypes({}, req, h)

    expect(h.response).toHaveBeenCalledWith(resp)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith(path, resp)
  })

  it('returns application types from the cache', async () => {
    const mockRestore = jest.fn(() => JSON.stringify(resp))

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: mockRestore
        }
      }
    }))

    const { getApplicationTypes } = await import('../reference-data.js')
    await getApplicationTypes({}, req, h)

    expect(h.response).toHaveBeenCalledWith(resp)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })
})
