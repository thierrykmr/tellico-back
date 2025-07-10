import { entities } from '../common/entities';

import { DataSource, DataSourceOptions } from 'typeorm';

export let dataSourceOptions: DataSourceOptions = {
//Déclaration des options de connexion TypeORM    
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Options de connexion robustes
  connectTimeout: 60000, // 60 secondes
  acquireTimeout: 60000,
  // Pool de connexions
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  },
};

if (process.env.PROD) {//en production
  dataSourceOptions = {
    ...dataSourceOptions,
    entities: ['dist/src/modules/**/entities/*.entity.js'],
    migrations: ['db/migrations/*.js'],
  };
} else {//dans un autre env: ex: dev
  dataSourceOptions = {
    ...dataSourceOptions,
    entities,
    synchronize: true,
  };
}

export default new DataSource(dataSourceOptions);