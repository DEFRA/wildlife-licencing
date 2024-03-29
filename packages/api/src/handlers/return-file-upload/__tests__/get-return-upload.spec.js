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

const context = { request: { params: { returnId: '7c3b13ef-c2fb-4955-942e-764593cf0ada', uploadId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' } } }

const req = {
  path: 'path',
  payload: {
    filetype: 'MAP',
    filename: 'map.txt',
    objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
    bucket: 'bucket-name'
  }
}

describe('getReturnUpload handler', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.resetAllMocks()
    codeFunc = jest.fn()
    typeFunc = jest.fn(() => ({ code: codeFunc }))
    h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }
  })

  it('returns an return-upload and status 200', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' }))
        },
        returnUploads: {
          findByPk: jest.fn(() => ({
            dataValues: Object.assign(returnUpload, {
              ...ts
            })
          }))
        }
      }
    }))
    const getReturnFileUpload = (await import('../get-return-file-upload.js')).default
    await getReturnFileUpload(context, req, h)
    expect(h.response).toHaveBeenCalledWith({
      returnId: 'ee269288-9eae-4627-b4a8-671132cfb6b6',
      bucket: 'bucket-name',
      objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
      createdAt: '2022-08-02T11:53:01.291Z',
      filename: 'map.txt',
      filetype: 'MAP',
      id: '5e790ab3-c37a-4e4c-a19d-97fb72cdbd42',
      updatedAt: '2022-08-02T12:04:04.004Z'
    })
    expect(codeFunc).toHaveBeenCalledWith(200)
    expect(typeFunc).toHaveBeenCalledWith('application/json')
  })

  it('returns 404 if the return does not exist', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const getReturnFileUpload = (await import('../get-return-file-upload.js')).default
    await getReturnFileUpload(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('returns 404 if the return upload does not exist', async () => {
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        returns: {
          findByPk: jest.fn(() => ({ id: '7c3b13ef-c2fb-4955-942e-764593cf0ada' }))
        },
        returnUploads: {
          findByPk: jest.fn(() => null)
        }
      }
    }))
    const getReturnFileUpload = (await import('../get-return-file-upload.js')).default
    await getReturnFileUpload(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })

  it('throws on error', async () => {
    jest.doMock('@defra/wls-database-model', () => ({ models: {} }))
    const getReturnFileUpload = (await import('../get-return-file-upload.js')).default
    await expect(async () => await getReturnFileUpload(context, req, h)).rejects.toThrow()
  })
})
