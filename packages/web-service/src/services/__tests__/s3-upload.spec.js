
describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())
  describe('S3 Bucket File Upload', () => {
    it('Logs an error if a new bucket cannot be created', async () => {
      const mockHeadBucket = jest.fn((b, f) => {
        f(new Error(), {}) // error, data
      })
      const mockCreateBucket = jest.fn((b, f) => {
        f(new Error(), null) // error, data
      })
      jest.doMock('fs', () => ({
        readFileSync: jest.fn(() => 'file-content')
      }))
      const mockPutObject = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3: jest.fn(() => ({
          headBucket: mockHeadBucket,
          createBucket: mockCreateBucket,
          putObject: mockPutObject
        }))
      }))
      const errSpy = jest.spyOn(console, 'error')
      const { s3FileUpload } = await import('../s3-upload.js')
      await s3FileUpload('0b357917-9b23-4f16-b460-bcee0ff1103f', 'file.txt', '/scandir/file.txt')
      expect(errSpy).toHaveBeenCalled()
    })
    it('Creates bucket if application bucket does not already exist and uploads file to new bucket', async () => {
      const mockHeadBucket = jest.fn((b, f) => {
        f(new Error(), {}) // error, data
      })
      const mockCreateBucket = jest.fn((b, f) => {
        f(null, {}) // error, data
      })
      jest.doMock('fs', () => ({
        readFileSync: jest.fn(() => 'file-content')
      }))
      const mockPutObject = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3: jest.fn(() => ({
          headBucket: mockHeadBucket,
          createBucket: mockCreateBucket,
          putObject: mockPutObject
        }))
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      await s3FileUpload('0b357917-9b23-4f16-b460-bcee0ff1103f', 'file.txt', '/scandir/file.txt')
      expect(mockHeadBucket).toHaveBeenCalled()
      expect(mockCreateBucket).toHaveBeenCalled()
      expect(mockPutObject).toHaveBeenCalledWith({
        ACL: 'bucket-owner-full-control',
        Body: 'file-content',
        Bucket: '0b357917-9b23-4f16-b460-bcee0ff1103f',
        Key: 'file.txt'
      })
    })
    it('Add the file to the application bucket if one already exists', async () => {
      const mockHeadBucket = jest.fn((b, f) => {
        f(null, {}) // error, data
      })
      jest.doMock('fs', () => ({
        readFileSync: jest.fn(() => 'file-content')
      }))
      const mockPutObject = jest.fn()
      const mockCreateBucket = jest.fn()
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3: jest.fn(() => ({
          headBucket: mockHeadBucket,
          putObject: mockPutObject
        }))
      }))
      const { s3FileUpload } = await import('../s3-upload.js')
      await s3FileUpload('0b357917-9b23-4f16-b460-bcee0ff1103f', 'file.txt', '/scandir/file.txt')
      expect(mockHeadBucket).toHaveBeenCalled()
      expect(mockCreateBucket).toHaveBeenCalledTimes(0)
      expect(mockPutObject).toHaveBeenCalledWith({
        ACL: 'bucket-owner-full-control',
        Body: 'file-content',
        Bucket: '0b357917-9b23-4f16-b460-bcee0ff1103f',
        Key: 'file.txt'
      })
    })
  })
})
