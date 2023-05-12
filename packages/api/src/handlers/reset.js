import { models } from '@defra/wls-database-model'
import pkg from 'sequelize'
import { APPLICATION_JSON } from '../constants.js'
import { clearApplicationCaches } from './application/application-cache.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS
const { Sequelize } = pkg
const Op = Sequelize.Op

const inApplicationIds = ids => ({
  where: {
    applicationId: {
      [Op.in]: ids
    }
  }
})

const inIds = ids => ({
  where: {
    id: {
      [Op.in]: ids
    }
  }
})

export default async (_context, req, h) => {
  try {
    const { username } = req.payload
    const response = {}

    console.log(`Removing data for the user ${username}...`)

    const [user] = await models.users.findAll({ where: { username } })

    if (!user) {
      return h.response({ code: 400, error: { description: `username: ${username} not found` } })
        .type(APPLICATION_JSON).code(400)
    } else {
      await models.users.update({
        cookiePrefs: null
      }, {
        where: {
          id: user.id
        }
      })
    }

    // Gather the necessary
    const applicationUsers = await models.applicationUsers.findAll({ where: { userId: user.id } })
    const applicationIds = applicationUsers.map(au => au.applicationId)
    const applicationContacts = await models.applicationContacts.findAll(inApplicationIds(applicationIds))
    const contactIds = applicationContacts.map(ac => ac.contactId)
    const applicationAccounts = await models.applicationAccounts.findAll(inApplicationIds(applicationIds))
    const accountIds = applicationAccounts.map(aa => aa.accountId)
    const applicationSites = await models.applicationSites.findAll(inApplicationIds(applicationIds))
    const siteIds = applicationSites.map(as => as.siteId)

    // Begin the destruction
    response.applicationUsers = await models.applicationUsers.destroy(inApplicationIds(applicationIds))
    response.applicationContacts = await models.applicationContacts.destroy(inApplicationIds(applicationIds))
    response.applicationAccounts = await models.applicationAccounts.destroy(inApplicationIds(applicationIds))
    response.applicationSites = await models.applicationSites.destroy(inApplicationIds(applicationIds))
    response.permissions = await models.permissions.destroy(inApplicationIds(applicationIds))
    response.contacts = await models.contacts.destroy(inIds(contactIds))
    response.accounts = await models.accounts.destroy(inIds(accountIds))
    response.sites = await models.sites.destroy(inIds(siteIds))
    response.habitatSites = await models.habitatSites.destroy(inApplicationIds(applicationIds))
    response.previousLicences = await models.previousLicences.destroy(inApplicationIds(applicationIds))
    response.applicationUploads = await models.applicationUploads.destroy(inApplicationIds(applicationIds))
    response.applications = await models.applications.destroy(inIds(applicationIds))

    await Promise.all(applicationIds.map(async id => clearApplicationCaches(id)))
    await Promise.all(contactIds.map(async id => cache.delete(`/contact/${id}`)))
    await Promise.all(accountIds.map(async id => cache.delete(`/account/${id}`)))
    await Promise.all(siteIds.map(async id => cache.delete(`/site/${id}`)))

    return h.response(response).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error resetting', err)
    throw new Error(err.message)
  }
}
