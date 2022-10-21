import Config from '../config.js'
const TEST_ENDPOINT = 'http://localhost:8080'

describe('aws connectors', () => {
  it('configures s3 with a custom endpoint if one is defined in configuration', async () => {
    Config.aws.s3.endpoint = TEST_ENDPOINT
    const AWS = (await import('../aws.js')).default()
    const { S3Client } = AWS
    const result = await S3Client.config.endpoint()
    await expect(result.hostname).toEqual('localhost')
    await expect(result.port).toEqual(8080)
  })
})
