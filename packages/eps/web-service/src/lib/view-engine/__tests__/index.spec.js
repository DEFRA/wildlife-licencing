import index from '../index'

describe('index', () => {
  describe('engines.njk', () => {
    let response

    test('.compile is a function', () => {
      expect(index.engines.njk.compile).toBeInstanceOf(Function)
    })

    test('.compile returns a function', () => {
      response = index.engines.njk.compile('', { environment: 'test' })

      expect(response).toBeInstanceOf(Function)
    })
    test('the function returned by .compile replied with a Promise', () => {
      const innerFunction = response({})

      expect(innerFunction).toBeInstanceOf(Promise)
    })

  })
  test('exports an object', () => {
    expect(index).toBeInstanceOf(Object)
  })
})
