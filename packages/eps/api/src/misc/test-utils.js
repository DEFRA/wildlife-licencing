const mocks = {
  mockQuery: jest.fn(),
  mockSet: jest.fn(),
  mockGet: jest.fn(),
  mockDel: jest.fn
}

export const mockPersistence = {
  init: async () => {
    jest.mock('@defra/wls-connectors-lib')
    const { DATABASE, REDIS } = await import('@defra/wls-connectors-lib')
    DATABASE.getPool = jest.fn(() => ({ connect: async () => ({ query: mocks.mockQuery, release: jest.fn() }) }))
    REDIS.getClient = jest.fn(() => ({ set: mocks.mockSet, get: mocks.mockGet, GETDEL: mocks.mockDel }))
  },
  // reset: () => {
  //   mocks.mockSet.mockClear()
  //   mocks.mockGet.mockClear()
  //   mocks.mockQuery.mockClear()
  // },
  setMockGet: f => mocks.mockGet.mockImplementation(f),
  setMockQuery: f => mocks.mockQuery.mockImplementation(f),
  mocks
}
