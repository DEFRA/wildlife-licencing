import index from '../index'
import filters from '../filters'
import Nunjucks from 'nunjucks'
import { difference } from 'lodash'

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
      jest.spyOn(index, 'engineRender')

      test('.compile is a function', () => {
        expect(index.wrapper.engines.njk.compile).toBeInstanceOf(Function)
      })

      test('.compile returns a function', () => {
        response = index.wrapper.engines.njk.compile('', { environment: 'test' })

        expect(response).toBeInstanceOf(Function)
      })

      test('it calls Nunjucks.compile', () => {
        expect(Nunjucks.compile).toHaveBeenCalled()
      })

      test('engine has correct keys set', () => {
        const keys = ['engines', 'path', 'isCached', 'defaultExtension']
        expect(difference(keys, Object.keys(index.wrapper))).toHaveLength(0)
      })

      test('engine render has been called', () => {
        const context = {}
        const nunJucks = Nunjucks.compile('', { environment: 'test' })
        index.engineRender(context, nunJucks)
        expect(index.engineRender).toHaveBeenCalled()
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
        index.wrapper.engines.njk.prepare(options, cb)
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
