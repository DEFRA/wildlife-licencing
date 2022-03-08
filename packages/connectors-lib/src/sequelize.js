import Config from './config.js'
import pkg from 'sequelize'
import db from 'debug'
const { Sequelize, Transaction } = pkg
const debug = db('connectors-lib:db')
let sequelize

export const SEQUELIZE = {
  getSequelize: () => sequelize,
  initialiseConnection: async () => {
    debug(`Db host: ${Config.pg.host}`)
    debug(`Db port: ${Config.pg.port}`)
    sequelize = new Sequelize(Config.pg.database,
      Config.pg.user,
      Config.pg.pw,
      {
        dialect: 'postgres',
        host: Config.pg.host,
        port: Config.pg.port,
        logging: Config.pg.logging === 'true' ? console.log : false,
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
