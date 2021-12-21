/* eslint-disable camelcase */
import { openBatchRequest, createBatchRequestBody, findRequestSequence, createKeyObject } from '../batch-formation.js'
import { model } from '../../model/sdds-model.js'
import fs from 'fs'
import path from 'path'

const src = {
  applicant: {
    lastname: 'Botham',
    firstname: 'Ian',
    email: 'Ian.botham@gmail.com',
    phone: '876877666876',
    address:
        {
          postcode: 'BS92LT',
          addrline1: '1 The cottages',
          addrline2: 'The Village',
          addrline3: 'Taunton',
          county: 'Somerset'
        }
  },
  ecologist: {
    firstname: 'Brian',
    lastname: 'The-Ecologist',
    email: 'brian.ecologist@gmail.com',
    phone: '+44 837248649864',
    address:
      {
        postcode: 'YT56 9UW',
        addrline1: 'The University',
        addrline2: 'University Rd.',
        addrline3: 'Cambridge',
        county: 'Cambridgeshire'
      }
  },
  proposalDescription: 'move some newts across a road',
  detailsOfConvictions: 'speeding fine 2008. 167mph.'
}

/**
 * Content-Type:multipart/mixed;boundary=batch_499D1B
 Accept:application/json
 OData-MaxVersion: 4.0
 OData-Version: 4.0
 Prefer:return=representation
 */
describe('Batch query formation', () => {
  it('forms a batch query set for a basic data subset', async () => {
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
    const batchId = openBatchRequest()

    const baseUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'

    const batchQuery = createBatchRequestBody(batchId, sequence, src, baseUrl)

    console.log(batchQuery)

    expect(batchQuery).toContain(`--batch_${batchId}`)
    expect(batchQuery).toContain(`POST ${baseUrl}/contacts HTTP/1.1`)
    expect(batchQuery).toContain(`POST ${baseUrl}/sdds_applications HTTP/1.1`)
    expect(batchQuery).toContain(JSON.stringify({
      firstname: 'Ian',
      lastname: 'Botham',
      address1_line1: '1 The cottages',
      address1_line2: 'The Village',
      address1_line3: 'Taunton',
      address1_postalcode: 'BS92LT',
      address1_telephone1: '876877666876',
      emailaddress1: 'Ian.botham@gmail.com'
    }, null, 4))

    expect(batchQuery).toContain(JSON.stringify({
      firstname: 'Brian',
      lastname: 'The-Ecologist',
      address1_line1: 'The University',
      address1_line2: 'University Rd.',
      address1_line3: 'Cambridge',
      address1_postalcode: 'YT56 9UW',
      address1_telephone1: '+44 837248649864',
      emailaddress1: 'brian.ecologist@gmail.com'
    }, null, 4))

    expect(batchQuery).toContain(JSON.stringify({
      sdds_descriptionofproposal: 'move some newts across a road',
      sdds_detailsofconvictions: 'speeding fine 2008. 167mph.',
      'sdds_applicantid@odata.bind': '$1',
      'sdds_ecologistid@odata.bind': '$2'
    }, null, 4))
  })

  it('is able to parse the success response', async () => {
    const batchId = openBatchRequest()
    const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })

    const baseUrl = 'https://sdds-dev.crm11.dynamics.com/api/data/v9.0'

    const { POWERAPPS } = await import('@defra/wls-connectors-lib')
    POWERAPPS.batchRequest = jest.fn(() => {
      return ({
        status: 200,
        headers: [],
        getBody: jest.fn(async () => Promise.resolve(
          fs.readFileSync(path.join(__dirname, '/success-response.txt'), { encoding: 'utf8' })))
      })
    })

    const response = await POWERAPPS.batchRequest(batchId, '')
    expect(response.status).toBe(200)
    const bodyTxt = await response.getBody()
    expect(bodyTxt).toContain('--batchresponse_546e00b0-78e1-4917-a359-c3aa31c64c76')
    const keyObject = createKeyObject(bodyTxt, sequence, baseUrl)

    expect(keyObject).toEqual({
      applicant: {
        eid: '7d17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      ecologist: {
        eid: '7f17ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'contacts'
      },
      sdds_applications: {
        eid: '8417ae34-3c62-ec11-8f8f-0022480078af',
        entity: 'sdds_applications'
      }
    })
  })
})
