/* eslint-disable camelcase */
import { formQuery, findRequestSequence } from '../query-formation.js'
import { model } from '../../model/sdds-model.js'

const src = {
  applicant: {
    lastname: 'sdg',
    firstname: 'a',
    address:
        {
          postcode: 'BS92LT',
          addrLine1: 'ad1',
          addrline3: 'ad3'
        }
  },
  proposalDescription: 'sss',
  detailsOfConvictions: 'sdf'
}

describe('Query formation', () => {
  it('forms a batch query set', () => {
    // formQuery(model, src2, 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0')
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
    const batchQuery = formQuery(sequence, src, 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0')
    console.log(batchQuery)
  })
  // it('forms a batch query set', () => {
  //   formQuery(model, src, 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0')
  // })
})
