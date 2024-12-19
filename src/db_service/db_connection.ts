
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.dev_host,
    user: process.env.dev_user,
    password: process.env.dev_password,
    database: process.env.dev_database
});

export async function testDBConnection() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        console.log(`Connected to mysql database name: ${process.env.dev_database}`);
    }
    catch (err) {
        console.log("Could not connect to mysql database");
        process.exit(1);
    }
}

export default pool; 