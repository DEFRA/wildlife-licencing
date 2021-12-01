jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    GetSecretValueCommand: jest.fn().mockImplementation(() => { return {} }),
    SecretsManagerClient: jest.fn().mockImplementation(() => { return { send: () => ({ SecretString: 'bar' }) } })
  }
})

describe('The sequelize connector', () => {
  it('initializes', async () => {
    const { SEQUELIZE } = require('../sequelize.js')
    await SEQUELIZE.initialiseConnection()
    expect(SEQUELIZE.getSequelize()).toBeTruthy()
  })
})
