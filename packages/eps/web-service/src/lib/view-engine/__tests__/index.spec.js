import index from '../index'
import filters from '../filters'
import Nunjucks from 'nunjucks'

describe('index', () => {
  describe('addFilters', () => {
    const inputValue = { addFilter: jest.fn() }

    beforeEach(() => {
      index.addFilters(inputValue)
    })

    test('adds each filter', () => {
      expect(inputValue.addFilter).toHaveBeenCalledTimes(Object.keys(filters).length)
    })
  })

  describe('nunjucksEngine', () => {

    describe('.compile', () => {
      let response
      jest.spyOn(Nunjucks, 'compile')

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
      test('it calls Nunjucks.compile', () => {
        expect(Nunjucks.compile).toHaveBeenCalled()
      })
    })

    describe('.prepare', () => {
      jest.spyOn(Nunjucks, 'configure')
      const cb = jest.fn()
      const options = {
        path: 'root',
        compileOptions: {}
      }
      beforeAll(() => {
        index.engines.njk.prepare(options, cb)
      })
      test('Nunjucks.configure is called', () => {
        expect(Nunjucks.configure).toHaveBeenCalled()
      })
    })

  })
  test('exports an object', () => {
    expect(index).toBeInstanceOf(Object)
  })
})
