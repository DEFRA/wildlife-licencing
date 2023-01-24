import { APPLICATION_JSON } from '../../constants.js'
import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS
const baseQuery = 'select "a-t".id as "applicationTypeIds",\n' +
  '       "a-t-a-p".application_purpose_id as "applicationPurposeIds",\n' +
  '       s.id as "speciesIds",\n' +
  '       s.species_subject_id as "speciesSubjectIds",\n' +
  '       a.id as "activityIds",\n' +
  '       m.option as "methods"\n' +
  'from "application-types"  "a-t"\n' +
  '         join "application-type-application-purposes" "a-t-a-p" on "a-t".id = "a-t-a-p".application_type_id\n' +
  '         join "application-type-species" "a-t-s" on "a-t".id = "a-t-s".application_type_id\n' +
  '         join species s on "a-t-s".species_id = s.id\n' +
  '         join "application-type-activities" "a-t-a" on "a-t".id = "a-t-a".application_type_id\n' +
  '         join "activities" a on "a-t-a".activity_id = a.id\n' +
  '         join "activity-methods" "a-m" on a.id = "a-m".activity_id\n' +
  '         join "methods" m on "a-m".method_id = m.id'

/**
 * Wrap in single quotes
 * @param u
 * @returns {`'${string}'`}
 */
const w = u => `'${u}'`

/**
 * Create SQL IN list
 * @param context
 * @param req
 * @param h
 * @returns {string}
 */
const ils = a => `(${a.map(p => w(p)).join(',')})`

/**
 * Selects the unique values of a field in the result
 * @param result
 * @param field
 * @returns {any[]}
 */
const unique = (result, field) => [...new Set(result.map(r => r[field])).values()].filter(r => r)

export const findApplicationTypes = async (_context, req, h) => {
  try {
    const sp = new URLSearchParams(req.query)
    const cacheKey = `${req.path}?${sp}`
    const cacheResult = JSON.parse(await cache.restore(cacheKey))

    if (cacheResult) {
      return h.response(cacheResult)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const sequelize = SEQUELIZE.getSequelize()
    const filterObject = JSON.parse(req.query.query)
    const purposes = filterObject?.purposes
    const species = filterObject?.species
    const speciesSubjects = filterObject?.speciesSubjects
    const activities = filterObject?.activities
    const methods = filterObject?.methods

    const filters = []
    if (purposes) {
      filters.push(`"a-t-a-p".application_purpose_id in ${ils(purposes)}`)
    }

    if (species) {
      filters.push(`s.id in ${ils(species)}`)
    }

    if (speciesSubjects) {
      filters.push(`s.species_subject_id in ${ils(speciesSubjects)}`)
    }

    if (activities) {
      filters.push(`a.id in ${ils(activities)}`)
    }

    if (methods) {
      filters.push(`m.option in ${ils(methods)}`)
    }

    const whereClause = filters.length ? 'where ' + filters.join(' and ') : ''

    const qryStr = `${baseQuery} ${whereClause}`
    const result = await sequelize.query(qryStr, { type: sequelize.QueryTypes.SELECT })

    const responseBody = {
      types: unique(result, 'applicationTypeIds'),
      purposes: unique(result, 'applicationPurposeIds'),
      species: unique(result, 'speciesIds'),
      speciesSubjects: unique(result, 'speciesSubjectIds'),
      activities: unique(result, 'activityIds'),
      methods: unique(result, 'methods')
    }

    await cache.save(cacheKey, responseBody)
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error searching application-types', err)
    throw new Error(err.message)
  }
}
