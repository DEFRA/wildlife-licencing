jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the S3 file upload service', () => {
  beforeEach(() => jest.resetModules())
  describe('s3FileUpload', () => {
    it('sends the put command and unlinks the file', async () => {
      const mockWriteFileStream = jest.fn()
      jest.doMock('fs', () => ({
        createReadStream: jest.fn(() => 'rs'),
        unlinkSync: jest.fn()
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        AWS: {
          S3: () => ({
            writeFileStream: mockWriteFileStream
          })
        }
      }))
      jest.doMock('../api-requests.js', () => ({
        APIRequests: {
          FILE_UPLOAD: {
            APPLICATION: {
              record: jest.fn()
            }
          }
        }
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      await s3FileUpload('APPLICATION',
        'hello.txt',
        '/tmp/123',
        { filetype: 'method', multiple: false })('fedb14b6-53a8-ec11-9840-0022481aca85')
      expect(mockWriteFileStream).toHaveBeenCalledWith(expect.any(String), 'rs')
    })

    it('throws an error if unable to write', async () => {
      const mockWriteFileStream = jest.fn(() => { throw new Error() })
      jest.doMock('fs', () => ({
        createReadStream: jest.fn(() => 'rs'),
        unlinkSync: jest.fn()
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        AWS: {
          S3: () => ({
            writeFileStream: mockWriteFileStream
          })
        }
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      try {
        await s3FileUpload('APPLICATION',
          'hello.txt',
          '/tmp/123',
          { filetype: 'method', multiple: false })('fedb14b6-53a8-ec11-9840-0022481aca85')
      } catch (err) {
        expect(err.output.statusCode).toEqual(500)
      }
    })
  })
})
