import index from '../index'
import filters from '../filters'

describe('index', () => {
  describe('addFilters', () => {
    const inputValue = {addFilter: jest.fn()}

    beforeEach(() => {
      index.addFilters(inputValue)
    })

    test('adds each filter', () => {
      expect(inputValue.addFilter).toHaveBeenCalledTimes(Object.keys(filters).length)
    })
  })

  describe('nunjucksEngine', () => {
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
