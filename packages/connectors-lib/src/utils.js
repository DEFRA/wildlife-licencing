import * as _set from 'lodash.set'
import * as _get from 'lodash.get'
import * as _has from 'lodash.has'

const { default: set } = _set
const { default: get } = _get
const { default: has } = _has

const endProcess = err => {
  console.error('Unexpected error, terminating:', err)
  process.exit(-1)
}

const hide = (obj, path) => has(obj, path)
  ? set(obj, path, (s =>
      s.substr(0, 2) + '*'.repeat(s.length - 4) + s.substr(s.length - 2, 2))(get(obj, path)))
  : obj

export { endProcess, hide }
