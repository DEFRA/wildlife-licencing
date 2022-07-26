
describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())
  describe('S3 Bucket File Upload', () => {
    it('Throws an error if a new bucket cannot be created', async () => {
      const mockHead = () => Promise.reject(new Error())
      const mockCreate = () => Promise.reject(new Error())
      const errSpy = jest.spyOn(console, 'error')
      jest.doMock('@aws-sdk/client-s3', () => ({
        S3: jest.fn().mockImplementation(() => ({
          headBucket: jest.fn((bucketName, callback) => mockHead),
          createBucket: jest.fn((bucketName, callback) => mockCreate)
        }))
      }))
      const { S3FileUpload } = await import('../s3-upload.js')
      await S3FileUpload('0b357917-9b23-4f16-b460-bcee0ff1103f', 'file.txt', '/scandir/file.txt')
      await expect(errSpy).toHaveBeenCalledTimes(1)
      await expect(mockHead).toHaveBeenCalledTimes(1)
    })
    // it('Creates bucket if application bucket does not already exist and uploads file to new bucke', async () => {
    //   const mockCreate = { data: 'data goes here' }
    //   const mockUpload = { location: }
    //   jest.doMock('@aws-sdk/client-s3', () => jest.fn().mockImplementation(() => {
    //     return ({ headBucket: () => mockCreate })
    //   }))
    //   const { S3FileUpload } = await import('../s3-upload.js')
    //   await expect(() => S3FileUpload('0b357917-9b23-4f16-b460-bcee0ff1103f', 'file.txt', '/scandir/file.txt')).rejects.toThrow()
    // })
  })
})
