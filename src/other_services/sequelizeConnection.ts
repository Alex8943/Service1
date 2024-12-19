import {Sequelize} from "sequelize"; 
import { config } from "../../config";

const dbConfig = config.dbConfig;
const sequelize = new Sequelize(
    dbConfig.mysql.mysql_database!,
    dbConfig.mysql.mysql_user!,
    dbConfig.mysql.mysql_password!,
    {
        host: dbConfig.mysql.mysql_host,
        dialect: 'mysql',
        port: dbConfig.mysql.mysql_port,
    }
);


export const sequelizeAuth = async () => {sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch((error) => console.error('Unable to connect to the database:', error));
};

export const sequelizeSync = async () => {await sequelize.sync()
    .then(() => console.log('Seq model synced with the database'))
    .catch((error) => console.error('Error syncing models:', error));
};

export default sequelize;