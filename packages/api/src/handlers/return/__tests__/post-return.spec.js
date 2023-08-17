jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/licence/uuid/return'
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
  request: { params: { licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } }
}

const applicationJson = 'application/json'

describe('The postReturn handler', () => {
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

    const mockCreate = jest.fn(async () => ({
      dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => ({ id: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' })
        },
        returns: {
          create: mockCreate
        }
      }
    }))

    const postReturn = (await import('../post-return.js')).default

    await postReturn(context, req, h)
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77',
      updateStatus: 'L',
      returnData: {
        completedWithinLicenceDates: true
      }
    })
    expect(mockSave).toHaveBeenCalledWith(
      '/licence/1e470963-e8bf-41f5-9b0b-52d19c21cb77/return/1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
      { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR }
    )
    expect(h.response).toHaveBeenCalledWith({
      id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f',
      ...tsR
    })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })

  it('returns a 404 on licence not found', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        licences: {
          findByPk: () => null
        }
      }
    }))
    const postReturn = (await import('../post-return.js')).default
    await postReturn(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws with an insert error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        applications: {
          findByPk: () => {
            throw new Error()
          }
        }
      }
    }))
    const postReturn = (await import('../post-return.js')).default
    await expect(async () => {
      await postReturn(context, req, h)
    }).rejects.toThrow()
  })
})
