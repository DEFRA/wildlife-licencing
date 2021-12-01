import Config from './config.js'
import pkg from 'sequelize'
import { SECRETS } from './secrets.js'
const { Sequelize, Transaction } = pkg

let sequelize

export const SEQUELIZE = {
  getSequelize: () => sequelize,
  initialiseConnection: async () => {
    sequelize = new Sequelize(Config.pg.database,
      Config.pg.user,
      Config.pg.pw || await SECRETS.getSecret('/wls/postgres-password'),
      {
        dialect: 'postgres',
        host: Config.pg.host,
        port: Config.pg.port,
        logging: Config.pg.logging === 'true',
        native: false,

        define: {
          underscored: true,
          charset: 'utf8',
          timestamps: false
        },

        // similar for sync: you can define this to always force sync for models
        sync: { force: true },

        // pool configuration used to pool database connections
        pool: {
          max: 10,
          idle: 30000,
          acquire: 120000
        },

        isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
      })

    return sequelize
  }
}
