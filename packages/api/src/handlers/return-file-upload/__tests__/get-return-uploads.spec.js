const returnUpload = {
  id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
  returnId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
  filetype: 'MAP',
  filename: 'map.txt',
  objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
  bucket: 'bucket-name',
  createdAt: '2022-08-02T11:53:01.291Z',
  updatedAt: '2022-08-02T12:04:04.004Z'
}

let codeFunc
let typeFunc
let h

const ts = {
  createdAt: { toISOString: () => '2022-08-02T11:53:01.291Z' },
  updatedAt: { toISOString: () => '2022-08-02T12:04:04.004Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

const context = { request: { params: { returnId: '7c3b13ef-c2fb-4955-942e-764593cf0ada' } } }

const req = {
  path: 'path',
  payload: {
    filetype: 'MAP',
    filename: 'map.txt',
    objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
    bucket: 'bucket-name'
  }
}

describe('getReturnUploads handler', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.resetAllMocks()
    codeFunc = jest.fn()
    typeFunc = jest.fn(() => ({ code: codeFunc }))
    h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }
  })

  it('returns an return-uploads and status 200 from the database', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' }))
        },
        returnUploads: {
          findAll: jest.fn(() => [{ dataValues: Object.assign(returnUpload, { ...ts }) }])
        }
      }
    }))
    const getReturnFileUploads = (await import('../get-return-file-uploads.js')).default
    await getReturnFileUploads(context, req, h)
    expect(h.response).toHaveBeenCalledWith([{
      returnId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      ...tsR
    }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns an return-uploads and status 200 from the database applying a filetype filter', async () => {
    const mockFindAll = jest.fn(() => [{ dataValues: Object.assign(returnUpload, { ...ts }) }])
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' }))
        },
        returnUploads: {
          findAll: mockFindAll
        }
      }
    }))
    const getReturnFileUploads = (await import('../get-return-file-uploads.js')).default
    await getReturnFileUploads(context, Object.assign({}, { query: { filetype: 'MAP' } }, req), h)
    expect(mockFindAll).toHaveBeenCalledWith({
      where: {
        returnId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
        filetype: 'MAP'
      }
    })
    expect(h.response).toHaveBeenCalledWith([{
      returnId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      ...tsR
    }])
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns 404 if the return does not exist', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const getReturnFileUploads = (await import('../get-return-file-uploads.js')).default
    await getReturnFileUploads(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns 404 if the return-upload does not exist', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => null)
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' }))
        },
        returnUploads: {
          findAll: () => []
        }
      }
    }))
    const getReturnFileUploads = (await import('../get-return-file-uploads.js')).default
    await getReturnFileUploads(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on error', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      REDIS: {
        cache: {
          restore: jest.fn(() => { throw new Error() })
        }
      }
    }))
    jest.doMock('@defra/wls-database-model', () => ({ models: {} }))
    const getReturnFileUploads = (await import('../get-return-file-uploads.js')).default
    await expect(async () => await getReturnFileUploads(context, req, h)).rejects.toThrow()
  })
})
