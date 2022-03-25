const path = 'option-sets'
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

const resp = {
  'option-set': {
    values: [{ value: 1, description: 'd1' }, { value: 2, description: 'd2' }],
    ...tsR
  }
}

describe('The option-set data handlers', () => {
  beforeEach(() => jest.resetModules())

  it('returns option-sets from the database', async () => {
    const mockFindAll = jest.fn(() => [{
      dataValues: {
        name: 'option-set',
        json: [{ value: 1, description: 'd1' }, { value: 2, description: 'd2' }],
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
        optionSets: {
          findAll: mockFindAll
        }
      }
    }))

    const { getOptionSets } = await import('../option-sets.js')
    await getOptionSets({}, req, h)

    expect(h.response).toHaveBeenCalledWith(resp)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(mockSave).toHaveBeenCalledWith(path, resp)
  })

  it('returns option-sets from the cache', async () => {
    const mockRestore = jest.fn(() => JSON.stringify(resp))

    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: mockRestore
        }
      }
    }))

    const { getOptionSets } = await import('../option-sets.js')
    await getOptionSets({}, req, h)

    expect(h.response).toHaveBeenCalledWith(resp)
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })
})
