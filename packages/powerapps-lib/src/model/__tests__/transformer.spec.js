import * as _set from 'lodash.set'
import * as _get from 'lodash.get'

import { model } from '../sdds-model.js'
import { powerAppsObjectBuilder, localObjectBuilder } from '../transformer.js'
import src from '../../model/test-data/json-src.js'
import tgt from '../../model/test-data/json-tgt.js'

const { default: set } = _set
const { default: get } = _get

describe('The model transformer', () => {
  it('Correctly transforms from the source to the target schema', async () => {
    const t = powerAppsObjectBuilder(model.ecologist.targetFields, src)
    expect(t).toEqual({
      address1_line1: 'The University',
      address1_line2: 'University Rd.',
      address1_line3: 'Cambridge',
      address1_county: 'Cambridgeshire',
      address1_postalcode: 'YT56 9UW',
      address1_telephone1: '+44 837248649864',
      emailaddress1: 'brian.ecologist@gmail.com',
      firstname: 'Brian',
      lastname: 'The-Ecologist'
    })
  })

  it('Correctly transforms from the target to the source schema', async () => {
    const s = localObjectBuilder({ sdds_applications: model.sdds_applications }, tgt)
    expect(s).toEqual({
      data: src,
      keys: {
        applicant: {
          eid: '5902378c-736d-ec11-8943-000d3a86e24e',
          entity: 'contacts'
        },
        ecologist: {
          eid: '5c02378c-736d-ec11-8943-000d3a86e24e',
          entity: 'contacts'
        },
        sdds_applications: {
          eid: '5e02378c-736d-ec11-8943-000d3a86e24e',
          entity: 'sdds_applications',
          etag: 'W/"2751267"'
        }
      }
    })
  })
})
