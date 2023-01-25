import { setGlobalDate, unsetGlobalDate } from '../fake-date.js'

describe('fake-date', () => {
  describe('proxy date functions', () => {
    beforeAll(() => {
      process.env.ALLOW_RESET = 'YES'
    })

    afterAll(() => {
      delete process.env.ALLOW_RESET
    })

    beforeEach(() => {
      setGlobalDate('2011-10-05T14:48:00.000Z')
    })

    afterEach(() => {
      unsetGlobalDate()
    })

    it('when called as a function, returns a string representation of the current date and time', () => {
      expect([
        'Wed Oct 05 2011 15:48:00 GMT+0100 (British Summer Time)',
        'Wed Oct 05 2011 14:48:00 GMT+0000 (Coordinated Universal Time)']).toContain(Date())
    })

    it('when called as a constructor, returns a new Date object', () => {
      const today = new Date()
      expect(today.toISOString()).toEqual('2011-10-05T14:48:00.000Z')

      // Allows manipulation as on dates
      today.setFullYear(2030)
      expect(today.toISOString()).toEqual('2030-10-05T14:48:00.000Z')
    })

    it('calling now() returns the numeric value corresponding to the current time', () => {
      expect(Date.now()).toBe(1317826080000)
    })

    it('calling now() returns the numeric value corresponding to the current time', () => {
      expect(Date.now()).toBe(1317826080000)
    })

    it('calling parse() returns the number of milliseconds since January 1, 1970, 00:00:00 UTC', () => {
      expect(Date.parse('01 Jan 1970 00:00:00 GMT')).toBe(0)
    })

    it('calling UTC returns the number of milliseconds since January 1, 1970, 00:00:00 UTC', () => {
      const utcDate = new Date(Date.UTC(96, 1, 2, 3, 4, 5))
      expect(utcDate.toUTCString()).toBe('Fri, 02 Feb 1996 03:04:05 GMT')
    })

    it('unsetGlobalDate restores the correct function of Date()', () => {
      unsetGlobalDate()
      const today = new Date()
      expect(today.toISOString()).not.toEqual('2011-10-05T14:48:00.000Z')
    })
  })

  describe('error handling', () => {
    it('setGlobalDate throw an error if RESET not set', () => {
      expect(() => setGlobalDate()).toThrow()
    })

    it('unsetGlobalDate throw an error if RESET not set', () => {
      expect(() => unsetGlobalDate()).toThrow()
    })
  })
})
