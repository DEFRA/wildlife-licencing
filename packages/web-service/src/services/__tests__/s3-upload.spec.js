
describe('the S3 file upload service', () => {
  beforeEach(() => jest.resetModules())
  describe('s3FileUpload', () => {
    it('sends the put command and unlinks the file', async () => {
      const mockSend = jest.fn()
      const mockPut = jest.fn()
      jest.doMock('fs', () => ({
        createReadStream: jest.fn(() => 'rs'),
        unlinkSync: jest.fn()
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        AWS: () => ({
          S3Client: {
            send: mockSend
          },
          PutObjectCommand: mockPut,
          bucket: 'bucket'
        })
      }))
      jest.doMock('../api-requests.js', () => ({
        APIRequests: {
          FILE_UPLOAD: {
            record: jest.fn()
          }
        }
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      await s3FileUpload('fedb14b6-53a8-ec11-9840-0022481aca85',
        'hello.txt',
        '/tmp/123',
        { filetype: 'method', multiple: false }
      )
      expect(mockPut).toHaveBeenCalledWith({
        ACL: 'authenticated-read',
        Body: 'rs',
        Bucket: 'bucket',
        Key: expect.any(String)
      })
    })

    it('throws an error if unable to write', async () => {
      const mockSend = jest.fn()
      const mockPut = jest.fn(() => { throw new Error() })
      jest.doMock('fs', () => ({
        createReadStream: jest.fn(() => 'rs'),
        unlinkSync: jest.fn()
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        AWS: () => ({
          S3Client: {
            send: mockSend
          },
          PutObjectCommand: mockPut,
          bucket: 'bucket'
        })
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      try {
        await s3FileUpload('fedb14b6-53a8-ec11-9840-0022481aca85',
          'hello.txt',
          '/tmp/123',
          { filetype: 'method', multiple: false }
        )
      } catch (err) {
        expect(err.output.statusCode).toEqual(500)
      }
    })
  })
})
