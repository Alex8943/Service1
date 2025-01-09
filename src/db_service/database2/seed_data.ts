import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

/*
// const pool deployed db 2
const pool = mysql.createPool({
    host: process.env.prod_host2,
    user: process.env.prod_user2,
    password: process.env.prod_password2,
    database: process.env.prod_database2,
    ssl: { rejectUnauthorized: true }
});
*/

// const pool local db 2
const pool = mysql.createPool({
    host: process.env.dev_host2,
    user: process.env.dev_user2,
    password: process.env.dev_password2,
    database: process.env.dev_database2,
});

export async function seedData2() {
    const connection = await pool.getConnection();
    
    try {
        // Drop the review table if it exists
        console.log("Dropping existing review table...");
        await connection.query(`DROP TABLE IF EXISTS \`reviews\`;`);
        
        // Create the review table
        console.log("Creating review table...");
        await connection.query(`
            CREATE TABLE \`reviews\` (
                \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
                \`media_fk\` bigint unsigned NOT NULL,
                \`title\` varchar(50) NOT NULL,
                \`description\` varchar(750) NOT NULL,
                \`platform_fk\` bigint unsigned NOT NULL,
                \`user_fk\` bigint unsigned NOT NULL,
                \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` datetime DEFAULT NULL,
                \`isBlocked\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`id\`),
                KEY \`media_fk\` (\`media_fk\`),
                KEY \`user_fk\` (\`user_fk\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        console.log("Review table created successfully.");

        // Insert fake data into the review table
        console.log("Inserting reviews...");
        const totalReviews = 500;
        const batchSize = 100;
        let reviewValues: string[] = [];

        const openingPhrases = [
            "In this episode, we explore",
            "Join us as we dive into",
            "This episode is all about",
            "In this thought-provoking session, we discuss",
            "Get ready for an engaging talk on"
        ];

        await connection.beginTransaction();

        const num_media_fk = 1

        for (let i = 0; i < totalReviews; i++) {
            const user_fk = faker.number.int({ min: 1, max: 100 });
            const media_fk = (num_media_fk);
            const platform_fk = faker.number.int({ min: 1, max: 4 });
            const title = faker.lorem.words(3).substring(0, 50).replace(/['"]/g, "");
            const description = `${faker.helpers.arrayElement(openingPhrases)} ${faker.lorem.sentence()}`.replace(/['"]/g, "");

            reviewValues.push(`(${media_fk}, '${title}', '${description}', ${platform_fk}, ${user_fk}, NOW(), NOW(), 0)`);

            if (reviewValues.length >= batchSize) {
                const query = `
                    INSERT INTO reviews (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
                    VALUES ${reviewValues.join(", ")};
                `;
                await connection.query(query);
                reviewValues = [];
            }
        }

        if (reviewValues.length > 0) {
            const query = `
                INSERT INTO review (media_fk, title, description, platform_fk, user_fk, createdAt, updatedAt, isBlocked)
                VALUES ${reviewValues.join(", ")};
            `;
            await connection.query(query);
        }

        await connection.commit();
        console.log("Inserted reviews successfully.");
    } catch (err) {
        console.error("Error occurred:", err);
        await connection.rollback();
    } finally {
        connection.release();
    }
}

export default pool;
