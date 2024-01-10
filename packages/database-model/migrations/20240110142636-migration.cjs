'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('accounts', 'organisation_id', Sequelize.UUID)
    queryInterface.addColumn('application-users', 'user_role', Sequelize.STRING)
    queryInterface.addColumn('application-users', 'application_role', Sequelize.STRING)
    queryInterface.addColumn('users', 'user', Sequelize.JSONB)
    queryInterface.addColumn('users', 'fetched', Sequelize.BOOLEAN)
  },

  async down (queryInterface) {
    queryInterface.removeColumn('accounts', 'organisation_id')
    queryInterface.removeColumn('application-users', 'user_role')
    queryInterface.removeColumn('application-users', 'application_role')
    queryInterface.removeColumn('users', 'user')
    queryInterface.removeColumn('users', 'fetched')
  }
}
