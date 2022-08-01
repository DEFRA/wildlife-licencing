describe('The sequelize connector', () => {
  it('initializes', async () => {
    const { SEQUELIZE } = require('../sequelize.js')
    await SEQUELIZE.initialiseConnection()
    expect(SEQUELIZE.getSequelize()).toBeTruthy()
  })
})
