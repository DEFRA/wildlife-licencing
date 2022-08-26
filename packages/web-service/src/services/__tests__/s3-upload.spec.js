
describe('the S3 file upload service', () => {
  beforeEach(() => jest.resetModules())
  describe('createBucket', () => {
    const mockSend = jest.fn(() => { throw new Error() })
    it('does nothing if the bucket cannot be created', async () => {
      jest.doMock('@defra/wls-connectors-lib', () => ({
        AWS: () => ({
          S3Client: {
            send: mockSend
          }
        })
      }))
      const { createBucket } = await import('../s3-upload.js')
      await expect(async () => await createBucket()).not.toThrow()
    })
  })

  describe('s3FileUpload', () => {
    it('sends the put command and unlinks the file', async () => {
      const mockSend = jest.fn()
      const mockPut = jest.fn()
      const mockCreate = jest.fn()
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
          CreateBucketCommand: mockCreate
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
      expect(mockCreate).toHaveBeenCalledWith({ Bucket: 'fedb14b6-53a8-ec11-9840-0022481aca85.method' })
      expect(mockPut).toHaveBeenCalledWith({
        ACL: 'authenticated-read',
        Body: 'rs',
        Bucket: 'fedb14b6-53a8-ec11-9840-0022481aca85.method',
        Key: expect.any(String)
      })
    })

    it('throws an error if unable to write', async () => {
      const mockSend = jest.fn()
      const mockPut = jest.fn(() => { throw new Error() })
      const mockCreate = jest.fn()
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
          CreateBucketCommand: mockCreate
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
