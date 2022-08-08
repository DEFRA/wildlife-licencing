
jest.mock('@defra/wls-database-model')
jest.mock('@defra/wls-connectors-lib')

jest.mock('@defra/wls-queue-defs', () => ({
  getQueue: jest.fn(() => ({ process: jest.fn })),
  queueDefinitions: { FILE_QUEUE: {} }
}))

// const applicationId = 'b1847e67-07fa-4c51-af03-cb51f5126939'
//
// const job = {
//   data: {
//     applicationId
//   }
// }

describe('The file job processor', () => {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  describe('The tests', () => {
    it('', async () => {})
  })
})
