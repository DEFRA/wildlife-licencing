import { model } from '../sdds-model.js'
import { powerAppsObjectBuilder, localObjectBuilder } from '../transformer.js'
import src from '../../model/test-data/json-src.js'
import tgt from '../../model/test-data/json-tgt.js'

describe('The model transformer', () => {
  it('correctly transforms from the source to the target schema', async () => {
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

  it('correctly transforms from the source to the target schema where a srcFunc is set', async () => {
    const t = powerAppsObjectBuilder(model.sdds_applications.targetFields, src)
    expect(t).toEqual({
      sdds_descriptionofproposal: 'move some newts across a road',
      sdds_detailsofconvictions: 'speeding fine 2008. 167mph.',
      sdds_sourceremote: true
    })
  })

  it('omits field if neither srcPath or srcFunc are set transforming from the source to the target schema', async () => {
    const t = powerAppsObjectBuilder(Object.assign({}, model.ecologist.targetFields, { firstname: {} }), src)
    expect(t).toEqual({
      address1_line1: 'The University',
      address1_line2: 'University Rd.',
      address1_line3: 'Cambridge',
      address1_county: 'Cambridgeshire',
      address1_postalcode: 'YT56 9UW',
      address1_telephone1: '+44 837248649864',
      emailaddress1: 'brian.ecologist@gmail.com',
      lastname: 'The-Ecologist'
    })
  })

  it('correctly transforms from the target to the source schema', async () => {
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

  it('throws if error on transformation from the target to the source schema', async () => {
    expect(() => localObjectBuilder({ sdds_applications: model.sdds_applications }, { foo: 'bar' })).toThrow()
  })

  it('throws if error on transformation from the target to the source schema if supplied null', async () => {
    expect(() => localObjectBuilder({ sdds_applications: model.sdds_applications }, null)).toThrow()
  })
})
