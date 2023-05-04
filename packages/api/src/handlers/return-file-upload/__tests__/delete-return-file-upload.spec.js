/*
 * Mock the hapi request object
 */
const req = {
  path: 'path',
  payload: {
    filetype: 'MAP',
    filename: 'map.txt',
    objectKey: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
    bucket: 'bucket-name'
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

/*
 * Create the parameters and payload to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { returnId: '7c3b13ef-c2fb-4955-942e-764593cf0ada', uploadId: 'e6b8de2e-51dc-4196-aa69-5725b3aff732' } } }

jest.mock('@defra/wls-database-model')

let models
let deleteReturnFileUpload

describe('The deleteReturn file upload handler', () => {
  beforeAll(async () => {
    models = (await import('@defra/wls-database-model')).models
    deleteReturnFileUpload = (await import('../delete-return-file-upload.js')).default
  })

  it('returns a 500 with an unexpected database error', async () => {
    models.returnUploads = { destroy: jest.fn(() => { throw Error() }) }
    await expect(async () => {
      await deleteReturnFileUpload(context, req, h)
    }).rejects.toThrow()
  })

  it('returns a 204 on successful delete', async () => {
    models.returnUploads = { destroy: jest.fn(() => 1) }
    await deleteReturnFileUpload(context, req, h)
    expect(models.returnUploads.destroy).toHaveBeenCalledWith({ where: { id: context.request.params.uploadId } })
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on uploadId not found', async () => {
    models.returnUploads = { destroy: jest.fn(() => 0) }
    await deleteReturnFileUpload(context, req, h)
    expect(codeFunc).toHaveBeenCalledWith(404)
  })
})
