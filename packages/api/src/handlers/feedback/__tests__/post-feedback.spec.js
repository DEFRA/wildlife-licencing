jest.spyOn(console, 'error').mockImplementation(() => null)

/*
 * Mock the hapi request object
 */
const path = '/feedback'

const userId = '6010bdb5-478c-46dc-8511-442fd26e298b'

const req = {
  path,
  payload: {
    userId: userId,
    rating: 'Satisfied',
    howCanWeImproveThisService: 'Here is some text on how to improve the service',
    sddsRating: 1000000
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

const applicationJson = 'application/json'

describe('The postFeedback handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 201 on successful create', async () => {
    const mockCreate = jest.fn(async () => ({ dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts } }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        feedbacks: {
          create: mockCreate
        }
      }
    }))

    const getQueueMock = jest.fn(() => ({
      add: jest.fn(() => ({
        id: 1
      }))
    }))

    jest.doMock('@defra/wls-queue-defs', () => ({
      getQueue: getQueueMock,
      queueDefinitions: {
        FEEDBACK_QUEUE: 1
      }
    }))

    const postFeedback = (await import('../post-feedback.js')).default

    await postFeedback(context, req, h)
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      feedbackData: {
        howCanWeImproveThisService: req.payload.howCanWeImproveThisService,
        rating: req.payload.rating,
        sddsRating: req.payload.sddsRating
      },
      userId
    })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })
})
