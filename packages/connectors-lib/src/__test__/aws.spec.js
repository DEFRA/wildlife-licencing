import Config from '../config.js'
const TEST_ENDPOINT = 'http://localhost:8080'

describe('aws connectors', () => {
  it('configures s3 with a custom endpoint if one is defined in configuration', async () => {
    Config.aws.s3.endpoint = TEST_ENDPOINT
    const { s3 } = (await import('../aws.js')).default()
    const result = await s3.config.endpoint()
    await expect(result.hostname).toEqual('localhost')
    await expect(result.port).toEqual(8080)
    expect(s3.config.s3ForcePathStyle).toBeTruthy()
  })

  it('uses default s3 settings if a custom endpoint is not defined', async () => {
    process.env.AWS_REGION = 'eu-west-2'
    delete Config.aws.s3.endpoint
    const { s3 } = (await import('../aws.js')).default()
    const result = await s3.config.endpoint()
    await expect(result.hostname).toEqual('s3.eu-west-2.amazonaws.com')
    expect(s3.config.s3ForcePathStyle).toBeFalsy()
  })

  it('configures secretsmanager with a custom endpoint if one is defined in configuration', async () => {
    Config.aws.secretsManager.endpoint = TEST_ENDPOINT
    const { secretsManagerClient } = (await import('../aws.js')).default()
    const result = await secretsManagerClient.config.endpoint()
    await expect(result.hostname).toEqual('localhost')
    await expect(result.port).toEqual(8080)
  })

  it('uses default secretsmanager settings if a custom endpoint is not defined', async () => {
    process.env.AWS_REGION = 'eu-west-2'
    delete Config.aws.secretsManager.endpoint
    const { secretsManagerClient } = (await import('../aws.js')).default()
    const result = await secretsManagerClient.config.endpoint()
    await expect(result.hostname).toEqual('secretsmanager.eu-west-2.amazonaws.com')
  })
})
