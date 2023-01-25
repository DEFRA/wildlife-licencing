/**
 * This is used for automated testing where time dependent components are required to be tested.
 * The test framework make request a specific datetime to be set at the system level.
 * This creates a Date proxy on the global object intercepts calls on the native Date class.
 * NOTE. This will only work in the environment that the request is received in. It will
 * not work in a clustered environment. That would require a solution involving redis.
 */
export function setGlobalDate (isoStr) {
  if (process.env.ALLOW_RESET === 'YES') {
    // Save the native date function on global
    if (!global.NativeDate) {
      global.NativeDate = Date
    }

    // Install a mock Date function
    global.Date = function (...args) {
      if (!this) {
        // Called as a function
        return new global.NativeDate(isoStr).toString()
      } else {
        if (args.length) {
          return new global.NativeDate(...args)
        } else {
          return new global.NativeDate(isoStr)
        }
      }
    }

    // Create the static methods
    global.Date.now = () => (new global.NativeDate(isoStr)).valueOf()
    global.Date.parse = global.NativeDate.parse
    global.Date.UTC = global.NativeDate.UTC
  } else {
    throw new Error('Attempted to call the globalDate proxy without ALLOW_RESET')
  }
}

export function unsetGlobalDate () {
  if (process.env.ALLOW_RESET === 'YES') {
    global.Date = global.NativeDate
  } else {
    throw new Error('Attempted to call the globalDate proxy without ALLOW_RESET')
  }
}
