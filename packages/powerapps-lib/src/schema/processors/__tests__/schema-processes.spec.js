import {
  SddsApplication,
  SddsSite,
  Contact,
  Account, SddsApplicationType, SddsApplicationPurpose, SddsApplicationKeys, SddsSiteKeys
} from '../../tables/tables.js'

import {
  srcObj,
  initialKeys,
  initialGeneratedAssignmentsObject,
  updateKeys,
  updatedGeneratedAssignmentsObject,
  expectedApplicationRequestPath,
  applicationResponseObject,
  applicationResponseTransformedDataObject,
  applicationResponseTransformedKeys,
  applicationSiteResponseObject, applicationSiteResponseTransformedDataObject, applicationSiteResponseTransformedKeys
} from './example-src-object.js'

import { Relationship, RelationshipType, Table } from '../../schema.js'

jest.mock('../../../services/cache.js', () => ({
  getReferenceDataIdByName: jest.fn(() => '001')
}))

describe('the schema processes', () => {
  beforeEach(() => jest.resetModules())

  describe('the createTableSet function', () => {
    it('can determine the correct batch update sequence with a set of tables', async () => {
      const { createTableSet } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite, Contact, Account])

      expect(tableSet.map(t => t.name))
        .toEqual(['sdds_sites', 'contacts', 'accounts', 'contacts', 'accounts', 'sdds_applications'])

      expect(tableSet.map(t => t.basePath))
        .toEqual(['application.sites', 'application.applicant', 'application.applicant.organization',
          'application.ecologist', 'application.ecologist.organization', 'application'])
    })
  })

  describe('the createTableColumnsPayload function', () => {
    it('can create the batch update columns object for a simple table; the contact table', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [Contact, Account])
      const ecologist = tableSet.find(ts => ts.basePath === 'application.ecologist')
      const applicationPayload = await createTableColumnsPayload(ecologist, srcObj)
      expect(applicationPayload).toEqual({
        relationshipsPayload: null,
        columnPayload: {
          firstname: 'Mr Brian',
          lastname: 'Yak',
          telephone1: '234234',
          emailaddress1: 'brian.yak@email.com',
          address1_line1: 'Old Hill',
          address1_line2: 'Stapleton',
          address1_line3: 'Nr. Bristol',
          address1_county: 'Somerset',
          address1_city: 'Bristol',
          address1_postalcode: 'BS11 1PW'
        }
      })
    })

    it('can create the batch update columns object for complex table; the applications table', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite])
      const applicationPayload = await createTableColumnsPayload(SddsApplication, srcObj, tableSet)
      expect(applicationPayload).toEqual({
        id: 'c4d14353-028d-45d1-adcd-576a2386b3d1',
        columnPayload: {
          sdds_applicationcategory: 100000001,
          sdds_applicationnumber: expect.any(String),
          sdds_descriptionofproposal: 'Badgers are proposed to be moved',
          sdds_detailsofconvictions: 'no convictions',
          sdds_whydoyouneedalicence: 'need to move some badgers'
        },
        relationshipsPayload: {
          'sdds_applicantid@odata.bind': 'sdds_application_applicantid_Contact',
          'sdds_applicationpurpose@odata.bind': '/sdds_applicationpurposes(001)',
          'sdds_applicationtypesid@odata.bind': '/sdds_applicationtypeses(001)',
          'sdds_ecologistid@odata.bind': 'sdds_application_ecologistid_Contact',
          'sdds_ecologistorganisationid@odata.bind': 'sdds_application_ecologistorganisationid_',
          'sdds_organisationid@odata.bind': 'sdds_application_organisationid_Account'
        }
      })
    })

    it('can create the batch update columns for sites; an array of items', async () => {
      const { createTableSet, createTableColumnsPayload } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite])
      const site = tableSet.find(ts => ts.name === 'sdds_sites')
      const sitesPayloads = await createTableColumnsPayload(site, srcObj)
      expect(sitesPayloads).toEqual([
        {
          id: '842fc15b-2858-4349-86ea-b33a0629a30b',
          columnPayload: {
            sdds_name: 'The badger set 1',
            sdds_osgridreference: '7868962',
            sdds_addressline1: 'Winscombe',
            sdds_county: 'Somerset',
            sdds_postcode: 'BS21 2XX'
          },
          relationshipsPayload: {}
        },
        {
          id: '15385397-6df3-45f8-9c98-4551815bbfa0',
          columnPayload: {
            sdds_name: 'The badger set 2',
            sdds_osgridreference: '7868962',
            sdds_addressline1: 'Winscombe',
            sdds_addressline2: null, // Explicit set null
            sdds_county: 'Somerset',
            sdds_postcode: 'BS22 2XX'
          },
          relationshipsPayload: {}
        },
        {
          id: '27e20450-f414-445e-995b-8d7caf53ab2c',
          columnPayload: {
            sdds_name: 'The badger set 3',
            sdds_osgridreference: '786896',
            sdds_addressline1: 'Winscombe',
            sdds_county: 'Somerset',
            sdds_postcode: 'BS23 2XX'
          },
          relationshipsPayload: {}
        }
      ])
    })

    it('omits the payload if the base path is not set', async () => {
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload({ basePath: 'not-correct' }, srcObj)
      expect(result).toBeNull()
    })

    it('executes a table relationship with a parameterless srcFunc', async () => {
      const mockFunction = jest.fn(() => 'foo')
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', null, mockFunction)], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: 'data' }, [])
      expect(mockFunction).toHaveBeenCalled()
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {
          'testid@odata.bind': '/child(foo)'
        }
      })
    })

    it('executes a table relationship with a parameterless srcFunc; returning null, is ignored', async () => {
      const mockFunction = jest.fn(() => null)
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', null, mockFunction)], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: 'data' }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })

    it('returns nothing with a relationship with no value', async () => {
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', 'rel')], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: { } }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })

    it('returns nothing with a relationship with no value where a function is provided', async () => {
      const Parent = new Table('parent', [],
        [new Relationship('test-relationship', 'child',
          RelationshipType.MANY_TO_ONE, 'testid', 'rel', () => 'a')], 'path')
      const { createTableColumnsPayload } = await import('../schema-processes.js')
      const result = await createTableColumnsPayload(Parent, { path: { } }, [])
      expect(result).toEqual({
        columnPayload: {},
        relationshipsPayload: {}
      })
    })
  })

  describe('the createTableMMRelationshipsPayloads function', () => {
    it('creates a correct many-to-many post statement object', async () => {
      const { createTableMMRelationshipsPayloads } = await import('../schema-processes.js')
      const updateObjects = {
        table: 'sdds_sites',
        relationshipName: 'sdds_application_sdds_site_sdds_site',
        contentId: 1,
        assignments: {
          sdds_name: 'Cow field',
          sdds_osgridreference: '234765',
          sdds_addressline1: 'Nr Henleaze',
          sdds_town: 'Bristol',
          sdds_postcode: 'BS22 1QA'
        },
        powerAppsId: 'ad748889-0390-ec11-b400-000d3a8728b2',
        method: 'PATCH'
      }
      const result = await createTableMMRelationshipsPayloads(SddsApplication, [updateObjects])
      expect(result).toEqual([{ assignments: { '@odata.id': '$1' }, name: 'sdds_application_sdds_site_sdds_site' }])
    })
  })

  describe('the createBatchRequestObjects function', () => {
    it('can produce a set of insert objects from a table set and source data', async () => {
      const { createTableSet, createBatchRequestObjects } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite, Contact, Account])
      const results = await createBatchRequestObjects(srcObj, initialKeys, tableSet)
      expect(results).toEqual(initialGeneratedAssignmentsObject)
    })

    it('can produce a set of update objects from a table set and source data', async () => {
      const { createTableSet, createBatchRequestObjects } = await import('../schema-processes.js')
      const tableSet = createTableSet(SddsApplication, [SddsSite, Contact, Account])
      const results = await createBatchRequestObjects(srcObj, updateKeys, tableSet)
      expect(results).toEqual(updatedGeneratedAssignmentsObject)
    })
  })

  describe('the buildRequestPath function', () => {
    it('generates the correct request path for the main application extract', async () => {
      const { buildRequestPath } = await import('../schema-processes.js')
      const applicationRequestPath = buildRequestPath(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
      expect(applicationRequestPath).toBe(expectedApplicationRequestPath)
    })
  })

  describe('the buildObjectTransformer function', () => {
    it('build function to process an application response element', async () => {
      const { buildObjectTransformer, createTableSet } = await import('../schema-processes.js')
      const applicationTableSet = createTableSet(SddsApplication, [Contact, Account, SddsApplicationType, SddsApplicationPurpose])
      const applicationObjectTransformer = buildObjectTransformer(SddsApplication, applicationTableSet)
      expect(applicationObjectTransformer).toEqual(expect.any(Function))
      await expect(applicationObjectTransformer(applicationResponseObject)).resolves.toEqual({
        data: applicationResponseTransformedDataObject,
        keys: applicationResponseTransformedKeys
      })
    })

    it('build function to process an application-site response element', async () => {
      const { buildObjectTransformer, createTableSet } = await import('../schema-processes.js')
      const applicationSiteTableSet = createTableSet(SddsApplicationKeys, [SddsSiteKeys])
      const applicationSiteObjectTransformer = buildObjectTransformer(SddsApplicationKeys, applicationSiteTableSet)
      expect(applicationSiteObjectTransformer).toEqual(expect.any(Function))
      await expect(applicationSiteObjectTransformer(applicationSiteResponseObject)).resolves.toEqual({
        data: applicationSiteResponseTransformedDataObject,
        keys: applicationSiteResponseTransformedKeys
      })
    })
  })
})
