import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV;

const prodConfig = {
    current_env: environment,
    dbConfig: {
        mysql: {
            mysql_host: process.env.prod_host || 'localhost',
            mysql_user: process.env.prod_user || 'root',
            mysql_password: process.env.prod_password || '',
            mysql_database: process.env.prod_database || 'prod_db',
            mysql_port: process.env.prod_port ? parseInt(process.env.prod_port) : 3306,  // Convert to number
        },
        APP_PORT: process.env.prod_port ? parseInt(process.env.prod_port) : 8080,  // Convert to number
    },
    
};

export const commonConfig = {
    //...commonConfig,
    dbConfig: {
        mysql: {
            mysql_host: process.env.dev_host,
            mysql_user: process.env.dev_user,
            mysql_password: process.env.dev_password,
            mysql_database: process.env.dev_database,
            mysql_port: process.env.dev_port ? parseInt(process.env.dev_port) : undefined,  // Convert to number
        },
        APP_PORT: process.env.dev_port ? parseInt(process.env.dev_port) : undefined,  // Convert to number
    },    
};

export const config = (environment === 'development') ? commonConfig : commonConfig;
