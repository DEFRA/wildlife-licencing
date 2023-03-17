jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f'
const req = {
  path,
  payload: {
    completedWithinLicenceDates: true
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
const context = {
  request: {
    params: {
      returnId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
      licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77'
    }
  }
}

const applicationJson = 'application/json'

describe('The putReturn handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 201 on successful create', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))

    const mockFindOrCreate = jest.fn(async () => [{
      dataValues: {
        id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        ...ts
      }
    }, true])

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' })
        },
        returns: {
          findOrCreate: mockFindOrCreate
        }
      }
    }))

    const putReturn = (await import('../put-return.js')).default

    await putReturn(context, req, h)
    expect(mockFindOrCreate).toHaveBeenCalledWith({
      defaults: {
        licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
        returnData: {
          completedWithinLicenceDates: true
        },
        updateStatus: 'L'
      },
      where: {
        id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa'
      }
    })
    expect(mockSave).toHaveBeenCalledWith('/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it.only('returns a 200 on successful update', async () => {
    const mockSave = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          save: mockSave
        }
      }
    }))

    const mockUpdate = jest.fn(() => [null, [{
      dataValues: {
        id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
        ...ts
      }
    }]])

    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' })
        },
        returns: {
          findOrCreate: () => [null, false],
          update: mockUpdate
        }
      }
    }))

    const putReturn = (await import('../put-return.js')).default

    await putReturn(context, req, h)
    expect(mockUpdate).toHaveBeenCalledWith({
      licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      returnData: {
        completedWithinLicenceDates: true
      },
      updateStatus: 'L'
    },
    { returning: true, where: { id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa' } })
    expect(mockSave).toHaveBeenCalledWith('/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(200)
  })

  it('returns a 404 on licence not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => null
        }
      }
    }))
    const putReturn = (await import('../put-return.js')).default
    await putReturn(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => { throw new Error() }
        }
      }
    }))
    const putReturn = (await import('../put-return.js')).default
    await expect(async () => {
      await putReturn(context, req, h)
    }).rejects.toThrow()
  })
})
