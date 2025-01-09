import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const environment = process.env.NODE_ENV;
const commonConfig = {
    current_env: environment,
};

// Production Configuration
const prodConfig = {
    ...commonConfig,
    dbConfig: {
        mysql: {
            mysql_host: process.env.prod_host2,
            mysql_user: process.env.prod_user2,
            mysql_password: process.env.prod_password2,
            mysql_database: process.env.prod_database2,
            mysql_port: process.env.prod_port2 ? parseInt(process.env.prod_port2) : 3306,
            dialectOptions: process.env.prod_ssl === 'true' ? {
                ssl: {
                    rejectUnauthorized: true,
                    ca: process.env.prod_ssl_cert_path
                        ? fs.readFileSync(process.env.prod_ssl_cert_path).toString()
                        : undefined
                }
            } : {}
        },
        APP_PORT: process.env.prod_port2 ? parseInt(process.env.prod_port2) : 8080,
    },
};

export const devConfig = {
    ...commonConfig,
    dbConfig: {
        mysql: {
            mysql_host: process.env.dev_host2,
            mysql_user: process.env.dev_user2,
            mysql_password: process.env.dev_password2,
            mysql_database: process.env.dev_database2,
            mysql_port: process.env.dev_port2 ? parseInt(process.env.dev_port2) : undefined,
            dialectOptions: {
                ssl: {
                    rejectUnauthorized: false  // Bypass SSL in dev
                }
            }
        },
        APP_PORT: process.env.dev_port2 ? parseInt(process.env.dev_port2) : undefined,
    },
};

console.log(`Current Environment: ${environment}`);

export const config = (environment === "production" ? prodConfig : devConfig);
